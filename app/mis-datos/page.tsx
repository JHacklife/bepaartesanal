import type { Metadata } from "next"
import { DataManagement } from "@/components/data-management";

export const metadata: Metadata = {
  title: "Mis Datos",
  robots: {
    index: false,
    follow: false,
  },
}

export default function MisDatosPage() {
  return <DataManagement />;
}