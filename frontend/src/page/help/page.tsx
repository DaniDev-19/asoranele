import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Package,
  DollarSign,
  FileSpreadsheet,
  Images,
  Tags,
  Ruler,
  Smartphone,
  FileText,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ZoomIn,
  LayoutDashboard,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

interface GuideSection {
  id: string;
  label: string;
  icon: typeof BookOpen;
}

const GUIDE_SECTIONS: GuideSection[] = [
  { id: 'flujo', label: 'Flujo Visual', icon: LayoutDashboard },
  { id: 'pwa', label: 'Instalar App', icon: Smartphone },
  { id: 'tasas', label: 'Tasas', icon: DollarSign },
  { id: 'catalogos', label: 'Categorías y Unidades', icon: Tags },
  { id: 'articulos', label: 'Artículos y Fotos', icon: Package },
  { id: 'reportes', label: 'Excel y PDF', icon: FileSpreadsheet },
  { id: 'galeria', label: 'Galería WebP', icon: Images },
  { id: 'faq', label: 'Preguntas', icon: HelpCircle },
];

function HelpPage() {
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Cabecera de bienvenida */}
      <section className="rounded-2xl border border-violet-200 bg-linear-to-br from-violet-600 to-violet-800 p-5 sm:p-7 text-white shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur-xs shrink-0">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-1.5">
            <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
              Manual Oficial de Usuario
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Asoranele Gracia Divina
            </h2>
            <p className="text-sm text-violet-100 leading-relaxed max-w-2xl">
              Guía práctica paso a paso para administrar tu inventario de pulseras, manualidades,
              víveres y artículos variados, mantener las tasas de cambio al día y generar catálogos
              en PDF o Excel desde tu teléfono o computadora.
            </p>
          </div>
        </div>

        {/* Índice rápido Mobile-First */}
        <div className="mt-5 flex flex-wrap gap-2">
          {GUIDE_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                title={`Ir a la sección ${sec.label.toLowerCase()}`}
                className="cursor-pointer inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/25 transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 1. Diagrama Visual de Flujo para el Usuario */}
      <section
        id="flujo"
        className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              1. Flujo de Trabajo Recomendado
            </h3>
            <p className="text-sm text-slate-500">
              Sigue este orden sugerido para mantener tu tienda organizada y tus precios siempre actualizados.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsImageZoomOpen(true)}
            title='Ampliar imagen'
            className="cursor-pointer inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ZoomIn className="h-4 w-4 text-violet-600" />
            Ampliar imagen
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsImageZoomOpen(true)}
          className="group relative block w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <img
            src="/flujo-usuario.webp"
            alt="Diagrama de flujo de uso para el usuario final de Asoranele Gracia Divina"
            className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.01]"
          />
          <span className="absolute bottom-3 right-3 rounded-lg bg-slate-900/75 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
            Toca para ampliar
          </span>
        </button>
      </section>

      {/* 2. Instalación como App (PWA) */}
      <section
        id="pwa"
        className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              2. Instalar como Aplicación en tu Teléfono o PC (PWA)
            </h3>
            <p className="text-xs text-slate-500">
              No necesitas iniciar sesión ni descargar desde tiendas externas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1.5">
            <p className="font-semibold text-slate-900">Android (Chrome / Edge)</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Al entrar verás el banner inferior <strong>&ldquo;Instalar Asoranele Gracia Divina&rdquo;</strong>.
              Toca el botón <strong>Instalar App</strong> y confirma. También puedes abrir el menú
              (&#8942;) y elegir <em>Instalar aplicación</em>.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1.5">
            <p className="font-semibold text-slate-900">iPhone / iPad (Safari)</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Abre la web en <strong>Safari</strong>, toca el botón <strong>Compartir</strong> (cuadrado con
              flecha hacia arriba) y selecciona <strong>&ldquo;Agregar a inicio&rdquo;</strong>.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1.5">
            <p className="font-semibold text-slate-900">Computadora (Windows / Mac)</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Haz clic en el icono de instalación ubicado a la derecha de la barra de direcciones en
              Chrome o Edge, o usa el botón <strong>Instalar App</strong> del banner.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Tasas de Cambio */}
      <section
        id="tasas"
        className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                3. Tasas de Cambio y Conversor
              </h3>
              <p className="text-xs text-slate-500">
                Mantén actualizados el Dólar BCV, Paralelo/USDT y Euro.
              </p>
            </div>
          </div>
          <Link
            to="/tasas"
            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
          >
            Ir a Tasas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <ol className="space-y-2.5 text-sm text-slate-600 list-decimal list-inside">
          <li>
            <strong>Sincronización rápida desde la barra superior:</strong> En cualquier pantalla,
            toca el botón de recarga (<span className="font-medium text-slate-800">icono circular</span>)
            junto a la tasa BCV en la cabecera morada para traer los valores vigentes.
          </li>
          <li>
            <strong>Registro manual:</strong> Si deseas fijar una tasa personalizada, entra en{' '}
            <strong>Tasas de Cambio</strong>, llena los 4 campos (Dólar BCV, Dólar Paralelo, Euro BCV y
            Euro Paralelo) y pulsa <strong>Guardar Tasas</strong>.
          </li>
          <li>
            <strong>Conversor rápido:</strong> Ingresa cualquier monto en USD, EUR o VES para conocer
            al instante su equivalencia oficial BCV y Paralela. Cada actualización queda guardada en el
            histórico.
          </li>
        </ol>
      </section>

      {/* 4. Categorías y Unidades */}
      <section
        id="catalogos"
        className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
            <Tags className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              4. Categorías y Unidades de Medida
            </h3>
            <p className="text-xs text-slate-500">
              Estructura tu tienda antes o durante la carga de productos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="rounded-xl border border-slate-200 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Tags className="h-4 w-4 text-violet-600" /> Categorías
              </span>
              <Link to="/categorias" className="text-xs font-medium text-violet-600 hover:underline">
                Abrir
              </Link>
            </div>
            <p className="text-xs leading-relaxed">
              Agrupa tus productos por tipo, por ejemplo: <em>Pulseras</em>, <em>Manualidades</em>,{' '}
              <em>Víveres</em>, <em>Bisutería</em> o <em>Accesorios</em>. Puedes buscar, editar y
              seleccionar varias casillas para eliminar por lote.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Ruler className="h-4 w-4 text-violet-600" /> Unidades de Medida
              </span>
              <Link to="/unidades" className="text-xs font-medium text-violet-600 hover:underline">
                Abrir
              </Link>
            </div>
            <p className="text-xs leading-relaxed">
              Define cómo se vende cada artículo: <em>Unidad</em>, <em>Par</em>, <em>Docena</em>,{' '}
              <em>Kilogramo</em>, <em>Litro</em>, <em>Paquete</em> o <em>Caja</em>.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Gestión de Artículos y Fotos WebP */}
      <section
        id="articulos"
        className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                5. Gestión de Artículos, Filtros y Fotos
              </h3>
              <p className="text-xs text-slate-500">
                Control completo de inventario y precios en Dólares con cálculo automático en Bolívares.
              </p>
            </div>
          </div>
          <Link
            to="/items"
            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
          >
            Ir a Artículos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <ul className="space-y-2.5 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Crear o Editar:</strong> Toca <strong>Nuevo Artículo</strong>, ingresa nombre,
              precio en USD, categoría, unidad, descripción y estado. Puedes adjuntar hasta{' '}
              <strong>10 imágenes</strong> por producto.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Compresión automática .webp:</strong> Las fotos tomadas con la cámara del celular
              se optimizan y convierten automáticamente a formato <strong>.webp</strong> en tu
              dispositivo antes de subirse, ahorrando datos y acelerando la carga.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Búsqueda inteligente y filtros:</strong> Escribe varias palabras en cualquier
              orden (ej. <em>&ldquo;pulsera hilo rojo&rdquo;</em>) y combina los selectores
              desplegables con scroll de Categoría, Unidad y Estado.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Cambio rápido de estado:</strong> Cambia un producto entre{' '}
              <em>Disponible</em>, <em>Agotado</em>, <em>Inactivo</em> o <em>Descontinuado</em>{' '}
              directamente desde su tarjeta móvil o fila de tabla sin abrir el formulario.
            </span>
          </li>
        </ul>
      </section>

      {/* 6. Reportes PDF y Excel */}
      <section
        id="reportes"
        className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-rose-50 p-2 text-rose-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              6. Reportes en PDF y Carga Masiva Excel
            </h3>
            <p className="text-xs text-slate-500">
              Comparte fichas comerciales con tus clientes o actualiza el inventario por lotes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-rose-600" /> Documentos PDF
            </p>
            <ul className="text-xs space-y-1.5 leading-relaxed list-disc list-inside">
              <li>
                <strong>Ficha Técnica Individual:</strong> Pulsa el botón <strong>PDF</strong> en
                cualquier artículo para generar su ficha oficial con foto, descripción y precio en
                USD y Bs (tasa BCV).
              </li>
              <li>
                <strong>Catálogo General PDF:</strong> Usa el botón <strong>Catálogo PDF</strong> en
                la parte superior de Artículos o en el Dashboard para descargar el listado completo.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Importar y Exportar Excel
            </p>
            <ul className="text-xs space-y-1.5 leading-relaxed list-disc list-inside">
              <li>
                <strong>Exportar Excel:</strong> Descarga una planilla <code>.xlsx</code> ordenada
                con todo tu inventario actual.
              </li>
              <li>
                <strong>Importar Excel:</strong> Sube un archivo <code>.xlsx</code> desde{' '}
                <strong>Importar Excel</strong>; si una categoría o unidad escrita en la hoja aún no
                existe, el sistema la crea automáticamente y te indica si alguna fila tuvo errores.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. Galería y Mantenimiento de Imágenes */}
      <section
        id="galeria"
        className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                7. Galería WebP y Limpieza de Espacio
              </h3>
              <p className="text-xs text-slate-500">
                Evita acumular archivos sin uso en el servidor local o Cloudflare R2.
              </p>
            </div>
          </div>
          <Link
            to="/imagenes"
            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
          >
            Ir a Galería <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Si subiste fotos que luego no guardaste en ningún artículo o eliminaste productos antiguos,
          entra a <strong>Galería WebP</strong> y pulsa <strong>Limpiar Huérfanas</strong>. El
          sistema detectará automáticamente las imágenes que no están asociadas a ningún producto y las
          eliminará de forma segura del almacenamiento.
        </p>
      </section>

      {/* 8. Preguntas Frecuentes */}
      <section
        id="faq"
        className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
            <HelpCircle className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">8. Preguntas Frecuentes</h3>
        </div>

        <div className="space-y-3 text-sm">
          <details className="group rounded-xl border border-slate-200 p-4 open:bg-slate-50/70">
            <summary className="cursor-pointer font-semibold text-slate-900">
              ¿Necesito usuario o contraseña para entrar?
            </summary>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              No. Este panel está diseñado como acceso administrativo directo para agilizar el trabajo
              diario del negocio. Asegúrate de abrirlo únicamente en tus dispositivos autorizados.
            </p>
          </details>

          <details className="group rounded-xl border border-slate-200 p-4 open:bg-slate-50/70">
            <summary className="cursor-pointer font-semibold text-slate-900">
              ¿Qué pasa si cambio el precio en dólares o actualizo la tasa BCV?
            </summary>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Todos los precios mostrados en Bolívares en las tarjetas, tablas y fichas PDF se
              recalculan automáticamente multiplicando el precio USD por la tasa BCV más reciente.
            </p>
          </details>

          <details className="group rounded-xl border border-slate-200 p-4 open:bg-slate-50/70">
            <summary className="cursor-pointer font-semibold text-slate-900">
              ¿Puedo subir fotos pesadas tomadas desde mi celular?
            </summary>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Sí. Aunque tu cámara tome fotos de 5 MB o 10 MB, la aplicación las comprime en tu
              teléfono a formato WebP (~200 KB) antes de enviarlas al servidor.
            </p>
          </details>
        </div>
      </section>

      {/* Modal para ampliar imagen del flujo */}
      <Modal
        isOpen={isImageZoomOpen}
        onClose={() => setIsImageZoomOpen(false)}
        title="Flujo de Uso - Asoranele Gracia Divina"
        description="Guía visual paso a paso del funcionamiento diario."
        maxWidthClass="sm:max-w-4xl"
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img
            src="/flujo-usuario.webp"
            alt="Diagrama ampliado del flujo de usuario"
            className="w-full h-auto object-contain"
          />
        </div>
      </Modal>
    </div>
  );
}

export default HelpPage;