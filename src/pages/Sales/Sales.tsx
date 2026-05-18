import { Button, IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import InfoBar from '../../layouts/InfoBar/InfoBar';
import { AttachMoney, DeleteOutline, Send, Sync, Visibility } from '@mui/icons-material';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { DEFAULT_OPTIONS, getTheme } from '@table-library/react-table-library/material-ui';
import { toast } from 'react-toastify';
import { deleteOrder, getOrder, getOrders, getUpfrontOrders, updateOrderStatus } from '../../services/order.service';
import { NumericFormat } from 'react-number-format';
import { useState } from 'react';
import SalesModal from './SalesModal';
import PaymentModal from './PaymentModal';
import { formatDate } from '../../utils/orderUtil';
import StatusComponent from '../../components/StatusComponent/StatusComponent';
import CustomLoading from '../../components/CustomLoading/CustomLoading';
import Pagination from '../../components/Pagination/Pagination';

type modes = 'Order' | 'Send' | 'Delete' | '';
type TabValue = 'all' | 'upfront';

const orderModel: Order = {
  id: 0,
  date: new Date(),
  status: 'STARTED',
  orderDetails: [],
  total: 0,
};

const Sales = () => {
  const queryClient = useQueryClient();

  const materialTheme = getTheme({
    ...DEFAULT_OPTIONS,
    verticalSpacing: 10,
    striped: true,
    highlightOnHover: true,
  });

  const theme = useTheme(materialTheme);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setmodalMode] = useState<modes>('');
  const [currentOrder, setCurrentOrder] = useState<Order>(orderModel);
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<Order>(orderModel);
  const [prevPage, setPrevPage] = useState<number[] | []>([]);
  const [cursor, setCursor] = useState<number | undefined>();

  const ordersQuery = useQuery({
    queryKey: ['orders', cursor],
    queryFn: () => getOrders(cursor),
    placeholderData: keepPreviousData,
    refetchInterval: 15000,
  });

  const upfrontQuery = useQuery({
    queryKey: ['orders-upfront', cursor],
    queryFn: () => getUpfrontOrders(cursor),
    enabled: activeTab === 'upfront',
    placeholderData: keepPreviousData,
    refetchInterval: 15000,
  });

  const ReadOrderQuery = useQuery({
    queryKey: ['order', currentOrder],
    queryFn: () => getOrder(!currentOrder.id ? 0 : currentOrder.id),
    enabled: false,
  });

  const { mutate: editOrderStatusMutate } = useMutation({
    mutationFn: (order: Order) => updateOrderStatus(order),
    onSuccess: () => {
      handleCloseModal();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-upfront'] });
    },
    onError: () => toast.error('Error al enviar orden'),
  });

  const { mutate: deletOrderMutate } = useMutation({
    mutationFn: (id: number) => deleteOrder(id),
    onSuccess: () => {
      handleCloseModal();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-upfront'] });
    },
    onError: () => toast.error('Error al enviar orden'),
  });

  const columns: Column<Order>[] = [
    { label: 'Cliente', renderCell: (item) => item.Client?.name },
    { label: 'Creador', renderCell: (item) => `${item.user?.first_name} ${item.user?.last_name}` },
    { label: 'Estatus', renderCell: (item) => <StatusComponent status={item.status} /> },
    // @ts-expect-error Date is not undefined, but has to be ? for other components
    { label: 'Fecha', renderCell: (item) => formatDate(item.date) },
    {
      label: 'Total',
      renderCell: (item) => (
        <NumericFormat value={item?.total.toFixed(2)} prefix="$" thousandSeparator displayType="text" disabled />
      ),
    },
    {
      label: 'Anticipo',
      renderCell: (item) => (
        <NumericFormat
          value={(item?.amountPaid ?? 0).toFixed(2)}
          prefix="$"
          thousandSeparator
          displayType="text"
          disabled
        />
      ),
    },
    {
      label: 'Restante',
      renderCell: (item) => (
        <NumericFormat
          value={(item.total - (item.amountPaid ?? 0)).toFixed(2)}
          prefix="$"
          thousandSeparator
          displayType="text"
          disabled
        />
      ),
    },
    {
      label: 'Acciones',
      renderCell: (item) => (
        <div className="flex flex-row gap-2">
          <IconButton onClick={() => onViewSelect(item)} aria-label="Ver orden">
            <Visibility />
          </IconButton>
          {item.status !== 'RELEASED' && (
            <IconButton onClick={() => handleOpenPaymentModal(item)} aria-label="Registrar anticipo">
              <AttachMoney />
            </IconButton>
          )}
          {(item.status === 'NOT STARTED' || item.status === 'STARTED') && (
            <>
              <IconButton onClick={() => onSendSelect(item)} aria-label="Enviar orden">
                <Send />
              </IconButton>
              <IconButton onClick={() => onDeleteSelect(item)} aria-label="Borrar orden">
                <DeleteOutline />
              </IconButton>
            </>
          )}
        </div>
      ),
    },
  ];

  const activeQuery = activeTab === 'upfront' ? upfrontQuery : ordersQuery;
  const data = { nodes: activeQuery?.data };

  const handleOnClickRefetch = () => {
    activeQuery.refetch();
  };

  const resetPagination = () => {
    setCursor(undefined);
    setPrevPage([]);
  };

  const handleTabChange = (_: React.MouseEvent<HTMLElement>, newValue: TabValue | null) => {
    if (newValue) {
      setActiveTab(newValue);
      resetPagination();
    }
  };

  const handleOnPrevClick = () => {
    if (!activeQuery.isPlaceholderData && activeQuery.data) {
      setCursor(handleRemovePrevPageCursor);
    }
  };

  const handleOnNextClick = () => {
    if (!activeQuery.isPlaceholderData && activeQuery.data?.length) {
      const nextId = activeQuery.data[activeQuery.data.length - 1]?.id;
      const firstId = activeQuery.data[0]?.id;
      if (nextId) {
        setPrevPage((current) => (firstId ? [...current, firstId] : current));
        setCursor(nextId);
      }
    }
  };

  const handleRemovePrevPageCursor = () => {
    const newItems = [...prevPage];
    const previousCursor = newItems.pop();
    setPrevPage(newItems);
    return previousCursor;
  };

  const handleOpenPaymentModal = (order: Order) => {
    setPaymentOrder(order);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentOrder(orderModel);
    setPaymentModalOpen(false);
  };

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['orders-upfront'] });
  };

  const onViewSelect = (order: Order) => {
    setCurrentOrder(order);
    setmodalMode('Order');
    handleOpenModal();
  };

  const onSendSelect = (order: Order) => {
    setCurrentOrder(order);
    setmodalMode('Send');
    handleOpenModal();
  };

  const onDeleteSelect = (order: Order) => {
    setCurrentOrder(order);
    setmodalMode('Delete');
    handleOpenModal();
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentOrder(orderModel);
    setModalOpen(false);
  };

  return (
    <>
      <InfoBar pageTitle="Ventas">
        <Button
          onClick={handleOnClickRefetch}
          variant="contained"
          style={{ backgroundColor: '#66301E', color: 'white' }}
          startIcon={<Sync />}
        >
          Sincronizar
        </Button>
      </InfoBar>
      <div className="flex justify-center px-8 mb-4">
        <ToggleButtonGroup value={activeTab} exclusive onChange={handleTabChange} aria-label="Filtro de órdenes">
          <ToggleButton value="all" aria-label="Todas las órdenes">
            Todas
          </ToggleButton>
          <ToggleButton value="upfront" aria-label="Órdenes con anticipo">
            Anticipos
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div className="min-w-full flex flex-col gap-6 rounded-md drop-shadow-md justify-center w-full px-8 mb-3">
        {activeQuery.isLoading ? (
          <CustomLoading />
        ) : (
          activeQuery?.data && <CompactTable columns={columns} data={data} theme={theme} />
        )}
        <Pagination
          isPlaceholderData={activeQuery.isPlaceholderData}
          prevPage={prevPage}
          onPrevClick={handleOnPrevClick}
          onNextClick={handleOnNextClick}
        />
      </div>
      <SalesModal
        mode={modalMode}
        open={modalOpen}
        order={currentOrder}
        onClose={handleCloseModal}
        onSendAccept={editOrderStatusMutate}
        onDeleteAccept={deletOrderMutate}
        orderQuery={ReadOrderQuery}
      />
      <PaymentModal
        open={paymentModalOpen}
        order={paymentOrder}
        onClose={handleClosePaymentModal}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default Sales;
