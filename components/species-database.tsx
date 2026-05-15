"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Fish, Plus, Eye, ArrowLeftRight, PlusCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SpeciesComparison } from "./species-comparison"
import { DelayedComponent } from "@/components/ui/delayed-component"
import type { Species } from "@/lib/species/types"
import { listSpecies } from "@/lib/species/repository"

interface SpeciesDatabaseProps {
  onSelectSpecies?: (species: Species) => void
  selectedSpecies?: string[]
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()

export function SpeciesDatabase({ onSelectSpecies, selectedSpecies = [] }: SpeciesDatabaseProps) {
  const router = useRouter()
  const [speciesList, setSpeciesList] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [showComparison, setShowComparison] = useState(false)

  const reloadSpecies = async (isMounted = true) => {
    try {
      setLoading(true)
      const loadedSpecies = await listSpecies()
      if (!isMounted) return
      setSpeciesList(loadedSpecies)
    } catch (error) {
      console.error("No se pudo cargar el catalogo de especies:", error)
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    reloadSpecies(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const filteredSpecies = useMemo(() => {
    const normalizedSearchTerm = normalizeText(searchTerm)
    const normalizedSelectedRegion = normalizeText(selectedRegion)

    return speciesList
      .filter((species) => {
        const normalizedCommonName = normalizeText(species.commonName)
        const normalizedScientificName = normalizeText(species.scientificName)

        const matchesSearch =
          normalizedSearchTerm.length === 0 ||
          normalizedCommonName.includes(normalizedSearchTerm) ||
          normalizedScientificName.includes(normalizedSearchTerm)

        const matchesCategory = selectedCategory === "all" || species.category === selectedCategory

        const matchesRegion =
          selectedRegion === "all" ||
          species.region.some((region) => normalizeText(region).includes(normalizedSelectedRegion))

        return matchesSearch && matchesCategory && matchesRegion
      })
      .sort((speciesA, speciesB) => {
        if (!normalizedSearchTerm) {
          return speciesA.commonName.localeCompare(speciesB.commonName, "es")
        }

        const aCommonName = normalizeText(speciesA.commonName)
        const bCommonName = normalizeText(speciesB.commonName)
        const aScientificName = normalizeText(speciesA.scientificName)
        const bScientificName = normalizeText(speciesB.scientificName)

        const aStartsWith = aCommonName.startsWith(normalizedSearchTerm) || aScientificName.startsWith(normalizedSearchTerm)
        const bStartsWith = bCommonName.startsWith(normalizedSearchTerm) || bScientificName.startsWith(normalizedSearchTerm)

        if (aStartsWith !== bStartsWith) {
          return aStartsWith ? -1 : 1
        }

        return speciesA.commonName.localeCompare(speciesB.commonName, "es")
      })
  }, [searchTerm, selectedCategory, selectedRegion, speciesList])

  const categories = [
    { value: "all", label: "Todas las categorías" },
    { value: "pez", label: "Peces" },
    { value: "molusco", label: "Moluscos" },
    { value: "crustaceo", label: "Crustáceos" },
    { value: "equinodermo", label: "Equinodermos" },
    { value: "alga", label: "Algas" },
  ]

  const regions = [
    { value: "all", label: "Todas las regiones" },
    { value: "península valdés", label: "Península Valdés" },
    { value: "comodoro rivadavia", label: "Comodoro Rivadavia" },
    { value: "golfo san jorge", label: "Golfo San Jorge" },
    { value: "golfo nuevo", label: "Golfo Nuevo" },
  ]

  const getCategoryColor = (category: string) => {
    const colors = {
      pez: "bg-blue-100 text-blue-800",
      molusco: "bg-purple-100 text-purple-800",
      crustaceo: "bg-orange-100 text-orange-800",
      equinodermo: "bg-green-100 text-green-800",
      alga: "bg-yellow-100 text-yellow-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getCommercialValueColor = (value: string) => {
    const colors = {
      alta: "bg-green-100 text-green-800",
      media: "bg-yellow-100 text-yellow-800",
      baja: "bg-red-100 text-red-800",
    }
    return colors[value as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  if (showComparison) {
    return <SpeciesComparison onClose={() => setShowComparison(false)} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">Base de datos de especies</h3>
          <p className="text-sm text-gray-400">Especies comunes en las costas patagónicas de Argentina</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/guia-especies/nueva-especie")} variant="outline">
            <Fish className="w-4 h-4" />
            Sugerir especie
          </Button>
          <Button onClick={() => setShowComparison(true)} variant="outline">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Comparar especies
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nombre común o científico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 themed-input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Categoría</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-background border border-gray-300 rounded-md text-sm"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Región</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full p-2 bg-background border border-gray-300 rounded-md text-sm"
            >
              {regions.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <DelayedComponent
        loading={loading}
        skeleton={
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-lg border border-border">
                <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-400">{filteredSpecies.length} especies encontradas</p>

          <div className="grid gap-4">
            {filteredSpecies.map((species) => (
              <Card key={species.id} className="glass-card hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Species Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={species.imageUrl || "/placeholder.svg"}
                        alt={species.commonName}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    </div>

                    {/* Species Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-lg">{species.commonName}</h4>
                        <Badge className={getCategoryColor(species.category)}>{species.category}</Badge>
                        <Badge className={getCommercialValueColor(species.commercialValue)}>
                          Valor {species.commercialValue}
                        </Badge>
                        {species.similarSpecies && species.similarSpecies.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            ⚠️ Especies similares
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-400 italic mb-2">{species.scientificName}</p>

                      <p className="text-sm mb-3 line-clamp-2">{species.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="font-medium">Talla:</span>
                          <p>{species.averageSize}</p>
                        </div>
                        <div>
                          <span className="font-medium">Peso:</span>
                          <p>{species.averageWeight}</p>
                        </div>
                        <div>
                          <span className="font-medium">Temporada:</span>
                          <p>{species.season.join(", ")}</p>
                        </div>
                        {species.minSize && (
                          <div>
                            <span className="font-medium">Talla mínima:</span>
                            <p className="text-red-600 font-medium">{species.minSize}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {species.fishingMethod.slice(0, 3).map((method, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {method}
                          </Badge>
                        ))}
                        {species.fishingMethod.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{species.fishingMethod.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2">
                      {onSelectSpecies && (
                        <Button
                          size="sm"
                          onClick={() => onSelectSpecies(species)}
                          disabled={selectedSpecies.includes(species.id)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {selectedSpecies.includes(species.id) ? "Agregada" : "Agregar"}
                        </Button>
                      )}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <Fish className="w-5 h-5" />
                              <span>{species.commonName}</span>
                            </DialogTitle>
                            <DialogDescription>{species.scientificName}</DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6">
                            {/* Large Image */}
                            <div className="flex justify-center">
                              <img
                                src={species.imageUrl || "/placeholder.svg"}
                                alt={species.commonName}
                                className="w-full max-w-md h-64 object-cover rounded-lg border"
                              />
                            </div>

                            <p className="text-gray-300">{species.description}</p>

                            {/* Similar Species Warning */}
                            {species.similarSpecies && species.similarSpecies.length > 0 && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <ArrowLeftRight className="w-4 h-4 text-yellow-600" />
                                  <span className="font-medium text-yellow-800">Especies similares</span>
                                </div>
                                <p className="text-sm text-yellow-700 mb-3">
                                  Esta especie puede confundirse con otras. Usa la herramienta de comparación para ver las
                                  diferencias.
                                </p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowComparison(true)}
                                  className="bg-white"
                                >
                                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                                  Comparar especies
                                </Button>
                              </div>
                            )}

                            {/* Identification Tips */}
                            <div>
                              <h4 className="font-medium mb-3 text-lg">Características de identificación</h4>
                              <ul className="space-y-2">
                                {species.identificationTips.map((tip, index) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-sm">{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-3">Características físicas</h4>
                                <ul className="text-sm space-y-2">
                                  <li>
                                    <strong>Talla promedio:</strong> {species.averageSize}
                                  </li>
                                  <li>
                                    <strong>Peso promedio:</strong> {species.averageWeight}
                                  </li>
                                  {species.minSize && (
                                    <li>
                                      <strong>Talla mínima legal:</strong>{" "}
                                      <span className="text-red-600 font-medium">{species.minSize}</span>
                                    </li>
                                  )}
                                  <li>
                                    <strong>Valor comercial:</strong> {species.commercialValue}
                                  </li>
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-medium mb-3">Hábitat y pesca</h4>
                                <ul className="text-sm space-y-2">
                                  <li>
                                    <strong>Hábitat:</strong> {species.habitat.join(", ")}
                                  </li>
                                  <li>
                                    <strong>Temporada:</strong> {species.season.join(", ")}
                                  </li>
                                  <li>
                                    <strong>Métodos de pesca:</strong> {species.fishingMethod.join(", ")}
                                  </li>
                                  <li>
                                    <strong>Regiones:</strong> {species.region.join(", ")}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSpecies.length === 0 && (
            <div className="text-center py-8">
              <Fish className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron especies con los criterios seleccionados</p>
            </div>
          )}
        </div>
      </DelayedComponent>
    </div>
  )
}
