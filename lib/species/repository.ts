import type { Species } from "./types"

export interface SpeciesRepository {
  list(): Promise<Species[]>
}

type ApiErrorPayload = {
  status: number
  userMessage: string
  originalMessage?: string
  stack?: string
}

const getErrorPayload = async (response: Response, fallbackMessage: string): Promise<ApiErrorPayload> => {
  try {
    const payload = await response.json()
    if (!payload || typeof payload !== "object") {
      return {
        status: response.status,
        userMessage: fallbackMessage,
      }
    }

    const userMessage =
      typeof (payload as { message?: unknown }).message === "string"
        ? (payload as { message: string }).message
        : typeof (payload as { error?: unknown }).error === "string"
          ? (payload as { error: string }).error
          : fallbackMessage

    if (typeof (payload as { message?: unknown }).message === "string") {
      return {
        status: response.status,
        userMessage,
        originalMessage:
          typeof (payload as { originalMessage?: unknown }).originalMessage === "string"
            ? (payload as { originalMessage: string }).originalMessage
            : undefined,
        stack:
          typeof (payload as { stack?: unknown }).stack === "string"
            ? (payload as { stack: string }).stack
            : undefined,
      }
    }

    return {
      status: response.status,
      userMessage,
      originalMessage:
        typeof (payload as { originalMessage?: unknown }).originalMessage === "string"
          ? (payload as { originalMessage: string }).originalMessage
          : undefined,
      stack:
        typeof (payload as { stack?: unknown }).stack === "string"
          ? (payload as { stack: string }).stack
          : undefined,
    }
  } catch {
    return {
      status: response.status,
      userMessage: fallbackMessage,
    }
  }
}

class SqlSpeciesRepository implements SpeciesRepository {
  async list(): Promise<Species[]> {
    const response = await fetch("/api/species", {
      cache: "no-store",
    })

    if (!response.ok) {
      const errorPayload = await getErrorPayload(response, "No se pudieron obtener especies.")
      console.error("[speciesRepository] Error al listar especies", {
        status: errorPayload.status,
        userMessage: errorPayload.userMessage,
        originalMessage: errorPayload.originalMessage,
        stack: errorPayload.stack,
      })
      throw new Error(errorPayload.userMessage)
    }

    return (await response.json()) as Species[]
  }
}

export const speciesRepository: SpeciesRepository = new SqlSpeciesRepository()

export const listSpecies = async (): Promise<Species[]> => speciesRepository.list()
