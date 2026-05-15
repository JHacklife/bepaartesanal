/**
 * Script para corregir el campo badges en usuarios existentes
 * Establece badges = '[]' para usuarios que tienen un valor inválido o NULL
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Corrigiendo campo badges en usuarios existentes...')

  // Obtener todos los usuarios
  const users = await prisma.$queryRaw`SELECT id, badges FROM users`

  let fixed = 0
  for (const user of users) {
    let needsFix = false

    if (user.badges === null || user.badges === '') {
      needsFix = true
    } else {
      try {
        const parsed = typeof user.badges === 'string' ? JSON.parse(user.badges) : user.badges
        if (!Array.isArray(parsed)) needsFix = true
      } catch {
        needsFix = true
      }
    }

    if (needsFix) {
      await prisma.$executeRaw`UPDATE users SET badges = '[]' WHERE id = ${user.id}`
      console.log(`Corregido usuario ${user.id}`)
      fixed++
    }
  }

  console.log(`Completado. ${fixed} usuarios corregidos.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
