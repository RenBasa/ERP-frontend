import { FC } from 'react';
import ModalTemplate from '../../components/ModalTemplate/ModalTemplate';
import { Form, Formik } from 'formik';
import {
  Button,
  DialogActions,
  DialogContent,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { UseQueryResult } from '@tanstack/react-query';
import { formatDate } from '../../utils/orderUtil';
import StatusComponent from '../../components/StatusComponent/StatusComponent';
import { NumericFormat } from 'react-number-format';
import OrderRow from '../../components/OrderRow/OrderRow';

interface CategoriesModalProps {
  open: boolean;
  order: Order;
  mode: modes;
  onClose: () => void;
  onSendAccept: (order: Order) => void;
  onDeleteAccept: (id: number) => void;
  orderQuery: UseQueryResult<Order, Error>;
}

type modes = 'Order' | 'Send' | 'Delete' | '';

const CategoriesModal: FC<CategoriesModalProps> = ({
  open,
  order,
  mode,
  onClose,
  onSendAccept,
  onDeleteAccept,
  orderQuery,
}) => {
  const getTitle = () => {
    if (mode === 'Order') {
      return 'Visualizar Orden';
    } else if (mode === 'Send') {
      return 'Enviar Orden';
    }
    return 'Borrar Orden';
  };

  if (mode === 'Order') orderQuery.refetch();

  const renderContent = () => {
    switch (mode) {
      case 'Order':
        return (
          <DialogContent>
            {orderQuery?.data && (
              <div className="flex flex-col gap-2 items-center justify-center w-full">
                <div className="flex flex-row w-full justify-center gap-4">
                  <span className="text-xl">Cliente: {orderQuery.data.Client?.name}</span>
                  <span className="text-xl">
                    Creador: {`${orderQuery.data.user?.first_name} ${orderQuery.data.user?.last_name}`}
                  </span>
                </div>
                <div className="flex flex-row w-full justify-center gap-4">
                  <span className="text-xl">
                    <StatusComponent status={orderQuery.data.status} />{' '}
                  </span>
                  {/*  @ts-expect-error Date is not undefined, but has to be ? for other components */}
                  <span className="text-xl">Fecha: {formatDate(orderQuery.data.date)}</span>
                </div>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="left">Nombre</TableCell>
                      <TableCell align="left">Unidad</TableCell>
                      <TableCell align="left">Cantidad</TableCell>
                      <TableCell align="left">Precio</TableCell>
                      <TableCell align="left">Total</TableCell>
                      <TableCell align="left"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderQuery.data.orderDetails.map((item, index) => (
                      <OrderRow orderDetail={item} key={index} />
                    ))}
                  </TableBody>
                </Table>
                <NumericFormat
                  className="text-3xl"
                  value={orderQuery?.data?.total.toFixed(2)}
                  prefix="$"
                  thousandSeparator
                  displayType="text"
                  disabled
                />
                {orderQuery.data.amountPaid != null && orderQuery.data.amountPaid > 0 && (
                  <div className="flex flex-row gap-6 mt-2">
                    <span className="text-xl">
                      Anticipo:{' '}
                      <NumericFormat
                        value={orderQuery.data.amountPaid.toFixed(2)}
                        prefix="$"
                        thousandSeparator
                        displayType="text"
                      />
                    </span>
                    <span className="text-xl">
                      Restante:{' '}
                      <NumericFormat
                        value={(orderQuery.data.total - (orderQuery.data.amountPaid ?? 0)).toFixed(2)}
                        prefix="$"
                        thousandSeparator
                        displayType="text"
                      />
                    </span>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        );
      case 'Send':
        return (
          <Formik initialValues={order} onSubmit={(values) => onSendAccept(values)}>
            {(props) => (
              <Form>
                <DialogContent>
                  <TextField
                    onChange={props.handleChange('status')}
                    className="w-full"
                    required
                    select
                    label="Estado de la Orden"
                    fullWidth
                    variant="outlined"
                    value={props.values.status}
                  >
                    <MenuItem value="PENDING">Pendiente</MenuItem>
                    <MenuItem value="BLOCKED">Bloqueado</MenuItem>
                  </TextField>
                </DialogContent>
                <DialogActions>
                  <Button onClick={onClose}>Cancelar</Button>
                  <Button type="submit">Aceptar</Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        );
      case 'Delete':
        return (
          <>
            <DialogContent>¿Seguro que quieres borrar la orden?</DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancelar</Button>
              <Button onClick={() => onDeleteAccept(!order.id ? 0 : order.id)}>Aceptar</Button>
            </DialogActions>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ModalTemplate open={open} title={getTitle()} handleOnClose={onClose}>
      {renderContent()}
    </ModalTemplate>
  );
};

export default CategoriesModal;
