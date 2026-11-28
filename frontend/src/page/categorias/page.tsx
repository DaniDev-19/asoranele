import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Pencil, Trash2, Tags } from 'lucide-react';
import {
  useCategoriasPaginated,
  useCreateCategoria,
  useDeleteCategoria,
  useDeleteManyCategorias,
  useUpdateCategoria,
} from '../../hooks/useCategorias';
import { useDebounce } from '../../hooks/useDebounce';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState, Spinner } from '../../components/ui/EmptyState';
import type { Categoria } from '../../types/api';

const categoriaSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(250, 'El nombre no puede exceder los 250 caracteres'),
});

type CategoriaFormValues = z.infer<typeof categoriaSchema>;

function CategoriasPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [deletingCategoria, setDeletingCategoria] = useState<Categoria | null>(null);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);

  const { data, isLoading, isError } = useCategoriasPaginated({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });

  const createMutation = useCreateCategoria();
  const updateMutation = useUpdateCategoria();
  const deleteMutation = useDeleteCategoria();
  const deleteManyMutation = useDeleteManyCategorias();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema),
  });

  const categorias = data?.data ?? [];
  const meta = data?.meta;

  const openCreateModal = () => {
    setEditingCategoria(null);
    reset({ name: '' });
    setIsFormOpen(true);
  };

  const openEditModal = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    reset({ name: categoria.name ?? '' });
    setIsFormOpen(true);
  };

  const onSubmit = async (values: CategoriaFormValues) => {
    if (editingCategoria) {
      await updateMutation.mutateAsync({ id: editingCategoria.id, payload: values });
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
    if (selectedIds.length === categorias.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categorias.map((c) => c.id));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategoria) return;
    await deleteMutation.mutateAsync(deletingCategoria.id);
    setSelectedIds((prev) => prev.filter((id) => id !== deletingCategoria.id));
    setDeletingCategoria(null);
  };

  const handleConfirmBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    await deleteManyMutation.mutateAsync(selectedIds);
    setSelectedIds([]);
    setIsBatchDeleteOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Barra de acciones superior */}
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
            placeholder="Buscar categorías (ej. bebidas frias)..."
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
            title="Haz Clic para Crear una Nueva Categoría"
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <Spinner label="Cargando categorías..." />
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
          Error al cargar las categorías. Verifica la conexión con el backend.
        </div>
      ) : categorias.length === 0 ? (
        <EmptyState
          icon={<Tags className="h-6 w-6" />}
          title="No hay categorías registradas"
          description={
            debouncedSearch
              ? 'No se encontraron categorías que coincidan con tu búsqueda.'
              : 'Comienza creando la primera categoría para organizar tus artículos.'
          }
          action={
            !debouncedSearch && (
              <button
                type="button"
                onClick={openCreateModal}
                title="Haz Clic para Crear una Nueva Categoría"
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Plus className="h-4 w-4" />
                Crear Categoría
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
                  checked={categorias.length > 0 && selectedIds.length === categorias.length}
                  onChange={handleToggleAll}
                  aria-label="Seleccionar todas"
                  className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <span>Seleccionar todas ({categorias.length})</span>
              </label>
              <span>Total: {meta?.totalItems ?? categorias.length}</span>
            </div>

            {categorias.map((cat) => (
              <div key={cat.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(cat.id)}
                    onChange={() => handleToggleSelect(cat.id)}
                    aria-label={`Seleccionar ${cat.name ?? cat.id}`}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{cat.name}</p>
                    <p className="text-xs font-mono text-slate-400">ID #{cat.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="cursor-pointer min-h-10 min-w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                    aria-label="Editar categoría"
                    title="Haz Clic para Editar la Categoría"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingCategoria(cat)}
                    className="cursor-pointer min-h-10 min-w-10 flex items-center justify-center rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
                    aria-label="Eliminar categoría"
                    title="Haz Clic para Eliminar la Categoría"
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
                      checked={categorias.length > 0 && selectedIds.length === categorias.length}
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
                {categorias.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(cat.id)}
                        onChange={() => handleToggleSelect(cat.id)}
                        aria-label={`Seleccionar ${cat.name ?? cat.id}`}
                        className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">#{cat.id}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">{cat.name}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          title="Editar"
                          className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCategoria(cat)}
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

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
        description="Ingresa el nombre de la categoría para clasificar tus artículos."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="categoria-name" className="block text-sm font-medium text-slate-700">
              Nombre de la categoría
            </label>
            <input
              id="categoria-name"
              type="text"
              autoFocus
              {...register('name')}
              placeholder="Ej. Bebidas, Ferretería, Lácteos..."
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
              title="Haz Clic para Guardar la Categoría"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="cursor-pointer rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Guardando...'
                : editingCategoria
                  ? 'Actualizar'
                  : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmación de eliminación individual */}
      <ConfirmDialog
        isOpen={Boolean(deletingCategoria)}
        onClose={() => setDeletingCategoria(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title="Eliminar Categoría"
        message={`¿Estás seguro de eliminar "${deletingCategoria?.name}"? Si tiene artículos asociados en cascada, podrían verse afectados.`}
      />

      {/* Confirmación de eliminación por lote */}
      <ConfirmDialog
        isOpen={isBatchDeleteOpen}
        onClose={() => setIsBatchDeleteOpen(false)}
        onConfirm={handleConfirmBatchDelete}
        isLoading={deleteManyMutation.isPending}
        title="Eliminación en Lote"
        message={`¿Deseas eliminar las ${selectedIds.length} categorías seleccionadas? Esta acción no se puede deshacer.`}
        confirmLabel={`Eliminar ${selectedIds.length}`}
      />
    </div>
  );
}

export default CategoriasPage;
