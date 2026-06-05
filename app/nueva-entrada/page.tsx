import type { Metadata } from "next"
import { LogbookEntry } from "@/components/logbook-entry";

export const metadata: Metadata = {
  title: "Nueva Entrada",
  robots: {
    index: false,
    follow: false,
  },
}

export default function NuevaEntradaPage() {
  return <LogbookEntry />;
}