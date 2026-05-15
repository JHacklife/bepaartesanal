import { NextRequest, NextResponse } from "next/server"
import { listSpeciesFromDatabase, createSpeciesInDatabase } from "@/lib/server/species-service"
import { isDatabaseConfigured } from "@/lib/server/prisma"
import { withApiHandler } from "@/lib/api/handler"
import { ApiErrors } from "@/lib/api/errors"
import { auth } from "@/lib/auth"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"

const UPLOAD_DIR = "public/uploads/species"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const isReadOnlyDeployment = Boolean(process.env.NETLIFY)

const ensureUploadDir = () => {
  const fullPath = path.join(process.cwd(), UPLOAD_DIR)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
  }
  return fullPath
}

const parseJsonArray = (raw: FormDataEntryValue | null, field: string): string[] => {
  if (!raw || typeof raw !== "string") return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error(`${field} must be an array`)
    return parsed.filter((v: unknown): v is string => typeof v === "string")
  } catch {
    return []
  }
}

export const GET = withApiHandler("GET", "/api/species", async () => {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(ApiErrors.databaseNotConfigured, { status: 503 })
  }
  const species = await listSpeciesFromDatabase()
  return NextResponse.json(species)
})

export const POST = withApiHandler("POST", "/api/species", async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ title: "No autorizado", message: "Debes iniciar sesión" }, { status: 401 })
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(ApiErrors.databaseNotConfigured, { status: 503 })
  }

  const formData = await req.formData()

  // Campos requeridos
  const commonName = (formData.get("commonName") as string | null)?.trim()
  const scientificName = (formData.get("scientificName") as string | null)?.trim()
  const category = (formData.get("category") as string | null)?.trim()
  const description = (formData.get("description") as string | null)?.trim()

  if (!commonName || !scientificName || !category || !description) {
    return NextResponse.json(
      { title: "Campos incompletos", message: "commonName, scientificName, category y description son obligatorios" },
      { status: 400 }
    )
  }

  // Imagen: archivo o URL
  let imageUrl = (formData.get("imageUrl") as string | null)?.trim() || ""
  const imageFile = formData.get("image") as File | null

  if (imageFile && imageFile.size > 0) {
    if (isReadOnlyDeployment) {
      return NextResponse.json(
        {
          title: "Subida de archivos no disponible en este entorno",
          message: "En produccion serverless usa una URL de imagen (campo imageUrl) o integra almacenamiento externo.",
        },
        { status: 501 }
      )
    }

    if (!ALLOWED_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { title: "Tipo de archivo no permitido", message: "Solo se permiten JPEG, PNG y WebP" },
        { status: 400 }
      )
    }
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { title: "Archivo muy grande", message: "Tamaño máximo: 5 MB" },
        { status: 400 }
      )
    }
    const uploadDir = ensureUploadDir()
    const ext = imageFile.name.split(".").pop() || "jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filepath = path.join(uploadDir, filename)
    const buffer = await imageFile.arrayBuffer()
    fs.writeFileSync(filepath, Buffer.from(buffer))
    imageUrl = `/uploads/species/${filename}`
  }

  if (!imageUrl) {
    return NextResponse.json(
      { title: "Imagen requerida", message: "Debes subir una imagen o proporcionar una URL" },
      { status: 400 }
    )
  }

  const species = await createSpeciesInDatabase({
    commonName,
    scientificName,
    category,
    commercialValue: (formData.get("commercialValue") as string | null)?.trim() || "media",
    description,
    habitat: parseJsonArray(formData.get("habitat"), "habitat"),
    region: parseJsonArray(formData.get("region"), "region"),
    identificationTips: parseJsonArray(formData.get("identificationTips"), "identificationTips"),
    keyDifferences: parseJsonArray(formData.get("keyDifferences"), "keyDifferences"),
    similarSpecies: parseJsonArray(formData.get("similarSpecies"), "similarSpecies"),
    season: parseJsonArray(formData.get("season"), "season"),
    fishingMethod: parseJsonArray(formData.get("fishingMethod"), "fishingMethod"),
    imageUrl,
    averageSize: (formData.get("averageSize") as string | null)?.trim() || undefined,
    averageWeight: (formData.get("averageWeight") as string | null)?.trim() || undefined,
    minSize: (formData.get("minSize") as string | null)?.trim() || undefined,
  })

  return NextResponse.json(species, { status: 201 })
})
