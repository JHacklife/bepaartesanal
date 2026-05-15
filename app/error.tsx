"use client"

import Link from "next/link"
import { useEffect } from "react"
import { AlertTriangle, Home, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("App error boundary:", error)
  }, [error])

  return (
    <div className="min-h-screen ocean-animation flex items-center justify-center">
      <div className="glass-card p-10 rounded-2xl text-center max-w-md mx-4">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-5xl font-bold text-destructive mb-2">500</h1>
        <h2 className="text-xl font-semibold mb-3">Algo salio mal</h2>
        <p className="text-muted-foreground mb-8">
          No pudimos completar esta accion. Puedes reintentar o volver al inicio.
        </p>
        <div className="flex gap-3 justify-center">
          <Button type="button" variant="outline" className="gap-2" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
            Reintentar
          </Button>
          <Link href="/auth/signin">
            <Button type="button" className="gap-2">
              <Home className="w-4 h-4" />
              Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
