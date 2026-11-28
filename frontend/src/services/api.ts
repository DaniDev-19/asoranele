import axios, { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/api';

/**
 * Limpia la URL base definida en .env (ej. elimina punto y coma final o comillas accidentales)
 */
export function getBaseServerUrl(): string {
  const raw = (import.meta.env.VITE_URL as string | undefined) ?? 'http://localhost:4000';
  return raw.trim().replace(/[;"']+$/g, '').replace(/^["']+/g, '').replace(/\/+$/, '');
}

export const API_V1_URL = `${getBaseServerUrl()}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_V1_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiNavigationErrorDetail {
  status: 400 | 404 | 500;
  message: string;
}

export const API_ERROR_EVENT = 'asoranele:api-error';

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const method = (error.config?.method ?? 'get').toLowerCase();
      const url = error.config?.url ?? '';
      const skipRedirect = Boolean(
        error.config?.headers && 'x-skip-error-redirect' in error.config.headers,
      );

      if (!skipRedirect && typeof window !== 'undefined') {
        let targetStatus: 400 | 404 | 500 | null = null;

        if (status >= 500) {
          targetStatus = 500;
        } else if (status === 404 && method === 'get' && !url.includes('/tasas/latest')) {
          targetStatus = 404;
        } else if (status === 400 && method === 'get') {
          targetStatus = 400;
        }

        if (targetStatus) {
          window.dispatchEvent(
            new CustomEvent<ApiNavigationErrorDetail>(API_ERROR_EVENT, {
              detail: {
                status: targetStatus,
                message: extractApiErrorMessage(error),
              },
            }),
          );
        }
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Extrae un mensaje legible de cualquier error de Axios o del servidor
 */
export function extractApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorResponse>;
    const data = axiosErr.response?.data;

    if (data?.details?.fields && data.details.fields.length > 0) {
      return data.details.fields.map((f) => f.message).join(' | ');
    }

    if (data?.message) {
      return data.message;
    }

    if (axiosErr.code === 'ECONNABORTED') {
      return 'La petición tardó demasiado tiempo. Verifica tu conexión.';
    }

    if (!axiosErr.response) {
      return 'No se pudo conectar con el servidor backend. Verifica que esté encendido.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado.';
}
