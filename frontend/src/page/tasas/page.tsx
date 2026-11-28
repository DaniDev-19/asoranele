import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RefreshCw, Save, Calculator, DollarSign, History } from 'lucide-react';
import {
  useCreateManualTasa,
  useLatestTasa,
  useSyncTasa,
  useTasaHistory,
} from '../../hooks/useTasas';
import { tasaService } from '../../services/tasa.service';
import { extractApiErrorMessage } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/EmptyState';
import { formatCurrency, formatDateTime, formatRate } from '../../utils/formatters';
import type { CurrencyConversionResult } from '../../types/api';

const manualTasaSchema = z.object({
  dolar_bcv: z.coerce.number({ message: 'Requerido' }).positive('Debe ser mayor a 0'),
  dolar_paralelo: z.coerce.number({ message: 'Requerido' }).positive('Debe ser mayor a 0'),
  euro_bcv: z.coerce.number({ message: 'Requerido' }).positive('Debe ser mayor a 0'),
  euro_paralelo: z.coerce.number({ message: 'Requerido' }).positive('Debe ser mayor a 0'),
});

type ManualTasaInput = z.input<typeof manualTasaSchema>;
type ManualTasaOutput = z.output<typeof manualTasaSchema>;

function TasasPage() {
  const toast = useToast();
  const [historyPage, setHistoryPage] = useState(1);

  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<'USD' | 'EUR' | 'VES'>('USD');
  const [conversion, setConversion] = useState<CurrencyConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const { data: latestTasa, isLoading: loadingLatest } = useLatestTasa();
  const { data: historyData, isLoading: loadingHistory } = useTasaHistory(historyPage, 10);
  const syncTasa = useSyncTasa();
  const createManual = useCreateManualTasa();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManualTasaInput, unknown, ManualTasaOutput>({
    resolver: zodResolver(manualTasaSchema),
  });

  const onManualSubmit = async (values: ManualTasaOutput) => {
    await createManual.mutateAsync(values);
    reset();
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Ingresa un monto mayor a 0 para convertir.');
      return;
    }

    setIsConverting(true);
    try {
      const result = await tasaService.convert(numericAmount, fromCurrency);
      setConversion(result);
    } catch (err) {
      toast.error(extractApiErrorMessage(err));
    } finally {
      setIsConverting(false);
    }
  };

  const historyList = historyData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Tarjeta de Tasas Vigentes + Sincronización */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Tasas Vigentes del Sistema</h2>
              <p className="text-xs text-slate-500">
                {latestTasa
                  ? `Actualizada el ${formatDateTime(latestTasa.created_at)}`
                  : 'No hay registros de tasas en la base de datos'}
              </p>
            </div>
          </div>

          <button
            type="button"
            title="Sincronizar tasas con DolarAPI"
            onClick={() => syncTasa.mutate()}
            disabled={syncTasa.isPending}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${syncTasa.isPending ? 'animate-spin' : ''}`} />
            {syncTasa.isPending ? 'Sincronizando...' : 'Sincronizar con DolarAPI'}
          </button>
        </div>

        {loadingLatest ? (
          <Spinner label="Obteniendo tasas..." />
        ) : latestTasa ? (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Dólar BCV</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                Bs. {formatRate(latestTasa.dolar_bcv)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Dólar Paralelo (USDT)</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                Bs. {formatRate(latestTasa.dolar_paralelo)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Euro BCV</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                Bs. {formatRate(latestTasa.euro_bcv)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Euro Paralelo (USDT)</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                Bs. {formatRate(latestTasa.euro_paralelo)}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Haz clic en <strong>Sincronizar con DolarAPI</strong> o registra las tasas manualmente abajo.
          </p>
        )}
      </div>

      {/* Calculadora + Registro Manual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculadora */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            <Calculator className="h-5 w-5 text-violet-600" />
            <h3 className="text-base font-bold text-slate-900">Calculadora de Divisas</h3>
          </div>

          <form onSubmit={handleConvert} className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Monto"
              className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
            />
            <CustomSelect
              value={fromCurrency}
              onChange={(val) => setFromCurrency(val as 'USD' | 'EUR' | 'VES')}
              ariaLabel="Moneda origen"
              searchable={false}
              className="sm:w-44"
              buttonClassName="border-slate-300 bg-white"
              options={[
                { value: 'USD', label: 'Dólares (USD)' },
                { value: 'EUR', label: 'Euros (EUR)' },
                { value: 'VES', label: 'Bolívares (VES)' },
              ]}
            />
            <button
              type="submit"
              disabled={isConverting}
              title="Haz Clic para Convertir"
              className="cursor-pointer rounded-xl bg-slate-900 px-2 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {isConverting ? 'Calculando...' : 'Convertir'}
            </button>
          </form>

          {conversion && (
            <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200 text-sm">
              <div>
                <p className="text-xs text-slate-500">Bolívares (BCV)</p>
                <p className="font-bold text-slate-900">
                  {formatCurrency(conversion.equivalencias.bolivares_bcv, 'VES')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Bolívares (Paralelo)</p>
                <p className="font-bold text-slate-900">
                  {formatCurrency(conversion.equivalencias.bolivares_paralelo, 'VES')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Dólares (Ref. BCV)</p>
                <p className="font-semibold text-slate-800">
                  {formatCurrency(conversion.equivalencias.dolares_bcv, 'USD')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Euros (Ref. BCV)</p>
                <p className="font-semibold text-slate-800">
                  {formatCurrency(conversion.equivalencias.euros_bcv, 'EUR')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Registro Manual */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Registro Manual de Tasas</h3>

          <form onSubmit={handleSubmit(onManualSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600">Dólar BCV</label>
              <input
                type="number"
                step="0.0001"
                {...register('dolar_bcv')}
                placeholder="Ej. 54.3210"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
              />
              {errors.dolar_bcv && (
                <p className="mt-1 text-xs text-rose-600">{errors.dolar_bcv.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">Dólar Paralelo (USDT)</label>
              <input
                type="number"
                step="0.0001"
                {...register('dolar_paralelo')}
                placeholder="Ej. 62.5000"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
              />
              {errors.dolar_paralelo && (
                <p className="mt-1 text-xs text-rose-600">{errors.dolar_paralelo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">Euro BCV</label>
              <input
                type="number"
                step="0.0001"
                {...register('euro_bcv')}
                placeholder="Ej. 57.1000"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
              />
              {errors.euro_bcv && (
                <p className="mt-1 text-xs text-rose-600">{errors.euro_bcv.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">Euro Paralelo (USDT)</label>
              <input
                type="number"
                step="0.0001"
                {...register('euro_paralelo')}
                placeholder="Ej. 66.2000"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
              />
              {errors.euro_paralelo && (
                <p className="mt-1 text-xs text-rose-600">{errors.euro_paralelo.message}</p>
              )}
            </div>

            <div className="sm:col-span-2 flex justify-end pt-1">
              <button
                type="submit"
                title="Haz Clic para Guardar las Tasas"
                disabled={createManual.isPending}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {createManual.isPending ? 'Guardando...' : 'Guardar Tasas'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Histórico */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
          <History className="h-5 w-5 text-slate-500" />
          <h3 className="text-base font-bold text-slate-900">Histórico de Tasas</h3>
        </div>

        {loadingHistory ? (
          <Spinner label="Cargando histórico..." />
        ) : (
          <>
            {/* Vista Móvil (Cards) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {historyList.map((row) => (
                <div key={row.id} className="p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500">
                    {formatDateTime(row.created_at)}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-slate-50 p-2">
                      <span className="text-slate-500 block text-[11px]">Dólar BCV</span>
                      <strong className="text-slate-900 font-semibold text-sm">
                        Bs. {formatRate(row.dolar_bcv)}
                      </strong>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <span className="text-slate-500 block text-[11px]">USDT Paralelo</span>
                      <strong className="text-slate-900 font-semibold text-sm">
                        Bs. {formatRate(row.dolar_paralelo)}
                      </strong>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <span className="text-slate-500 block text-[11px]">Euro BCV</span>
                      <span className="text-slate-700 font-medium">
                        Bs. {formatRate(row.euro_bcv)}
                      </span>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <span className="text-slate-500 block text-[11px]">Euro Paralelo</span>
                      <span className="text-slate-700 font-medium">
                        Bs. {formatRate(row.euro_paralelo)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista Escritorio (Tabla) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Fecha Registro</th>
                    <th className="px-4 py-3">Dólar BCV</th>
                    <th className="px-4 py-3">Dólar Paralelo</th>
                    <th className="px-4 py-3">Euro BCV</th>
                    <th className="px-4 py-3">Euro Paralelo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {historyList.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 text-slate-600">{formatDateTime(row.created_at)}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">Bs. {formatRate(row.dolar_bcv)}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">Bs. {formatRate(row.dolar_paralelo)}</td>
                      <td className="px-4 py-3 text-slate-700">Bs. {formatRate(row.euro_bcv)}</td>
                      <td className="px-4 py-3 text-slate-700">Bs. {formatRate(row.euro_paralelo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={historyData?.meta} onPageChange={setHistoryPage} />
          </>
        )}
      </div>
    </div>
  );
}

export default TasasPage;
