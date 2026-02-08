import { useCartStore } from '../../store/cart-store';
import NoItems from '../../layouts/NoItems/NoItems';
import StatusComponent from '../../components/StatusComponent/StatusComponent';
import { Button, Divider, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { NumericFormat } from 'react-number-format';
import OrderRow from './OrderRow';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createOrder } from '../../services/order.service';
import { getClients } from '../../services/client.service';
import { ChangeEvent, useState } from 'react';
import CancelOrderModal from './CancelOrderModal';

const OrderCart = () => {
  // Hooks
  // const queryClient = useQueryClient();
  const setClient = useCartStore((state) => state.setClient);
  const order = useCartStore((state) => state.order);
  const orderStatus = useCartStore((state) => state.order.status);
  const resetOrder = useCartStore((state) => state.reset);

  // Use states
  const [selectedClientId, setSelectedClientId] = useState(order.clientId);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  // Use effects

  // React query functions
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  // React Query Mutation
  const { mutate: createOrderMutate } = useMutation({
    // TODO: Set the status to pending
    mutationFn: (order: Order) => createOrder(order),

    onSuccess: () => {
      resetOrder();
      toast('Orden enviada correctamente');
    },
    onError: () => toast.error('Error al enviar orden'),
  });

  // handlers and helper funciont
  const handleOnOrderSubmit = () => {
    createOrderMutate(order);
  };

  const handleClientChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const clientId = parseInt(event.target.value, 10);
    setSelectedClientId(clientId);
    setClient(clientId);
  };

  const handleOpenCancelModal = () => {
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
  };

  const handleConfirmCancelOrder = () => {
    resetOrder();
    setIsCancelModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="h-full flex flex-col gap-4 p-4">
        {/* <span className="text-4xl">Nueva orden</span> */}
        <TextField
          onChange={handleClientChange}
          required
          select
          label="Cliente"
          variant="outlined"
          value={selectedClientId}
        >
          {clientsQuery.data?.map((client) => (
            <MenuItem key={client.id} value={client.id}>
              {client.name}
            </MenuItem>
          ))}
        </TextField>

        <Divider />
        {/* <div className="flex flex-row gap-4 items-center"> */}
        <StatusComponent status={orderStatus} />
        {/* </div> */}
        <Divider />
        {/* TODO: Move to component */}
        {order.orderDetails.length > 0 ? (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="left">Nombre</TableCell>
                  <TableCell align="left">Cantidad</TableCell>
                  <TableCell align="left">Unidad</TableCell>
                  <TableCell align="left">Precio</TableCell>
                  <TableCell align="left">Total</TableCell>
                  <TableCell align="left"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.orderDetails.map((item, index) => (
                  <OrderRow orderDetail={item} key={index} rowIndex={index} />
                ))}
              </TableBody>
            </Table>
            <span className="text-3xl font-bold text-gray-900 flex items-center gap-1">
              Total:
              <NumericFormat
                // value={totalHelper(props.values.quantity, props.values.equivalency, props.values.unitId)}
                value={order.total}
                prefix="$"
                thousandSeparator
                //   displayType="text"
                decimalScale={2}
                disabled
              />
            </span>
            <Button
              onClick={handleOnOrderSubmit}
              variant="contained"
              style={{ backgroundColor: '#900A20' }}
              className=" text-white"
              fullWidth
              disabled={order.orderDetails.length > 0 ? false : true}
            >
              Enviar Ticket de Orden
            </Button>
            <Button
              variant="contained"
              style={{ backgroundColor: '#F6F6FB', color: 'GrayText' }}
              fullWidth
              disabled={order.orderDetails.length > 0 ? false : true}
              onClick={handleOpenCancelModal}
            >
              Cancelar Orden
            </Button>
            <CancelOrderModal
              open={isCancelModalOpen}
              onClose={handleCloseCancelModal}
              onConfirm={handleConfirmCancelOrder}
            />
          </>
        ) : (
          <div className="h-full px-4 flex justify-center items-center">
            <NoItems text="No se ha agregado ningun producto" />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCart;
