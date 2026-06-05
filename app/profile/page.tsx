import type { Metadata } from "next"
import { ProfilePanel } from "@/components/profile-panel"

export const metadata: Metadata = {
  title: "Mi Perfil",
  robots: {
    index: false,
    follow: false,
  },
}

export default function ProfilePage() {
  return <ProfilePanel />
}
