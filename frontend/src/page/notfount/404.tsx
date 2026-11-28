import { useLocation } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { ErrorLayout } from './ErrorLayout';

interface ErrorLocationState {
  message?: string;
}

function Error404() {
  const location = useLocation();
  const state = (location.state as ErrorLocationState | null) ?? null;

  return (
    <ErrorLayout
      code="404"
      badge="No encontrado"
      title="Página o recurso no encontrado"
      description="La ruta o el elemento que estás buscando no existe, fue movido o ya fue eliminado del panel de Asoranele Gracia Divina."
      detail={state?.message}
      icon={<FileQuestion className="h-8 w-8 sm:h-10 sm:w-10 text-violet-600" />}
      accentClasses={{
        badge: 'bg-violet-50 text-violet-700 border border-violet-200',
        iconBox: 'bg-violet-50 border-violet-200',
        codeText: 'text-violet-600',
      }}
    />
  );
}

export default Error404;
