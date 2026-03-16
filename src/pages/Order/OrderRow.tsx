import { TableCell, TableRow, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FC } from 'react';
import { useCartStore } from '../../store/cart-store';
export interface OrderRowProps {
  orderDetail: OrderDetail;
  rowIndex: number;
}
const OrderRow: FC<OrderRowProps> = ({ orderDetail, rowIndex }) => {
  const deleteOrderDetail = useCartStore((state) => state.removeOrderDetail);
  const updateQuantity = useCartStore((state) => state.updateOrderDetailQuantity);
  const handleDecrease = () => updateQuantity(rowIndex, Math.max(0, orderDetail.quantity - 1));
  const handleIncrease = () => updateQuantity(rowIndex, orderDetail.quantity + 1);
  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value) || value < 0) {
      updateQuantity(rowIndex, 0);
      return;
    }
    updateQuantity(rowIndex, value);
  };
  return (
    <TableRow className="flex flex-row gap-2 items-center">
      <TableCell align="left">{orderDetail.productName}</TableCell>
      <TableCell align="left">
        <div className="flex items-center gap-2">
          <button
            className="h-8 w-8 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Disminuir cantidad"
            onClick={handleDecrease}
          >
            -
          </button>
          <TextField
            size="small"
            type="number"
            inputProps={{ min: 0, inputMode: 'numeric' }}
            value={orderDetail.quantity}
            onChange={handleQtyChange}
          />
          <button
            className="h-8 w-8 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Aumentar cantidad"
            onClick={handleIncrease}
          >
            +
          </button>
        </div>
      </TableCell>
      <TableCell align="left">{orderDetail.unitName}</TableCell>
      <TableCell align="left">{orderDetail.price.toFixed(2)}</TableCell>
      <TableCell align="left">{orderDetail.total?.toFixed(2)}</TableCell>
      <TableCell align="left">
        {/* TODO: Check for length and change order status  */}
        <button className="flex flex-row gap-1 items-center" onClick={() => deleteOrderDetail(rowIndex)}>
          <span>Borrar</span>
          <DeleteIcon className="text-slate-600" />
        </button>
      </TableCell>
    </TableRow>
  );
};

export default OrderRow;
