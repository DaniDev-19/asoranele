import axios from 'axios';
import { apiClient } from './api';
import type {
  ApiResponse,
  CurrencyConversionResult,
  PaginatedResponse,
  TasaCambio,
} from '../types/api';

export interface CreateTasaPayload {
  dolar_bcv: number;
  dolar_paralelo: number;
  euro_bcv: number;
  euro_paralelo: number;
}

export const tasaService = {
  async getLatest(): Promise<TasaCambio | null> {
    try {
      const { data } = await apiClient.get<ApiResponse<TasaCambio>>('/tasas/latest');
      return data.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  async sync(): Promise<TasaCambio> {
    const { data } = await apiClient.post<ApiResponse<TasaCambio>>('/tasas/sync');
    return data.data;
  },

  async getHistory(page = 1, limit = 10): Promise<PaginatedResponse<TasaCambio>> {
    const { data } = await apiClient.get<PaginatedResponse<TasaCambio>>('/tasas/history', {
      params: { page, limit },
    });
    return data;
  },

  async createManual(payload: CreateTasaPayload): Promise<TasaCambio> {
    const { data } = await apiClient.post<ApiResponse<TasaCambio>>('/tasas', payload);
    return data.data;
  },

  async convert(amount: number, from: 'USD' | 'EUR' | 'VES'): Promise<CurrencyConversionResult> {
    const { data } = await apiClient.get<ApiResponse<CurrencyConversionResult>>('/tasas/convert', {
      params: { amount, from },
    });
    return data.data;
  },
};
