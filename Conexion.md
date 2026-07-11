# Conexion Frontend — Frutopedia API

## URL de la API

| Entorno | URL |
|---------|-----|
| Desarrollo | `http://localhost:3000` |
| Produccion | `https://api-frutas-XXXX.onrender.com` |

Swagger UI (solo desarrollo): `http://localhost:3000/api-docs`

---

## Guia para el agente de IA (Frontend)

> **Instruccion:** Estas en el proyecto del frontend. Usa esta guia para consumir la API de Frutopedia.

### 1. Variables de entorno

Crear un archivo `.env` en la raiz del frontend:

```
VITE_API_URL=http://localhost:3000
```

En produccion:

```
VITE_API_URL=https://api-frutas-XXXX.onrender.com
```

### 2. Tipos TypeScript

```ts
export interface Fruta {
  id: number;
  nombre: string;
  nombreCientifico: string;
  familiaBotanica: string | null;
  otrosNombres: string[];
  descripcion: string;
  categoria: string;
  sabor: string | null;
  origenPais: string | null;
  origenRegion: string | null;
  temporada: string[];
  colores: string[];
  usosCulinarios: string[];
  beneficios: string[];
  alergias: string[];
  curiosidades: string[];
  imagenes: string[];           // URLs de busqueda Unsplash (ej: "https://unsplash.com/s/photos/mango")
  porcionG: number;
  caloriasKcal: number | null;
  carbohidratosG: number | null;
  azucaresG: number | null;
  fibraG: number | null;
  proteinasG: number | null;
  grasasG: number | null;
  vitaminaCMg: number | null;
  vitaminaAUg: number | null;
  vitaminaKUg: number | null;
  potasioMg: number | null;
  calcioMg: number | null;
  hierroMg: number | null;
  conservacionMetodo: string | null;
  conservacionDuracionDias: number | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface Paginacion {
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export interface RespuestaFrutas {
  datos: Fruta[];
  paginacion: Paginacion;
}

export interface FrutaInput {
  nombre: string;               // requerido
  nombreCientifico: string;     // requerido
  descripcion: string;          // requerido
  categoria: string;            // requerido
  familiaBotanica?: string | null;
  otrosNombres?: string[];
  sabor?: string | null;
  origenPais?: string | null;
  origenRegion?: string | null;
  temporada?: string[];
  colores?: string[];
  usosCulinarios?: string[];
  beneficios?: string[];
  alergias?: string[];
  curiosidades?: string[];
  imagenes?: string[];
  porcionG?: number;
  caloriasKcal?: number | null;
  carbohidratosG?: number | null;
  azucaresG?: number | null;
  fibraG?: number | null;
  proteinasG?: number | null;
  grasasG?: number | null;
  vitaminaCMg?: number | null;
  vitaminaAUg?: number | null;
  vitaminaKUg?: number | null;
  potasioMg?: number | null;
  calcioMg?: number | null;
  hierroMg?: number | null;
  conservacionMetodo?: string | null;
  conservacionDuracionDias?: number | null;
}

export type FrutaUpdate = Partial<FrutaInput>;

export interface ErrorAPI {
  error: string;
}

export interface ErrorValidacion {
  error: string;
  detalles: { campo: string; mensaje: string }[];
}
```

### 3. Cliente API

```ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json();
  if (!res.ok) throw new ApiError(res.status, body.error || "Error desconocido");
  return body;
}

interface FiltrosFrutas {
  pagina?: number;
  por_pagina?: number;
  categoria?: string;
  temporada?: string;
  color?: string;
}

export const api = {
  frutas: {
    listar: (filtros?: FiltrosFrutas) => {
      const params = new URLSearchParams();
      if (filtros?.pagina) params.set("pagina", String(filtros.pagina));
      if (filtros?.por_pagina) params.set("por_pagina", String(filtros.por_pagina));
      if (filtros?.categoria) params.set("categoria", filtros.categoria);
      if (filtros?.temporada) params.set("temporada", filtros.temporada);
      if (filtros?.color) params.set("color", filtros.color);
      const qs = params.toString();
      return request<RespuestaFrutas>(`/frutas${qs ? `?${qs}` : ""}`);
    },
    obtener: (id: number) => request<Fruta>(`/frutas/${id}`),
    crear: (data: FrutaInput) =>
      request<Fruta>("/frutas", { method: "POST", body: JSON.stringify(data) }),
    actualizar: (id: number, data: FrutaUpdate) =>
      request<Fruta>(`/frutas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    eliminar: (id: number) =>
      request<void>(`/frutas/${id}`, { method: "DELETE" }),
  },
};
```

### 4. Ejemplos de uso

```ts
import { api } from "./lib/api";

// Listar todas las frutas (pagina 1, 10 por pagina)
const { datos, paginacion } = await api.frutas.listar();

// Filtrar por categoria
const bayas = await api.frutas.listar({ categoria: "Baya" });

// Filtrar por temporada
const verano = await api.frutas.listar({ temporada: "Verano" });

// Filtrar por color
const rojas = await api.frutas.listar({ color: "Rojo" });

// Combinar filtros + paginacion
const resultado = await api.frutas.listar({
  pagina: 1,
  por_pagina: 5,
  categoria: "Pomácea",
  temporada: "Otoño",
});

// Obtener una fruta por ID
const fruta = await api.frutas.obtener(324);

// Crear fruta
const nueva = await api.frutas.crear({
  nombre: "Nueva Fruta",
  nombreCientifico: "Species nova",
  descripcion: "Descripcion de la fruta",
  categoria: "Tropical",
});

// Actualizar fruta (parcial)
const actualizada = await api.frutas.actualizar(324, { sabor: "Muy dulce" });

