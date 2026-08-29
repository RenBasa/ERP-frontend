import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface cartStoreState {
  order: Order;
}
interface cartStoreActions {
  // createNewOrder: (name: string, location: string, wholesale: boolean) => void;
  setStatus: (status: OrderStatus) => void;
  setClient: (clientId: number) => void;
  setAmountPaid: (amountPaid: number) => void;
  addOrderDetail: (orderDetail: OrderDetail) => void;
  removeOrderDetail: (index: number) => void;
  updateOrderDetailQuantity: (index: number, quantity: number) => void;
  reset: () => void;
}
const initialState: cartStoreState = {
  order: {
    status: 'NOT STARTED',
    total: 0,
    amountPaid: 0,
    clientId: 1,
    orderDetails: [],
  },
};

// sessionStorage (not localStorage): survives a reload within the same
// tab — which is the actual bug this fixes, a reload wiping an
// in-progress order — without an abandoned cart lingering across
// completely separate days on a shared terminal, which localStorage
// would do.
export const useCartStore = create<cartStoreState & cartStoreActions>()(
  persist(
    (set) => ({
      ...initialState,
      setStatus: (status: OrderStatus) => {
        set((state) => ({ ...state, status }));
      },
      setClient: (clientId: number) => {
        set((state) => ({
          ...state,
          order: {
            ...state.order,
            clientId: clientId,
          },
        }));
      },
      setAmountPaid: (amountPaid: number) => {
        set((state) => ({
          ...state,
          order: {
            ...state.order,
            amountPaid,
          },
        }));
      },
      addOrderDetail: (orderDetail: OrderDetail) => {
        set((state) => ({
          order: {
            ...state.order,
            orderDetails: [...state.order.orderDetails, orderDetail],
            total: state.order.total + orderDetail.price * orderDetail.quantity,
          },
        }));
      },
      removeOrderDetail: (index: number) => {
        set((state) => ({
          order: {
            ...state.order,
            orderDetails: state.order.orderDetails.filter((_, i) => i !== index),
            total:
              state.order.total - state.order.orderDetails[index].price * state.order.orderDetails[index].quantity,
          },
        }));
      },
      updateOrderDetailQuantity: (index: number, quantity: number) => {
        set((state) => {
          const safeQuantity = quantity < 0 ? 0 : quantity;
          const updatedDetails = state.order.orderDetails.map((d, i) => {
            if (i !== index) return d;
            const updatedTotal =
              d.unitId === d.unitId && d.productId ? safeQuantity * d.price : safeQuantity * d.price;
            return {
              ...d,
              quantity: safeQuantity,
              total: updatedTotal,
            };
          });
          const newTotal = updatedDetails.reduce((sum, d) => sum + d.price * d.quantity, 0);
          return {
            order: {
              ...state.order,
              orderDetails: updatedDetails,
              total: newTotal,
            },
          };
        });
      },
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
