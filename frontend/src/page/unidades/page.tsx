import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Pencil, Trash2, Ruler } from 'lucide-react';
import {
  useCreateUnidad,
  useDeleteManyUnidades,
  useDeleteUnidad,
  useUnidadesPaginated,
  useUpdateUnidad,
} from '../../hooks/useUnidades';
import { useDebounce } from '../../hooks/useDebounce';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState, Spinner } from '../../components/ui/EmptyState';
import type { Unidad } from '../../types/api';

const unidadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(250, 'El nombre no puede exceder los 250 caracteres'),
});

type UnidadFormValues = z.infer<typeof unidadSchema>;

function UnidadesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnidad, setEditingUnidad] = useState<Unidad | null>(null);
  const [deletingUnidad, setDeletingUnidad] = useState<Unidad | null>(null);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);

  const { data, isLoading, isError } = useUnidadesPaginated({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });

  const createMutation = useCreateUnidad();
  const updateMutation = useUpdateUnidad();
  const deleteMutation = useDeleteUnidad();
  const deleteManyMutation = useDeleteManyUnidades();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnidadFormValues>({
    resolver: zodResolver(unidadSchema),
  });

  const unidades = data?.data ?? [];
  const meta = data?.meta;

  const openCreateModal = () => {
    setEditingUnidad(null);
    reset({ name: '' });
    setIsFormOpen(true);
  };

  const openEditModal = (unidad: Unidad) => {
    setEditingUnidad(unidad);
    reset({ name: unidad.name ?? '' });
    setIsFormOpen(true);
  };

  const onSubmit = async (values: UnidadFormValues) => {
    if (editingUnidad) {
      await updateMutation.mutateAsync({ id: editingUnidad.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    setIsFormOpen(false);
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleAll = () => {
    if (selectedIds.length === unidades.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unidades.map((u) => u.id));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUnidad) return;
    await deleteMutation.mutateAsync(deletingUnidad.id);
    setSelectedIds((prev) => prev.filter((id) => id !== deletingUnidad.id));
    setDeletingUnidad(null);
  };

  const handleConfirmBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    await deleteManyMutation.mutateAsync(selectedIds);
    setSelectedIds([]);
    setIsBatchDeleteOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar unidades (ej. kilogramo, caja)..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setIsBatchDeleteOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar ({selectedIds.length})
            </button>
          )}

          <button
            type="button"
            onClick={openCreateModal}
            title="Haz Clic para Crear una Unidad"
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva Unidad
          </button>
        </div>
      </div>

      {isLoading ? (
        <Spinner label="Cargando unidades de medida..." />
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
          Error al cargar las unidades. Verifica la conexión con el backend.
        </div>
      ) : unidades.length === 0 ? (
        <EmptyState
          icon={<Ruler className="h-6 w-6" />}
          title="No hay unidades de medida"
          description={
            debouncedSearch
              ? 'No se encontraron unidades que coincidan con tu búsqueda.'
              : 'Agrega unidades como Kilogramo, Litro, Caja o Unidad para tus artículos.'
          }
          action={
            !debouncedSearch && (
              <button
                type="button"
                onClick={openCreateModal}
                title="Haz Clic para Crear una Unidad"
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Plus className="h-4 w-4" />
                Crear Unidad
              </button>
            )
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          {/* Vista Móvil (Cards) */}
          <div className="sm:hidden divide-y divide-slate-100">
            <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unidades.length > 0 && selectedIds.length === unidades.length}
                  onChange={handleToggleAll}
                  aria-label="Seleccionar todas"
                  className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <span>Seleccionar todas ({unidades.length})</span>
              </label>
              <span>Total: {meta?.totalItems ?? unidades.length}</span>
            </div>

            {unidades.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(u.id)}
                    onChange={() => handleToggleSelect(u.id)}
                    aria-label={`Seleccionar ${u.name ?? u.id}`}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{u.name}</p>
                    <p className="text-xs font-mono text-slate-400">ID #{u.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(u)}
                    className="cursor-pointer min-h-10 min-w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                    aria-label="Editar unidad"
                    title="Haz Clic para Editar la Unidad"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Haz Clic para Eliminar la Unidad"
                    onClick={() => setDeletingUnidad(u)}
                    className="cursor-pointer min-h-10 min-w-10 flex items-center justify-center rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
                    aria-label="Eliminar unidad"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Vista Escritorio (Tabla) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="w-12 px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={unidades.length > 0 && selectedIds.length === unidades.length}
                      onChange={handleToggleAll}
                      aria-label="Seleccionar todas"
                      className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                  </th>
                  <th className="w-20 px-4 py-3.5">ID</th>
                  <th className="px-4 py-3.5">Nombre</th>
                  <th className="w-36 px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {unidades.map((unidad) => (
                  <tr key={unidad.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(unidad.id)}
                        onChange={() => handleToggleSelect(unidad.id)}
                        aria-label={`Seleccionar ${unidad.name ?? unidad.id}`}
                        className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">#{unidad.id}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">{unidad.name}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(unidad)}
                          title="Editar"
                          className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingUnidad(unidad)}
                          title="Eliminar"
                          className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingUnidad ? 'Editar Unidad' : 'Nueva Unidad de Medida'}
        description="Define la presentación o unidad de medida para los productos."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="unidad-name" className="block text-sm font-medium text-slate-700">
              Nombre de la unidad
            </label>
            <input
              id="unidad-name"
              type="text"
              autoFocus
              {...register('name')}
              placeholder="Ej. Kilogramo, Litro, Paquete, Unidad..."
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-rose-600">{errors.name.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              title="Haz Clic para Cancelar"
              onClick={() => setIsFormOpen(false)}
              className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              title="Haz Clic para Guardar la Unidad"
              className="cursor-pointer rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Guardando...'
                : editingUnidad
                  ? 'Actualizar'
                  : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingUnidad)}
        onClose={() => setDeletingUnidad(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title="Eliminar Unidad"
        message={`¿Estás seguro de eliminar "${deletingUnidad?.name}"?`}
      />

      <ConfirmDialog
        isOpen={isBatchDeleteOpen}
        onClose={() => setIsBatchDeleteOpen(false)}
        onConfirm={handleConfirmBatchDelete}
        isLoading={deleteManyMutation.isPending}
        title="Eliminación en Lote"
        message={`¿Deseas eliminar las ${selectedIds.length} unidades seleccionadas?`}
        confirmLabel={`Eliminar ${selectedIds.length}`}
      />
    </div>
  );
}

export default UnidadesPage;
