import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      <p className="mt-2 text-sm font-medium">{label}</p>
    </div>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
