import { apiClient } from './api';
import type { ApiResponse, Categoria, PaginatedResponse } from '../types/api';

export interface NamePayload {
  name: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const categoriaService = {
  async getPaginated(params: PaginationQuery = {}): Promise<PaginatedResponse<Categoria>> {
    const { data } = await apiClient.get<PaginatedResponse<Categoria>>('/categorias', { params });
    return data;
  },

  async getAll(): Promise<Categoria[]> {
    const { data } = await apiClient.get<ApiResponse<Categoria[]>>('/categorias/all');
    return data.data;
  },

  async getAllWithCount(): Promise<Categoria[]> {
    const { data } = await apiClient.get<ApiResponse<Categoria[]>>('/categorias/with-count');
    return data.data;
  },

  async getById(id: number): Promise<Categoria> {
    const { data } = await apiClient.get<ApiResponse<Categoria>>(`/categorias/${id}`);
    return data.data;
  },

  async create(payload: NamePayload): Promise<Categoria> {
    const { data } = await apiClient.post<ApiResponse<Categoria>>('/categorias', payload);
    return data.data;
  },

  async update(id: number, payload: NamePayload): Promise<Categoria> {
    const { data } = await apiClient.put<ApiResponse<Categoria>>(`/categorias/${id}`, payload);
    return data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/categorias/${id}`);
  },

  async deleteMany(ids: number[]): Promise<{ deletedCount: number }> {
    const { data } = await apiClient.delete<ApiResponse<{ deletedCount: number }>>('/categorias/batch', {
      data: { ids },
    });
    return data.data;
  },
};
