import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { CustomSelect } from '../ui/CustomSelect';
import { useAllCategorias } from '../../hooks/useCategorias';
import { useAllUnidades } from '../../hooks/useUnidades';
import { useCreateItem, useUpdateItem } from '../../hooks/useItems';
import { imagenService } from '../../services/imagen.service';
import { extractApiErrorMessage } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { resolveImageUrl } from '../../utils/formatters';
import type { Imagen, Item, ItemStatus } from '../../types/api';

const itemFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(350, 'Máximo 350 caracteres'),
  price: z.coerce
    .number({ message: 'Ingresa un precio válido' })
    .min(0, 'El precio no puede ser negativo'),
  description: z.string().trim().max(5000, 'Máximo 5000 caracteres').optional(),
  status: z.enum(['disponible', 'agotado', 'inactivo', 'descontinuado']),
  categoria_id: z.string().optional(),
  unidad_id: z.string().optional(),
});

type ItemFormInput = z.input<typeof itemFormSchema>;
type ItemFormOutput = z.output<typeof itemFormSchema>;

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: Item | null;
}

export function ItemFormModal({ isOpen, onClose, editingItem }: ItemFormModalProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: categorias = [] } = useAllCategorias();
  const { data: unidades = [] } = useAllUnidades();

  const createItem = useCreateItem();
  const updateItem = useUpdateItem();

  const [uploadedImages, setUploadedImages] = useState<Imagen[]>(
    () => editingItem?.item_image?.map((rel) => rel.imagen) ?? [],
  );
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemFormInput, unknown, ItemFormOutput>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: editingItem?.name ?? '',
      price: editingItem?.price ? Number(editingItem.price) : 0,
      description: editingItem?.description ?? '',
      status: editingItem?.status ?? 'disponible',
      categoria_id: editingItem?.categoria_id ? String(editingItem.categoria_id) : '',
      unidad_id: editingItem?.unidad_id ? String(editingItem.unidad_id) : '',
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remainingSlots = 10 - uploadedImages.length;
    if (files.length > remainingSlots) {
      toast.error(`Solo puedes asociar hasta 10 imágenes (espacios disponibles: ${remainingSlots}).`);
      return;
    }

    setIsUploadingImages(true);
    try {
      // imagenService.uploadMultiple convierte automáticamente cada archivo a .webp antes de enviarlo
      const newImages = await imagenService.uploadMultiple(files);
      setUploadedImages((prev) => [...prev, ...newImages]);
      toast.success(`${newImages.length} imagen(es) optimizadas a .webp y subidas.`);
    } catch (err) {
      toast.error(extractApiErrorMessage(err));
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imageId: number) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const onSubmit = async (values: ItemFormOutput) => {
    const payload = {
      name: values.name,
      price: values.price,
      description: values.description || null,
      status: values.status as ItemStatus,
      categoria_id: values.categoria_id ? Number(values.categoria_id) : null,
      unidad_id: values.unidad_id ? Number(values.unidad_id) : null,
      image_ids: uploadedImages.map((img) => img.id),
    };

    if (editingItem) {
      await updateItem.mutateAsync({ id: editingItem.id, payload });
    } else {
      await createItem.mutateAsync(payload);
    }
    onClose();
  };

  const isSaving = createItem.isPending || updateItem.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'Editar Artículo' : 'Nuevo Artículo'}
      description="Completa la ficha del artículo. Las imágenes se convierten automáticamente a .webp antes de enviarse."
      maxWidthClass="sm:max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="item-name" className="block text-sm font-medium text-slate-700">
              Nombre del artículo *
            </label>
            <input
              id="item-name"
              type="text"
              {...register('name')}
              placeholder="Ej. Aceite de Oliva Extra Virgen 1L"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="item-price" className="block text-sm font-medium text-slate-700">
              Precio (USD) *
            </label>
            <input
              id="item-price"
              type="number"
              step="0.01"
              min="0"
              {...register('price')}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
            {errors.price && <p className="mt-1 text-xs text-rose-600">{errors.price.message}</p>}
          </div>

          <div>
            <label htmlFor="item-status" className="block text-sm font-medium text-slate-700">
              Estado
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  id="item-status"
                  value={field.value}
                  onChange={field.onChange}
                  searchable={false}
                  className="mt-1.5"
                  buttonClassName="border-slate-300 bg-white"
                  options={[
                    { value: 'disponible', label: 'Disponible' },
                    { value: 'agotado', label: 'Agotado' },
                    { value: 'inactivo', label: 'Inactivo' },
                    { value: 'descontinuado', label: 'Descontinuado' },
                  ]}
                />
              )}
            />
          </div>

          <div>
            <label htmlFor="item-categoria" className="block text-sm font-medium text-slate-700">
              Categoría
            </label>
            <Controller
              name="categoria_id"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  id="item-categoria"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  className="mt-1.5"
                  buttonClassName="border-slate-300 bg-white"
                  options={[
                    { value: '', label: 'Sin categoría' },
                    ...categorias.map((cat) => ({
                      value: String(cat.id),
                      label: cat.name ?? `Categoría #${cat.id}`,
                    })),
                  ]}
                />
              )}
            />
          </div>

          <div>
            <label htmlFor="item-unidad" className="block text-sm font-medium text-slate-700">
              Unidad de Medida
            </label>
            <Controller
              name="unidad_id"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  id="item-unidad"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  className="mt-1.5"
                  buttonClassName="border-slate-300 bg-white"
                  options={[
                    { value: '', label: 'Sin unidad' },
                    ...unidades.map((u) => ({
                      value: String(u.id),
                      label: u.name ?? `Unidad #${u.id}`,
                    })),
                  ]}
                />
              )}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="item-description" className="block text-sm font-medium text-slate-700">
              Descripción
            </label>
            <textarea
              id="item-description"
              rows={3}
              {...register('description')}
              placeholder="Detalles técnicos, presentación o notas del artículo..."
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Sección de Imágenes WebP */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Imágenes del Producto (WebP)</p>
              <p className="text-xs text-slate-500">
                Se convierten a .webp automáticamente en tu navegador antes de enviarse.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {uploadedImages.length} / 10
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            title="Haz clic para seleccionar imágenes del artículo"
            disabled={isUploadingImages || uploadedImages.length >= 10}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-4 py-5 text-sm text-slate-600 hover:border-violet-400 hover:bg-violet-50/40 disabled:opacity-50 transition-colors"
          >
            {isUploadingImages ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                <span className="font-medium text-violet-700">Convirtiendo a .webp y subiendo...</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-6 w-6 text-violet-600" />
                <span className="font-medium">Haz clic para seleccionar imágenes (máx. 5 por lote)</span>
                <span className="text-xs text-slate-400">JPG, PNG o WEBP · Máx. 5MB c/u</span>
              </>
            )}
          </button>

          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-1">
              {uploadedImages.map((img, idx) => (
                <div
                  key={img.id}
                  className="group relative aspect-square rounded-xl border border-slate-200 bg-slate-100 overflow-hidden"
                >
                  {img.url ? (
                    <img
                      src={resolveImageUrl(img.url)}
                      alt={img.alt_text ?? 'Producto'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}

                  <span className="absolute left-1.5 top-1.5 rounded-md bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    #{idx + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    title="Desvincular imagen"
                    className="absolute right-1.5 top-1.5 rounded-full bg-rose-600 p-1 text-white opacity-90 hover:bg-rose-700 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            title="Cancelar y cerrar formulario"
            onClick={onClose}
            disabled={isSaving || isUploadingImages}
            className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            title="Guardar artículo"
            disabled={isSaving || isUploadingImages}
            className="cursor-pointer rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : editingItem ? 'Actualizar Artículo' : 'Crear Artículo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
