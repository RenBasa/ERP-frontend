import { FC } from 'react';

export interface StatusComponentProps {
  status: OrderStatus;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; container: string; dot: string }
> = {
  'NOT STARTED': {
    label: 'No Empezado',
    container: 'bg-amber-50 text-amber-900 ring-amber-600/25',
    dot: 'bg-amber-600',
  },
  STARTED: {
    label: 'Empezado',
    container: 'bg-emerald-50 text-emerald-900 ring-emerald-600/25',
    dot: 'bg-emerald-600',
  },
  PENDING: {
    label: 'En proceso',
    container: 'bg-violet-50 text-violet-900 ring-violet-600/25',
    dot: 'bg-violet-600',
  },
  RELEASED: {
    label: 'Completado',
    container: 'bg-sky-50 text-sky-900 ring-sky-600/25',
    dot: 'bg-sky-600',
  },
  BLOCKED: {
    label: 'Bloqueado',
    container: 'bg-rose-50 text-rose-900 ring-rose-600/25',
    dot: 'bg-rose-600',
  },
};

const StatusComponent: FC<StatusComponentProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.container}`}
      role="status"
      aria-label={config.label}
    >
      <span
        className={`size-1.5 shrink-0 rounded-full ${config.dot}`}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
};

export default StatusComponent;