// Eliminar fruta
await api.frutas.eliminar(324);
```

---

## Endpoints

### GET /frutas — Listar frutas

Lista frutas con filtros y paginacion.

**Parametros query:**

| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| `pagina` | integer | 1 | Numero de pagina |
| `por_pagina` | integer | 10 | Elementos por pagina (max: 100) |
| `categoria` | string | — | Busqueda parcial case-insensitive (ej: `Poma`, `Baya`) |
| `temporada` | string | — | Match exacto en array (ej: `Verano`, `Invierno`, `Todo el ano`) |
| `color` | string | — | Match exacto en array (ej: `Rojo`, `Verde`) |

**Ejemplo:**

```
GET /frutas?pagina=1&por_pagina=5&color=Rojo
```

**Respuesta 200:**

```json
{
  "datos": [
    {
      "id": 324,
      "nombre": "Manzana",
      "nombreCientifico": "Malus domestica",
      "familiaBotanica": "Rosaceae",
      "otrosNombres": ["Apple", "Manzano"],
      "descripcion": "Fruta de pulpa crujiente y jugosa...",
      "categoria": "Pomácea",
      "sabor": "Dulce con notas ácidas",
      "origenPais": "Asia Central",
      "origenRegion": "Kazajistán (montañas de Tian Shan)",
      "temporada": ["Otoño", "Invierno"],
      "colores": ["Rojo", "Verde", "Amarillo"],
      "usosCulinarios": ["Consumo fresco", "Tartas", "Compotas", "Jugos", "Sidra"],
      "beneficios": ["Favorece la digestión por su fibra", "Aporta antioxidantes"],
      "alergias": ["Síndrome de alergia oral"],
      "curiosidades": ["Existen más de 7,500 variedades de manzanas"],
      "imagenes": ["https://unsplash.com/s/photos/manzana"],
      "porcionG": 100,
      "caloriasKcal": 52,
      "carbohidratosG": 13.8,
      "azucaresG": 10.4,
      "fibraG": 2.4,
      "proteinasG": 0.3,
      "grasasG": 0.2,
      "vitaminaCMg": 4.6,
      "vitaminaAUg": 3,
      "vitaminaKUg": 2.2,
      "potasioMg": 107,
      "calcioMg": 6,
      "hierroMg": 0.12,
      "conservacionMetodo": "Refrigerada",
      "conservacionDuracionDias": 30,
      "creadoEn": "2026-07-11T18:28:13.215Z",
      "actualizadoEn": "2026-07-11T18:28:13.215Z"
    }
  ],
  "paginacion": {
    "total": 100,
    "pagina": 1,
    "por_pagina": 5,
    "total_paginas": 20
  }
}
```

**Datos actuales:** 100 frutas con imagenes de Unsplash, datos nutricionales reales y informacion completa.

---

### GET /frutas/:id — Obtener una fruta

**Parametro path:** `id` (integer, requerido)

**Ejemplo:** `GET /frutas/324`

**Respuesta 200:** Objeto `Fruta` (mismo formato que en el listado, sin arreglo `datos`).

**Respuesta 400:** `{ "error": "ID debe ser un numero" }`

**Respuesta 404:** `{ "error": "Fruta no encontrada" }`

---

### POST /frutas — Crear fruta

**Body JSON (FrutaInput):** los campos `nombre`, `nombreCientifico`, `descripcion` y `categoria` son **requeridos**. Todos los demas son opcionales.

```json
{
  "nombre": "Mango",
  "nombreCientifico": "Mangifera indica",
  "descripcion": "Fruta tropical dulce y jugosa",
  "categoria": "Drupa",
  "familiaBotanica": "Anacardiaceae",
  "otrosNombres": ["Manguito"],
  "sabor": "Dulce e intenso",
  "origenPais": "India",
  "colores": ["Verde", "Amarillo", "Naranja"],
  "temporada": ["Primavera", "Verano"],
  "imagenes": ["https://unsplash.com/s/photos/mango"],
  "caloriasKcal": 60,
  "carbohidratosG": 15
}
```

**Respuesta 201:** Objeto `Fruta` creado con `id` y timestamps.

**Respuesta 400:** Error de validacion Zod:

```json
{
  "error": "Error de validacion",
  "detalles": [
    { "campo": "nombre", "mensaje": "nombre es requerido" },
    { "campo": "categoria", "mensaje": "categoria es requerida" }
  ]
}
```

---

### PUT /frutas/:id — Actualizar fruta

**Parametro path:** `id` (integer, requerido)

**Body JSON (FrutaUpdate):** todos los campos son opcionales (parcial).

```json
{
  "sabor": "Muy dulce y aromatico",
  "imagenes": ["https://unsplash.com/s/photos/mango"]
}
```

**Respuesta 200:** Objeto `Fruta` actualizado.

**Respuesta 400:** `{ "error": "ID debe ser un numero" }` o error de validacion.

**Respuesta 404:** `{ "error": "Fruta no encontrada" }`

---

### DELETE /frutas/:id — Eliminar fruta

**Parametro path:** `id` (integer, requerido)

**Respuesta 204:** Sin contenido (exitoso).

**Respuesta 400:** `{ "error": "ID debe ser un numero" }`

**Respuesta 404:** `{ "error": "Fruta no encontrada" }`

---

## Campo imagenes

Cada fruta tiene un array `imagenes` con URLs de busqueda de Unsplash:

```json
"imagenes": ["https://unsplash.com/s/photos/mango"]
```

**Para el frontend:** Estas URLs apuntan a la pagina de busqueda de Unsplash para cada fruta. Para extraer imagenes reales de Unsplash, usar la API oficial de Unsplash con la busqueda del nombre de la fruta, o usar un proxy/routing en el frontend que extraiga la primera imagen de la pagina de resultados.

**Alternativa simple:** Usar el servicio `https://source.unsplash.com/featured/?{fruta}` para obtener una imagen aleatoria de cada fruta (sujecta a disponibilidad).

