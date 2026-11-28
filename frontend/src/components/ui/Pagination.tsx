import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '../../types/api';

interface PaginationProps {
  meta: PaginationMeta | undefined;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (!meta || meta.totalPages <= 1) return null;

  const { currentPage, totalPages, totalItems, hasNextPage, hasPreviousPage } = meta;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-b-2xl">
      <p className="text-sm text-slate-600">
        Página <span className="font-semibold text-slate-900">{currentPage}</span> de{' '}
        <span className="font-semibold text-slate-900">{totalPages}</span> ({totalItems} registros)
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          title="Ir a la página anterior"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>
        <button
          type="button"
          title="Ir a la siguiente página"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
