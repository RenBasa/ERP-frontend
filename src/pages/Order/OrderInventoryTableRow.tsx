import { Form, Formik } from 'formik';
import { quantityFromAmountHelper, totalHelper } from '../../utils/orderUtil';
import { FC, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { Button, MenuItem, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';

export interface OrderInventoryTableRow {
  product: Product;
  onProductSubmit: (orderDetail: OrderDetail) => void;
}
const OrderInventoryTableRow: FC<OrderInventoryTableRow> = ({ product, onProductSubmit }) => {
  // "Cantidad" vs "Monto" ($ amount) — same idea as FloatingProductBar's
  // grid-view equivalent: a customer asking for "$50 of this" shouldn't
  // require staff to do the division by hand.
  const [inputMode, setInputMode] = useState<'quantity' | 'amount'>('quantity');
  const [amount, setAmount] = useState<number>(0);

  const model: OrderDetail = {
    quantity: 0,
    price: product.priceUnit,
    // price: totalHelper(0, product?.priceUnit, product.unitId) || 0,
    unitId: product.unitId || 1,
    productId: product.id || 1,
    total: totalHelper(0, product?.priceUnit, product.unitId, product) || 0,
    productName: product.name,
    unitName: product.unit?.name,
    // total: product.priceUnit,
  };
  return (
    <div className="flex flex-row gap 2 w-full mr-2">
      <Formik
        initialValues={model}
        onSubmit={(values, { resetForm }) => {
          onProductSubmit(values);
          resetForm();
          // resetForm() only resets Formik's own values — this component
          // instance is reused across submits of the same product row, so
          // the amount-mode state needs clearing separately or a stale $
          // value would sit in the field after a successful add.
          setAmount(0);
        }}
        enableReinitialize
      >
        {(props) => {
          // Recomputes quantity/total from the current $ amount whenever the
          // amount itself changes, or the unit/price it's priced against
          // changes (switching units while in "Monto" mode still needs to
          // land on the same target total, not the same raw quantity).
          const applyAmount = (amountValue: number, price: number, unitId: number) => {
            const derivedQuantity = quantityFromAmountHelper(amountValue, price, unitId, product);
            props.setFieldValue('quantity', derivedQuantity);
            props.setFieldValue('total', totalHelper(derivedQuantity, price, unitId, product));
          };

          return (
            <Form className="flex flex-row gap-6 w-full items-center">
              <div className="flex flex-col gap-1" style={{ minWidth: '140px' }}>
                <ToggleButtonGroup
                  value={inputMode}
                  exclusive
                  size="small"
                  aria-label="Modo de entrada"
                  onChange={(_e, next) => {
                    if (!next) return;
                    setInputMode(next);
                    if (next === 'amount') {
                      applyAmount(amount, props.values.price, props.values.unitId);
                    }
                  }}
                >
                  <ToggleButton value="quantity" aria-label="Por cantidad">
                    Cant.
                  </ToggleButton>
                  <ToggleButton value="amount" aria-label="Por monto">
                    $
                  </ToggleButton>
                </ToggleButtonGroup>

                {inputMode === 'quantity' ? (
                  <TextField
                    onChange={async (e) => {
                      props.handleChange(e);
                      await props.setFieldValue(
                        'total',
                        totalHelper(+e.target.value, props.values.price, props.values.unitId, product),
                      );
                    }}
                    value={props.values.quantity}
                    sx={{ '& .MuiInputBase-input': { height: 55 } }}
                    required
                    name="quantity"
                    fullWidth
                    type="number"
                  />
                ) : (
                  <TextField
                    onChange={(e) => {
                      const value = Number(e.target.value) || 0;
                      setAmount(value);
                      applyAmount(value, props.values.price, props.values.unitId);
                    }}
                    value={amount || ''}
                    placeholder="$ Monto"
                    sx={{ '& .MuiInputBase-input': { height: 55 } }}
                    required
                    fullWidth
                    type="number"
                  />
                )}
              </div>

              <TextField
                required
                onChange={(e) => props.handleChange(e)}
                select
                fullWidth
                variant="outlined"
                name="unitId"
                value={props.values.unitId}
                disabled={product.equivalentUnits?.length < 1}
                sx={{ '& .MuiInputBase-input': { height: 55 }, minWidth: '100px' }}
              >
                <MenuItem
                  value={product.unit?.id}
                  onClick={() => {
                    props.setFieldValue('price', product.priceUnit);
                    props.setFieldValue('unitName', product.unit?.name);
                    if (inputMode === 'amount') {
                      applyAmount(amount, product.priceUnit, product.unitId);
                    } else {
                      props.setFieldValue(
                        'total',
                        totalHelper(props.values.quantity, product.priceUnit, product.unitId, product),
                      );
                    }
                  }}
                >
                  {product.unit?.name}
                </MenuItem>
                {product.equivalentUnits?.map((equivalentUnit) => (
                  <MenuItem
                    key={equivalentUnit.unit?.id}
                    value={equivalentUnit.unit?.id}
                    onClick={() => {
                      props.setFieldValue('price', equivalentUnit.equivalent);
                      props.setFieldValue('unitName', equivalentUnit.unit.name);
                      if (inputMode === 'amount') {
                        applyAmount(amount, equivalentUnit.equivalent, equivalentUnit.unitId);
                      } else {
                        props.setFieldValue(
                          'total',
                          totalHelper(props.values.quantity, equivalentUnit.equivalent, equivalentUnit.unitId, product),
                        );
                      }
                    }}
                  >
                    {equivalentUnit.unit?.name}
                  </MenuItem>
                ))}
              </TextField>

              <span className="text-xl font-bold text-gray-900 flex items-center">
                <NumericFormat
                  value={props.values.total}
                  prefix="$"
                  thousandSeparator
                  displayType="text"
                  disabled
                />
              </span>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  '&.Mui-disabled': {
                    color: '#c0c0c0',
                  },
                }}
                style={{ backgroundColor: '#900A20', minWidth: '100px' }}
                className=" text-white"
                fullWidth
                disabled={props.values.quantity > 0 ? false : true}
              >
                Agregar
              </Button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default OrderInventoryTableRow;
