import { AxiosERPInstance } from '../Lib/axiosInstance.config';

// The backend's create endpoint types its body as Prisma's *checked*
// OrderDetailCreateInput, which requires relations as nested `connect`
// objects rather than flat foreign-key scalars — Prisma's client validates
// this shape at runtime regardless of what TypeScript says on either side.
export const createOrderDetail = async (orderId: number, detail: OrderDetail): Promise<OrderDetail> => {
  const response = await AxiosERPInstance.post('/order-detail', {
    order: { connect: { id: orderId } },
    product: { connect: { id: detail.productId } },
    unit: { connect: { id: detail.unitId } },
    quantity: detail.quantity,
    price: detail.price,
  });
  return response.data;
};

// Quantity/price are plain scalar fields, so a flat update body works here
// without needing the connect-object treatment createOrderDetail needs.
export const updateOrderDetail = async (id: number, quantity: number, price: number): Promise<OrderDetail> => {
  const response = await AxiosERPInstance.patch(`/order-detail/${id}`, { quantity, price });
  return response.data;
};

export const deleteOrderDetail = async (id: number): Promise<OrderDetail> => {
  const response = await AxiosERPInstance.delete(`/order-detail/${id}`);
  return response.data;
};
