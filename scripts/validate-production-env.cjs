const fs = require("node:fs")
const path = require("node:path")

const root = process.cwd()
const envFiles = [".env", ".env.local", ".env.production", ".env.production.local"]

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}

  const values = {}
  const content = fs.readFileSync(filePath, "utf8")

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue

    const equalsIndex = line.indexOf("=")
    if (equalsIndex === -1) continue

    const key = line.slice(0, equalsIndex).trim()
    let value = line.slice(equalsIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    values[key] = value
  }

  return values
}

const fileEnv = envFiles.reduce((acc, filename) => {
  return { ...acc, ...parseEnvFile(path.join(root, filename)) }
}, {})

const env = { ...fileEnv, ...process.env }

const missing = []
const warnings = []

function hasValue(name) {
  return typeof env[name] === "string" && env[name].trim().length > 0
}

function requireOne(names, label = names.join(" or ")) {
  if (!names.some(hasValue)) {
    missing.push(label)
  }
}

function requireValue(name) {
  if (!hasValue(name)) {
    missing.push(name)
  }
}

requireValue("DATABASE_URL")
requireOne(["AUTH_SECRET", "NEXTAUTH_SECRET"])
requireOne(["AUTH_URL", "NEXTAUTH_URL"])

const authSecret = env.AUTH_SECRET || env.NEXTAUTH_SECRET || ""
if (authSecret.includes("REEMPLAZAR") || authSecret === "dev-only-secret-change-in-production") {
  missing.push("AUTH_SECRET/NEXTAUTH_SECRET real, no placeholder")
}

if ((env.NEXT_PUBLIC_STORAGE_PROVIDER || "").toLowerCase() !== "sql") {
  warnings.push("NEXT_PUBLIC_STORAGE_PROVIDER no es 'sql'; en produccion las entradas pueden quedar solo en el navegador.")
}

if (!hasValue("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY")) {
  warnings.push("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no esta definido; el selector de mapa de Nueva entrada quedara deshabilitado.")
}

if (hasValue("GOOGLE_CLIENT_ID") !== hasValue("GOOGLE_CLIENT_SECRET")) {
  missing.push("GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET deben configurarse juntos")
}

if (missing.length > 0) {
  console.error("[production-env] Faltan variables requeridas:")
  for (const item of missing) {
    console.error(`- ${item}`)
  }
  process.exit(1)
}

if (warnings.length > 0) {
  console.warn("[production-env] Advertencias:")
  for (const item of warnings) {
    console.warn(`- ${item}`)
  }
}

console.log("[production-env] Variables de produccion verificadas.")
