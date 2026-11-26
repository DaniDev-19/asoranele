# Asoranele Platform - Backend API

Servicio backend de alto rendimiento para la gestion de inventario, catalogacion de articulos, control cambiario multimoneda, procesamiento de imagenes y generacion de reportes comerciales en Excel y PDF.

Arquitectura basada en el patron MVC adaptado a API REST desacoplada y principios de Programacion Orientada a Objetos (POO) con TypeScript estricto, Prisma ORM y PostgreSQL.

---

## 1. Stack Tecnologico

- Entorno de Ejecucion: Node.js (v20+ o v22+ recomendada)
- Lenguaje: TypeScript 5 con configuracion modular ECMAScript (NodeNext, verbatimModuleSyntax)
- Framework HTTP: Express.js (v5)
- Capa de Persistencia / ORM: Prisma ORM (v6) sobre PostgreSQL
- Procesamiento y Optimizacion de Imagenes: Sharp (conversion automatica a WebP y redimensionamiento)
- Almacenamiento Cloud: Cloudflare R2 via AWS SDK S3 Client (@aws-sdk/client-s3) con fallback local en disco
- Validacion de Datos y DTOs: Zod (v3/v4)
- Generacion de Documentos:
  - Planillas de Calculo: ExcelJS (estilos corporativos, lectura y escritura)
  - Documentos Vectoriales: PDFKit (fichas tecnicas con conversion cambiaria y catalogos)
- Seguridad y Resiliencia:
  - Helmet (cabeceras de seguridad HTTP)
  - CORS parametrizable
  - Express Rate Limit (limitadores globales y estrictos)
  - Middleware global de control de excepciones con identificador unico (x-request-id)

---

## 2. Principios de Arquitectura y Diseno

### Arquitectura de Capas (MVC Desacoplado)

En esta API, la vista no reside en el servidor; el servidor expone recursos estructurados en formato JSON que alimentan el frontend desacoplado (React, Vue o aplicaciones moviles).

1. Rutas (Routes): Puerta de entrada. Define los metodos HTTP, aplica middlewares de seguridad y valida estrictamente las entradas (Body, Params y Query) mediante esquemas de Zod antes de alcanzar la logica de negocio.
2. Controladores (Controllers): Clases POO encargadas exclusivamente de la orquestacion del protocolo HTTP (extraccion de parametros, coordinacion de modelos, definicion de codigos de estado HTTP 200/201/204 y delegacion de errores no controlados a traves de next(error)).
3. Modelos (Models): Clases POO que encapsulan el acceso y persistencia a datos mediante Prisma Client. No contienen dependencias de Express ni de protocolo web, lo que permite su reutilizacion en scripts o pruebas unitarias. Emplean inyeccion de dependencias via constructor.
4. Servicios (Services): Modulos especializados para tareas complejas externas (DolarAPI, Sharp para WebP, Cloudflare R2 / Local Storage, generacion de PDF y analisis de hojas Excel).
5. Middleware Centralizado de Errores: Intercepta instancias de AppError, ZodError, errores de sintaxis JSON y excepciones nativas de Prisma (P2002 para unicidad, P2025 para no encontrado, P2003 para integridad referencial), retornando respuestas consistentes.

---

## 3. Estructura del Proyecto

```
backend/
├── prisma/
│   └── schema.prisma             # Definicion de esquemas y modelos Prisma
├── src/
│   ├── config/
│   │   └── db.ts                 # Instancia singleton de PrismaClient y conexion
│   ├── controllers/              # Controladores POO (HTTP layer)
│   │   ├── categoria.controller.ts
│   │   ├── imagen.controller.ts
│   │   ├── item.controller.ts
│   │   ├── tasa.controller.ts
│   │   └── unidad.controller.ts
│   ├── middleware/               # Middlewares defensivos y utilitarios
│   │   ├── globalError.middleware.ts
│   │   ├── schemaValid.middleware.ts
│   │   └── upload.middleware.ts
│   ├── models/                   # Capa de persistencia y consultas (Data Access)
│   │   ├── Categoria.model.ts
│   │   ├── Imagen.model.ts
│   │   ├── Item.model.ts
│   │   ├── Tasa.model.ts
│   │   └── Unidad.model.ts
│   ├── routes/                   # Enrutadores RESTful
│   │   ├── categoria.route.ts
│   │   ├── imagen.route.ts
│   │   ├── item.route.ts
│   │   ├── tasa.route.ts
│   │   └── unidad.route.ts
│   ├── services/                 # Servicios de infraestructura y procesamiento
│   │   ├── dolar_api.service.ts
│   │   ├── excel.service.ts
│   │   ├── image_r2.service.ts
│   │   └── pdf.service.ts
│   ├── types/                    # Interfaces compartidas y definiciones DTO
│   │   ├── pagination.ts
│   │   └── tasas.ts
│   ├── utils/                    # Configuraciones de seguridad
│   │   ├── cors.ts
│   │   ├── helmet.ts
│   │   └── rateLimit.ts
│   ├── validations/              # Esquemas Zod para sanitizacion y tipado
│   │   ├── item.validation.ts
│   │   ├── name.validation.ts
│   │   └── tasa.validation.ts
│   ├── app.ts                    # Configuracion y montaje de la aplicacion Express
│   └── index.ts                  # Punto de arranque y escucha del servidor
├── uploads/                      # Directorio local para almacenamiento de archivos
├── .env.example                  # Plantilla de variables de entorno
├── package.json
└── tsconfig.json
```

