"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import { SpeciesDatabase } from "./species-database"

interface SelectedSpecies {
  id: string
  commonName: string
  scientificName: string
  crates: string
  kg: string
  size: string
}

interface SpeciesSelectorProps {
  selectedSpecies: SelectedSpecies[]
  onSpeciesChange: (species: SelectedSpecies[]) => void
}

export function SpeciesSelector({ selectedSpecies, onSpeciesChange }: SpeciesSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSelectSpecies = (species: any) => {
    const newSpecies: SelectedSpecies = {
      id: species.id,
      commonName: species.commonName,
      scientificName: species.scientificName,
      crates: "",
      kg: "",
      size: "",
    }

    onSpeciesChange([...selectedSpecies, newSpecies])
    setIsDialogOpen(false)
  }

  const handleRemoveSpecies = (index: number) => {
    const updated = selectedSpecies.filter((_, i) => i !== index)
    onSpeciesChange(updated)
  }

  const handleUpdateSpecies = (index: number, field: keyof SelectedSpecies, value: string) => {
    const updated = [...selectedSpecies]
    updated[index] = { ...updated[index], [field]: value }
    onSpeciesChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Especies capturadas</Label>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Agregar especie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar especie</DialogTitle>
              <DialogDescription>Agrega y selecciona las especies capturadas de la base de datos</DialogDescription>
            </DialogHeader>
            <SpeciesDatabase onSelectSpecies={handleSelectSpecies} selectedSpecies={selectedSpecies.map((s) => s.id)} />
          </DialogContent>
        </Dialog>
      </div>

      {selectedSpecies.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-500 mb-2">No hay especies seleccionadas</p>
          <p className="text-sm text-gray-400">Usa el botón "Agregar especie" para agregar capturas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {selectedSpecies.map((species, index) => (
            <div key={`${species.id}-${index}`} className="p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium flex items-center space-x-2">
                    <span>{species.commonName}</span>
                    <Badge variant="outline" className="text-xs">
                      {species.scientificName}
                    </Badge>
                  </h4>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveSpecies(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor={`crates-${index}`} className="text-sm">
                    No. de cajones
                  </Label>
                  <Input
                    id={`crates-${index}`}
                    type="number"
                    placeholder="5"
                    value={species.crates}
                    onChange={(e) => handleUpdateSpecies(index, "crates", e.target.value)}
                    className="themed-input"
                  />
                </div>
                <div>
                  <Label htmlFor={`kg-${index}`} className="text-sm">
                    Peso (KG) *
                  </Label>
                  <Input
                    id={`kg-${index}`}
                    type="number"
                    step="0.1"
                    placeholder="25.5"
                    value={species.kg}
                    onChange={(e) => handleUpdateSpecies(index, "kg", e.target.value)}
                    required
                    className="themed-input"
                  />
                </div>
                <div>
                  <Label htmlFor={`size-${index}`} className="text-sm">
                    Talla promedio
                  </Label>
                  <select
                    id={`size-${index}`}
                    value={species.size}
                    onChange={(e) => handleUpdateSpecies(index, "size", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Seleccionar</option>
                    <option value="small">Pequeña</option>
                    <option value="medium">Mediana</option>
                    <option value="large">Grande</option>
                    <option value="extra-large">Extra grande</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
