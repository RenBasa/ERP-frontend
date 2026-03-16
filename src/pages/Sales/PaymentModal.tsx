import { FC } from 'react';
import ModalTemplate from '../../components/ModalTemplate/ModalTemplate';
import { Form, Formik } from 'formik';
import { Button, DialogActions, DialogContent, TextField } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { NumericFormat } from 'react-number-format';
import { toast } from 'react-toastify';
import { addPayment } from '../../services/order.service';
import { AxiosError } from 'axios';

interface PaymentModalProps {
  open: boolean;
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: FC<PaymentModalProps> = ({ open, order, onClose, onSuccess }) => {
  const remaining = order.total - (order.amountPaid ?? 0);

  const { mutate: addPaymentMutate, isPending } = useMutation({
    mutationFn: (amount: number) => addPayment(order.id ?? 0, amount),
    onSuccess: () => {
      toast('Anticipo registrado correctamente');
      onSuccess();
      onClose();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Error al registrar anticipo');
    },
  });

  const handleValidate = (values: { amount: number }) => {
    const errors: { amount?: string } = {};
    if (!values.amount || values.amount <= 0) {
      errors.amount = 'El monto debe ser mayor a 0';
    } else if (values.amount > remaining) {
      errors.amount = `El monto no puede ser mayor al restante ($${remaining.toFixed(2)})`;
    }
    return errors;
  };

  return (
    <ModalTemplate open={open} title="Registrar Anticipo" handleOnClose={onClose}>
      <Formik
        initialValues={{ amount: 0 }}
        validate={handleValidate}
        onSubmit={(values) => addPaymentMutate(values.amount)}
        enableReinitialize
      >
        {(props) => (
          <Form>
            <DialogContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-lg">
                    Cliente: <strong>{order.Client?.name}</strong>
                  </span>
                  <div className="flex flex-row gap-4">
                    <span className="text-lg">
                      Total:{' '}
                      <NumericFormat
                        value={order.total.toFixed(2)}
                        prefix="$"
                        thousandSeparator
                        displayType="text"
                      />
                    </span>
                    <span className="text-lg">
                      Anticipo:{' '}
                      <NumericFormat
                        value={(order.amountPaid ?? 0).toFixed(2)}
                        prefix="$"
                        thousandSeparator
                        displayType="text"
                      />
                    </span>
                    <span className="text-lg">
                      Restante:{' '}
                      <NumericFormat
                        value={remaining.toFixed(2)}
                        prefix="$"
                        thousandSeparator
                        displayType="text"
                      />
                    </span>
                  </div>
                </div>
                <NumericFormat
                  customInput={TextField}
                  prefix="$"
                  thousandSeparator
                  decimalScale={2}
                  label="Monto del anticipo"
                  fullWidth
                  variant="outlined"
                  value={props.values.amount || ''}
                  onValueChange={(values) => props.setFieldValue('amount', values.floatValue ?? 0)}
                  error={!!props.errors.amount && props.touched.amount}
                  helperText={props.touched.amount && props.errors.amount}
                  onBlur={props.handleBlur('amount')}
                  aria-label="Monto del anticipo"
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>
                Aceptar
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </ModalTemplate>
  );
};

export default PaymentModal;
