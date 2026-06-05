import type { Species } from "./types"

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

export const speciesRepository: SpeciesRepository = new SqlSpeciesRepository()

export const listSpecies = async (): Promise<Species[]> => speciesRepository.list()
