import { API_V1_URL, apiClient } from './api';
import type {
  ApiResponse,
  CreateItemPayload,
  ImportExcelReport,
  Item,
  ItemQueryParams,
  ItemStats,
  ItemStatus,
  PaginatedResponse,
  UpdateItemPayload,
} from '../types/api';

export const itemService = {
  async getPaginated(params: ItemQueryParams = {}): Promise<PaginatedResponse<Item>> {
    const { data } = await apiClient.get<PaginatedResponse<Item>>('/items', { params });
    return data;
  },

  async getAll(): Promise<Item[]> {
    const { data } = await apiClient.get<ApiResponse<Item[]>>('/items/all');
    return data.data;
  },

  async getStats(): Promise<ItemStats> {
    const { data } = await apiClient.get<ApiResponse<ItemStats>>('/items/stats');
    return data.data;
  },

  async getById(id: number): Promise<Item> {
    const { data } = await apiClient.get<ApiResponse<Item>>(`/items/${id}`);
    return data.data;
  },

  async create(payload: CreateItemPayload): Promise<Item> {
    const { data } = await apiClient.post<ApiResponse<Item>>('/items', payload);
    return data.data;
  },

  async update(id: number, payload: UpdateItemPayload): Promise<Item> {
    const { data } = await apiClient.put<ApiResponse<Item>>(`/items/${id}`, payload);
    return data.data;
  },

  async updateStatus(id: number, status: ItemStatus): Promise<Item> {
    const { data } = await apiClient.patch<ApiResponse<Item>>(`/items/${id}/status`, { status });
    return data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/items/${id}`);
  },

  async deleteMany(ids: number[]): Promise<{ deletedCount: number }> {
    const { data } = await apiClient.delete<ApiResponse<{ deletedCount: number }>>('/items/batch', {
      data: { ids },
    });
    return data.data;
  },

  async exportExcel(): Promise<Blob> {
    const { data } = await apiClient.get<Blob>('/items/export/excel', {
      responseType: 'blob',
    });
    return data;
  },

  async importExcel(file: File): Promise<ImportExcelReport> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<ApiResponse<ImportExcelReport>>('/items/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });
    return data.data;
  },

  getExportCatalogPdfUrl(): string {
    return `${API_V1_URL}/items/export/pdf`;
  },

  getItemPdfUrl(id: number): string {
    return `${API_V1_URL}/items/${id}/pdf`;
  },
};
