export interface FindPaginatedOptions {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
