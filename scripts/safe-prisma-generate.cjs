const { spawnSync } = require("node:child_process")

const result = spawnSync("npx", ["prisma", "generate"], {
  stdio: "pipe",
  encoding: "utf8",
  shell: true,
})

if (result.stdout) process.stdout.write(result.stdout)
if (result.stderr) process.stderr.write(result.stderr)

if (result.status === 0) {
  process.exit(0)
}

const output = `${result.stdout || ""}\n${result.stderr || ""}`
const isKnownWindowsPrismaLock =
  output.includes("EPERM") &&
  output.includes("query_engine-windows.dll.node")

if (isKnownWindowsPrismaLock) {
  console.warn("[safe-prisma-generate] Prisma generate omitido por bloqueo de archivo en Windows (EPERM).")
  console.warn("[safe-prisma-generate] Continuando con build; si persiste, cierra procesos Node/antivirus y reintenta.")
  process.exit(0)
}

process.exit(result.status || 1)
