import type { MetadataRoute } from "next"

const siteUrl =
  process.env.AUTH_URL ||
  process.env.NEXTAUTH_URL ||
  "https://bepaartesanal.infinitelabs.tech"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/auth/csrf", "/api/auth/session"],
        disallow: [
          "/dashboard",
          "/mis-datos",
          "/nueva-entrada",
          "/guia-especies",
          "/profile",
          "/settings",
          "/themes",
          "/feedback",
          "/auth/signin",
          "/auth/signup",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
