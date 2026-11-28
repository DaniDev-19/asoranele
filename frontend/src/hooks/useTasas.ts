import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasaService, type CreateTasaPayload } from '../services/tasa.service';
import { extractApiErrorMessage } from '../services/api';
import { useToast } from './useToast';

export const TASA_KEYS = {
  all: ['tasas'] as const,
  latest: ['tasas', 'latest'] as const,
  history: (page: number, limit: number) => ['tasas', 'history', page, limit] as const,
};

export function useLatestTasa() {
  return useQuery({
    queryKey: TASA_KEYS.latest,
    queryFn: () => tasaService.getLatest(),
    retry: false,
  });
}

export function useTasaHistory(page = 1, limit = 10) {
  return useQuery({
    queryKey: TASA_KEYS.history(page, limit),
    queryFn: () => tasaService.getHistory(page, limit),
  });
}

export function useSyncTasa() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: () => tasaService.sync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASA_KEYS.all });
      toast.success('Tasas de cambio sincronizadas correctamente desde DolarAPI.');
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err));
    },
  });
}

export function useCreateManualTasa() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: CreateTasaPayload) => tasaService.createManual(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASA_KEYS.all });
      toast.success('Tasas registradas manualmente con éxito.');
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err));
    },
  });
}
