import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriaService, type NamePayload, type PaginationQuery } from '../services/categoria.service';
import { extractApiErrorMessage } from '../services/api';
import { useToast } from './useToast';

export const CATEGORIA_KEYS = {
  all: ['categorias'] as const,
  list: (params: PaginationQuery) => ['categorias', 'list', params] as const,
  select: ['categorias', 'all'] as const,
  withCount: ['categorias', 'with-count'] as const,
};

export function useCategoriasPaginated(params: PaginationQuery) {
  return useQuery({
    queryKey: CATEGORIA_KEYS.list(params),
    queryFn: () => categoriaService.getPaginated(params),
  });
}

export function useAllCategorias() {
  return useQuery({
    queryKey: CATEGORIA_KEYS.select,
    queryFn: () => categoriaService.getAll(),
  });
}

export function useCategoriasWithCount() {
  return useQuery({
    queryKey: CATEGORIA_KEYS.withCount,
    queryFn: () => categoriaService.getAllWithCount(),
  });
}

export function useCreateCategoria() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: NamePayload) => categoriaService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIA_KEYS.all });
      toast.success('Categoría creada exitosamente.');
    },
    onError: (err) => toast.error(extractApiErrorMessage(err)),
  });
}

export function useUpdateCategoria() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: NamePayload }) =>
      categoriaService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIA_KEYS.all });
      toast.success('Categoría actualizada exitosamente.');
    },
    onError: (err) => toast.error(extractApiErrorMessage(err)),
  });
}

export function useDeleteCategoria() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: number) => categoriaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIA_KEYS.all });
      toast.success('Categoría eliminada exitosamente.');
    },
    onError: (err) => toast.error(extractApiErrorMessage(err)),
  });
}

export function useDeleteManyCategorias() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (ids: number[]) => categoriaService.deleteMany(ids),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIA_KEYS.all });
      toast.success(`${res.deletedCount} categorías eliminadas.`);
    },
    onError: (err) => toast.error(extractApiErrorMessage(err)),
  });
}
