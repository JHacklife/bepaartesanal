/**
 * Error estándar de API — usado tanto en el servidor (handler) como en el cliente (use-api-error).
 * El objeto se serializa en JSON y viaja en el cuerpo de la respuesta HTTP.
 */
export interface ApiErrorBody {
  /** Título corto, legible para el usuario (ej: "Sin autorización") */
  title: string
  /** Descripción detallada para el usuario */
  message: string
  /** Código de error interno, útil para mapeo en cliente */
  code?: string
  /** Código HTTP de la respuesta */
  status?: number
  /** Mensaje técnico original para depuración (no para UI de usuario) */
  originalMessage?: string
  /** Stacktrace técnico para depuración */
  stack?: string
}

/** Construye una respuesta de error API estandarizada. */
export function buildApiError(
  title: string,
  message: string,
  code?: string,
): ApiErrorBody {
  return { title, message, ...(code ? { code } : {}) }
}

/** Catálogo de errores reutilizables del servidor. */
export const ApiErrors = {
  databaseNotConfigured: buildApiError(
    "Servicio no disponible",
    "La base de datos no está configurada.",
    "DB_NOT_CONFIGURED",
  ),
  internalError: buildApiError(
    "Error interno",
    "Ocurrió un error inesperado. Intenta nuevamente.",
    "INTERNAL_ERROR",
  ),
  rateLimitExceeded: buildApiError(
    "Demasiadas solicitudes",
    "Excediste el límite de solicitudes. Espera un momento e intenta de nuevo.",
    "RATE_LIMIT_EXCEEDED",
  ),
  unauthorized: buildApiError(
    "Sin autorización",
    "Debes iniciar sesión para realizar esta acción.",
    "UNAUTHORIZED",
  ),
  badRequest: (message: string) =>
    buildApiError("Solicitud inválida", message, "BAD_REQUEST"),
  conflict: (message: string) =>
    buildApiError("Conflicto", message, "CONFLICT"),
}
