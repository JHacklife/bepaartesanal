#!/usr/bin/env node

import { PrismaClient } from "@prisma/client"
import { randomUUID } from "crypto"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

const TEST_USER_EMAIL = process.env.SEED_TEST_EMAIL || "test@bepa.local"
const TEST_USER_PASSWORD = process.env.SEED_TEST_PASSWORD || "Test1234"

const testData = [
  {
    date: "2026-05-08",
    startTime: "06:30",
    endTime: "14:45",
    skipper: "Carlos Mendoza",
    method: "hookah",
    area: "Bahía Engaño - Sector Norte",
    depth: "18",
    latitude: -42.7692,
    longitude: -65.0385,
    crewWages: "15000",
    fuelConsumption: "28.5",
    weather: "Viento moderado del NE, oleaje de 0.5-1m, buena visibilidad",
    observations: "Buena jornada. Zona muy productiva. Se avistaron delfines.",
    location: "Bahía Engaño",
    status: "Validado",
    sailors: [
      { name: "Juan García", divingTime: "180" },
      { name: "Pedro López", divingTime: "165" },
    ],
    catches: [
      {
        speciesId: "abadejo",
        crates: "12",
        weight: "65.5",
        size: "large",
      },
      {
        speciesId: "mero",
        crates: "8",
        weight: "42.0",
        size: "medium",
      },
    ],
  },
  {
    date: "2026-05-09",
    startTime: "07:00",
    endTime: "15:30",
    skipper: "Roberto Silva",
    method: "semi-autonomo",
    area: "Punta Loyola",
    depth: "22",
    latitude: -51.5248,
    longitude: -69.2245,
    crewWages: "14500",
    fuelConsumption: "32.0",
    weather: "Viento fuerte del SO, oleaje de 1-1.5m, buena visibilidad",
    observations:
      "Día desafiante por el viento. Menos captura que lo esperado.",
    location: "Punta Loyola",
    status: "Pendiente",
    sailors: [
      { name: "Miguel Rodríguez", divingTime: "200" },
      { name: "Andrés Morales", divingTime: "195" },
      { name: "Fernando Díaz", divingTime: "190" },
    ],
    catches: [
      {
        speciesId: "merluza-negra",
        crates: "6",
        weight: "28.0",
        size: "medium",
      },
      {
        speciesId: "corvina-rubia",
        crates: "4",
        weight: "35.5",
        size: "large",
      },
    ],
  },
  {
    date: "2026-05-07",
    startTime: "06:00",
    endTime: "16:00",
    skipper: "Arturo Fernández",
    method: "hookah",
    area: "Zona de Vieira - Sector Centro",
    depth: "20",
    latitude: -42.3456,
    longitude: -64.8901,
    crewWages: "16000",
    fuelConsumption: "35.0",
    weather: "Condiciones excelentes. Viento suave, mar calmo.",
    observations: "Excelente rendimiento de vieira. Pulpa de muy buena calidad.",
    location: "Zona de Vieira",
    status: "Validado",
    sailors: [
      { name: "Julio Ramírez", divingTime: "220" },
      { name: "Diego Saavedra", divingTime: "210" },
    ],
    catches: [
      {
        speciesId: "vieira-tehuelche",
        crates: "25",
        weight: "120.0",
        size: "large",
      },
    ],
    production: {
      sacoMuestras: "si",
      kgPulpaVieira: "48.5",
      numBolsas: "10",
      kgPorBolsa: "4.85",
      rindePulpaVieira: "40.5",
    },
  },
]

async function main() {
  console.log("🌱 Iniciando seed de datos de prueba...")

  const passwordHash = await hash(TEST_USER_PASSWORD, 12)
  const testUser = await prisma.user.upsert({
    where: { email: TEST_USER_EMAIL },
    update: {
      name: "Usuario de Prueba",
      password: passwordHash,
    },
    create: {
      email: TEST_USER_EMAIL,
      name: "Usuario de Prueba",
      password: passwordHash,
    },
  })

  console.log(`👤 Usuario de prueba listo: ${TEST_USER_EMAIL}`)

  for (const testEntry of testData) {
    console.log(
      `\n📋 Creando entrada: ${testEntry.date} - ${testEntry.skipper}`
    )

    const entryId = randomUUID()

    // Crear marineros
    const crewMemberIds = []
    for (const sailor of testEntry.sailors) {
      const crewMemberId = randomUUID()
      await prisma.crewMember.create({
        data: {
          id: crewMemberId,
          name: sailor.name,
        },
      })
      crewMemberIds.push(crewMemberId)
    }

    // Crear entrada
    await prisma.fishingEntry.create({
      data: {
        id: entryId,
        userId: testUser.id,
        date: testEntry.date,
        startTime: testEntry.startTime,
        endTime: testEntry.endTime,
        skipper: testEntry.skipper,
        method: testEntry.method,
        area: testEntry.area,
        depth: testEntry.depth,
        latitude: testEntry.latitude,
        longitude: testEntry.longitude,
        crewWages: testEntry.crewWages,
        fuelConsumption: testEntry.fuelConsumption,
        weather: testEntry.weather,
        observations: testEntry.observations,
        gps: `${testEntry.latitude}, ${testEntry.longitude}`,
        location: testEntry.location,
        status: testEntry.status,
      },
    })

    // Crear relaciones marinero-entrada
    for (let i = 0; i < crewMemberIds.length; i++) {
      await prisma.entryCrewMember.create({
        data: {
          id: randomUUID(),
          entryId,
          crewMemberId: crewMemberIds[i],
          divingTime: testEntry.sailors[i].divingTime,
        },
      })
    }

    // Crear capturas
    for (const catchData of testEntry.catches) {
      await prisma.catch.create({
        data: {
          id: randomUUID(),
          entryId,
          speciesId: catchData.speciesId,
          crates: catchData.crates,
          weight: catchData.weight,
          size: catchData.size,
        },
      })
    }

    // Crear datos de producción si existen
    if (testEntry.production) {
      await prisma.productionData.create({
        data: {
          id: randomUUID(),
          entryId,
          sacoMuestras: testEntry.production.sacoMuestras,
          kgPulpaVieira: testEntry.production.kgPulpaVieira,
          numBolsas: testEntry.production.numBolsas,
          kgPorBolsa: testEntry.production.kgPorBolsa,
          rindePulpaVieira: testEntry.production.rindePulpaVieira,
        },
      })
    }

    console.log(`✅ Entrada creada con éxito`)
  }

  console.log(
    `\n🎉 Seed completado: ${testData.length} entradas de prueba cargadas`
  )
  console.log(`🔐 Credenciales de prueba: ${TEST_USER_EMAIL} / ${TEST_USER_PASSWORD}`)
}

main()
  .catch((error) => {
    console.error("❌ Error durante el seed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
