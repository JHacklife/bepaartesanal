import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { version } = require("./package.json")

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
