# Asoranele Platform - Backend API

Servicio backend para la gestion de inventario, catalogacion de articulos, control cambiario multimoneda, procesamiento de imagenes WebP y generacion de reportes comerciales en Excel y PDF para **Asoranele Gracia Divina**.

Construido con arquitectura MVC desacoplada en capas, Programacion Orientada a Objetos (POO), TypeScript estricto, Express 5, Prisma ORM y soporte dual para **PostgreSQL local** y **Neon Serverless Postgres**.

Documentacion relacionada:
- **Documentacion General del Proyecto**: [../README.md](../README.md)
- **Documentacion del Frontend PWA**: [../frontend/README.md](../frontend/README.md)

---

## 1. Stack Tecnologico

- **Entorno de Ejecucion**: Node.js (v20+ o v22+)
- **Lenguaje**: TypeScript con configuracion ECMAScript (`NodeNext`)
- **Framework HTTP**: Express.js v5
- **ORM y Base de Datos**: Prisma ORM v6 sobre PostgreSQL (Local o Neon Cloud)
- **Procesamiento de Imagenes**: Sharp (redimensionamiento y conversion automatica a `.webp`)
- **Almacenamiento Cloud**: Cloudflare R2 mediante `@aws-sdk/client-s3` (con fallback local en `/uploads`)
- **Validacion de Esquemas**: Zod
- **Documentos**: ExcelJS (importacion/exportacion `.xlsx`) y PDFKit (catalogos y fichas tecnicas)
- **Seguridad**: Helmet, CORS configurable por origenes, Express Rate Limit dual y trazabilidad `x-request-id`

---

## 2. Arquitectura y Flujo de Peticiones

```mermaid
flowchart TD
    Req["Peticion HTTP entrante"] --> Proxy["Express trust proxy (Cloudflare / Nginx)"]
    Proxy --> Sec["CORS + Helmet + RequestId + GlobalRateLimiter"]
    Sec --> Route["Router (/api/v1/*) + StrictRateLimiter (rutas criticas)"]
    Route --> Valid["schemaValidMiddleware (Zod) / Multer (MIME y tamano)"]
    Valid -->|"Error de validacion"| Err["globalError.middleware (400 / 422)"]
    Valid --> Ctrl["Controller POO"]
    Ctrl --> Model["Model POO (Prisma Client)"]
    Ctrl --> Svc["Services (DolarAPI, Sharp WebP, Cloudflare R2, ExcelJS, PDFKit)"]
    Model -->|"DB_PROVIDER = local | neon | auto"| DB[("PostgreSQL Local o Neon")]
```

---

## 3. Configuracion de Base de Datos Dual (Local y Neon)

El archivo `src/config/db.ts` y `prisma.config.ts` implementan una resolucion automatica y validada segun `DB_PROVIDER`:

- `DB_PROVIDER=local`: Conecta a `DATABASE_URL` (PostgreSQL local).
- `DB_PROVIDER=neon`: Conecta a `DATABASE_URL_NEON` y valida que la cadena incluya `sslmode=require`.
- `DB_PROVIDER=auto`: Selecciona `DATABASE_URL_NEON` cuando `NODE_ENV=production` y `DATABASE_URL` cuando `NODE_ENV=development`.

Al arrancar, el servidor imprime en consola el proveedor activo sin exponer credenciales (por ejemplo `PostgreSQL [NEON] (ep-.../neondb)`) y el endpoint `GET /` reporta `"database": "neon"` o `"database": "local"`.

### Variables de Entorno (`backend/.env`)

```env
PORT=4000
NODE_ENV=development
SERVER_NAME="Asoranele Platform API"
APP_URL=http://localhost:4000

# Selector de base de datos: "local", "neon" o "auto"
DB_PROVIDER="local"
DATABASE_URL="postgresql://postgres:123456@localhost:5432/db_asoranele?schema=public"
DATABASE_URL_NEON="postgresql://USER:PASSWORD@ep-xxxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# CORS (origenes autorizados separados por coma)
ALLOWED_ORIGINS="http://localhost:4000,http://localhost:5173"

# Almacenamiento: "r2" (Cloudflare R2) o "local"
STORAGE_DRIVER=local
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_DOMAIN=https://pub-xxxx.r2.dev
```

---

## 4. Seguridad Implementada

1. **Helmet (`src/utils/helmet.ts`)**: Cabeceras HTTP de proteccion con `crossOriginResourcePolicy: cross-origin` para permitir servir imagenes WebP al frontend desacoplado.
2. **CORS (`src/utils/cors.ts`)**: Lista blanca estricta controlada desde `ALLOWED_ORIGINS`.
3. **Rate Limiting Dual (`src/utils/rateLimit.ts`)**:
   - Global: 300 peticiones cada 15 minutos por IP.
   - Estricto: 30 peticiones cada 15 minutos en subida de imagenes, importacion Excel y sincronizacion con DolarAPI.
