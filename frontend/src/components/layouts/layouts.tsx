import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  Ruler,
  DollarSign,
  Images,
  Menu,
  X,
  RefreshCw,
  MoreHorizontal,
} from 'lucide-react';
import HelpButtom from '../helpbutton/HelpButtom';
import { InstallPwaBanner } from '../pwa/InstallPwaBanner';
import { useLatestTasa, useSyncTasa } from '../../hooks/useTasas';
import { formatRate } from '../../utils/formatters';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/items', label: 'Artículos', icon: Package },
  { to: '/categorias', label: 'Categorías', icon: Tags },
  { to: '/unidades', label: 'Unidades', icon: Ruler },
  { to: '/tasas', label: 'Tasas de Cambio', icon: DollarSign },
  { to: '/imagenes', label: 'Galería', icon: Images },
];

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/items', label: 'Artículos', icon: Package },
  { to: '/categorias', label: 'Categorías', icon: Tags },
  { to: '/tasas', label: 'Tasas', icon: DollarSign },
];

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Panel de Control',
  '/items': 'Artículos',
  '/categorias': 'Categorías',
  '/unidades': 'Unidades',
  '/tasas': 'Tasas de Cambio',
  '/imagenes': 'Galería WebP',
  '/ayuda': 'Guía del Sistema',
  '/400': 'Error 400',
  '/404': 'Error 404',
  '/500': 'Error 500',
};

function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: latestTasa } = useLatestTasa();
  const syncTasa = useSyncTasa();

  const pageTitle = ROUTE_TITLES[location.pathname] ?? 'Asoranele';

  const renderNavLinks = (onNavigate?: () => void) => (
    <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navegación principal">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={Boolean(item.end)}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${isActive
                ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/20'
                : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row bg-slate-50 text-slate-900">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <img
            src="/logo.webp"
            alt="Logo Asoranele"
            className="h-9 w-9 shrink-0 rounded-xl object-contain"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">Asoranele</p>
            <p className="text-xs text-slate-500 truncate">Gracia Divina</p>
          </div>
        </div>

        {renderNavLinks()}

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              PWA Acceso Directo
            </p>
            <p className="mt-0.5 text-xs text-slate-600">
              Optimizado para uso móvil y escritorio sin inicio de sesión.
            </p>
          </div>
        </div>
      </aside>

      {/* Drawer Móvil ("Más") */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-slate-900/50 backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="fixed inset-y-0 left-0 w-72 max-w-[82vw] bg-white shadow-2xl flex flex-col pb-[env(safe-area-inset-bottom)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo.webp"
                  alt="Logo Asoranele"
                  className="h-8 w-8 shrink-0 rounded-xl object-contain"
                />
                <span className="font-bold text-slate-900">Asoranele PWA</span>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="cursor-pointer min-h-10 min-w-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                aria-label="Cerrar menú"
                title="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderNavLinks(() => setSidebarOpen(false))}
          </aside>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Header Mobile-First */}
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 shrink-0 items-center justify-between gap-2 border-b border-violet-700/20 bg-violet-600 px-3 sm:px-6 shadow-sm pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="cursor-pointer lg:hidden min-h-10 min-w-10 flex items-center justify-center rounded-xl text-violet-100 hover:bg-white/15 hover:text-white transition-colors"
              aria-label="Abrir menú"
              title='Abrir menú'
            >
              <Menu className="h-5 w-5 cursor-pointer" />
            </button>

            <h1 className="text-base sm:text-xl font-bold tracking-tight text-white truncate">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Widget de tasa visible desde móvil */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 rounded-xl bg-white/15 px-2.5 py-1.5 text-[11px] sm:text-xs text-white backdrop-blur-xs">
              {latestTasa ? (
                <>
                  <span>
                    BCV: <strong className="font-semibold">{formatRate(latestTasa.dolar_bcv)}</strong>
                  </span>
                  <span className="hidden sm:inline text-violet-200">|</span>
                  <span className="hidden sm:inline">
                    USDT: <strong className="font-semibold">{formatRate(latestTasa.dolar_paralelo)}</strong>
                  </span>
                </>
              ) : (
                <span>Sin tasa</span>
              )}

              <button
                type="button"
                onClick={() => syncTasa.mutate()}
                disabled={syncTasa.isPending}
                title="Sincronizar tasas"
                aria-label="Sincronizar tasas"
                className="cursor-pointer rounded-lg p-1 hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncTasa.isPending ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <HelpButtom />
          </div>
        </header>

        {/* Main con espacio inferior para la BottomNav en móvil */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation Bar Mobile-First (PWA App Feel) */}
      <nav
        aria-label="Navegación inferior móvil"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      >
        <div className="grid grid-cols-5 h-16">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={Boolean(item.end)}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${isActive ? 'text-violet-600' : 'text-slate-500 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`rounded-xl px-3 py-1 transition-colors ${isActive ? 'bg-violet-100/80' : ''
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="truncate max-w-full px-1">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}

          <button
            type="button"
            title="Más opciones de navegación"
            onClick={() => setSidebarOpen(true)}
            className="cursor-pointer flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <div className="rounded-xl px-3 py-1">
              <MoreHorizontal className="h-5 w-5" />
            </div>
            <span>Más</span>
          </button>
        </div>
      </nav>

      {/* Banner personalizado para instalar la PWA */}
      <InstallPwaBanner />
    </div>
  );
}

export default Layout;
