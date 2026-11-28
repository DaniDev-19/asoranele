import type { ItemStatus } from '../../types/api';

const STATUS_STYLES: Record<ItemStatus, { bg: string; dot: string; label: string }> = {
  disponible: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Disponible',
  },
  agotado: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    label: 'Agotado',
  },
  inactivo: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    label: 'Inactivo',
  },
  descontinuado: {
    bg: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    label: 'Descontinuado',
  },
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.disponible;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.bg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
