import { useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  FileSpreadsheet,
  Upload,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import {
  useDeleteItem,
  useDeleteManyItems,
  useItemsPaginated,
  useUpdateItemStatus,
} from '../../hooks/useItems';
import { useAllCategorias } from '../../hooks/useCategorias';
import { useAllUnidades } from '../../hooks/useUnidades';
import { useLatestTasa } from '../../hooks/useTasas';
import { useDebounce } from '../../hooks/useDebounce';
import { itemService } from '../../services/item.service';
import { useToast } from '../../hooks/useToast';
import { ItemFormModal } from '../../components/items/ItemFormModal';
import { ImportExcelModal } from '../../components/items/ImportExcelModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { Pagination } from '../../components/ui/Pagination';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState, Spinner } from '../../components/ui/EmptyState';
import { formatCurrency, resolveImageUrl } from '../../utils/formatters';
import type { Item, ItemStatus } from '../../types/api';

function ItemPage() {
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [categoriaFilter, setCategoriaFilter] = useState<string>('');
  const [unidadFilter, setUnidadFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const { data: categorias = [] } = useAllCategorias();
  const { data: unidades = [] } = useAllUnidades();
  const { data: latestTasa } = useLatestTasa();

  const { data, isLoading, isError } = useItemsPaginated({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    categoria_id: categoriaFilter ? Number(categoriaFilter) : undefined,
    unidad_id: unidadFilter ? Number(unidadFilter) : undefined,
    status: (statusFilter as ItemStatus) || undefined,
  });

  const updateStatus = useUpdateItemStatus();
  const deleteItem = useDeleteItem();
  const deleteManyItems = useDeleteManyItems();

  const items = data?.data ?? [];
  const meta = data?.meta;
  const bcvRate = latestTasa?.dolar_bcv ? Number(latestTasa.dolar_bcv) : null;

  const openCreateModal = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    await deleteItem.mutateAsync(deletingItem.id);
    setSelectedIds((prev) => prev.filter((id) => id !== deletingItem.id));
    setDeletingItem(null);
  };

  const handleConfirmBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    await deleteManyItems.mutateAsync(selectedIds);
    setSelectedIds([]);
    setIsBatchDeleteOpen(false);
  };

  const handleExportExcel = async () => {
    try {
      const blob = await itemService.exportExcel();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `articulos_asoranele_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Archivo Excel exportado correctamente.');
    } catch {
      toast.error('Error al exportar el archivo Excel.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra superior: Búsqueda + Acciones */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar artículos por nombre o descripción..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {selectedIds.length > 0 && (
            <button
              type="button"
              title="Eliminar artículos seleccionados"
              onClick={() => setIsBatchDeleteOpen(true)}
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar ({selectedIds.length})
            </button>
          )}

          <button
            type="button"
            title="Importar artículos desde un archivo Excel"
            onClick={() => setIsImportOpen(true)}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Upload className="h-4 w-4 text-emerald-600" />
            Importar Excel
          </button>

          <button
            type="button"
            title="Exportar inventario a Excel"
            onClick={handleExportExcel}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Exportar Excel
          </button>

          <a
            href={itemService.getExportCatalogPdfUrl()}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver catálogo en PDF"
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileText className="h-4 w-4 text-rose-600" />
            Catálogo PDF
          </a>

          <button
            type="button"
            title="Crear nuevo artículo"
            onClick={openCreateModal}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo Artículo
          </button>
        </div>
      </div>

      {/* Filtros secundarios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <CustomSelect
          value={categoriaFilter}
          onChange={(val) => {
            setCategoriaFilter(val);
            setPage(1);
          }}
          ariaLabel="Filtrar por categoría"
          options={[
            { value: '', label: 'Todas las categorías' },
            ...categorias.map((c) => ({
              value: String(c.id),
              label: c.name ?? `Categoría #${c.id}`,
            })),
          ]}
        />

        <CustomSelect
          value={unidadFilter}
          onChange={(val) => {
            setUnidadFilter(val);
            setPage(1);
          }}
          ariaLabel="Filtrar por unidad"
          options={[
            { value: '', label: 'Todas las unidades' },
            ...unidades.map((u) => ({
              value: String(u.id),
              label: u.name ?? `Unidad #${u.id}`,
            })),
          ]}
        />

        <CustomSelect
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          ariaLabel="Filtrar por estado"
          searchable={false}
          options={[
            { value: '', label: 'Todos los estados' },
            { value: 'disponible', label: 'Disponible' },
            { value: 'agotado', label: 'Agotado' },
            { value: 'inactivo', label: 'Inactivo' },
            { value: 'descontinuado', label: 'Descontinuado' },
          ]}
        />
      </div>

      {/* Tabla */}
      {isLoading ? (
        <Spinner label="Cargando inventario..." />
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
          Error al obtener los artículos. Verifica la conexión con el backend.
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="No hay artículos registrados"
          description="Crea un artículo nuevo o importa tu catálogo desde Excel."
          action={
            <button
              type="button"
              onClick={openCreateModal}
              title="Haz Clic para Crear un Artículo"
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              <Plus className="h-4 w-4" />
              Crear Artículo
            </button>
          }
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
          {/* Vista Móvil (Cards) */}
          <div className="sm:hidden divide-y divide-slate-100">
            <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={items.length > 0 && selectedIds.length === items.length}
                  onChange={handleToggleAll}
                  aria-label="Seleccionar todos"
                  className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <span>Seleccionar todos ({items.length})</span>
              </label>
              <span>Total: {meta?.totalItems ?? items.length}</span>
            </div>

            {items.map((item) => {
              const thumbUrl = item.item_image?.[0]?.imagen?.url;
              const priceNum = Number(item.price ?? 0);

              return (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleToggleSelect(item.id)}
                      aria-label={`Seleccionar ${item.name ?? item.id}`}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />

                    <div className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                      {thumbUrl ? (
                        <img
                          src={resolveImageUrl(thumbUrl)}
                          alt={item.name ?? 'Artículo'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                        <span className="font-mono text-xs text-slate-400 shrink-0">#{item.id}</span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                        {item.categoria?.name && (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700">
                            {item.categoria.name}
                          </span>
                        )}
                        {item.unidad?.name && (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                            {item.unidad.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50/70 p-2.5 rounded-xl text-xs">
                    <div>
                      <p className="font-bold text-base text-slate-900">{formatCurrency(priceNum, 'USD')}</p>
                      {bcvRate && (
                        <p className="text-[11px] text-slate-500">
                          ≈ {formatCurrency(priceNum * bcvRate, 'VES')} BCV
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={item.status} />
                      <CustomSelect
                        value={item.status}
                        ariaLabel={`Cambiar estado de ${item.name ?? item.id}`}
                        searchable={false}
                        onChange={(val) =>
                          updateStatus.mutate({
                            id: item.id,
                            status: val as ItemStatus,
                          })
                        }
                        buttonClassName="!py-1 !px-2.5 !text-[11px] bg-white border-slate-200"
                        menuClassName="right-0 left-auto w-44"
                        options={[
                          { value: 'disponible', label: 'Disponible' },
                          { value: 'agotado', label: 'Agotado' },
                          { value: 'inactivo', label: 'Inactivo' },
                          { value: 'descontinuado', label: 'Descontinuado' },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    <a
                      href={itemService.getItemPdfUrl(item.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-10 px-3 flex items-center gap-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-rose-600" />
                      PDF
                    </a>
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="min-h-10 px-3 flex items-center gap-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Pencil className="h-4 w-4 text-violet-600" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingItem(item)}
                      className="min-h-10 px-3 flex items-center gap-1.5 rounded-xl border border-rose-200 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vista Escritorio (Tabla) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="w-12 px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && selectedIds.length === items.length}
                      onChange={handleToggleAll}
                      aria-label="Seleccionar todos"
                      className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                  </th>
                  <th className="px-4 py-3.5">Artículo</th>
                  <th className="px-4 py-3.5">Precio</th>
                  <th className="px-4 py-3.5">Categoría / Unidad</th>
                  <th className="px-4 py-3.5">Estado</th>
                  <th className="w-40 px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {items.map((item) => {
                  const thumbUrl = item.item_image?.[0]?.imagen?.url;
                  const priceNum = Number(item.price ?? 0);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleToggleSelect(item.id)}
                          aria-label={`Seleccionar ${item.name ?? item.id}`}
                          className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                            {thumbUrl ? (
                              <img
                                src={resolveImageUrl(thumbUrl)}
                                alt={item.name ?? 'Artículo'}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-xs">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate max-w-xs">
                              #{item.id} {item.description ? `· ${item.description}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="font-bold text-slate-900">{formatCurrency(priceNum, 'USD')}</p>
                        {bcvRate && (
                          <p className="text-xs text-slate-500">
                            {formatCurrency(priceNum * bcvRate, 'VES')} BCV
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-800">
                          {item.categoria?.name ?? 'Sin categoría'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.unidad?.name ?? 'Sin unidad'}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col items-start gap-1.5">
                          <StatusBadge status={item.status} />
                          <CustomSelect
                            value={item.status}
                            ariaLabel={`Cambiar estado de ${item.name ?? item.id}`}
                            searchable={false}
                            onChange={(val) =>
                              updateStatus.mutate({
                                id: item.id,
                                status: val as ItemStatus,
                              })
                            }
                            buttonClassName="!py-1 !px-2.5 !text-xs bg-white border-slate-200"
                            menuClassName="w-44"
                            options={[
                              { value: 'disponible', label: 'Disponible' },
                              { value: 'agotado', label: 'Agotado' },
                              { value: 'inactivo', label: 'Inactivo' },
                              { value: 'descontinuado', label: 'Descontinuado' },
                            ]}
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <a
                            href={itemService.getItemPdfUrl(item.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver Ficha Técnica PDF"
                            className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            title="Editar artículo"
                            className="rounded-lg p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingItem(item)}
                            title="Eliminar artículo"
                            className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}

      {/* Modales */}
      {isFormOpen && (
        <ItemFormModal
          key={editingItem?.id ?? 'new'}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          editingItem={editingItem}
        />
      )}

      <ImportExcelModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />

      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteItem.isPending}
        title="Eliminar Artículo"
        message={`¿Estás seguro de eliminar "${deletingItem?.name}"? Sus imágenes exclusivas también se purgarán del almacenamiento.`}
      />

      <ConfirmDialog
        isOpen={isBatchDeleteOpen}
        onClose={() => setIsBatchDeleteOpen(false)}
        onConfirm={handleConfirmBatchDelete}
        isLoading={deleteManyItems.isPending}
        title="Eliminación en Lote"
        message={`¿Deseas eliminar los ${selectedIds.length} artículos seleccionados?`}
        confirmLabel={`Eliminar ${selectedIds.length}`}
      />
    </div>
  );
}

export default ItemPage;
