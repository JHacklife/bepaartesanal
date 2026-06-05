import type { MetadataRoute } from "next"

const siteUrl =
  process.env.AUTH_URL ||
  process.env.NEXTAUTH_URL ||
  "https://bepaartesanal.infinitelabs.tech"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ]
}
