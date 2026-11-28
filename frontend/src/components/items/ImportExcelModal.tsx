import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FileSpreadsheet, UploadCloud, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { itemService } from '../../services/item.service';
import { extractApiErrorMessage } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { ITEM_KEYS } from '../../hooks/useItems';
import { CATEGORIA_KEYS } from '../../hooks/useCategorias';
import { UNIDAD_KEYS } from '../../hooks/useUnidades';
import type { ImportExcelReport } from '../../types/api';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportExcelModal({ isOpen, onClose }: ImportExcelModalProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [report, setReport] = useState<ImportExcelReport | null>(null);

  const handleClose = () => {
    setSelectedFile(null);
    setReport(null);
    onClose();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecciona un archivo Excel (.xlsx o .xls).');
      return;
    }

    setIsUploading(true);
    try {
      const result = await itemService.importExcel(selectedFile);
      setReport(result);
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CATEGORIA_KEYS.all });
      queryClient.invalidateQueries({ queryKey: UNIDAD_KEYS.all });
      toast.success(`Importación completada: ${result.imported} artículos creados.`);
    } catch (err) {
      toast.error(extractApiErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Artículos desde Excel"
      description="Sube una planilla .xlsx con columnas: ID (opcional), Nombre, Precio, Estado, Categoría, Unidad, Descripción."
      maxWidthClass="sm:max-w-lg"
    >
      <div className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={(e) => {
            setSelectedFile(e.target.files?.[0] ?? null);
            setReport(null);
          }}
          className="hidden"
        />

        <button
          type="button"
          title="Haz clic para seleccionar un archivo Excel"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="cursor-pointer w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-sm text-slate-600 hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors"
        >
          {selectedFile ? (
            <>
              <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
              <span className="font-semibold text-slate-900">{selectedFile.name}</span>
              <span className="text-xs text-slate-500">
                {(selectedFile.size / 1024).toFixed(1)} KB · Clic para cambiar archivo
              </span>
            </>
          ) : (
            <>
              <UploadCloud className="h-8 w-8 text-slate-400" />
              <span className="font-medium">Seleccionar archivo Excel (.xlsx / .xls)</span>
              <span className="text-xs text-slate-400">Tamaño máximo 20 MB</span>
            </>
          )}
        </button>

        {report && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Importados: {report.imported}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-rose-700">
                <AlertCircle className="h-4 w-4" />
                Fallidos: {report.failed}
              </span>
            </div>

            {report.errors.length > 0 && (
              <div className="max-h-36 overflow-y-auto rounded-lg border border-rose-200 bg-white p-2.5 text-xs space-y-1">
                {report.errors.map((err) => (
                  <p key={`${err.row}-${err.error}`} className="text-rose-700">
                    <strong>Fila {err.row}:</strong> {err.error}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            title="Cerrar ventana"
            onClick={handleClose}
            className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cerrar
          </button>
          <button
            type="button"
            title="Iniciar importación del archivo Excel"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isUploading ? 'Importando...' : 'Iniciar Importación'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
