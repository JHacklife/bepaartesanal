#!/usr/bin/env node

import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"
import { loadProjectEnv } from "./load-project-env.mjs"

loadProjectEnv()

const prisma = new PrismaClient()

const defaultUsers = [
  ["Usuario de Prueba 1", "test1@bepa.local", "BepaTest1234!"],
  ["Usuario de Prueba 2", "test2@bepa.local", "BepaTest1234!"],
  ["Usuario de Prueba 3", "test3@bepa.local", "BepaTest1234!"],
  ["Usuario de Prueba 4", "test4@bepa.local", "BepaTest1234!"],
  ["Usuario de Prueba 5", "test5@bepa.local", "BepaTest1234!"],
]

const testUsers = defaultUsers.map(([name, email, password], index) => {
  const suffix = index + 1

  return {
    name: process.env[`TEST_USER_${suffix}_NAME`] || name,
    email: process.env[`TEST_USER_${suffix}_EMAIL`] || email,
    password: process.env[`TEST_USER_${suffix}_PASSWORD`] || password,
  }
})

try {
  console.log("Creando/actualizando usuarios de prueba...")

  for (const user of testUsers) {
    const passwordHash = await hash(user.password, 12)

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: passwordHash,
      },
      create: {
        name: user.name,
        email: user.email,
        password: passwordHash,
      },
    })

    console.log(`Usuario listo: ${user.email}`)
  }

  console.log(`Seed completado: ${testUsers.length} usuarios de prueba listos.`)
} catch (error) {
  console.error("No se pudieron crear los usuarios de prueba:", error)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
