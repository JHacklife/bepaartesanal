import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { Prisma } from "@prisma/client"
import { getPrismaClient, isDatabaseConfigured } from "@/lib/server/prisma"
import { withApiHandler } from "@/lib/api/handler"
import { ApiErrors, buildApiError } from "@/lib/api/errors"

export const runtime = "nodejs"

type RegisterPayload = {
  name?: string
  email?: string
  password?: string
}

export const POST = withApiHandler(
  "POST",
  "/api/auth/register",
  async (request: NextRequest) => {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(ApiErrors.databaseNotConfigured, { status: 503 })
    }

    const payload = (await request.json()) as RegisterPayload

    const normalizedEmail = payload.email?.trim().toLowerCase()
    const password = payload.password ?? ""
    const displayName = payload.name?.trim()

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        ApiErrors.badRequest("Email y contraseña son obligatorios."),
        { status: 400 },
      )
    }

    const prisma = getPrismaClient()

    try {
      const passwordHash = await hash(password, 12)

      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: passwordHash,
          name: displayName && displayName.length > 0 ? displayName : null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      })

      return NextResponse.json(user, { status: 201 })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return NextResponse.json(
            ApiErrors.conflict("Ya existe una cuenta con ese correo."),
            { status: 409 },
          )
        }

        // Esquema/tablas no aplicadas en producción (frecuente tras deploy inicial).
        if (error.code === "P2021" || error.code === "P2022") {
          return NextResponse.json(
            buildApiError(
              "Servicio no disponible",
              "La base de datos no esta lista para operar. Ejecuta prisma db push o aplica migraciones en produccion.",
              "DB_SCHEMA_NOT_READY",
            ),
            { status: 503 },
          )
        }
      }

      const isDbAuthOrInitFailure =
        error instanceof Prisma.PrismaClientInitializationError ||
        (error instanceof Error &&
          /authentication failed against database server|can't reach database server/i.test(
            error.message,
          ))

      if (isDbAuthOrInitFailure) {
        const rawMessage = error instanceof Error ? error.message : String(error)
        const normalized = rawMessage.toLowerCase()

        const dbErrorKind =
          normalized.includes("authentication failed against database server") || normalized.includes("access denied")
            ? "DB_AUTH_FAILED"
            : normalized.includes("can't reach database server") || normalized.includes("connect timeout")
              ? "DB_UNREACHABLE"
              : "DB_UNAVAILABLE"

        const userMessage =
          dbErrorKind === "DB_AUTH_FAILED"
            ? "No se pudo crear la cuenta en este momento. Verifica la configuracion de credenciales de base de datos en el entorno de produccion."
            : dbErrorKind === "DB_UNREACHABLE"
              ? "No se pudo crear la cuenta en este momento. La aplicacion no logra conectarse al servidor de base de datos."
              : "No se pudo crear la cuenta en este momento. Intenta nuevamente mas tarde."

        console.error("[auth/register] Database unavailable", {
          timestamp: new Date().toISOString(),
          message: rawMessage,
          stack: error instanceof Error ? error.stack : undefined,
          dbErrorKind,
          error,
        })

        return NextResponse.json(
          buildApiError(
            "Servicio no disponible",
            userMessage,
            dbErrorKind,
          ),
          { status: 503 },
        )
      }

      throw error // el handler wrapper lo captura y devuelve 500 estandarizado
    }
  },
)
