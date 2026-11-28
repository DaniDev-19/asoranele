import { apiClient } from './api';
import type { ApiResponse, PaginatedResponse, Unidad } from '../types/api';
import type { NamePayload, PaginationQuery } from './categoria.service';

export const unidadService = {
  async getPaginated(params: PaginationQuery = {}): Promise<PaginatedResponse<Unidad>> {
    const { data } = await apiClient.get<PaginatedResponse<Unidad>>('/unidades', { params });
    return data;
  },

  async getAll(): Promise<Unidad[]> {
    const { data } = await apiClient.get<ApiResponse<Unidad[]>>('/unidades/all');
    return data.data;
  },

  async getAllWithCount(): Promise<Unidad[]> {
    const { data } = await apiClient.get<ApiResponse<Unidad[]>>('/unidades/with-count');
    return data.data;
  },

  async getById(id: number): Promise<Unidad> {
    const { data } = await apiClient.get<ApiResponse<Unidad>>(`/unidades/${id}`);
    return data.data;
  },

  async create(payload: NamePayload): Promise<Unidad> {
    const { data } = await apiClient.post<ApiResponse<Unidad>>('/unidades', payload);
    return data.data;
  },

  async update(id: number, payload: NamePayload): Promise<Unidad> {
    const { data } = await apiClient.put<ApiResponse<Unidad>>(`/unidades/${id}`, payload);
    return data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/unidades/${id}`);
  },

  async deleteMany(ids: number[]): Promise<{ deletedCount: number }> {
    const { data } = await apiClient.delete<ApiResponse<{ deletedCount: number }>>('/unidades/batch', {
      data: { ids },
    });
    return data.data;
  },
};
