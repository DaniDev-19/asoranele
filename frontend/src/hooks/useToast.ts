import { useContext } from 'react';
import { ToastContext, type ToastContextValue } from '../providers/toastContext';

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe utilizarse dentro de ToastProvider');
  }
  return ctx;
}