---

## CORS configurado

El API tiene CORS habilitado. Permite solicitudes desde:

- **Desarrollo:** `http://localhost:5173` (Vite default)
- **Produccion:** La URL que configures en `FRONTEND_URL`

Para permitir multiples origenes, separar con comas en `.env`:

```
FRONTEND_URL=http://localhost:5173,http://localhost:3001
```

**Headers permitidos:** `Content-Type`, `Authorization`

**Metodos permitidos:** `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

---

## Variables de entorno

### Backend (API) — `.env`

| Variable | Ejemplo | Descripcion |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/fruitapi` | URL de conexion PostgreSQL |
| `FRONTEND_URL` | `http://localhost:5173` | URL del frontend (CORS). Comas para multiples. |
| `PORT` | `3000` | Puerto del servidor (default: 3000) |

### Frontend — `.env`

| Variable | Ejemplo | Descripcion |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000` | URL base de la API |

---

## Datos actuales de la API

| Dato | Valor |
|------|-------|
| Total de frutas | 100 |
| Imagenes | URLs de busqueda Unsplash en campo `imagenes` |
| Datos nutricionales | Completos (14 campos por fruta) |
| Categorias | Pomacea, Baya, Hesperidio, Drupa, Pepo, Tropical, etc. |
| Temporadas | Primavera, Verano, Otono, Invierno, Todo el ano |
| Colores | Rojo, Verde, Amarillo, Naranja, Morado, etc. |

---

## Despliegue en Render + Neon

### Paso 1: Base de datos en Neon

1. Crear cuenta en [neon.tech](https://neon.tech) (gratuito)
2. Crear proyecto y copiar la URL de conexion:
   ```
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

### Paso 2: Migraciones locales

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Esto crea `prisma/migrations/` con el SQL necesario.

### Paso 3: Desplegar en Render

1. Subir codigo a GitHub
2. Crear **Web Service** en [render.com](https://render.com)
3. Conectar el repositorio
4. Configurar:

| Campo | Valor |
|-------|-------|
| Runtime | `Node` |
| Build Command | `npm install && npx prisma generate` |
| Start Command | `npm run seed && node dist/src/server.js` |

5. Environment Variables:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | URL de Neon |
| `FRONTEND_URL` | URL del frontend en produccion |
| `PORT` | `10000` |
| `NODE_ENV` | `production` |

### Paso 4: Verificar

1. `https://api-frutas-XXXX.onrender.com/frutas` — debe retornar JSON
2. `https://api-frutas-XXXX.onrender.com/api-docs` — Swagger UI

---

## Comandos utiles

```bash
npm run dev              # Desarrollo local (tsx watch)
npm run seed             # Sembrar 100 frutas en la DB
npx prisma generate      # Generar cliente Prisma
npx prisma migrate dev   # Migrar DB local
npx prisma studio        # Ver datos en UI web
npm run build            # Build para produccion (tsc)
npx prisma migrate deploy # Deploy migraciones en produccion
```

---

## Troubleshooting

| Problema | Solucion |
|----------|----------|
| CORS error en frontend | Verificar que `FRONTEND_URL` coincida exactamente con la URL del frontend |
| `P1001: Database does not exist` | Verificar `DATABASE_URL` en Neon apunta a la DB correcta |
| `P1000: Authentication failed` | Verificar credenciales en la URL de Neon |
| Puerto en Render | Render asigna `PORT` automaticamente, usar `process.env.PORT` |
| Prisma no encuentra cliente | Ejecutar `npx prisma generate` o verificar `postinstall` |
| Migraciones no aplicadas | Ejecutar `npx prisma migrate deploy` en Render Shell |
| Seed no funciona en produccion | Ejecutar `npm run seed` desde Render Shell |
| IMAGENES | Cada fruta tiene URLs de busqueda de Unsplash en `imagenes[]`; usar la API de Unsplash o un proxy para extraer imagenes reales |
