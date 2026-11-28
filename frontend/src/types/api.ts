export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  status: 'success';
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorField {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  status: 'error';
  code: string;
  message: string;
  details?: {
    fields?: ApiErrorField[];
  };
}

export interface Categoria {
  id: number;
  name: string | null;
  _count?: {
    item: number;
  };
}

export interface Unidad {
  id: number;
  name: string | null;
  _count?: {
    item: number;
  };
}

export interface Imagen {
  id: number;
  url: string;
  alt_text: string | null;
  storageProvider?: 'r2' | 'local';
}

export interface ItemImageRelation {
  item_id: number;
  imagen_id: number;
  orden: number;
  imagen: Imagen;
}

export type ItemStatus = 'disponible' | 'agotado' | 'inactivo' | 'descontinuado';

export interface Item {
  id: number;
  name: string | null;
  price: string | number | null;
  description: string | null;
  status: ItemStatus;
  categoria_id: number | null;
  unidad_id: number | null;
  categoria: Categoria | null;
  unidad: Unidad | null;
  item_image: ItemImageRelation[];
}

export interface ItemStats {
  total: number;
  disponibles: number;
  agotados: number;
  inactivos: number;
  descontinuados: number;
  sinCategoria: number;
  sinUnidad: number;
}

export interface ItemQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoria_id?: number;
  unidad_id?: number;
  status?: ItemStatus;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'id' | 'name' | 'price' | 'status';
  orderDirection?: 'asc' | 'desc';
}

export interface CreateItemPayload {
  name: string;
  price: number;
  description?: string | null;
  status?: ItemStatus;
  categoria_id?: number | null;
  unidad_id?: number | null;
  image_ids?: number[];
}

export type UpdateItemPayload = Partial<CreateItemPayload>;

export interface TasaCambio {
  id: number;
  dolar_bcv: string | number;
  dolar_paralelo: string | number;
  euro_bcv: string | number;
  euro_paralelo: string | number;
  fecha: string;
  created_at: string;
  updated_at: string;
}

export interface CurrencyConversionResult {
  monto_origen: number;
  moneda_origen: 'USD' | 'EUR' | 'VES';
  tasas_aplicadas: {
    dolar_bcv: number;
    dolar_paralelo: number;
    euro_bcv: number;
    euro_paralelo: number;
    fecha_tasa: string;
  };
  equivalencias: {
    bolivares_bcv: number;
    bolivares_paralelo: number;
    dolares_bcv: number;
    dolares_paralelo: number;
    euros_bcv: number;
    euros_paralelo: number;
  };
}

export interface ImportExcelReport {
  totalRows: number;
  imported: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}
