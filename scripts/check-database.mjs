#!/usr/bin/env node

import { PrismaClient } from "@prisma/client"
import { loadProjectEnv } from "./load-project-env.mjs"

loadProjectEnv()

if (!process.env.DATABASE_URL?.trim()) {
  console.error("DATABASE_URL no esta definido en .env/.env.local.")
  process.exit(1)
}

const prisma = new PrismaClient()

try {
  await prisma.$queryRaw`SELECT 1`

  const [users, species, entries] = await Promise.all([
    prisma.user.count(),
    prisma.speciesCatalogItem.count(),
    prisma.fishingEntry.count(),
  ])

  console.log("Conexion a base de datos OK.")
  console.log(`Usuarios: ${users}`)
  console.log(`Especies: ${species}`)
  console.log(`Entradas: ${entries}`)
} catch (error) {
  console.error("La base de datos no respondio correctamente:", error)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
