import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient
}

const normalizeDatabaseUrl = () => {
  const raw = process.env.DATABASE_URL
  if (!raw) return ""

  const trimmed = raw.trim()
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed

  if (process.env.DATABASE_URL !== unquoted) {
    process.env.DATABASE_URL = unquoted
  }

  return unquoted
}

export const isDatabaseConfigured = () => Boolean(normalizeDatabaseUrl())

export const getPrismaClient = () => {
  normalizeDatabaseUrl()

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient()
  }

  return globalForPrisma.prisma
}
