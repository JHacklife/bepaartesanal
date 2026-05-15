import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { withApiHandler } from "@/lib/api/handler"
import { ApiErrors } from "@/lib/api/errors"
import { getPrismaClient, isDatabaseConfigured } from "@/lib/server/prisma"
import type { NextApiRequest, NextApiResponse } from "next"

export const runtime = "nodejs"

export const DELETE = withApiHandler("DELETE", "/api/entries/[id]", async (req: NextRequest) => {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(ApiErrors.databaseNotConfigured, { status: 503 })
  }

  try {
    // Get the entry ID from the URL
    const url = new URL(req.url)
    const id = url.pathname.split("/").pop()

    if (!id || id === "[id]") {
      return NextResponse.json(
        { title: "Error", message: "ID de entrada no especificado", code: "MISSING_ID" },
        { status: 400 }
      )
    }

    // Verify user is authenticated
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(ApiErrors.unauthorized, { status: 401 })
    }

    // Delete the entry, ensuring it belongs to the current user
    const prisma = getPrismaClient()
    const deletedEntry = await prisma.fishingEntry.delete({
      where: {
        id,
        userId: session.user.id, // Prevent cross-user deletion
      },
    })

    return NextResponse.json(
      {
        message: "Entrada eliminada exitosamente",
        id: deletedEntry.id,
      },
      { status: 200 }
    )
  } catch (error) {
    // Handle Prisma not found error
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as any).code === "P2025"
    ) {
      return NextResponse.json(
        { title: "Error", message: "Entrada no encontrada o no tienes permisos para eliminarla", code: "NOT_FOUND" },
        { status: 404 }
      )
    }

    // Handle other Prisma errors
    if (
      error &&
      typeof error === "object" &&
      "code" in error
    ) {
      const prismaError = error as any
      return NextResponse.json(
        { title: "Error", message: `Error en la base de datos (${prismaError.code})`, code: prismaError.code },
        { status: 500 }
      )
    }

    // Handle unknown errors
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    console.error(`[DELETE /api/entries/[id]] Error:`, errorMessage, error)
    return NextResponse.json(
      { title: "Error", message: `Error al eliminar la entrada: ${errorMessage}` },
      { status: 500 }
    )
  }
})
