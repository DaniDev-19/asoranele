import { getBaseServerUrl } from '../services/api';

export function formatCurrency(value: string | number | null | undefined, currency: 'USD' | 'VES' | 'EUR' = 'USD'): string {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return currency === 'VES' ? 'Bs. 0,00' : '$0.00';

  if (currency === 'VES') {
    return `Bs. ${num.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  if (currency === 'EUR') {
    return `€${num.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `$${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatRate(value: string | number | null | undefined): string {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return '0.0000';
  return num.toLocaleString('es-VE', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

export function formatDateTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return 'N/D';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'N/D';
  return date.toLocaleString('es-VE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Resuelve URLs de imágenes tanto si vienen absolutas (R2/CDN) como relativas (/uploads/...)
 */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const baseUrl = getBaseServerUrl();
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${normalizedPath}`;
}
