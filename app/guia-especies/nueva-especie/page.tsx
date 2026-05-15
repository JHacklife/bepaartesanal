"use client"

import { useRouter } from "next/navigation"
import { AddSpeciesForm } from "@/components/add-species-form"

export default function NuevaEspeciePage() {
  const router = useRouter()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <AddSpeciesForm
        onClose={() => router.push("/guia-especies")}
        onSaved={() => router.push("/guia-especies")}
      />
    </div>
  )
}
