# Base de Datos

La estructura inicial del proyecto quedo preparada para usar MySQL con Prisma.

## Opcion recomendada en Hostinger

Para este proyecto de Next.js con rutas API y Prisma, lo recomendable es usar una opcion de Hostinger que soporte Node.js en servidor.

Si tu plan actual solo sirve archivos estaticos o PHP, la app no va a poder ejecutar las rutas API ni conectarse directamente a MySQL desde el servidor.

Opciones validas:

1. Hostinger VPS o servicio con Node.js.
2. Mantener el frontend en Hostinger y usar un backend externo.

## Lo que ya esta armado

1. Esquema Prisma en prisma/schema.prisma.
2. Cliente Prisma de servidor en lib/server/prisma.ts.
3. Rutas API para especies y entradas en app/api/species/route.ts y app/api/entries/route.ts.
4. Script para cargar el catalogo inicial de especies desde JSON.

## Variables de entorno

Copia .env.example a .env y completa:

DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DB_NAME"
AUTH_SECRET="SECRETO_LARGO_Y_ALEATORIO"
AUTH_URL="https://tu-dominio.com"
NEXT_PUBLIC_STORAGE_PROVIDER="sql"

Compatibilidad (si tu entorno usa nombres legacy de NextAuth):

NEXTAUTH_SECRET="Mismo valor que AUTH_SECRET"
NEXTAUTH_URL="https://tu-dominio.com"

Para desarrollo offline puedes usar almacenamiento local para entradas:

NEXT_PUBLIC_STORAGE_PROVIDER="localStorage"

## Pasos para crear la base en Hostinger

1. Entra al hPanel.
2. Ve a Databases o Bases de datos MySQL.
3. Crea una base nueva.
4. Crea un usuario y password.
5. Asigna el usuario a la base.
6. Anota host, puerto, nombre de base, usuario y password.

## Comandos del proyecto

1. npm run db:generate
2. npm run db:push
3. npm run db:seed:species
4. npm run db:studio

## Deploy en Hostinger (Node.js)

1. Verifica que el plan soporte procesos Node.js persistentes. Si es solo hosting estatico/PHP, las rutas en app/api no van a funcionar.
2. Instala dependencias en el servidor: npm install
3. Verifica variables: npm run check:production
4. Construye: npm run build:production
5. Inicia la app: npm run start
6. Configura todas las variables de entorno (DATABASE_URL, AUTH_SECRET, AUTH_URL y opcionales).
7. Si usas proxy o subdominio, asegúrate de que AUTH_URL coincida exactamente con la URL publica.

## Orden sugerido de implementacion

1. Crear la base MySQL en Hostinger.
2. Completar DATABASE_URL.
3. Ejecutar generate y push.
4. Cargar especies con el seed.
5. Cambiar providers a sql.
6. Probar alta y lectura de entradas.

## Nota importante

Mientras no configures la base, la app puede funcionar en desarrollo con localStorage para entradas y JSON para especies. En produccion usa SQL para no perder datos entre dispositivos o despliegues.
