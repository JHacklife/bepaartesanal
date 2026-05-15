"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const errorMap: Record<string, string> = {
  CredentialsSignin: "Correo o contraseña inválidos.",
  OAuthAccountNotLinked: "Este correo ya existe con otro método de acceso.",
  AccessDenied: "No se pudo autorizar el acceso.",
}

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const authError = searchParams.get("error")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const readableError = useMemo(() => {
    if (!authError) return null
    return errorMap[authError] || "No se pudo iniciar sesión. Intenta nuevamente."
  }, [authError])

  const handleCredentialsSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLocalError(null)
    setIsCredentialsLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    })

    setIsCredentialsLoading(false)

    if (result?.error) {
      setLocalError(errorMap[result.error] || "No se pudo iniciar sesión con credenciales.")
      return
    }

    router.push(result?.url || callbackUrl)
  }

  const handleGoogleSignIn = async () => {
    setLocalError(null)
    setIsGoogleLoading(true)

    await signIn("google", { callbackUrl })
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          <CardDescription>
            Accede con Google o con tu correo y contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(readableError || localError) && (
            <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {localError || readableError}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isCredentialsLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            Continuar con Google
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              o con correo
            </span>
          </div>

          <form className="space-y-3" onSubmit={handleCredentialsSignIn}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu-correo@dominio.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pr-11"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isCredentialsLoading || isGoogleLoading}
            >
              {isCredentialsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link
              href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="font-medium underline underline-offset-4"
            >
              Regístrate aquí
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            <Link href="/" className="underline underline-offset-4">
              Volver al inicio
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="mx-auto min-h-[70vh] w-full max-w-md" />}>
      <SignInContent />
    </Suspense>
  )
}
