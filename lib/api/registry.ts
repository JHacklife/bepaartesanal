/**
 * Registro central de endpoints de la API.
 *
 * Cada entrada define:
 *  - description: propósito del endpoint (documentación interna)
 *  - rateLimit.maxRequests: máximo de solicitudes permitidas en la ventana
 *  - rateLimit.windowMs: duración de la ventana en milisegundos
 *  - requiresAuth: si es true el handler wrapper exigirá sesión activa (opcional)
 *
 * Para agregar un endpoint nuevo:
 *   1. Añadir una entrada aquí con su clave "METHOD /ruta"
 *   2. Envolver el handler en app/api con `withApiHandler("METHOD", "/ruta", handler)`
 */

export interface ApiEndpointConfig {
  description: string
  rateLimit: {
    /** Máximo de solicitudes por ventana */
    maxRequests: number
    /** Duración de la ventana en ms */
    windowMs: number
  }
  /** Indica que el endpoint necesita sesión autenticada (no aplica en auth/*) */
  requiresAuth?: boolean
}

export const apiRegistry: Record<string, ApiEndpointConfig> = {
  // ── Autenticación ──────────────────────────────────────────────────────────
  "POST /api/auth/register": {
    description: "Registro de nuevo usuario con email y contraseña",
    rateLimit: { maxRequests: 20, windowMs: 15 * 60 * 1000 }, // 20 por 15 min
  },

  // ── Entradas de pesca ─────────────────────────────────────────────────────
  "GET /api/entries": {
    description: "Listar entradas de la bitácora",
    requiresAuth: true,
    rateLimit: { maxRequests: 300, windowMs: 60 * 1000 }, // 300 por minuto
  },
  "POST /api/entries": {
    description: "Crear nueva entrada en la bitácora",
    requiresAuth: true,
    rateLimit: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 por minuto
  },
  "DELETE /api/entries/[id]": {
    description: "Eliminar una entrada de la bitácora",
    requiresAuth: true,
    rateLimit: { maxRequests: 120, windowMs: 60 * 1000 }, // 120 por minuto
  },

  // ── Catálogo de especies ───────────────────────────────────────────────────
  "GET /api/species": {
    description: "Listar catálogo de especies disponibles",
    requiresAuth: true,
    rateLimit: { maxRequests: 300, windowMs: 60 * 1000 }, // 300 por minuto
  },
  "POST /api/species": {
    description: "Agregar nueva especie al catálogo",
    requiresAuth: true,
    rateLimit: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 por minuto
  },

  // ── Perfil del usuario ───────────────────────────────────────────────────
  "GET /api/profile": {
    description: "Obtener perfil del usuario autenticado",
    requiresAuth: true,
    rateLimit: { maxRequests: 300, windowMs: 60 * 1000 }, // 300 por minuto
  },
  "PUT /api/profile": {
    description: "Actualizar perfil del usuario autenticado",
    requiresAuth: true,
    rateLimit: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 por minuto
  },
  "POST /api/upload-profile-photo": {
    description: "Subir foto de perfil del usuario",
    requiresAuth: true,
    rateLimit: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 por minuto
  },

  // ── Comentarios / sugerencias ───────────────────────────────────────────
  "GET /api/feedback": {
    description: "Listar comentarios del usuario autenticado",
    requiresAuth: true,
    rateLimit: { maxRequests: 120, windowMs: 60 * 1000 }, // 120 por minuto
  },
  "POST /api/feedback": {
    description: "Crear comentario/sugerencia en historial de base de datos",
    requiresAuth: true,
    rateLimit: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 por minuto
  },
}
