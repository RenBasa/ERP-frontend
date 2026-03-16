import { AxiosERPInstance } from '../Lib/axiosInstance.config';

// List orders
export const getOrders = async (): Promise<Order[]> => {
  const response = await AxiosERPInstance.get(`/order`);
  return response.data;
};

// Create an Order
export const createOrder = async (order: Order) => {
  order.orderDetails.forEach((detail) => {
    delete detail.total;
    delete detail.unitName;
    delete detail.productName;
  });
  const response = await AxiosERPInstance.post('/order', order);
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

export const getUpfrontOrders = async (): Promise<Order[]> => {
  const response = await AxiosERPInstance.get(`/order/upfront`);
  return response.data;
};
