import { useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { ErrorLayout } from './ErrorLayout';

interface ErrorLocationState {
  message?: string;
}

function Error400() {
  const location = useLocation();
  const state = (location.state as ErrorLocationState | null) ?? null;

  return (
    <ErrorLayout
      code="400"
      badge="Solicitud incorrecta"
      title="No pudimos procesar tu solicitud"
      description="Algunos parámetros o datos enviados no tienen el formato esperado por el sistema de Asoranele Gracia Divina. Revisa la información e inténtalo de nuevo."
      detail={state?.message}
      icon={<AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600" />}
      accentClasses={{
        badge: 'bg-amber-50 text-amber-700 border border-amber-200',
        iconBox: 'bg-amber-50 border-amber-200',
        codeText: 'text-amber-600',
      }}
    />
  );
}

export default Error400;
