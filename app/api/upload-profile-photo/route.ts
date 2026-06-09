import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withApiHandler } from "@/lib/api/handler"
import { getPrismaClient, isDatabaseConfigured } from "@/lib/server/prisma"
import fs from "fs"
import path from "path"

const UPLOAD_DIR = "public/uploads/profiles"
const UPLOAD_PUBLIC_PATH = "/uploads/profiles"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

const ensureUploadDir = () => {
  const fullPath = path.join(process.cwd(), UPLOAD_DIR)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
  }
  return fullPath
}

export const POST = withApiHandler("POST", "/api/upload-profile-photo", async (req: NextRequest) => {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ title: "Base de datos no configurada", message: "DATABASE_URL no definida" }, { status: 503 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ title: "No autorizado", message: "Debes iniciar sesión" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { title: "Archivo requerido", message: "Debes enviar una imagen" },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { title: "Tipo de archivo no permitido", message: "Solo se permiten: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      )
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { title: "Archivo muy grande", message: `Tamaño máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    const uploadDir = ensureUploadDir()
    const ext = file.name.split(".").pop()
    const filename = `${session.user.id}-${Date.now()}.${ext}`
    const filepath = path.join(uploadDir, filename)

    const buffer = await file.arrayBuffer()
    fs.writeFileSync(filepath, Buffer.from(buffer))

    const relativePath = `${UPLOAD_PUBLIC_PATH}/${filename}`
    const prisma = getPrismaClient()

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        profileImage: relativePath,
        image: relativePath,
      },
    })

    return NextResponse.json(
      {
        message: "Foto de perfil subida correctamente",
        url: relativePath,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error subiendo foto:", error)
    return NextResponse.json(
      { title: "Error al subir foto", message: "No se pudo guardar la foto de perfil" },
      { status: 500 }
    )
  }
})
