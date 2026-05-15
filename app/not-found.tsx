import Link from "next/link"
import { Fish, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen ocean-animation flex items-center justify-center">
      <div className="glass-card p-10 rounded-2xl text-center max-w-md mx-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Fish className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-3">Página no encontrada</h2>
        <p className="text-muted-foreground mb-8">
          La página que buscás no existe o fue eliminada.
        </p>
        <Link href="/dashboard">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  )
}
