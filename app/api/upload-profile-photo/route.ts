import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withApiHandler } from "@/lib/api/handler"
import fs from "fs"
import path from "path"

const UPLOAD_DIR = "public/uploads/profiles"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const isReadOnlyDeployment = Boolean(process.env.NETLIFY)

const ensureUploadDir = () => {
  const fullPath = path.join(process.cwd(), UPLOAD_DIR)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
  }
  return fullPath
}

export const POST = withApiHandler("POST", "/api/upload-profile-photo", async (req: NextRequest) => {
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

    if (isReadOnlyDeployment) {
      return NextResponse.json(
        {
          title: "Subida de archivos no disponible en este entorno",
          message: "La foto de perfil requiere almacenamiento externo (por ejemplo, S3 o Cloudinary) en produccion serverless.",
        },
        { status: 501 }
      )
    }

    const uploadDir = ensureUploadDir()
    const ext = file.name.split(".").pop()
    const filename = `${session.user.id}-${Date.now()}.${ext}`
    const filepath = path.join(uploadDir, filename)

    const buffer = await file.arrayBuffer()
    fs.writeFileSync(filepath, Buffer.from(buffer))

    const relativePath = `/uploads/profiles/${filename}`

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
