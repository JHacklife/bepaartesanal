import { speciesCatalog } from "./catalog"
import type { Species } from "./types"

type SpeciesProvider = "catalog" | "sql"

const getConfiguredSpeciesProvider = (): SpeciesProvider => {
  const provider = (process.env.NEXT_PUBLIC_SPECIES_PROVIDER || "catalog").toLowerCase()

  if (provider === "sql") {
    return "sql"
  }

  return "catalog"
}

export interface SpeciesRepository {
  list(): Promise<Species[]>
}

const getErrorMessage = async (response: Response, fallbackMessage: string) => {
  try {
    const payload = await response.json()
    if (payload && typeof payload.error === "string") {
      return payload.error
    }
  } catch {
    return fallbackMessage
  }

  return fallbackMessage
}

class CatalogSpeciesRepository implements SpeciesRepository {
  async list(): Promise<Species[]> {
    return speciesCatalog
  }
}

class SqlSpeciesRepository implements SpeciesRepository {
  async list(): Promise<Species[]> {
    const response = await fetch("/api/species", {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "No se pudieron obtener especies desde SQL."))
    }

    return (await response.json()) as Species[]
  }
}

class UnsupportedSpeciesRepository implements SpeciesRepository {
  constructor(private readonly providerName: Exclude<SpeciesProvider, "catalog">) { }

  async list(): Promise<Species[]> {
    throw new Error(`El proveedor ${this.providerName} no esta implementado aun.`)
  }
}

const createSpeciesRepository = (): SpeciesRepository => {
  const provider = getConfiguredSpeciesProvider()

  if (provider === "catalog") {
    return new CatalogSpeciesRepository()
  }

  if (provider === "sql") {
    return new SqlSpeciesRepository()
  }

  return new UnsupportedSpeciesRepository(provider)
}

export const speciesRepository = createSpeciesRepository()

export const listSpecies = async (): Promise<Species[]> => speciesRepository.list()
