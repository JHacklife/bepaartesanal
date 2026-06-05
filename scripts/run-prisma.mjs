#!/usr/bin/env node

import { spawnSync } from "node:child_process"
import { loadProjectEnv } from "./load-project-env.mjs"

loadProjectEnv()

const args = process.argv.slice(2)

if (args.length === 0) {
  console.error("Uso: node scripts/run-prisma.mjs <comando prisma>")
  process.exit(1)
}

const result = spawnSync("npx", ["prisma", ...args], {
  stdio: "inherit",
  shell: true,
  env: process.env,
})

process.exit(result.status || 0)
