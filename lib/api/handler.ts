import { NextRequest, NextResponse } from "next/server"
import { apiRegistry } from "./registry"
import { checkRateLimit } from "./rate-limiter"
import { ApiErrors } from "./errors"

type ApiHandler = (req: NextRequest) => Promise<NextResponse> | NextResponse

/**
 * HOF que envuelve un handler de API con:
 *  - Rate limiting configurable por endpoint (definido en registry.ts)
 *  - Captura global de errores no controlados con log detallado
 *  - Respuestas de error estandarizadas (ApiErrorBody)
 *
 * Uso:
 *   export const POST = withApiHandler("POST", "/api/auth/register", async (req) => { ... })
 */
export function withApiHandler(
  method: string,
  path: string,
  handler: ApiHandler,
): ApiHandler {
  return async (req: NextRequest): Promise<NextResponse> => {
    const registryKey = `${method.toUpperCase()} ${path}`
    const config = apiRegistry[registryKey]

    // ── Rate limiting ────────────────────────────────────────────────────────
    if (config?.rateLimit) {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "unknown"
      const rateLimitKey = `${ip}:${registryKey}`

      const rl = checkRateLimit(
        rateLimitKey,
        config.rateLimit.maxRequests,
        config.rateLimit.windowMs,
      )

      const headers: Record<string, string> = {
        "X-RateLimit-Limit": String(config.rateLimit.maxRequests),
        "X-RateLimit-Remaining": String(rl.remaining),
        "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
      }

      if (!rl.allowed) {
        headers["Retry-After"] = String(rl.retryAfterSeconds)
        return NextResponse.json(ApiErrors.rateLimitExceeded, {
          status: 429,
          headers,
        })
      }
    }

    // ── Ejecutar handler ─────────────────────────────────────────────────────
    // Log detallado y devuelve error como JSON
    try {
      return await handler(req)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const stack = error instanceof Error ? error.stack : undefined

      console.error(`[API Error] ${registryKey}`, {
        timestamp: new Date().toISOString(),
        message,
        stack,
        error,
      })

      // Devolver siempre JSON, nunca re-lanzar
      return NextResponse.json(
        {
          title: "Error interno del servidor",
          message: process.env.NODE_ENV === "production"
            ? "Error al procesar la solicitud"
            : message,
          code: "INTERNAL_SERVER_ERROR",
        },
        { status: 500 }
      )
    }
  }
}
