import type { Metadata } from "next"
import { MaritimeShowcase } from '@/components/maritime-showcase'

export const metadata: Metadata = {
  title: "Temas",
  robots: {
    index: false,
    follow: false,
  },
}

export default function ThemesPage() {
  return <MaritimeShowcase />
}
