import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Eliminar',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidthClass="sm:max-w-md">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed pt-1">{message}</p>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          title="Cancelar"
          onClick={onClose}
          disabled={isLoading}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          title="Confirmar"
          onClick={onConfirm}
          disabled={isLoading}
          className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Procesando...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
