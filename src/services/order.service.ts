import { AxiosERPInstance } from '../Lib/axiosInstance.config';

// List orders
export const getOrders = async (cursor?: number): Promise<Order[]> => {
  const response = await AxiosERPInstance.get(`/order${cursor ? `?cursor=${cursor}` : ''}`);
  return response.data;
};

// Create an Order
export const createOrder = async (order: Order) => {
  const payload: Order = {
    ...order,
    orderDetails: order.orderDetails.map((detail) => ({
      quantity: detail.quantity,
      price: detail.price,
      unitId: detail.unitId,
      productId: detail.productId,
    })),
  };
  const response = await AxiosERPInstance.post('/order', payload);
  return response;
};

// Read an Order
export const getOrder = async (id: number): Promise<Order> => {
  const response = await AxiosERPInstance.get(`/order/${id}`);
  return response.data;
};

// Delete an Order
export const updateOrderStatus = async (order: Order): Promise<Order> => {
  const response = await AxiosERPInstance.patch(`/order/${order.id}/status?status=${order.status}`);
  return response.data;
};

// Delete an Order
export const deleteOrder = async (id: number): Promise<Order> => {
  const response = await AxiosERPInstance.delete(`/order/${id}/details`);
  return response.data;
};

export const addPayment = async (orderId: number, amount: number): Promise<Order> => {
  const response = await AxiosERPInstance.patch(`/order/${orderId}/payment`, { amount });
  return response.data;
};

export const getUpfrontOrders = async (cursor?: number): Promise<Order[]> => {
  const response = await AxiosERPInstance.get(`/order/upfront${cursor ? `?cursor=${cursor}` : ''}`);
  return response.data;
};

// Recompute and persist an order's total after its line items change
export const updateOrderTotal = async (id: number, total: number): Promise<Order> => {
  const response = await AxiosERPInstance.patch(`/order/${id}`, { total });
  return response.data;
};
