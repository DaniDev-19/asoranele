# Asoranele Gracia Divina - Plataforma de Gestion e Inventario

Plataforma web integral (**PWA Mobile-First** + **API REST**) disenada para **Asoranele Gracia Divina**, orientada a la administracion de inventario (pulseras, manualidades, viveres y articulos varios), catalogacion por categorias y unidades, control cambiario multimoneda (BCV / Paralelo), optimizacion de imagenes WebP en Cloudflare R2 y generacion de reportes comerciales en Excel y PDF.

---

## Documentacion de Modulos

- **Frontend PWA (React 19 + Vite + Tailwind CSS v4 + TanStack Query)**: [frontend/README.md](frontend/README.md)
- **Backend API (Express 5 + Prisma ORM + PostgreSQL / Neon + Cloudflare R2)**: [backend/README.md](backend/README.md)

---

## 1. Arquitectura General del Sistema

El proyecto sigue una arquitectura desacoplada Cliente-Servidor preparada para operar con **Cloudflare Pages** (frontend), **Cloudflare R2** (almacenamiento de objetos WebP), **PostgreSQL / Neon** (persistencia) y **Cloudflare Proxy / Tunnel** delante del servidor Node.js.

```mermaid
flowchart LR
    U["Usuario (Movil PWA / Escritorio)"] -->|"HTTPS (Cloudflare Pages)"| FE["Frontend React 19 + VitePWA"]
    FE -->|"Cache en Memoria (60s)"| TQ["TanStack Query v5"]
    TQ -->|"Peticiones HTTP / Multipart"| AX["Axios apiClient (VITE_URL/api/v1)"]
    AX -->|"Cloudflare Proxy + Helmet + CORS + RateLimit"| BE["Backend Express 5 (Node.js)"]
    BE -->|"Selector DB_PROVIDER (local / neon)"| DB[("PostgreSQL Local o Neon Cloud")]
    BE -->|"Sharp WebP"| ST["Cloudflare R2 / Disco Local"]
    BE -->|"Sincronizacion"| DA["DolarAPI Externa"]
    BE -->|"ExcelJS / PDFKit"| DOC["Reportes Excel y Fichas PDF"]
```

---

## 2. Flujo de Datos, Cache y Manejo de Errores

```mermaid
sequenceDiagram
    participant UI as Vista / Componente
    participant Hook as Hook TanStack Query
    participant TQ as QueryClient Cache
    participant AX as Axios (apiClient)
    participant API as Backend Express 5

    UI->>Hook: Solicita listado o detalle
    Hook->>TQ: Busca queryKey en memoria
    alt Cache vigente (staleTime 60s)
        TQ-->>UI: Retorna datos inmediatamente
    else Cache expirado o inexistente
        TQ->>AX: GET /api/v1/...
        AX->>API: Peticion HTTP con validacion Zod
        alt Respuesta 200 OK
            API-->>AX: JSON estructurado
            AX-->>TQ: Actualiza cache y entrega datos
            TQ-->>UI: Renderiza vista movil o escritorio
        else Error 400 / 404 / 500 en GET
            API-->>AX: Error HTTP + mensaje
            AX-->>UI: Interceptor emite evento y redirige a /400, /404 o /500
        end
    end
```

---

## 3. Flujo de Imagenes WebP y Ciclo PWA

```mermaid
flowchart TD
    A["Seleccion de imagen en movil o PC"] --> B["Compresion a WebP en navegador (max 1600px, calidad 0.82)"]
    B --> C["Envio multipart/form-data a /api/v1/images"]
    C --> D["Validacion Multer + Sharp WebP en Backend"]
    D --> E["Almacenamiento en Cloudflare R2 o /uploads"]

    P1["Inicio de la aplicacion"] --> P2["Registro de Service Worker (sw.js)"]
    P2 --> P3{"Modo standalone activo?"}
    P3 -->|"Si"| P4["Ocultar banner de instalacion"]
    P3 -->|"No"| P5["Capturar evento beforeinstallprompt"]
    P5 --> P6["Mostrar InstallPwaBanner y ejecutar prompt()"]
```

---

## 4. Seguridad, Almacenamiento y Sesiones

- **Modelo sin inicio de sesion**: El panel opera como aplicacion administrativa directa sin cuentas de usuario ni tokens JWT, por lo que **no almacena cookies de sesion ni credenciales en `localStorage`**. En el navegador unicamente se utiliza `sessionStorage` para recordar si el usuario descarto temporalmente el aviso de instalacion PWA durante la sesion actual.
- **Capas de seguridad activas en el backend**:
  - **Cabeceras HTTP**: `helmet` con `crossOriginResourcePolicy: cross-origin` para carga segura de recursos multimedia.
  - **Control de origenes**: `cors` restringido a la lista blanca `ALLOWED_ORIGINS`.
  - **Proteccion contra abuso**: `express-rate-limit` dual (300 req/15 min global; 30 req/15 min en endpoints criticos de subida, importacion y sincronizacion).
  - **Validacion estricta**: Esquemas `Zod` en body, params y query, mas filtros de tipo MIME y tamano en `Multer` (5 MB por imagen, 20 MB por Excel).
  - **Proteccion SQL**: Consultas parametrizadas mediante **Prisma ORM**.
  - **Trazabilidad y Proxy**: `app.set("trust proxy", 1)` compatible con Cloudflare y asignacion de `x-request-id` UUID por peticion.

---

## 5. Inicio Rapido en Local

```bash
# 1. Instalar y configurar Backend
cd backend
cp .env.example .env
npm install
npm run db:generate
npm run db:push
npm run dev

# 2. Instalar y configurar Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

Para detalles completos de endpoints, variables de entorno, despliegue en Cloudflare y Neon, consulta [backend/README.md](backend/README.md) y [frontend/README.md](frontend/README.md).
