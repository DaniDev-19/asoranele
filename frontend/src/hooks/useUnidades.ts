import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unidadService } from '../services/unidad.service';
import type { NamePayload, PaginationQuery } from '../services/categoria.service';
import { extractApiErrorMessage } from '../services/api';
import { useToast } from './useToast';

export const UNIDAD_KEYS = {
  all: ['unidades'] as const,
  list: (params: PaginationQuery) => ['unidades', 'list', params] as const,
  select: ['unidades', 'all'] as const,
  withCount: ['unidades', 'with-count'] as const,
};

export function useUnidadesPaginated(params: PaginationQuery) {
  return useQuery({
    queryKey: UNIDAD_KEYS.list(params),
    queryFn: () => unidadService.getPaginated(params),
  });
}

export function useAllUnidades() {
  return useQuery({
    queryKey: UNIDAD_KEYS.select,
    queryFn: () => unidadService.getAll(),
  });
}

export function useUnidadesWithCount() {
  return useQuery({
    queryKey: UNIDAD_KEYS.withCount,
    queryFn: () => unidadService.getAllWithCount(),
  });
}

export function useCreateUnidad() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: NamePayload) => unidadService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UNIDAD_KEYS.all });
      toast.success('Unidad de medida creada exitosamente.');
    },
    onError: (err) => toast.error(extractApiErrorMessage(err)),
  });
}

export function useUpdateUnidad() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: NamePayload }) =>
      unidadService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UNIDAD_KEYS.all });
      toast.success('Unidad de medida actualizada exitosamente.');
    },
    onError: (err) => toast.error(extractApiErrorMessage(err)),
  });
}

export function useDeleteUnidad() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: number) => unidadService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UNIDAD_KEYS.all });
      toast.success('Unidad de medida eliminada exitosamente.');
    },
    onError: (err) => toast.error(extractApiErrorMessage(err)),
  });
}

export function useDeleteManyUnidades() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (ids: number[]) => unidadService.deleteMany(ids),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: UNIDAD_KEYS.all });
      toast.success(`${res.deletedCount} unidades eliminadas.`);
    },
    onError: (err) => toast.error(extractApiErrorMessage(err)),
  });
}
