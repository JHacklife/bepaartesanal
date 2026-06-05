"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Anchor, Eye, EyeOff, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const errorMap: Record<string, string> = {
  CredentialsSignin: "Correo o contraseña inválidos.",
  AccessDenied: "No se pudo autorizar el acceso.",
}

const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0"

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const authError = searchParams.get("error")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false)
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

  return (
    <div className="relative isolate min-h-[100dvh] overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--secondary)/0.75)] to-[hsl(var(--accent)/0.7)]" />
      <div className="absolute left-[-16rem] top-[-9rem] -z-10 h-[28rem] w-[28rem] rounded-full bg-[hsl(var(--primary)/0.18)] blur-3xl" />
      <div className="absolute bottom-[-12rem] right-[-10rem] -z-10 h-[30rem] w-[30rem] rounded-full bg-[hsl(var(--accent)/0.18)] blur-3xl" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.6),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.35),transparent_40%)]" />

      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-md items-center">
        <Card className="glass-card w-full border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card)/0.78)] text-foreground shadow-[0_24px_80px_hsl(var(--primary)/0.22)] backdrop-blur-xl">
          <CardHeader className="space-y-4 pb-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.14)]">
              <Anchor className="h-6 w-6 text-[hsl(var(--primary))]" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))]">BEPA Artesanal</CardTitle>
              <CardDescription className="text-sm text-[hsl(var(--muted-foreground))]">
                Bitácora electrónica de pesca artesanal
              </CardDescription>
            </div>
            <p className="text-xs uppercase tracking-[0.28em] text-[hsl(var(--primary))]">Acceso seguro</p>
          </CardHeader>

          <CardContent className="space-y-5">
            {(readableError || localError) && (
              <p className="rounded-xl border border-red-300/70 bg-red-50/85 px-3 py-2 text-sm text-red-700">
                {localError || readableError}
              </p>
            )}

            <form className="space-y-4" onSubmit={handleCredentialsSignIn}>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[hsl(var(--foreground))]">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu-correo@dominio.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-11 border-[hsl(var(--border))] bg-[hsl(var(--background)/0.92)] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:ring-[hsl(var(--primary)/0.45)]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[hsl(var(--foreground))]">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 border-[hsl(var(--border))] bg-[hsl(var(--background)/0.92)] pr-11 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:ring-[hsl(var(--primary)/0.45)]"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--primary)/0.12)] hover:text-[hsl(var(--foreground))]"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full border border-[hsl(var(--primary)/0.35)] bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] font-semibold text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary)/0.3)] transition hover:brightness-105"
                disabled={isCredentialsLoading}
              >
                {isCredentialsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>

            <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
              ¿No tienes cuenta?{" "}
              <Link
                href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-semibold text-[hsl(var(--primary))] underline decoration-[hsl(var(--primary)/0.45)] underline-offset-4 hover:text-[hsl(var(--primary)/0.8)]"
              >
                Regístrate aquí
              </Link>
            </p>

            <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
              <Link href="/" className="underline decoration-[hsl(var(--muted-foreground)/0.65)] underline-offset-4 hover:text-[hsl(var(--foreground))]">
                Volver al inicio
              </Link>
            </p>

            <p className="text-center text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground)/0.8)]">
              Versión {appVersion}
            </p>
          </CardContent>
        </Card>
      </div>
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
