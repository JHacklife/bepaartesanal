import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "Acceso",
    template: "%s | Acceso BEPA Artesanal",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-image-preview": "none",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
