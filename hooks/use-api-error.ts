"use client"

import { useCallback } from "react"
import { toast } from "sonner"
import type { ApiErrorBody } from "@/lib/api/errors"

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
      // ── Log detallado para el programador (sin elevarlo a error en dev) ───
      console.warn("[useApiError]", {
        timestamp: new Date().toISOString(),
        raw,
        stack: raw instanceof Error ? raw.stack : undefined,
      })

      // ── Extraer título y descripción ──────────────────────────────────────
      let title = fallbackTitle
      let message = fallbackMessage

      if (raw && typeof raw === "object") {
        const body = raw as Partial<ApiErrorBody>
        if (body.title) title = body.title
        if (body.message) message = body.message
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
        }
      }

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
        let body: Partial<ApiErrorBody>

        if (isJson) {
          try {
            body = (await response.json()) as Partial<ApiErrorBody>
          } catch {
            body = {}
          }
        } else {
          body = {}
        }

        if (!body.title && !body.message) {
          body = {
            ...body,
            title: response.status >= 500 ? "Servicio no disponible" : "No se pudo completar la solicitud",
            message: `HTTP ${response.status}${response.statusText ? ` - ${response.statusText}` : ""}`,
          }
        }

        // Log detallado de error HTTP manejado
        console.warn("[apiFetch] Error de respuesta", {
          timestamp: new Date().toISOString(),
          url: typeof input === "string" ? input : input.toString(),
          status: response.status,
          body,
        })

        throw body
      }

      return (isJson ? response.json() : response.text()) as Promise<T>
    },
    [],
  )

  return { handleApiError, apiFetch }
}
