import { randomUUID } from "node:crypto"
import type { FishingEntry, NewFishingEntry } from "@/lib/entries/types"
import { getPrismaClient } from "./prisma"

export const listEntriesFromDatabase = async (userId: string): Promise<FishingEntry[]> => {
  const prisma = getPrismaClient()

  const records = await prisma.fishingEntry.findMany({
    where: { userId },
    include: {
      crewMembers: {
        include: {
          crewMember: true,
        },
      },
      catches: {
        include: {
          species: true,
        },
      },
      production: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return records.map((record) => ({
    id: record.id,
    date: record.date || undefined,
    startTime: record.startTime || undefined,
    endTime: record.endTime || undefined,
    skipper: record.skipper || undefined,
    method: record.method || undefined,
    area: record.area || undefined,
    depth: record.depth || undefined,
    sailors: record.crewMembers.map((ecm) => ({
      name: ecm.crewMember.name,
      divingTime: ecm.divingTime || undefined,
    })),
    species: record.catches.map((c) => c.species.commonName).join(", ") || undefined,
    catches: record.catches.map((c) => ({
      id: c.speciesId,
      commonName: c.species.commonName,
      scientificName: c.species.scientificName,
      crates: c.crates || "",
      weight: c.weight || "",
      size: c.size || undefined,
    })),
    crewWages: record.crewWages || undefined,
    fuelConsumption: record.fuelConsumption || undefined,
    weather: record.weather || undefined,
    observations: record.observations || undefined,
    gps: record.latitude && record.longitude
      ? `${record.latitude}, ${record.longitude}`
      : undefined,
    location: record.location || undefined,
    coordinates: record.latitude && record.longitude
      ? [record.latitude, record.longitude]
      : undefined,
    status: record.status || undefined,
    sacoMuestras: record.production?.sacoMuestras || undefined,
    kgPulpaVieira: record.production?.kgPulpaVieira || undefined,
    numBolsas: record.production?.numBolsas || undefined,
    kgPorBolsa: record.production?.kgPorBolsa || undefined,
    rindePulpaVieira: record.production?.rindePulpaVieira || undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }))
}

export const createEntryInDatabase = async (entry: NewFishingEntry, userId: string): Promise<FishingEntry> => {
  const prisma = getPrismaClient()

  // Parsear coordenadas si vienen en formato "lat, lng"
  let latitude: number | undefined
  let longitude: number | undefined

  if (entry.gps && typeof entry.gps === "string") {
    const parts = entry.gps.split(",").map((p) => parseFloat(p.trim()))
    if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
      latitude = parts[0]
      longitude = parts[1]
    }
  } else if (entry.coordinates && Array.isArray(entry.coordinates)) {
    latitude = entry.coordinates[0]
    longitude = entry.coordinates[1]
  }

  const fishingEntry = await prisma.fishingEntry.create({
    data: {
      id: entry.id || randomUUID(),
      userId,
      date: entry.date,
      startTime: entry.startTime,
      endTime: entry.endTime,
      skipper: entry.skipper,
      method: entry.method,
      area: entry.area,
      depth: entry.depth != null ? String(entry.depth) : undefined,
      latitude,
      longitude,
      crewWages: entry.crewWages,
      fuelConsumption: entry.fuelConsumption,
      weather: entry.weather,
      observations: entry.observations,
      gps: entry.gps,
      location: entry.location,
      status: entry.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // Crear marineros
  if (entry.sailors && Array.isArray(entry.sailors)) {
    for (const sailor of entry.sailors) {
      if (!sailor.name) continue

      const crewMember = await prisma.crewMember.create({
        data: {
          id: randomUUID(),
          name: sailor.name,
        },
      })

      await prisma.entryCrewMember.create({
        data: {
          id: randomUUID(),
          entryId: fishingEntry.id,
          crewMemberId: crewMember.id,
          divingTime: sailor.divingTime,
        },
      })
    }
  }

  // Crear capturas
  if (entry.catches && Array.isArray(entry.catches)) {
    for (const catchItem of entry.catches) {
      await prisma.catch.create({
        data: {
          id: randomUUID(),
          entryId: fishingEntry.id,
          speciesId: catchItem.id,
          crates: catchItem.crates,
          weight: catchItem.weight,
          size: catchItem.size,
        },
      })
    }
  }

  // Crear datos de producción si existen
  if (
    entry.sacoMuestras ||
    entry.kgPulpaVieira ||
    entry.numBolsas ||
    entry.kgPorBolsa ||
    entry.rindePulpaVieira
  ) {
    await prisma.productionData.create({
      data: {
        id: randomUUID(),
        entryId: fishingEntry.id,
        sacoMuestras: entry.sacoMuestras,
        kgPulpaVieira: entry.kgPulpaVieira,
        numBolsas: entry.numBolsas,
        kgPorBolsa: entry.kgPorBolsa,
        rindePulpaVieira: entry.rindePulpaVieira,
      },
    })
  }

  // Retornar entrada completa con relaciones
  const completeEntry = await prisma.fishingEntry.findUniqueOrThrow({
    where: { id: fishingEntry.id },
    include: {
      crewMembers: {
        include: {
          crewMember: true,
        },
      },
      catches: {
        include: {
          species: true,
        },
      },
      production: true,
    },
  })

  return {
    id: completeEntry.id,
    date: completeEntry.date || undefined,
    startTime: completeEntry.startTime || undefined,
    endTime: completeEntry.endTime || undefined,
    skipper: completeEntry.skipper || undefined,
    method: completeEntry.method || undefined,
    area: completeEntry.area || undefined,
    depth: completeEntry.depth || undefined,
    sailors: completeEntry.crewMembers.map((ecm) => ({
      name: ecm.crewMember.name,
      divingTime: ecm.divingTime || undefined,
    })),
    species: completeEntry.catches.map((c) => c.species.commonName).join(", ") || undefined,
    catches: completeEntry.catches.map((c) => ({
      id: c.speciesId,
      commonName: c.species.commonName,
      scientificName: c.species.scientificName,
      crates: c.crates || "",
      weight: c.weight || "",
      size: c.size || undefined,
    })),
    crewWages: completeEntry.crewWages || undefined,
    fuelConsumption: completeEntry.fuelConsumption || undefined,
    weather: completeEntry.weather || undefined,
    observations: completeEntry.observations || undefined,
    gps: completeEntry.latitude && completeEntry.longitude
      ? `${completeEntry.latitude}, ${completeEntry.longitude}`
      : undefined,
    location: completeEntry.location || undefined,
    coordinates: completeEntry.latitude && completeEntry.longitude
      ? [completeEntry.latitude, completeEntry.longitude]
      : undefined,
    status: completeEntry.status || undefined,
    sacoMuestras: completeEntry.production?.sacoMuestras || undefined,
    kgPulpaVieira: completeEntry.production?.kgPulpaVieira || undefined,
    numBolsas: completeEntry.production?.numBolsas || undefined,
    kgPorBolsa: completeEntry.production?.kgPorBolsa || undefined,
    rindePulpaVieira: completeEntry.production?.rindePulpaVieira || undefined,
    createdAt: completeEntry.createdAt.toISOString(),
    updatedAt: completeEntry.updatedAt.toISOString(),
  }
}
