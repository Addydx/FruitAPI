## 🧪 Estado actual - FruitAPI

### ✔ Ya completado
- PostgreSQL instalado y funcionando (v18)
- Base de datos `fruitapi` creada
- Usuario `addydx` creado
- Prisma instalado y configurado
- Schema de `Fruta` ya definido (muy completo y correcto)
- Proyecto Node/TypeScript inicializado

### ❌ Problema actual (bloqueo)
- Prisma Migrate falla con error de permisos en schema `public`
- PostgreSQL está bloqueando creación de tablas
- Conflicto de ownership/permisos en el schema

### 📍 Nos quedamos aquí
➡ Intentando ejecutar:
   `npx prisma migrate dev`

➡ Error:
   "permiso denegado al esquema public"

➡ Bloqueo impide crear la primera tabla `Fruta`
