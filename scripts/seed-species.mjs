import { PrismaClient } from "@prisma/client"
import speciesCatalog from "../lib/species/catalog.json" with { type: "json" }

const prisma = new PrismaClient()

const toJson = (value) => value ?? []

try {
  for (const species of speciesCatalog) {
    await prisma.speciesCatalogItem.upsert({
      where: { id: species.id },
      update: {
        commonName: species.commonName,
        scientificName: species.scientificName,
        category: species.category,
        habitat: toJson(species.habitat),
        averageSize: species.averageSize,
        averageWeight: species.averageWeight,
        season: toJson(species.season),
        fishingMethod: toJson(species.fishingMethod),
        commercialValue: species.commercialValue,
        description: species.description,
        minSize: species.minSize ?? null,
        region: toJson(species.region),
        imageUrl: species.imageUrl,
        identificationTips: toJson(species.identificationTips),
        keyDifferences: species.keyDifferences ?? null,
        similarSpecies: species.similarSpecies ?? null,
      },
      create: {
        id: species.id,
        commonName: species.commonName,
        scientificName: species.scientificName,
        category: species.category,
        habitat: toJson(species.habitat),
        averageSize: species.averageSize,
        averageWeight: species.averageWeight,
        season: toJson(species.season),
        fishingMethod: toJson(species.fishingMethod),
        commercialValue: species.commercialValue,
        description: species.description,
        minSize: species.minSize ?? null,
        region: toJson(species.region),
        imageUrl: species.imageUrl,
        identificationTips: toJson(species.identificationTips),
        keyDifferences: species.keyDifferences ?? null,
        similarSpecies: species.similarSpecies ?? null,
      },
    })
  }

  console.log(`Catalogo sincronizado: ${speciesCatalog.length} especies`)
} catch (error) {
  console.error("No se pudo sincronizar el catalogo de especies:", error)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
