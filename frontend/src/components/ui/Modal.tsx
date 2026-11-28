import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidthClass?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidthClass = 'sm:max-w-lg',
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/55 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidthClass} max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden pb-[env(safe-area-inset-bottom)] sm:pb-0`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Indicador visual de bottom-sheet en móvil */}
        <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className="h-1.5 w-10 rounded-full bg-slate-300" />
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-3.5 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h3 id="modal-title" className="text-base sm:text-lg font-semibold text-slate-900">
              {title}
            </h3>
            {description && (
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer min-h-10 min-w-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Cerrar modal"
            title="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">{children}</div>
      </div>
    </div>
  );
}
