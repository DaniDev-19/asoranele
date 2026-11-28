import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/layouts/layouts';
import { Spinner } from './components/ui/EmptyState';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { API_ERROR_EVENT, type ApiNavigationErrorDetail } from './services/api';

const DashboardPage = lazy(() => import('./page/dashboard/page'));
const ItemPage = lazy(() => import('./page/item/page'));
const CategoriasPage = lazy(() => import('./page/categorias/page'));
const UnidadesPage = lazy(() => import('./page/unidades/page'));
const TasasPage = lazy(() => import('./page/tasas/page'));
const ImagenesPage = lazy(() => import('./page/imagenes/page'));
const HelpPage = lazy(() => import('./page/help/page'));
const Error400 = lazy(() => import('./page/notfount/400'));
const Error404 = lazy(() => import('./page/notfount/404'));
const Error500 = lazy(() => import('./page/notfount/500'));

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner label="Cargando módulo..." />
    </div>
  );
}

/**
 * Escucha errores HTTP críticos (400, 404, 500) emitidos por apiClient
 * y redirige a la vista correspondiente conservando el detalle técnico.
 */
function ApiErrorListener() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleApiError = (event: Event) => {
      const customEvent = event as CustomEvent<ApiNavigationErrorDetail>;
      const detail = customEvent.detail;
      if (!detail) return;

      const targetPath = `/${detail.status}`;
      if (location.pathname === targetPath) return;

      navigate(targetPath, {
        replace: false,
        state: { message: detail.message },
      });
    };

    window.addEventListener(API_ERROR_EVENT, handleApiError);
    return () => window.removeEventListener(API_ERROR_EVENT, handleApiError);
  }, [navigate, location.pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ApiErrorListener />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="items" element={<ItemPage />} />
              <Route path="categorias" element={<CategoriasPage />} />
              <Route path="unidades" element={<UnidadesPage />} />
              <Route path="tasas" element={<TasasPage />} />
              <Route path="imagenes" element={<ImagenesPage />} />
              <Route path="ayuda" element={<HelpPage />} />

              {/* Páginas de error HTTP */}
              <Route path="400" element={<Error400 />} />
              <Route path="404" element={<Error404 />} />
              <Route path="500" element={<Error500 />} />

              {/* Alias por compatibilidad con rutas previas */}
              <Route path="home" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Error404 />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
