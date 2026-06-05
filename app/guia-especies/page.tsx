import type { Metadata } from "next"
import { SpeciesWiki } from "@/components/species-wiki";

export const metadata: Metadata = {
  title: "Guia de Especies",
  robots: {
    index: false,
    follow: false,
  },
}

export default function GuiaEspeciesPage() {
  return <SpeciesWiki />;
}