import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authStore } from './auth-store';

interface cartStoreState {
  order: Order;
  // Id of the user the cart belongs to, so it is never carried over to
  // someone else (see the auth subscription at the bottom).
  ownerId?: number;
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
  ownerId: undefined,
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

const userIdOf = (token: string | undefined): number | undefined => {
  try {
    return token ? JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).id : undefined;
  } catch {
    return undefined;
  }
};

// The cart survives reloads, so it must not survive a change of user: on any
// logout (the Salir button, an expired or deactivated session, a logout in
// another tab) or when a different user's session appears, it is emptied so
// nobody can submit the previous user's items under their own name. A
// renewed token for the same user keeps the cart.
authStore.subscribe((state) => {
  const userId = userIdOf(state.accessToken);
  const { ownerId, reset } = useCartStore.getState();
  if (userId === undefined) {
    reset();
    return;
  }
  if (ownerId !== undefined && ownerId !== userId) {
    reset();
  }
  if (useCartStore.getState().ownerId !== userId) {
    useCartStore.setState({ ownerId: userId });
  }
});
