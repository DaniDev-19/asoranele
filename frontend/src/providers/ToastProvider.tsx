import { useCallback, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastContext, type ToastType } from './toastContext';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => removeToast(id), 4500);
    },
    [removeToast],
  );

  const success = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      {/* Mobile-first: arriba en móvil para no chocar con la BottomNav; abajo-derecha en sm+ */}
      <div
        aria-live="polite"
        className="fixed top-4 inset-x-4 sm:top-auto sm:bottom-5 sm:right-5 sm:left-auto z-50 flex flex-col gap-2 sm:max-w-sm w-auto sm:w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-lg backdrop-blur-md transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900'
                : toast.type === 'error'
                  ? 'bg-rose-50/95 border-rose-200 text-rose-900'
                  : 'bg-slate-50/95 border-slate-200 text-slate-900'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />}
            {toast.type === 'info' && <Info className="h-5 w-5 shrink-0 text-violet-600 mt-0.5" />}

            <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-black/5 hover:text-slate-700 transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
