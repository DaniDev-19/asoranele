import { apiClient } from './api';
import { compressImageToWebp } from '../utils/imageCompressor';
import type { ApiResponse, Imagen, PaginatedResponse } from '../types/api';

export const imagenService = {
  async getPaginated(page = 1, limit = 20): Promise<PaginatedResponse<Imagen>> {
    const { data } = await apiClient.get<PaginatedResponse<Imagen>>('/images', {
      params: { page, limit },
    });
    return data;
  },

  async uploadSingle(file: File, altText?: string): Promise<Imagen> {
    const optimizedFile = await compressImageToWebp(file);
    const formData = new FormData();
    formData.append('image', optimizedFile);
    if (altText) {
      formData.append('alt_text', altText);
    }

    const { data } = await apiClient.post<ApiResponse<Imagen>>('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 45000,
    });
    return data.data;
  },

  async uploadMultiple(files: File[]): Promise<Imagen[]> {
    const optimizedFiles = await Promise.all(files.map((f) => compressImageToWebp(f)));
    const formData = new FormData();
    for (const file of optimizedFiles) {
      formData.append('images', file);
    }

    const { data } = await apiClient.post<ApiResponse<Imagen[]>>('/images/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/images/${id}`);
  },

  async cleanupOrphans(): Promise<{ deletedCount: number }> {
    const { data } = await apiClient.delete<ApiResponse<{ deletedCount: number }>>('/images/cleanup-orphans');
    return data.data;
  },
};
