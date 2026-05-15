"use client"

import { useEffect } from "react"

const RELOAD_KEY = "bepa_chunk_reload_at"
const RELOAD_COOLDOWN_MS = 60_000

const isChunkLoadError = (error: unknown): boolean => {
  const message =
    typeof error === "string"
      ? error
      : error && typeof error === "object" && "message" in error
        ? String((error as { message?: unknown }).message)
        : ""

  return (
    message.includes("ChunkLoadError") ||
    message.includes("Loading chunk") ||
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("/_next/static/chunks/")
  )
}

const shouldAttemptReload = (): boolean => {
  try {
    const lastReloadAt = Number(sessionStorage.getItem(RELOAD_KEY) || "0")
    const now = Date.now()

    if (Number.isNaN(lastReloadAt) || now - lastReloadAt > RELOAD_COOLDOWN_MS) {
      sessionStorage.setItem(RELOAD_KEY, String(now))
      return true
    }
  } catch {
    return true
  }

  return false
}

const reloadWithCacheBuster = () => {
  const nextUrl = new URL(window.location.href)
  nextUrl.searchParams.set("__chunk_retry", Date.now().toString())
  window.location.replace(nextUrl.toString())
}

export function ChunkReloadGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return

    const onWindowError = (event: ErrorEvent) => {
      const target = event.target as HTMLScriptElement | null
      const failedChunk = target?.tagName === "SCRIPT" && target?.src?.includes("/_next/static/chunks/")

      if ((failedChunk || isChunkLoadError(event.error)) && shouldAttemptReload()) {
        reloadWithCacheBuster()
      }
    }

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason) && shouldAttemptReload()) {
        reloadWithCacheBuster()
      }
    }

    window.addEventListener("error", onWindowError, true)
    window.addEventListener("unhandledrejection", onUnhandledRejection)

    return () => {
      window.removeEventListener("error", onWindowError, true)
      window.removeEventListener("unhandledrejection", onUnhandledRejection)
    }
  }, [])

  return null
}
