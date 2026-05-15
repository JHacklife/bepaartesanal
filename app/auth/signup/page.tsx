"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { CheckCircle2, Circle, Eye, EyeOff, Loader2, UserPlus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { signUpSchema, type SignUpFormValues } from "@/lib/validations/auth"
import { useApiError } from "@/hooks/use-api-error"

function SignUpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const { handleApiError, apiFetch } = useApiError()

  const [showPasswords, setShowPasswords] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: yupResolver(signUpSchema),
    mode: "onChange",
  })

  const passwordValue = watch("password") || ""

  const passwordChecks = useMemo(() => {
    return {
      minLength: passwordValue.length >= 8,
      hasUppercase: /[A-Z]/.test(passwordValue),
      hasNumber: /[0-9]/.test(passwordValue),
      hasSpecialChar: /[^A-Za-z0-9]/.test(passwordValue),
    }
  }, [passwordValue])

  const checklistItems = useMemo(() => {
    return [
      { ok: passwordChecks.minLength, label: "Minimo 8 caracteres" },
      { ok: passwordChecks.hasUppercase, label: "Al menos una mayuscula" },
      { ok: passwordChecks.hasNumber, label: "Al menos un numero" },
      { ok: passwordChecks.hasSpecialChar, label: "Al menos un caracter especial" },
    ]
  }, [passwordChecks])

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      })
    } catch (error) {
      handleApiError(error, "Error al crear la cuenta")
      return
    }

    const loginResult = await signIn("credentials", {
      email: values.email,
      password: values.password,
      callbackUrl,
      redirect: false,
    })

    if (loginResult?.error) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`)
      return
    }

    router.push(loginResult?.url || callbackUrl)
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>
            Registro por email y contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre (opcional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu-correo@dominio.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPasswords ? "text" : "password"}
                  placeholder="Mín. 8 caracteres, 1 mayúscula y 1 número"
                  aria-invalid={!!errors.password}
                  className="pr-11"
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                  onClick={() => setShowPasswords((prev) => !prev)}
                  aria-label={showPasswords ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Reintentar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords ? "text" : "password"}
                  placeholder="Vuelve a escribir tu contraseña"
                  aria-invalid={!!errors.confirmPassword}
                  className="pr-11"
                  {...register("confirmPassword")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                  onClick={() => setShowPasswords((prev) => !prev)}
                  aria-label={showPasswords ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="rounded-md border border-border bg-muted/30 p-3">
              <p className="mb-2 text-xs font-medium text-foreground">Validacion de contraseña</p>
              <ul className="space-y-1 text-xs">
                {checklistItems.map((item) => (
                  <li
                    key={item.label}
                    className={item.ok ? "flex items-center gap-2 text-emerald-600" : "flex items-center gap-2 text-muted-foreground"}
                  >
                    {item.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Crear cuenta
            </Button>
          </form>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              o
            </span>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link
              href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="underline underline-offset-4"
            >
              Iniciar sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="mx-auto min-h-[70vh] w-full max-w-md" />}>
      <SignUpContent />
    </Suspense>
  )
}
