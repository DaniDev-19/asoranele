import { Link } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  AlertCircle,
  Tags,
  Ruler,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  ArrowRight,
  DollarSign,
} from 'lucide-react';
import { useItemStats } from '../../hooks/useItems';
import { useCategoriasWithCount } from '../../hooks/useCategorias';
import { useUnidadesWithCount } from '../../hooks/useUnidades';
import { useLatestTasa, useSyncTasa } from '../../hooks/useTasas';
import { itemService } from '../../services/item.service';
import { formatDateTime, formatRate } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';
import { Spinner } from '../../components/ui/EmptyState';

function DashboardPage() {
  const toast = useToast();
  const { data: stats, isLoading: loadingStats } = useItemStats();
  const { data: categorias } = useCategoriasWithCount();
  const { data: unidades } = useUnidadesWithCount();
  const { data: tasa, isLoading: loadingTasa } = useLatestTasa();
  const syncTasa = useSyncTasa();

  const handleDownloadExcel = async () => {
    try {
      const blob = await itemService.exportExcel();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventario_asoranele_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Archivo Excel descargado.');
    } catch {
      toast.error('No se pudo exportar el archivo Excel.');
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      {loadingStats ? (
        <Spinner label="Cargando resumen del inventario..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Total Artículos</span>
              <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{stats?.total ?? 0}</p>
            <Link
              to="/items"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700"
            >
              Ver inventario <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Disponibles</span>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-emerald-700">{stats?.disponibles ?? 0}</p>
            <p className="mt-3 text-xs text-slate-500">Activos para catálogo</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Agotados / Inactivos</span>
              <div className="rounded-xl bg-rose-50 p-2 text-rose-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-rose-600">
              {(stats?.agotados ?? 0) + (stats?.inactivos ?? 0)}
            </p>
            <p className="mt-3 text-xs text-slate-500">
              {stats?.agotados ?? 0} agotados · {stats?.inactivos ?? 0} inactivos
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Catálogos Base</span>
              <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <Tags className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-4">
              <div>
                <span className="text-2xl font-bold text-slate-900">{categorias?.length ?? 0}</span>
                <span className="ml-1.5 text-xs text-slate-500">Categorías</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900">{unidades?.length ?? 0}</span>
                <span className="ml-1.5 text-xs text-slate-500">Unidades</span>
              </div>
            </div>
            <div className="mt-3 flex gap-3 text-xs font-medium">
              <Link to="/categorias" className="text-violet-600 hover:underline">
                Categorías
              </Link>
              <Link to="/unidades" className="text-violet-600 hover:underline">
                Unidades
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Sección Tasas de Cambio + Acciones Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Tasas de Cambio Vigentes</h2>
                <p className="text-xs text-slate-500">
                  {tasa
                    ? `Última actualización: ${formatDateTime(tasa.created_at)}`
                    : 'Aún no hay tasas registradas en base de datos'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => syncTasa.mutate()}
              disabled={syncTasa.isPending}
              title="Haz Clic para Sincronizar"
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncTasa.isPending ? 'animate-spin' : ''}`} />
              {syncTasa.isPending ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </div>

          {loadingTasa ? (
            <Spinner label="Cargando tasas..." />
          ) : tasa ? (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Dólar Oficial (BCV)
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  Bs. {formatRate(tasa.dolar_bcv)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Dólar Paralelo (USDT)
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  Bs. {formatRate(tasa.dolar_paralelo)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Euro Oficial (BCV)
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  Bs. {formatRate(tasa.euro_bcv)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Euro Paralelo (USDT)
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  Bs. {formatRate(tasa.euro_paralelo)}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              Presiona <strong>Sincronizar</strong> para descargar y guardar las tasas de hoy.
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <Link
              to="/tasas"
              className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
            >
              Ir al calculador e histórico completo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Reportes y Accesos Rápidos */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Reportes y Exportación</h2>
            <p className="mt-1 text-xs text-slate-500">
              Descarga el inventario actualizado en formatos listos para compartir o imprimir.
            </p>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={handleDownloadExcel}
                title="Haz Clic para Exportar el Inventario"
                className="cursor-pointer w-full flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-left text-sm font-medium text-emerald-900 hover:bg-emerald-100/70 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                  Exportar Inventario Excel
                </span>
                <ArrowRight className="h-4 w-4 text-emerald-600" />
              </button>

              <a
                href={itemService.getExportCatalogPdfUrl()}
                target="_blank"
                rel="noopener noreferrer"
                title="Haz Clic para Ver el Catálogo en PDF"
                className="cursor-pointer w-full flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-left text-sm font-medium text-rose-900 hover:bg-rose-100/70 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-rose-600" />
                  Catálogo General en PDF
                </span>
                <ArrowRight className="h-4 w-4 text-rose-600" />
              </a>

              <Link
                to="/unidades"
                title="Haz Clic para Administrar las Unidades"
                className="cursor-pointer w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <Ruler className="h-5 w-5 text-slate-600" />
                  Administrar Unidades
                </span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
