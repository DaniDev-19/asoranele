import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { itemService } from '../services/item.service';
import type {
  CreateItemPayload,
  ItemQueryParams,
  ItemStatus,
  UpdateItemPayload,
} from '../types/api';
import { extractApiErrorMessage } from '../services/api';
import { useToast } from './useToast';

export const ITEM_KEYS = {
  all: ['items'] as const,
  list: (params: ItemQueryParams) => ['items', 'list', params] as const,
  stats: ['items', 'stats'] as const,
  detail: (id: number) => ['items', 'detail', id] as const,
};

export function useItemsPaginated(params: ItemQueryParams) {
  return useQuery({
    queryKey: ITEM_KEYS.list(params),
    queryFn: () => itemService.getPaginated(params),
  });
}

export function useItemStats() {
  return useQuery({
    queryKey: ITEM_KEYS.stats,
    queryFn: () => itemService.getStats(),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: CreateItemPayload) => itemService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.all });
      toast.success('Artículo creado exitosamente.');
    },
    onError: (err) => toast.error(extractApiErrorMessage(err)),
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateItemPayload }) =>
      itemService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.all });
      toast.success('Artículo actualizado exitosamente.');
    },
    onError: (err) => toast.error(extractApiErrorMessage(err)),
  });
}

export function useUpdateItemStatus() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ItemStatus }) =>
      itemService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.all });
      toast.success('Estado del artículo actualizado.');
    },
    onError: (err) => toast.error(extractApiErrorMessage(err)),
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: number) => itemService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.all });
      toast.success('Artículo eliminado exitosamente.');
    },
    onError: (err) => toast.error(extractApiErrorMessage(err)),
  });
}

export function useDeleteManyItems() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (ids: number[]) => itemService.deleteMany(ids),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.all });
      toast.success(`${res.deletedCount} artículos eliminados.`);
    },
    onError: (err) => toast.error(extractApiErrorMessage(err)),
  });
}
