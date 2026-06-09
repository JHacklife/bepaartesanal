import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withApiHandler } from "@/lib/api/handler"
import { isDatabaseConfigured, getPrismaClient } from "@/lib/server/prisma"

const toNullableString = (value: unknown): string | null | undefined => {
  if (typeof value === "undefined") return undefined
  if (value === null) return null
  const normalized = String(value).trim()
  return normalized.length > 0 ? normalized : null
}

const toNullableInt = (value: unknown): number | null | undefined => {
  if (typeof value === "undefined") return undefined
  if (value === null || value === "") return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return Math.floor(parsed)
}

export const GET = withApiHandler("GET", "/api/profile", async (req: NextRequest) => {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ title: "Base de datos no configurada", message: "DATABASE_URL no definida" }, { status: 503 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ title: "No autorizado", message: "Debes iniciar sesión" }, { status: 401 })
  }

  const prisma = getPrismaClient()

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ title: "Usuario no encontrado", message: "El usuario no existe" }, { status: 404 })
    }

    // Información sensible (no incluir en perfil público)
    const sensitiveFields = {
      phoneNumber: user.phoneNumber,
      documentId: user.documentId,
      email: user.email,
    }

    // Perfil público
    const publicProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.profileImage || user.image,
      profileImage: user.profileImage || user.image,
      phoneNumber: user.phoneNumber,
      documentId: user.documentId,
      fishingZone: user.fishingZone,
      yearsOfExperience: user.yearsOfExperience,
      boatName: user.boatName,
      bio: user.bio,
      isProfilePublic: user.isProfilePublic,
      badges: user.badges,
      totalEntries: user.totalEntries,
      totalCatchWeight: user.totalCatchWeight,
      favoriteSpecies: user.favoriteSpecies,
      createdAt: user.createdAt,
    }

    return NextResponse.json({
      profile: publicProfile,
      sensitive: sensitiveFields,
      isOwn: true,
    })
  } catch (error) {
    console.error("Error obteniendo perfil:", error)
    return NextResponse.json(
      { title: "Error al obtener perfil", message: "No se pudo cargar tu perfil" },
      { status: 500 }
    )
  }
})

export const PUT = withApiHandler("PUT", "/api/profile", async (req: NextRequest) => {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ title: "Base de datos no configurada", message: "DATABASE_URL no definida" }, { status: 503 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ title: "No autorizado", message: "Debes iniciar sesión" }, { status: 401 })
  }

  try {
    const body = await req.json() as Record<string, unknown>

    const prisma = getPrismaClient()

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: toNullableString(body.name),
        phoneNumber: toNullableString(body.phoneNumber),
        fishingZone: toNullableString(body.fishingZone),
        yearsOfExperience: toNullableInt(body.yearsOfExperience),
        boatName: toNullableString(body.boatName),
        documentId: toNullableString(body.documentId),
        bio: toNullableString(body.bio),
        profileImage: toNullableString(body.profileImage),
        isProfilePublic: typeof body.isProfilePublic === 'boolean' ? body.isProfilePublic : undefined,
      },
    })

    return NextResponse.json({
      message: "Perfil actualizado correctamente",
      profile: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.profileImage || updatedUser.image,
        phoneNumber: updatedUser.phoneNumber,
        fishingZone: updatedUser.fishingZone,
        yearsOfExperience: updatedUser.yearsOfExperience,
        boatName: updatedUser.boatName,
        documentId: updatedUser.documentId,
        bio: updatedUser.bio,
        profileImage: updatedUser.profileImage,
        isProfilePublic: updatedUser.isProfilePublic,
        badges: updatedUser.badges,
        totalEntries: updatedUser.totalEntries,
        totalCatchWeight: updatedUser.totalCatchWeight,
        favoriteSpecies: updatedUser.favoriteSpecies,
      },
    })
  } catch (error) {
    console.error("Error actualizando perfil:", error)
    return NextResponse.json(
      { title: "Error al actualizar perfil", message: "No se pudo actualizar tu perfil" },
      { status: 500 }
    )
  }
})
