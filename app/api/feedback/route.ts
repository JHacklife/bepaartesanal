import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withApiHandler } from "@/lib/api/handler"
import { getPrismaClient, isDatabaseConfigured } from "@/lib/server/prisma"

type FeedbackType = "bug" | "feature" | "improvement" | "general"

const normalizeType = (value: unknown): FeedbackType | null => {
  if (typeof value !== "string") return null
  const normalized = value.trim().toLowerCase()
  if (normalized === "bug" || normalized === "feature" || normalized === "improvement" || normalized === "general") {
    return normalized
  }
  return null
}

const normalizeMessage = (value: unknown): string | null => {
  if (typeof value !== "string") return null
  const normalized = value.trim()
  if (normalized.length < 10) return null
  if (normalized.length > 3000) return normalized.slice(0, 3000)
  return normalized
}

export const GET = withApiHandler("GET", "/api/feedback", async () => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ title: "No autorizado", message: "Debes iniciar sesión" }, { status: 401 })
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { title: "Servicio no disponible", message: "La base de datos no está configurada para comentarios." },
      { status: 503 },
    )
  }

  const prisma = getPrismaClient()
  try {
    const items = await prisma.feedbackItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return NextResponse.json({ items })
  } catch {
    return NextResponse.json(
      { title: "Error al cargar historial", message: "No se pudo cargar el historial de comentarios." },
      { status: 500 },
    )
  }
})

export const POST = withApiHandler("POST", "/api/feedback", async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ title: "No autorizado", message: "Debes iniciar sesión" }, { status: 401 })
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { title: "Servicio no disponible", message: "La base de datos no está configurada para comentarios." },
      { status: 503 },
    )
  }

  const body = (await req.json()) as Record<string, unknown>
  const type = normalizeType(body.type)
  const message = normalizeMessage(body.message)

  if (!type) {
    return NextResponse.json({ title: "Tipo inválido", message: "Selecciona un tipo de comentario válido" }, { status: 400 })
  }

  if (!message) {
    return NextResponse.json({ title: "Mensaje inválido", message: "El mensaje debe tener al menos 10 caracteres" }, { status: 400 })
  }

  try {
    const prisma = getPrismaClient()
    const item = await prisma.feedbackItem.create({
      data: {
        userId: session.user.id,
        type,
        message,
        status: "En revisión",
        emailSent: false,
        emailError: null,
      },
    })

    return NextResponse.json(
      {
        message: "Comentario guardado correctamente",
        item,
      },
      { status: 201 },
    )
  } catch {
    return NextResponse.json(
      {
        title: "No se pudo guardar el comentario",
        message: "No se pudo guardar el comentario en este momento.",
      },
      { status: 503 },
    )
  }
})
