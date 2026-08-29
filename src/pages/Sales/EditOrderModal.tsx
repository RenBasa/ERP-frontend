import { FC, useEffect, useState } from 'react';
import ModalTemplate from '../../components/ModalTemplate/ModalTemplate';
import {
  Alert,
  Autocomplete,
  Button,
  DialogActions,
  DialogContent,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NumericFormat } from 'react-number-format';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { getProducts } from '../../services/product.service';
import { createOrderDetail, deleteOrderDetail, updateOrderDetail } from '../../services/orderDetail.service';
import { getOrder, updateOrderTotal } from '../../services/order.service';

interface EditOrderModalProps {
  open: boolean;
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

// A local-only line needs some identity to key/update it by before it has a
// real id from the backend (only assigned once saved) — a client-side
// negative counter is enough since it never collides with a real id.
let nextLocalId = -1;

const EditOrderModal: FC<EditOrderModalProps> = ({ open, order, onClose, onSuccess }) => {
  const queryClient = useQueryClient();

  const [lines, setLines] = useState<OrderDetail[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [confirmingReleased, setConfirmingReleased] = useState(false);

  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addQuantity, setAddQuantity] = useState<number>(1);
  const [addUnitId, setAddUnitId] = useState<number | undefined>();
  const [addUnitName, setAddUnitName] = useState<string>('');
  const [addPrice, setAddPrice] = useState<number>(0);

  // The Sales list query doesn't include orderDetails (only the dedicated
  // single-order fetch does) — `order` here may be the bare list-row shape,
  // so line items are always fetched fresh rather than trusted from props.
  const orderDetailsQuery = useQuery({
    queryKey: ['order-edit', order.id],
    queryFn: () => getOrder(order.id ?? 0),
    enabled: open && !!order.id,
  });

  // Reset all local editing state each time the modal opens for an order —
  // it isn't unmounted between opens (ModalTemplate just hides the Dialog),
  // so state from a previous order (or a cancelled edit) would otherwise
  // linger into the next one.
  useEffect(() => {
    if (open) {
      setDeletedIds([]);
      setConfirmingReleased(false);
      resetAddFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, order.id]);

  // Once the full order (with line items) actually arrives, seed the
  // editable lines from it — separate from the reset above since this
  // fires later, asynchronously, after the fetch resolves.
  useEffect(() => {
    if (orderDetailsQuery.data) {
      setLines(orderDetailsQuery.data.orderDetails.map((d) => ({ ...d })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderDetailsQuery.data]);

  const resetAddFields = () => {
    setProductSearch('');
    setSelectedProduct(null);
    setAddQuantity(1);
    setAddUnitId(undefined);
    setAddUnitName('');
    setAddPrice(0);
  };

  const productsQuery = useQuery({
    queryKey: ['products-edit-order', productSearch],
    queryFn: () => getProducts(productSearch, undefined),
    enabled: open,
  });

  const newTotal = lines.reduce((sum, l) => sum + l.quantity * l.price, 0);
  // Positive: change owed back to the customer. Negative: still owed —
  // shown either way rather than hidden, per the decision not to block
  // edits based on this number (see PR discussion / conversation history).
  const balance = (order.amountPaid ?? 0) - newTotal;

  const { mutate: saveMutate, isPending } = useMutation({
    mutationFn: async () => {
      const orderId = order.id ?? 0;
      const existingLines = lines.filter((l) => l.id && l.id > 0);
      const newLines = lines.filter((l) => !l.id || l.id < 0);

      await Promise.all(existingLines.map((l) => updateOrderDetail(l.id as number, l.quantity, l.price)));
      await Promise.all(newLines.map((l) => createOrderDetail(orderId, l)));
      await Promise.all(deletedIds.map((id) => deleteOrderDetail(id)));
      await updateOrderTotal(orderId, newTotal);
    },
    onSuccess: () => {
      toast('Orden actualizada correctamente');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-upfront'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      onSuccess();
      onClose();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Error al actualizar la orden');
    },
  });

  const handleQuantityChange = (index: number, value: number) => {
    setLines((current) => current.map((l, i) => (i === index ? { ...l, quantity: value < 0 ? 0 : value } : l)));
  };

  const handleRemoveLine = (index: number) => {
    const line = lines[index];
    if (line.id && line.id > 0) {
      setDeletedIds((current) => [...current, line.id as number]);
    }
    setLines((current) => current.filter((_, i) => i !== index));
  };

  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      setAddUnitId(product.unit?.id ?? product.unitId);
      setAddUnitName(product.unit?.name ?? '');
      setAddPrice(product.priceUnit);
    }
  };

  const handleAddUnitChange = (unitId: number) => {
    if (!selectedProduct) return;
    setAddUnitId(unitId);
    if (unitId === selectedProduct.unit?.id) {
      setAddUnitName(selectedProduct.unit?.name ?? '');
      setAddPrice(selectedProduct.priceUnit);
      return;
    }
    const match = selectedProduct.equivalentUnits?.find((eu) => eu.unit?.id === unitId);
    if (match) {
      setAddUnitName(match.unit?.name ?? '');
      setAddPrice(match.equivalent);
    }
  };

  const handleAddLine = () => {
    if (!selectedProduct || !addUnitId || addQuantity <= 0) return;
    const newLine: OrderDetail = {
      id: nextLocalId--,
      productId: selectedProduct.id ?? 0,
      productName: selectedProduct.name,
      unitId: addUnitId,
      unitName: addUnitName,
      quantity: addQuantity,
      price: addPrice,
    };
    setLines((current) => [...current, newLine]);
    resetAddFields();
  };

  const handleSaveClick = () => {
    if (order.status === 'RELEASED' && !confirmingReleased) {
      setConfirmingReleased(true);
      return;
    }
    saveMutate();
  };

  return (
    <ModalTemplate open={open} title="Editar Orden" handleOnClose={onClose}>
      <DialogContent>
        <div className="flex flex-col gap-3">
          <div className="flex flex-row gap-4">
            <span className="text-lg">
              Cliente: <strong>{order.Client?.name}</strong>
            </span>
          </div>

          {order.status === 'RELEASED' && (
            <Alert severity="warning">
              Esta orden ya fue liberada. Editarla no ajusta automáticamente ningún pago ya registrado — revisa el
              saldo con cuidado antes de guardar.
            </Alert>
          )}

          {orderDetailsQuery.isLoading && <span>Cargando...</span>}

          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left">Producto</TableCell>
                <TableCell align="left">Unidad</TableCell>
                <TableCell align="left">Cantidad</TableCell>
                <TableCell align="left">Precio</TableCell>
                <TableCell align="left">Total</TableCell>
                <TableCell align="left"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((line, index) => (
                <TableRow key={line.id ?? index}>
                  <TableCell align="left">{line.productName ?? line.product?.name}</TableCell>
                  <TableCell align="left">{line.unitName ?? line.unit?.name}</TableCell>
                  <TableCell align="left">
                    <TextField
                      type="number"
                      size="small"
                      inputProps={{ min: 0, step: 'any' }}
                      value={line.quantity}
                      onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                      sx={{ width: '90px' }}
                    />
                  </TableCell>
                  <TableCell align="left">
                    <NumericFormat value={line.price.toFixed(2)} prefix="$" thousandSeparator displayType="text" />
                  </TableCell>
                  <TableCell align="left">
                    <NumericFormat
                      value={(line.quantity * line.price).toFixed(2)}
                      prefix="$"
                      thousandSeparator
                      displayType="text"
                    />
                  </TableCell>
                  <TableCell align="left">
                    <IconButton aria-label="Quitar producto" onClick={() => handleRemoveLine(index)}>
                      <DeleteOutline />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Add a new line to the order */}
          <div className="flex flex-row gap-4 items-center flex-wrap border-t pt-3 mt-1">
            <Autocomplete
              options={productsQuery.data ?? []}
              getOptionLabel={(p) => p.name}
              value={selectedProduct}
              onChange={(_e, value) => handleProductSelect(value)}
              onInputChange={(_e, value) => setProductSearch(value)}
              sx={{ minWidth: '260px' }}
              renderInput={(params) => <TextField {...params} label="Agregar producto" />}
            />
            <TextField
              type="number"
              label="Cantidad"
              inputProps={{ min: 0, step: 'any' }}
              value={addQuantity}
              onChange={(e) => setAddQuantity(Number(e.target.value) || 0)}
              sx={{ width: '110px' }}
              disabled={!selectedProduct}
            />
            <TextField
              select
              label="Unidad"
              value={addUnitId ?? ''}
              onChange={(e) => handleAddUnitChange(Number(e.target.value))}
              sx={{ minWidth: '120px' }}
              disabled={!selectedProduct}
            >
              {selectedProduct?.unit && <MenuItem value={selectedProduct.unit.id}>{selectedProduct.unit.name}</MenuItem>}
              {selectedProduct?.equivalentUnits?.map((eu) => (
                <MenuItem key={eu.unit?.id} value={eu.unit?.id}>
                  {eu.unit?.name}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              onClick={handleAddLine}
              disabled={!selectedProduct || !addUnitId || addQuantity <= 0}
            >
              Agregar
            </Button>
          </div>

          <div className="flex flex-row gap-6 mt-2 items-center justify-end">
            <span className="text-2xl font-bold">
              Total: <NumericFormat value={newTotal.toFixed(2)} prefix="$" thousandSeparator displayType="text" />
            </span>
            {(order.amountPaid ?? 0) > 0 && (
              <span className="text-lg">
                {balance >= 0 ? 'Cambio' : 'Restante'}:{' '}
                <NumericFormat
                  value={Math.abs(balance).toFixed(2)}
                  prefix="$"
                  thousandSeparator
                  displayType="text"
                />
              </span>
            )}
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        {confirmingReleased ? (
          <>
            <span className="flex-1 self-center text-sm">¿Seguro que quieres guardar los cambios?</span>
            <Button onClick={() => setConfirmingReleased(false)}>Cancelar</Button>
            <Button onClick={() => saveMutate()} disabled={isPending} color="warning">
              Sí, guardar cambios
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSaveClick} disabled={isPending || lines.length === 0}>
              Guardar cambios
            </Button>
          </>
        )}
      </DialogActions>
    </ModalTemplate>
  );
};

export default EditOrderModal;
