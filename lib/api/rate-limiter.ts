/**
 * Rate limiter en memoria por IP + endpoint.
 *
 * Nota: este store se reinicia con cada cold start (serverless) y no
 * funciona en entornos multi-instancia. Para producción con múltiples
 * nodos, reemplazar por un store distribuido como @upstash/ratelimit + Redis.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterSeconds: number
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const existing = store.get(key)

  // Ventana expirada o primera solicitud
  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt,
      retryAfterSeconds: 0,
    }
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    }
  }

  existing.count++
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetAt: existing.resetAt,
    retryAfterSeconds: 0,
  }
}

/** Limpia entradas caducadas. Llamar periodicamente si es necesario. */
export function pruneExpiredEntries() {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key)
  }
}
