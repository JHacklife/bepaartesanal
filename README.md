# BEPA Artesanal

Aplicacion Next.js para bitacora electronica de pesca artesanal.

## Requisitos

- Node.js 20 o superior.
- MySQL accesible desde el servidor de produccion.
- Variables de entorno completas, ver `.env.example`.

## Desarrollo

```bash
npm install
npm run dev
```

## Base de Datos

```bash
npm run db:generate
npm run db:push
npm run db:seed:species
```

En produccion se recomienda:

```env
NEXT_PUBLIC_STORAGE_PROVIDER="sql"
NEXT_PUBLIC_SPECIES_PROVIDER="sql"
```

## Verificacion

```bash
npm run typecheck
npm run check:production
npm run build:production
```

`check:production` falla si faltan `DATABASE_URL`, `AUTH_SECRET`/`NEXTAUTH_SECRET` o `AUTH_URL`/`NEXTAUTH_URL`.

## Produccion

```bash
npm install --omit=dev
npm run db:generate
npm run build:production
npm run start
```

El servidor debe ejecutar Next.js como proceso Node. Un hosting solo estatico/PHP no alcanza porque la app usa rutas API, autenticacion y Prisma.

## Archivos Subidos

Las fotos se guardan en `public/uploads`. En servidores con disco efimero o multiples instancias, usar almacenamiento persistente externo o montar un volumen persistente.
