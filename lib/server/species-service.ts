import { randomUUID } from "node:crypto"
import type { Species } from "@/lib/species/types"
import { getPrismaClient } from "./prisma"

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === "string")
}

const mapSpeciesRecord = (record: {
  id: string
  commonName: string
  scientificName: string
  category: string
  habitat: unknown
  averageSize: string
  averageWeight: string
  season: unknown
  fishingMethod: unknown
  commercialValue: string
  description: string
  minSize: string | null
  region: unknown
  imageUrl: string
  identificationTips: unknown
  keyDifferences: unknown
  similarSpecies: unknown
}): Species => ({
  id: record.id,
  commonName: record.commonName,
  scientificName: record.scientificName,
  category: record.category as Species["category"],
  habitat: toStringArray(record.habitat),
  averageSize: record.averageSize,
  averageWeight: record.averageWeight,
  season: toStringArray(record.season),
  fishingMethod: toStringArray(record.fishingMethod),
  commercialValue: record.commercialValue as Species["commercialValue"],
  description: record.description,
  minSize: record.minSize || undefined,
  region: toStringArray(record.region),
  imageUrl: record.imageUrl,
  identificationTips: toStringArray(record.identificationTips),
  keyDifferences: toStringArray(record.keyDifferences ?? undefined),
  similarSpecies: toStringArray(record.similarSpecies ?? undefined),
})

export const listSpeciesFromDatabase = async (): Promise<Species[]> => {
  const prisma = getPrismaClient()
  const records = await prisma.speciesCatalogItem.findMany({
    orderBy: { commonName: "asc" },
  })

  return records.map(mapSpeciesRecord)
}

export interface CreateSpeciesInput {
  commonName: string
  scientificName: string
  category: string
  commercialValue: string
  description: string
  habitat: string[]
  region: string[]
  identificationTips: string[]
  keyDifferences?: string[]
  similarSpecies?: string[]
  imageUrl: string
  averageSize?: string
  averageWeight?: string
  minSize?: string
  season?: string[]
  fishingMethod?: string[]
}

export const createSpeciesInDatabase = async (input: CreateSpeciesInput): Promise<Species> => {
  const prisma = getPrismaClient()

  const record = await prisma.speciesCatalogItem.create({
    data: {
      id: randomUUID(),
      commonName: input.commonName,
      scientificName: input.scientificName,
      category: input.category,
      commercialValue: input.commercialValue,
      description: input.description,
      habitat: input.habitat,
      region: input.region,
      identificationTips: input.identificationTips,
      keyDifferences: input.keyDifferences ?? [],
      similarSpecies: input.similarSpecies ?? [],
      imageUrl: input.imageUrl,
      averageSize: input.averageSize || "N/D",
      averageWeight: input.averageWeight || "N/D",
      minSize: input.minSize || null,
      season: input.season ?? [],
      fishingMethod: input.fishingMethod ?? [],
    },
  })

  return mapSpeciesRecord(record)
}