4. **Validacion de Entradas y Archivos**:
   - Validacion Zod en `body`, `params` y `query` antes de llegar al controlador.
   - Multer en memoria con filtro estricto de MIME types (JPG/PNG/WEBP hasta 5 MB; Excel `.xlsx`/`.xls` hasta 20 MB).
5. **ORM Parametrizado y Manejo Centralizado de Errores**:
   - Prisma ORM previene inyeccion SQL.
   - `globalError.middleware.ts` oculta trazas internas en `NODE_ENV=production` y asigna un UUID `x-request-id` a cada solicitud.

---

## 5. Catalogo de Endpoints (`/api/v1`)

- **Salud**: `GET /` (estado del servidor y base de datos activa).
- **Categorias (`/api/v1/categorias`)**: `GET /`, `GET /all`, `GET /with-count`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /batch`, `DELETE /:id`.
- **Unidades (`/api/v1/unidades`)**: `GET /`, `GET /all`, `GET /with-count`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /batch`, `DELETE /:id`.
- **Articulos (`/api/v1/items`)**: `GET /`, `GET /all`, `GET /stats`, `GET /export/excel`, `POST /import/excel`, `GET /export/pdf`, `GET /:id/pdf`, `GET /:id`, `POST /`, `PUT /:id`, `PATCH /:id/status`, `DELETE /batch`, `DELETE /:id`.
- **Tasas de Cambio (`/api/v1/tasas`)**: `GET /latest`, `POST /sync`, `GET /history`, `GET /convert`, `POST /`, `GET /:id`.
- **Imagenes (`/api/v1/images`)**: `POST /upload`, `POST /upload-multiple`, `GET /`, `GET /:id`, `DELETE /cleanup-orphans`, `DELETE /:id`.

---

## 6. Despliegue con Neon, Vercel y Cloudflare R2

> Nota de arquitectura: Este backend utiliza **Express 5**, **Prisma ORM** (motor binario) y **Sharp** (binario nativo `libvips`), los cuales requieren un entorno Node.js completo y **no** son compatibles directamente con Cloudflare Workers (V8 Isolates) sin reescritura. Para produccion serverless puedes desplegar el backend directamente en **Vercel** (Node.js Serverless Functions) conectado a **Neon** y **Cloudflare R2**, o en un contenedor/PaaS detras de **Cloudflare Proxy / Tunnel**.

### Opcion A: Despliegue Serverless en Vercel (con Neon + Cloudflare R2)
1. **Sincronizar esquema hacia Neon** (una sola vez desde tu equipo o CI):
   ```bash
   # Con DB_PROVIDER=neon y DATABASE_URL_NEON configurados en .env
   npm run db:generate
   npm run db:push
   ```
2. **Importar el proyecto en Vercel**:
   - Configura **Root Directory** en `backend`.
   - El archivo [vercel.json](vercel.json) ya define `buildCommand: "npm run vercel-build"`, el rewrite hacia `api/index.js` y la inclusion de `dist/generated/prisma/**` (con `binaryTargets = ["native", "rhel-openssl-3.0.x"]` en `prisma/schema.prisma`).
3. **Variables de entorno obligatorias en Vercel**:
   - `NODE_ENV=production`
   - `DB_PROVIDER=neon`
   - `DATABASE_URL_NEON=<tu-connection-string-de-neon>`
   - `STORAGE_DRIVER=r2` (obligatorio en Vercel porque el disco local es efimero)
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_DOMAIN`
   - `ALLOWED_ORIGINS=https://tu-frontend.vercel.app`

### Opcion B: Servidor Node / Docker detras de Cloudflare Proxy o Tunnel
1. Despliega `backend/` en Render, Railway, Fly.io, Koyeb o VPS con `npm install && npm run db:generate && npm run build && npm run start`.
2. Configura `NODE_ENV=production`, `DB_PROVIDER=neon`, `STORAGE_DRIVER=r2` y `ALLOWED_ORIGINS`.
3. Apunta tu subdominio en el DNS de Cloudflare con Proxy activado o mediante **Cloudflare Tunnel (`cloudflared`)** (`app.set("trust proxy", 1)` ya viene habilitado).

---

## 7. Comandos de Desarrollo

```bash
npm install       # Instalar dependencias
npm run db:generate # Generar cliente Prisma
npm run db:push   # Sincronizar schema.prisma con la BD activa (Local o Neon)
npm run dev       # Servidor en modo desarrollo (tsx watch)
npm run build     # Compilar TypeScript hacia dist/
npm run start     # Ejecutar build de produccion
```
