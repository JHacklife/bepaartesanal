import fs from "node:fs"
import path from "node:path"

const DEFAULT_ENV_FILES = [".env", ".env.local"]

const parseEnvFile = (filePath) => {
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

export const loadProjectEnv = ({
  cwd = process.cwd(),
  files = DEFAULT_ENV_FILES,
} = {}) => {
  const loaded = {}

  for (const filename of files) {
    Object.assign(loaded, parseEnvFile(path.join(cwd, filename)))
  }

  Object.assign(process.env, loaded, process.env)

  return { ...loaded, ...process.env }
}
