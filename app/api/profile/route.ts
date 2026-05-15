import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withApiHandler } from "@/lib/api/handler"
import { isDatabaseConfigured, getPrismaClient } from "@/lib/server/prisma"

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
      image: user.profileImage || user.image,
      fishingZone: user.fishingZone,
      yearsOfExperience: user.yearsOfExperience,
      boatName: user.boatName,
      bio: user.bio,
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
        name: body.name ? String(body.name) : undefined,
        phoneNumber: body.phoneNumber ? String(body.phoneNumber) : undefined,
        fishingZone: body.fishingZone ? String(body.fishingZone) : undefined,
        yearsOfExperience: body.yearsOfExperience ? Number(body.yearsOfExperience) : undefined,
        boatName: body.boatName ? String(body.boatName) : undefined,
        documentId: body.documentId ? String(body.documentId) : undefined,
        bio: body.bio ? String(body.bio) : undefined,
        profileImage: body.profileImage ? String(body.profileImage) : undefined,
        isProfilePublic: typeof body.isProfilePublic === 'boolean' ? body.isProfilePublic : undefined,
      },
    })

    return NextResponse.json({
      message: "Perfil actualizado correctamente",
      profile: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
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
