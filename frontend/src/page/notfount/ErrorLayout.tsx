import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, LifeBuoy, RefreshCw } from 'lucide-react';

export interface ErrorPageProps {
  code: '400' | '404' | '500';
  badge: string;
  title: string;
  description: string;
  detail?: string;
  icon: ReactNode;
  accentClasses: {
    badge: string;
    iconBox: string;
    codeText: string;
  };
  showRetry?: boolean;
  onRetry?: () => void;
}

export function ErrorLayout({
  code,
  badge,
  title,
  description,
  detail,
  icon,
  accentClasses,
  showRetry = false,
  onRetry,
}: ErrorPageProps) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      return;
    }
    window.location.reload();
  };

  return (
    <section
      aria-labelledby={`error-title-${code}`}
      className="min-h-[70dvh] flex items-center justify-center px-3 py-6 sm:px-6 sm:py-10"
    >
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 text-center shadow-xs">
        <div className="flex flex-col items-center">
          <div
            className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border ${accentClasses.iconBox}`}
          >
            {icon}
          </div>

          <span
            className={`mt-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${accentClasses.badge}`}
          >
            Error {code} · {badge}
          </span>

          <p
            className={`mt-3 text-5xl sm:text-6xl font-black tracking-tight ${accentClasses.codeText}`}
          >
            {code}
          </p>

          <h1
            id={`error-title-${code}`}
            className="mt-2 text-xl sm:text-2xl font-bold text-slate-900"
          >
            {title}
          </h1>

          <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed">
            {description}
          </p>

          {detail && (
            <div className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-left text-xs text-slate-600 break-words">
              <span className="font-semibold text-slate-700">Detalle técnico: </span>
              {detail}
            </div>
          )}
        </div>

        {/* Acciones mobile-first: apiladas en móvil, en fila desde sm */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
          {showRetry && (
            <button
              type="button"
              onClick={handleRetry}
              title="Reintentar operación"
              className="cursor-pointer min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </button>
          )}

          <Link
            to="/"
            title="Ir al Panel Principal"
            className={`cursor-pointer min-h-11 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
              showRetry
                ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : 'bg-violet-600 text-white shadow-sm hover:bg-violet-700'
            }`}
          >
            <Home className="h-4 w-4" />
            Ir al Dashboard
          </Link>

          <button
            type="button"
            onClick={handleGoBack}
            title="Volver a la página anterior"
            className="cursor-pointer min-h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver atrás
          </button>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <Link
            to="/ayuda"
            title="Consultar la guía de ayuda del sistema"
            className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-violet-600 transition-colors"
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            ¿Necesitas ayuda? Abre el Manual del Sistema
          </Link>
        </div>
      </div>
    </section>
  );
}
