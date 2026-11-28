import { useLocation } from 'react-router-dom';
import { ServerCrash } from 'lucide-react';
import { ErrorLayout } from './ErrorLayout';

interface ErrorLocationState {
  message?: string;
}

interface Error500Props {
  message?: string;
  onRetry?: () => void;
}

function Error500({ message, onRetry }: Error500Props) {
  const location = useLocation();
  const state = (location.state as ErrorLocationState | null) ?? null;

  return (
    <ErrorLayout
      code="500"
      badge="Error del servidor"
      title="Algo salió mal en el servidor"
      description="Ocurrió un problema interno al procesar la petición. Por favor verifica que el servidor esté activo e intenta nuevamente en unos segundos."
      detail={message ?? state?.message}
      icon={<ServerCrash className="h-8 w-8 sm:h-10 sm:w-10 text-rose-600" />}
      accentClasses={{
        badge: 'bg-rose-50 text-rose-700 border border-rose-200',
        iconBox: 'bg-rose-50 border-rose-200',
        codeText: 'text-rose-600',
      }}
      showRetry
      onRetry={onRetry}
    />
  );
}

export default Error500;