---

## 4. Configuracion del Entorno

Copiar el archivo de variables de entorno de ejemplo:

```bash
cp .env.example .env
```

Variables requeridas en el archivo `.env`:

```env
PORT=4000
NODE_ENV=development
SERVER_NAME="Asoranele Platform API"
APP_URL=http://localhost:4000

# Base de datos PostgreSQL
DATABASE_URL="postgresql://usuario:password@localhost:5432/asoranele_db?schema=public"

# CORS (dominios autorizados separados por coma)
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"

# Modo de almacenamiento: "r2" o "local"
STORAGE_DRIVER=local

# Credenciales de Cloudflare R2 (necesarias solo si STORAGE_DRIVER=r2)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_DOMAIN=https://cdn.tu-dominio.com
```

---

## 5. Catalogo de Endpoints de la API

La API expone prefijos versionados bajo `/api/v1/` y alias directos bajo `/api/`.

### 5.1 Categorias (`/api/v1/categorias`)

- `GET /`: Listado paginado con soporte de busqueda amigable multitermino (`?page=1&limit=10&search=limpieza`).
- `GET /all`: Listado completo sin paginacion para selectores de la interfaz de usuario.
- `GET /with-count`: Listado de categorias con conteo de articulos asociados (`_count.item`).
- `GET /:id`: Detalle de una categoria por su clave primaria.
- `POST /`: Crea una nueva categoria. Body: `{"name": "Bebidas"}`.
- `PUT /:id`: Actualiza el nombre de una categoria. Body: `{"name": "Bebidas Frias"}`.
- `DELETE /batch`: Eliminacion masiva por lote. Body: `{"ids": [1, 2, 3]}`.
- `DELETE /:id`: Eliminacion individual por ID.

### 5.2 Unidades de Medida (`/api/v1/unidades`)

- `GET /`: Listado paginado con busqueda multitermino.
- `GET /all`: Listado completo sin paginacion.
- `GET /with-count`: Listado con conteo de articulos vinculados.
- `GET /:id`: Detalle de la unidad por ID.
- `POST /`: Registro de nueva unidad. Body: `{"name": "Kilogramos"}`.
- `PUT /:id`: Modificacion de nombre de unidad.
- `DELETE /batch`: Eliminacion en bloque por lote de IDs.
- `DELETE /:id`: Eliminacion individual por ID.

### 5.3 Articulos / Items (`/api/v1/items`)

- `GET /`: Consulta avanzada con paginacion, ordenamiento y filtros:
  - `page`: Numero de pagina (defecto: 1).
  - `limit`: Cantidad por pagina (defecto: 10, maximo: 100).
  - `search`: Busqueda tokenizada insensible a mayusculas/minusculas sobre nombre y descripcion.
  - `categoria_id`: Filtrado por ID de categoria.
  - `unidad_id`: Filtrado por ID de unidad.
  - `status`: Filtrado por estado (`disponible`, `agotado`, `inactivo`, `descontinuado`).
  - `minPrice` / `maxPrice`: Rango de precios en USD.
  - `sortBy`: Campo de ordenamiento (`id`, `name`, `price`, `status`).
  - `orderDirection`: Sentido del orden (`asc` o `desc`).
- `GET /all`: Listado completo sin paginar con relaciones de categoria, unidad e imagenes.
- `GET /stats`: Metricas agregadas para panel de control (totales por estado, articulos huerfanos sin categoria o unidad).
- `GET /export/excel`: Exporta el inventario completo a una planilla Excel (.xlsx) formateada con estilos contables.
- `POST /import/excel`: Carga masiva de articulos a traves de archivo Excel (.xlsx o .xls). Resuelve o crea categorias y unidades sobre la marcha y retorna reporte de filas exitosas y fallidas.
- `GET /export/pdf`: Genera y descarga el catalogo oficial de productos en PDF.
- `GET /:id/pdf`: Genera la Ficha Tecnica individual oficial del articulo en PDF con calculo de equivalencias cambiarias en Bolivares (BCV y Paralelo) y USD segun la tasa activa.
- `GET /:id`: Detalle de un articulo con sus relaciones y coleccion ordenada de imagenes.
- `POST /`: Crea un nuevo articulo validando la existencia de claves foraneas. Soporta asociacion de imagenes.
  Body:
  ```json
  {
    "name": "Aceite de Oliva Extra Virgen 1L",
    "price": 12.50,
    "description": "Prensado en frio, origen importado",
    "status": "disponible",
    "categoria_id": 1,
    "unidad_id": 2,
    "image_ids": [10, 11]
  }
  ```
