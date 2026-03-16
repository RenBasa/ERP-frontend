The backend now supports upfront/partial payments on orders. Here is what changed and what needs to be built in the frontend.

Backend changes (already deployed):

1. The `Order` model now has an `amountPaid` field (Float, defaults to 0). Every endpoint that returns an Order (`GET /order`, `GET /order/:id`, etc.) already includes it in the response.
2. New endpoint `PATCH /order/:id/payment` — body: `{ amount: number }`. Adds the given amount to the order's `amountPaid`. Returns the updated order. The backend validates that `amountPaid + amount <= total` and returns a 400 error with a descriptive message if exceeded.
3. New endpoint `GET /order/upfront` — returns all orders where `0 < amountPaid < total` (partially paid), including Client and user relations, ordered by date descending.

What to generate in the frontend:

1. Update the `Order` type in `src/types.d.ts`: Add `amountPaid?: number` to the `Order` interface, after `total`.

2. Add two new service functions in `src/services/order.service.ts`:

- `addPayment(orderId: number, amount: number)` — calls `PATCH /order/${orderId}/payment` with body `{ amount }` using `AxiosERPInstance`. Returns the updated order.
- `getUpfrontOrders()` — calls `GET /order/upfront` using `AxiosERPInstance`. Returns `Order[]`.

3. Update the Sales table in `src/pages/Sales/Sales.tsx`:

- The table uses `CompactTable` from `@table-library/react-table-library/compact`. Columns are defined as a `Column<Order>[]` array and data is passed as `{ nodes: queryData }`.
- Add a new column "Anticipo" (upfront) after the "Total" column that shows `amountPaid` formatted as currency with `NumericFormat` (same style as the Total column: `value={item?.amountPaid?.toFixed(2)}`, `prefix="$"`, `thousandSeparator`, `displayType="text"`).
- Add a new column "Restante" (remaining) after the "Anticipo" column showing `total - (amountPaid ?? 0)`, formatted the same way.
- In the "Acciones" column, add a new `IconButton` with the `AttachMoney` icon (from `@mui/icons-material`) that opens the `PaymentModal` to register an upfront payment. Only show this button for orders where `status !== 'RELEASED'`. Add the necessary state (`paymentModalOpen`, `paymentOrder`) following the existing `useState` pattern in the component.
- Import the new `PaymentModal` component and render it alongside the existing `SalesModal`, passing `onSuccess` as a callback that invalidates both `['orders']` and `['orders-upfront']` queries.

4. Create a new `PaymentModal` component in `src/pages/Sales/PaymentModal.tsx`:

- Props: `open: boolean`, `order: Order`, `onClose: () => void`, `onSuccess: () => void`.
- Uses a `ModalTemplate` wrapper (same as `SalesModal`). ModalTemplate props are: `open`, `title`, `handleOnClose` (not `onClose`). Title: "Registrar Anticipo".
- Shows the order's Client name, total, current `amountPaid`, and remaining (`total - (amountPaid ?? 0)`), all formatted with `NumericFormat` (`displayType="text"`, `prefix="$"`, `thousandSeparator`, `.toFixed(2)` on the value).
- Has a `NumericFormat` input (with `customInput={TextField}`, `prefix="$"`, `thousandSeparator`) for the payment amount. Use Formik for form handling, same pattern as the Send mode in `SalesModal`.
- On submit, calls the `addPayment` service function via a `useMutation`. On success, shows a toast `"Anticipo registrado correctamente"`, calls `onSuccess` (which should invalidate both `['orders']` and `['orders-upfront']` queries), and closes the modal. On error, shows a toast with the error message from `error.response.data.message`.
- Validates that the entered amount is > 0 and <= remaining balance before submitting.

5. Add an "Anticipos" view/tab in `src/pages/Sales/Sales.tsx`:

- Add a toggle or tab (use MUI `ToggleButtonGroup` or `Tabs`) between the `InfoBar` and the table section with two options: "Todas" (all orders, current behavior) and "Anticipos" (orders with upfront payment).
- When "Anticipos" is selected, fetch from `GET /order/upfront` using a separate `useQuery` with key `['orders-upfront']` and the `getUpfrontOrders` service function. Pass the result to `CompactTable` via `{ nodes: upfrontQuery.data }` instead of `ordersQuery.data`.
- The table columns remain the same for both tabs.

6. Update the order view modal in `src/pages/Sales/SalesModal.tsx`:

- In the `'Order'` mode view (the `case 'Order':` block), after the existing total `NumericFormat` display, show the payment info: "Anticipo: $X" and "Restante: $Y" using `NumericFormat` (same display pattern: `displayType="text"`, `prefix="$"`, `thousandSeparator`, `.toFixed(2)`), only when `amountPaid > 0`. Use `orderQuery.data.amountPaid` and `orderQuery.data.total - (orderQuery.data.amountPaid ?? 0)`.

Existing patterns to follow:

- Axios instance: `AxiosERPInstance` from `src/Lib/axiosInstance.config.ts`
- State management: `@tanstack/react-query` for server state, `zustand` for client state
- UI: MUI components + Tailwind CSS utility classes
- Table: `CompactTable` from `@table-library/react-table-library/compact`, columns as `Column<Order>[]`, data as `{ nodes: queryData }`
- Forms: Formik with MUI `TextField` components
- Notifications: `react-toastify` (`toast()` / `toast.error()`)
- Currency display: `react-number-format`'s `NumericFormat` with `value={num.toFixed(2)}`, `prefix="$"`, `thousandSeparator`, `displayType="text"`
- Currency input: `NumericFormat` with `customInput={TextField}`, `prefix="$"`, `thousandSeparator`
- Modal pattern: `ModalTemplate` component (props: `open`, `title`, `handleOnClose`) wrapping `DialogContent`/`DialogActions`
- Language: Spanish for all user-facing text
