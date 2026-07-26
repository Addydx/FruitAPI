# Guia de Despliegue — Frutopedia API

Paso a paso para desplegar la API en **Render** (backend) y **Neon** (base de datos PostgreSQL).

---

## Requisitos previos

- Cuenta gratuita en [render.com](https://render.com)
- Cuenta gratuita en [neon.tech](https://neon.tech)
- Cuenta en [github.com](https://github.com) con el codigo subido
- Node.js 20+ instalado localmente

---

## Paso 1: Crear base de datos en Neon

1. Ir a [neon.tech](https://neon.tech) y crear cuenta
2. Click en **Create Project**
3. Elegir region mas cercana al usuario (ej: `us-east-1` para America)
4. Copiar la **Connection string** que se ve asi:

```
postgresql://neondb_owner:xxxxx@ep-xxx-xxx.us-east-1.aws.neon.tech/frutopedia?sslmode=require
```

5. Guardar esta URL — la necesitaremos en el Paso 3

> **Tip:** Neon crea la database automaticamente. No es necesario crear tablas a mano.

---

## Paso 2: Preparar el repositorio

### 2.1 Agregar scripts faltantes en `package.json`

El `package.json` actual solo tiene `dev` y `seed`. Agregar los scripts de build y production:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/src/server.js",
    "seed": "tsx prisma/seed.ts",
    "postinstall": "npx prisma generate"
  }
}
```

> **Importante:** El `postinstall` ejecuta `prisma generate` automaticamente despues de `npm install` en Render.

### 2.2 Verificar `.gitignore`

Asegurarse de que `.gitignore` tenga:

```
node_modules
dist
.env
prisma/generated
```

Y que **NO** esten en `.gitignore`:

```
prisma/migrations
prisma/schema.prisma
prisma.config.ts
prisma/data/frutas.json
```

### 2.3 Verificar que `dotenv` este en dependencias

```bash
npm install dotenv
```

El `prisma.config.ts` y `prisma/seed.ts` usan `import "dotenv/config"`. Si no esta en `dependencies`, el seed fallara en produccion.

### 2.4 Subir a GitHub

```bash
git add .
git commit -m "Preparar para despliegue"
git push
```

---

## Paso 3: Desplegar en Render

### 3.1 Crear el servicio

1. Ir a [render.com](https://render.com) > Dashboard
2. Click **New +** > **Web Service**
3. Conectar el repositorio de GitHub
4. Configurar:

| Campo | Valor |
|-------|-------|
| **Name** | `api-frutas` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npx prisma generate && npx tsc` |
| **Start Command** | `npx prisma migrate deploy && node dist/src/server.js` |
| **Plan** | Free |

### 3.2 Variables de entorno

En la seccion **Environment Variables**, agregar:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | La URL de Neon del Paso 1 (con `sslmode=require`) |
| `FRONTEND_URL` | `https://tu-frontend.onrender.com` (o `*` para pruebas) |
| `PORT` | `10000` |
| `NODE_ENV` | `production` |

> **Tip:** Si aun no tienes el frontend desplegado, usa `FRONTEND_URL=*` temporalmente. Cambiarlo despues.

### 3.3 Crear el servicio

Click **Create Web Service**. El deploy tarda 2-5 minutos.

### 3.4 Verificar que funciona

Abrir en el navegador:

```
https://api-frutas-XXXX.onrender.com/frutas
```

Debe retornar un JSON con frutas. Si ves un error, revisar los logs en Render.

---

## Paso 4: Sembrar los datos (100 frutas)

Despues del primer deploy exitoso, la base de datos esta vacia. Hay que sembrar las 100 frutas.

### 4.1 Desde Render Shell

1. En Render, ir a tu servicio > **Shell** (pestaña izquierda)
2. Ejecutar:

```bash
npm run seed
```

Esto deberia mostrar:

```
Sembrando 100 frutas...
Base de datos limpiada.
Total frutas en base de datos: 100
```

### 4.2 Verificar

```bash
curl https://api-frutas-XXXX.onrender.com/frutas?por_pagina=2
```

Deberia retornar un JSON con las primeras frutas e imagenes de loremflickr.

---

## Paso 5: Verificar todo

### 5.1 Endpoints que deben funcionar

| URL | Metodo | Que hace |
|-----|--------|----------|
| `/frutas` | GET | Lista frutas con paginacion |
| `/frutas?categoria=Baya` | GET | Filtra por categoria |
| `/frutas?temporada=Verano` | GET | Filtra por temporada |
| `/frutas?color=Rojo` | GET | Filtra por color |
| `/frutas?pagina=2&por_pagina=5` | GET | Paginacion |
| `/frutas/324` | GET | Obtiene una fruta por ID |
| `/api-docs` | GET | Swagger UI |

### 5.2 Ejemplo de respuesta esperada

```json
{
  "datos": [
    {
      "id": 324,
      "nombre": "Manzana",
      "nombreCientifico": "Malus domestica",
      "imagenes": ["https://loremflickr.com/400/400/apple"],
      "caloriasKcal": 52,
      "categoria": "Pomácea",
      "temporada": ["Otoño", "Invierno"],
      "colores": ["Rojo", "Verde", "Amarillo"]
    }
  ],
  "paginacion": {
    "total": 100,
    "pagina": 1,
    "por_pagina": 10,
    "total_paginas": 10
  }
}
```

---

## Paso 6: Conectar el frontend

Cuando el frontend este desplegado:

1. Ir a Render > tu servicio API > **Environment**
2. Actualizar `FRONTEND_URL` con la URL real del frontend:

```
https://tu-frontend.onrender.com
```

3. Guardar — Render redeploya automaticamente

---

## Estructura de archivos relevante

```
api-frutas/
├── prisma/
│   ├── schema.prisma          # Schema de Prisma 7
│   ├── config.ts              # Configuracion de Prisma
│   ├── seed.ts                # Script de seed (100 frutas)
│   ├── data/
│   │   └── frutas.json        # Datos de las 100 frutas con imagenes
│   ├── migrations/            # Migraciones SQL (subir a git)
│   └── generated/             # Cliente generado (NO subir a git)
├── src/
│   ├── server.ts              # Entry point
│   ├── app.ts                 # Express + CORS + Swagger
│   ├── lib/prisma.ts          # Singleton de PrismaClient
│   ├── routes/frutas.routes.ts # Endpoints CRUD
│   ├── schemas/fruta.schema.ts # Validacion Zod
│   └── middleware/errorHandler.ts
├── Conexion.md                # Guia para el frontend
├── despliegue.md              # Esta guia
├── package.json
├── tsconfig.json
└── .gitignore
```

---

## Comandos utiles en produccion

```bash
# Ver logs recientes
# (desde Render Dashboard > Logs)

# Sembrar datos
npm run seed

# Verificar total de frutas
curl https://api-frutas-XXXX.onrender.com/frutas?por_pagina=1

# Swagger
https://api-frutas-XXXX.onrender.com/api-docs
```

---

## Troubleshooting

| Problema | Causa | Solucion |
|----------|-------|----------|
| `Cannot find module prisma/generated/...` | No se ejecuto `prisma generate` | Verificar que `postinstall` esta en package.json |
| `P1001: Database does not exist` | URL de Neon incorrecta | Verificar `DATABASE_URL` en Environment Variables |
| `P1000: Authentication failed` | Credenciales de Neon incorrectas | Copiar la URL completa desde Neon Dashboard |
| CORS error en frontend | `FRONTEND_URL` no coincide | Actualizar `FRONTEND_URL` con la URL exacta del frontend |
| Seed no funciona en Shell | Falta `dotenv` | Ejecutar `npm install dotenv` en Shell, luego `npm run seed` |
| Puerto en Render | Render asigna PORT automaticamente | Usar `process.env.PORT` (ya esta configurado en server.ts) |
| Build falla con `tsc` | Errores de tipos | Verificar que no hay errores de TypeScript localmente con `npm run build` |
| `SIGKILL` en deploy | Memoria insuficiente en plan Free | Upgrade a plan Starter o reducir uso de memoria |
| 502 Bad Gateway | El server no arranca | Revisar logs, verificar que `node dist/src/server.js` funciona |
| Migraciones no aplicadas | No se ejecuto `migrate deploy` | El start command ya lo incluye; si falla, ejecutar manualmente en Shell |

---

## Resetear la base de datos

Si necesitas empezar de cero:

```bash
# En Render Shell:
npx prisma migrate reset --force
npm run seed
```

Esto borra todos los datos, re-aplica las migraciones, y vuelve a sembrar las 100 frutas.

---

## Actualizaciones futuras

Cuando hagas cambios en el codigo:

```bash
git add .
git commit -m "Descripcion del cambio"
git push
```

Render detecta el push y redeploya automaticamente. Si cambiaste el schema de Prisma, las migraciones se aplican automaticamente via `prisma migrate deploy` en el start command.
