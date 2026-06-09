"use client"

import { useCallback } from "react"
import { toast } from "sonner"
import type { ApiErrorBody } from "@/lib/api/errors"

type ApiClientError = Partial<ApiErrorBody> & {
  error?: string
}

/**
 * Hook para consumir APIs y mostrar errores via toast (Sonner).
 *
 * - El toast muestra el título y la descripción para el usuario.
 * - El console.error imprime el contexto completo para el programador.
 */
export function useApiError() {
  const handleApiError = useCallback(
    (
      /** El objeto Response de fetch, un ApiErrorBody, un Error o cualquier valor */
      raw: unknown,
      /** Fallback cuando no hay título disponible en el body */
      fallbackTitle = "Error",
      /** Fallback cuando no hay descripción disponible */
      fallbackMessage = "Ocurrió un error inesperado. Intenta de nuevo.",
    ) => {
      // ── Extraer título y descripción ──────────────────────────────────────
      let title = fallbackTitle
      let message = fallbackMessage
      let status: number | undefined
      let originalMessage: string | undefined
      let stackTrace: string | undefined

      if (raw && typeof raw === "object") {
        const body = raw as ApiClientError
        if (body.title) title = body.title
        if (body.message) message = body.message
        if (typeof body.status === "number") status = body.status
        if (typeof body.originalMessage === "string") originalMessage = body.originalMessage
        if (typeof body.stack === "string") stackTrace = body.stack
        // Retrocompatibilidad: algunos endpoints aún devuelven { error: string }
        if (!body.message && "error" in body && typeof body.error === "string") {
          message = body.error
        }
      }

      if (raw instanceof Error) {
        const errorMessage = raw.message || ""
        const isNetworkIssue =
          /failed to fetch|networkerror|load failed|fetch/i.test(errorMessage) ||
          errorMessage.toLowerCase() === "offline"

        if (isNetworkIssue) {
          title = "Problema de conexión"
          message = "No pudimos conectarnos al servidor. Revisa tu internet y vuelve a intentar."
        } else {
          message = errorMessage || fallbackMessage
          originalMessage = errorMessage || originalMessage
        }
        stackTrace = raw.stack || stackTrace
      }

      // ── Log detallado para el programador ────────────────────────────────
      console.error("[useApiError]", {
        timestamp: new Date().toISOString(),
        status,
        title,
        userMessage: message,
        originalMessage,
        stack: stackTrace,
        raw,
      })

      toast.error(title, { description: message })
    },
    [],
  )

  /**
   * Realiza un fetch y lanza el error como ApiErrorBody si la respuesta no es ok.
   * Si la respuesta es ok, devuelve el JSON parseado.
   */
  const apiFetch = useCallback(
    async <T = unknown>(
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<T> => {
      const response = await fetch(input, init)
      const contentType = response.headers.get("content-type") ?? ""
      const isJson = contentType.includes("application/json")

      if (!response.ok) {
        let body: ApiClientError

        if (isJson) {
          try {
            body = (await response.json()) as ApiClientError
          } catch {
            body = {}
          }
        } else {
          body = {}
        }

        const normalizedError: ApiClientError = {
          ...body,
          status: typeof body.status === "number" ? body.status : response.status,
          title:
            body.title ||
            (response.status >= 500 ? "Servicio no disponible" : "No se pudo completar la solicitud"),
          message:
            body.message ||
            `HTTP ${response.status}${response.statusText ? ` - ${response.statusText}` : ""}`,
          originalMessage:
            typeof body.originalMessage === "string"
              ? body.originalMessage
              : typeof body.error === "string"
                ? body.error
                : undefined,
          stack: typeof body.stack === "string" ? body.stack : undefined,
        }

        // Log detallado de error HTTP manejado
        console.error("[apiFetch] Error de respuesta", {
          timestamp: new Date().toISOString(),
          url: typeof input === "string" ? input : input.toString(),
          status: normalizedError.status,
          statusText: response.statusText,
          userMessage: normalizedError.message,
          originalMessage: normalizedError.originalMessage,
          stack: normalizedError.stack,
          body: normalizedError,
        })

        throw normalizedError
      }

      return (isJson ? response.json() : response.text()) as Promise<T>
    },
    [],
  )

  return { handleApiError, apiFetch }
}
