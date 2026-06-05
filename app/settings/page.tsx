import type { Metadata } from "next"
import { SettingsPanel } from "@/components/settings-panel"

export const metadata: Metadata = {
  title: "Configuracion",
  robots: {
    index: false,
    follow: false,
  },
}

export default function SettingsPage() {
  return <SettingsPanel />
}