- `PUT /:id`: Modificacion parcial de articulo y resincronizacion automatica de imagenes con purga de archivos huerfanos.
- `PATCH /:id/status`: Modificacion atomica de estado del articulo. Body: `{"status": "agotado"}`.
- `DELETE /batch`: Eliminacion masiva por lote con eliminacion fisica automatica de imagenes huerfanas.
- `DELETE /:id`: Eliminacion individual con limpieza automatica de imagenes vinculadas.

### 5.4 Tasas de Cambio (`/api/v1/tasas`)

- `GET /latest` (o `/current`): Obtiene la tasa activa mas reciente registrada en base de datos (Dolar BCV, Dolar Paralelo/USDT, Euro BCV, Euro Paralelo/USDT).
- `POST /sync`: Consulta la API publica de DolarAPI en tiempo real, extrae los promedios oficiales y paralelos, y almacena un nuevo registro cronologico en PostgreSQL.
- `GET /history`: Historico paginado de variaciones de tasas de cambio.
- `GET /convert`: Utilidad de conversion en tiempo real entre divisas segun la ultima tasa registrada:
  - Ejemplo: `GET /api/v1/tasas/convert?amount=100&from=USD`
  - Retorna equivalencias exactas en Bolivares a tasa BCV y a tasa Paralelo, asi como equivalencias en Euros.
- `POST /`: Registro manual de tasas por parte del administrador. Body: `{"dolar_bcv": 52.48, "dolar_paralelo": 61.20, "euro_bcv": 55.10, "euro_paralelo": 64.30}`.
- `GET /:id`: Consulta de una tasa historica por su ID unico.

### 5.5 Imagenes (`/api/v1/images`)

- `POST /upload`: Carga de imagen individual (`multipart/form-data`, campo `image`).
  - Convierte y comprime automaticamente a WebP de alta fidelidad.
  - Sube a Cloudflare R2 o almacena en directorio local.
  - Registra la URL en la tabla `imagen` y retorna su ID para asociacion.
- `POST /upload-multiple`: Carga concurrente de hasta 5 imagenes simultaneas (`campo images`).
- `GET /`: Galeria de imagenes registradas con paginacion.
- `GET /:id`: Consulta de imagen por ID.
- `DELETE /cleanup-orphans`: Barrido de mantenimiento. Identifica y elimina del storage (R2 o Local) y de la base de datos todas las imagenes que no esten asociadas a ningun articulo.
- `DELETE /:id`: Eliminacion manual de imagen del storage fisico y de la base de datos.

---

## 6. Caracteristicas de Seguridad y Rendimiento

1. Optimizacion de Imagenes con Sharp:
   Cualquier archivo de imagen entrante es redimensionado proporcionalmente a un maximo de 1600x1600 y codificado a formato WebP (`quality: 80`), logrando una reduccion de tamano promedio del 80% antes de ser almacenado.
2. Politica Anti-Huerfanos (Garbage Collection de Archivos):
   Tanto en la actualizacion de imagenes de un articulo como en su eliminacion, el sistema inspecciona los vinculos en `item_image`. Si una imagen deja de ser referenciada por cualquier articulo, se purga automaticamente del bucket de Cloudflare R2 o del disco local.
3. Busqueda Amigable Multitermino (Tokenized Search):
   Las consultas de busqueda dividen el texto por espacios en blanco y evaluan cada termino de manera independiente e insensible a mayusculas/minusculas. Esto permite encontrar resultados como "Aceite de Oliva Extra Virgen" ingresando "oliva virgen", "virgen aceite" o terminos separados por multiples espacios.
4. Precision Cambiaria Decimal:
   Las tasas de cambio se modelan bajo tipo `DECIMAL(14, 4)` en PostgreSQL, garantizando fidelidad total con las 4 cifras decimales oficiales publicadas por el Banco Central de Venezuela.
5. Rate Limiting Dual:
   - Global: Maximo 300 peticiones cada 15 minutos por direccion IP.
   - Estricto: Maximo 30 peticiones cada 15 minutos en endpoints criticos (sincronizacion de tasas, importacion masiva Excel, carga de imagenes).
6. Trazabilidad de Peticiones:
   Cada solicitud entrante recibe un identificador unico UUID via encabezado `x-request-id`, reflejado tanto en la respuesta HTTP como en los registros de errores del servidor.

---

## 7. Scripts de Desarrollo y Despliegue

Desde la carpeta `backend/`:

```bash
# Instalacion de dependencias
npm install

# Generacion del cliente Prisma
npm run db:generate

# Sincronizar esquema de base de datos directamente
npm run db:push

# Ejecucion en modo desarrollo con recarga automatica (tsx watch)
npm run dev

# Compilacion estricta de TypeScript hacia carpeta dist/
npm run build

# Ejecucion en produccion
npm run start
```
