"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, ArrowLeftRight, CheckCircle, Plus, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import type { Species } from "@/lib/species/types"
import { listSpecies } from "@/lib/species/repository"

interface SpeciesComparisonProps {
  onClose?: () => void
}

type ComparisonGroup = {
  name: string
  description: string
  speciesIds: string[]
}

const buildComparisonGroups = (speciesList: Species[]): ComparisonGroup[] => {
  const byId = new Map(speciesList.map((item) => [item.id, item]))
  const groups: ComparisonGroup[] = []
  const usedSignatures = new Set<string>()

  for (const species of speciesList) {
    const validSimilarIds = (species.similarSpecies || []).filter((id) => byId.has(id))
    if (validSimilarIds.length === 0) continue

    const ids = Array.from(new Set([species.id, ...validSimilarIds])).slice(0, 3)
    if (ids.length < 2) continue

    const signature = ids.slice().sort().join("|")
    if (usedSignatures.has(signature)) continue
    usedSignatures.add(signature)

    groups.push({
      name: `${species.commonName} y similares`,
      description: `Comparacion sugerida desde la base de datos para ${species.commonName.toLowerCase()}.`,
      speciesIds: ids,
    })
  }

  return groups.slice(0, 8)
}

export function SpeciesComparison({ onClose }: SpeciesComparisonProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [speciesList, setSpeciesList] = useState<Species[]>([])
  const [selectedSpecies, setSelectedSpecies] = useState<Species[]>([])

  useEffect(() => {
    let active = true

    const loadSpecies = async () => {
      try {
        setLoading(true)
        setError(null)
        const loaded = await listSpecies()
        if (active) {
          setSpeciesList(loaded)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el comparador.")
          setSpeciesList([])
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadSpecies()

    return () => {
      active = false
    }
  }, [])

  const comparisonGroups = useMemo(() => buildComparisonGroups(speciesList), [speciesList])

  const handleAddSpecies = (speciesId: string) => {
    if (selectedSpecies.length >= 3) return

    const species = speciesList.find((item) => item.id === speciesId)
    if (!species) return
    if (selectedSpecies.some((item) => item.id === speciesId)) return

    setSelectedSpecies((current) => [...current, species])
  }

  const handleRemoveSpecies = (speciesId: string) => {
    setSelectedSpecies((current) => current.filter((item) => item.id !== speciesId))
  }

  const handleLoadGroup = (group: ComparisonGroup) => {
    const groupSpecies = group.speciesIds
      .map((id) => speciesList.find((species) => species.id === id))
      .filter((species): species is Species => Boolean(species))
      .slice(0, 3)

    setSelectedSpecies(groupSpecies)
  }

  const getCategoryColor = (category: Species["category"]) => {
    const colors: Record<Species["category"], string> = {
      pez: "bg-blue-100 text-blue-800",
      molusco: "bg-cyan-100 text-cyan-800",
      crustaceo: "bg-orange-100 text-orange-800",
      equinodermo: "bg-emerald-100 text-emerald-800",
      alga: "bg-lime-100 text-lime-800",
    }
    return colors[category]
  }

  const getCommercialValueColor = (value: Species["commercialValue"]) => {
    const colors: Record<Species["commercialValue"], string> = {
      alta: "bg-green-100 text-green-800",
      media: "bg-yellow-100 text-yellow-800",
      baja: "bg-red-100 text-red-800",
    }
    return colors[value]
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2 flex items-center">
            <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Comparacion de especies
          </h3>
          <p className="text-sm text-gray-600">Datos de comparacion obtenidos desde la base de datos</p>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
            <X className="w-4 h-4 mr-2 sm:mr-0" />
            <span className="sm:hidden">Cerrar</span>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {comparisonGroups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Comparaciones sugeridas</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {comparisonGroups.map((group) => (
                    <Button key={group.name} variant="outline" className="justify-start h-auto p-3 bg-transparent text-left" onClick={() => handleLoadGroup(group)}>
                      <div className="w-full">
                        <div className="font-medium text-sm">{group.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{group.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Seleccion manual</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                <Select onValueChange={handleAddSpecies}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Agregar especie..." />
                  </SelectTrigger>
                  <SelectContent>
                    {speciesList
                      .filter((species) => !selectedSpecies.some((item) => item.id === species.id))
                      .map((species) => (
                        <SelectItem key={species.id} value={species.id}>
                          {species.commonName} ({species.scientificName})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="self-center">{selectedSpecies.length}/3</Badge>
              </div>

              {selectedSpecies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSpecies.map((species) => (
                    <Badge key={species.id} variant="outline" className="flex items-center space-x-1 text-xs">
                      <span>{species.commonName}</span>
                      <button onClick={() => handleRemoveSpecies(species.id)} className="ml-1 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedSpecies.length >= 2 && (
            <div className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Comparacion visual</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className={`grid gap-3 sm:gap-4 ${selectedSpecies.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
                    {selectedSpecies.map((species) => (
                      <div key={species.id} className="text-center">
                        <img src={species.imageUrl || "/placeholder.svg"} alt={species.commonName} className="w-full h-32 sm:h-48 object-cover rounded-lg border mb-2 sm:mb-3" />
                        <h4 className="font-semibold text-sm sm:text-base">{species.commonName}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 italic truncate">{species.scientificName}</p>
                        <div className="flex justify-center space-x-1 mt-2">
                          <Badge className={`${getCategoryColor(species.category)} text-xs`} variant="secondary">{species.category}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Caracteristicas comparativas</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Caracteristica</th>
                        {selectedSpecies.map((species) => (
                          <th key={species.id} className="text-left py-2 font-medium min-w-32 lg:min-w-48">{species.commonName}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b"><td className="py-3 font-medium">Tamano promedio</td>{selectedSpecies.map((s) => <td key={s.id} className="py-3">{s.averageSize}</td>)}</tr>
                      <tr className="border-b"><td className="py-3 font-medium">Peso promedio</td>{selectedSpecies.map((s) => <td key={s.id} className="py-3">{s.averageWeight}</td>)}</tr>
                      <tr className="border-b"><td className="py-3 font-medium">Habitat</td>{selectedSpecies.map((s) => <td key={s.id} className="py-3">{s.habitat.join(", ") || "N/D"}</td>)}</tr>
                      <tr className="border-b"><td className="py-3 font-medium">Temporada</td>{selectedSpecies.map((s) => <td key={s.id} className="py-3">{s.season.join(", ") || "N/D"}</td>)}</tr>
                      <tr className="border-b"><td className="py-3 font-medium">Valor comercial</td>{selectedSpecies.map((s) => <td key={s.id} className="py-3"><Badge className={`${getCommercialValueColor(s.commercialValue)} text-xs`} variant="secondary">{s.commercialValue}</Badge></td>)}</tr>
                      {selectedSpecies.some((s) => s.minSize) && (
                        <tr className="border-b"><td className="py-3 font-medium">Talla minima legal</td>{selectedSpecies.map((s) => <td key={s.id} className="py-3">{s.minSize || "No aplica"}</td>)}</tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Diferencias clave para identificacion
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className={`grid gap-3 sm:gap-4 ${selectedSpecies.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
                    {selectedSpecies.map((species) => (
                      <div key={species.id} className="space-y-3">
                        <h4 className="font-semibold text-center text-sm sm:text-base bg-gray-50 dark:bg-gray-800 py-2 rounded">{species.commonName}</h4>
                        <div className="space-y-2">
                          {(species.keyDifferences || species.identificationTips).map((difference, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-xs sm:text-sm">{difference}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedSpecies.length === 1 && (
            <Card>
              <CardContent className="text-center py-6 sm:py-8">
                <ArrowLeftRight className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">Selecciona al menos 2 especies para comenzar la comparacion</p>
              </CardContent>
            </Card>
          )}

          {selectedSpecies.length === 0 && (
            <Card>
              <CardContent className="text-center py-6 sm:py-8">
                <Plus className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4 text-sm sm:text-base">Selecciona un grupo sugerido o agrega especies manualmente</p>
                <p className="text-xs sm:text-sm text-gray-400">Puedes comparar hasta 3 especies simultaneamente</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
