import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BEPA Artesanal",
    short_name: "BEPA",
    description:
      "Bitacora electronica para pescadores artesanales individuales en Argentina.",
    start_url: "/auth/signin",
    display: "standalone",
    background_color: "#e6f4ff",
    theme_color: "#0ea5e9",
    lang: "es-AR",
    categories: ["productivity", "utilities"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}
