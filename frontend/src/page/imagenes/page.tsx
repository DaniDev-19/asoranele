import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Images, Trash2, Sparkles, UploadCloud, Loader2 } from 'lucide-react';
import { imagenService } from '../../services/imagen.service';
import { extractApiErrorMessage } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState, Spinner } from '../../components/ui/EmptyState';
import { resolveImageUrl } from '../../utils/formatters';
import { compressImageToWebp } from '../../utils/imageCompressor';
import type { Imagen } from '../../types/api';

function ImagenesPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [page, setPage] = useState(1);
  const [deletingImg, setDeletingImg] = useState<Imagen | null>(null);
  const [isCleanupOpen, setIsCleanupOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['imagenes', page],
    queryFn: () => imagenService.getPaginated(page, 20),
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => imagenService.uploadMultiple(files),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['imagenes'] });
      toast.success(`${res.length} imagen(es) convertidas a .webp y subidas.`);
    },
    onError: (err) => toast.error(extractApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => imagenService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imagenes'] });
      toast.success('Imagen eliminada del almacenamiento y la base de datos.');
      setDeletingImg(null);
    },
    onError: (err) => toast.error(extractApiErrorMessage(err)),
  });

  const cleanupMutation = useMutation({
    mutationFn: () => imagenService.cleanupOrphans(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['imagenes'] });
      toast.success(`${res.deletedCount} imágenes huérfanas eliminadas.`);
      setIsCleanupOpen(false);
    },
    onError: (err) => toast.error(extractApiErrorMessage(err)),
  });

  const imagenes = data?.data ?? [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files ?? []);
    if (rawFiles.length === 0) return;
    try {
      const webpFiles = await Promise.all(
        rawFiles.map((file) => compressImageToWebp(file)),
      );
      uploadMutation.mutate(webpFiles);
    } catch {
      uploadMutation.mutate(rawFiles);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Galería y Almacenamiento WebP</h2>
          <p className="text-sm text-slate-500">
            Administra las imágenes optimizadas alojadas en Cloudflare R2 o disco local.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCleanupOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Limpiar Huérfanas
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            {uploadMutation.isPending ? 'Optimizando y subiendo...' : 'Subir Imágenes'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <Spinner label="Cargando galería..." />
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
          Error al cargar la galería de imágenes.
        </div>
      ) : imagenes.length === 0 ? (
        <EmptyState
          icon={<Images className="h-6 w-6" />}
          title="No hay imágenes almacenadas"
          description="Las imágenes que subas desde aquí o al crear artículos aparecerán en formato .webp."
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {imagenes.map((img) => (
              <div
                key={img.id}
                className="group relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs"
              >
                <div className="aspect-square bg-slate-100 overflow-hidden">
                  <img
                    src={resolveImageUrl(img.url)}
                    alt={img.alt_text ?? `Imagen #${img.id}`}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 p-2.5 border-t border-slate-100">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {img.alt_text ?? `Imagen #${img.id}`}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">ID #{img.id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeletingImg(img)}
                    title="Eliminar imagen"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination meta={data?.meta} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingImg)}
        onClose={() => setDeletingImg(null)}
        onConfirm={() => deletingImg && deleteMutation.mutate(deletingImg.id)}
        isLoading={deleteMutation.isPending}
        title="Eliminar Imagen"
        message={`¿Seguro que deseas eliminar la imagen #${deletingImg?.id}? Se borrará tanto del almacenamiento (R2/Local) como de la base de datos.`}
      />

      <ConfirmDialog
        isOpen={isCleanupOpen}
        onClose={() => setIsCleanupOpen(false)}
        onConfirm={() => cleanupMutation.mutate()}
        isLoading={cleanupMutation.isPending}
        title="Limpiar Imágenes Huérfanas"
        message="Se buscarán y eliminarán permanentemente todas las imágenes que no estén vinculadas a ningún artículo para liberar espacio."
        confirmLabel="Ejecutar Limpieza"
      />
    </div>
  );
}

export default ImagenesPage;
