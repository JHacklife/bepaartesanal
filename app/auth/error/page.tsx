import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type AuthErrorPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

const errorMap: Record<string, string> = {
  AccessDenied: "Se denegó el acceso a tu cuenta.",
  OAuthSignin: "No se pudo iniciar el flujo con el proveedor OAuth.",
  OAuthCallback: "Falló la respuesta del proveedor OAuth.",
  OAuthAccountNotLinked: "Este correo ya está vinculado a otro método de acceso.",
  CredentialsSignin: "Correo o contraseña inválidos.",
  Configuration: "La configuración de autenticación no es válida.",
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams
  const code = params.error || "Unknown"
  const message = errorMap[code] || "Ocurrió un error de autenticación no esperado."

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error de autenticación</CardTitle>
          <CardDescription>
            No se pudo completar el inicio de sesión.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {message}
          </div>

          <p className="text-xs text-muted-foreground">
            Código: {code}
          </p>

          <div className="flex gap-2">
            <Link href="/auth/signin" className="w-full">
              <Button className="w-full">Intentar de nuevo</Button>
            </Link>
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full">
                Ir al dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
