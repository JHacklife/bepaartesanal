"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftRight, ChevronRight, Fish, Grid, List, Search, SlidersHorizontal } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import type { Species } from "@/lib/species/types"
import { listSpecies } from "@/lib/species/repository"
import { SpeciesComparison } from "./species-comparison"

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()

export function SpeciesWiki() {
  const router = useRouter()
  const [speciesList, setSpeciesList] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showComparison, setShowComparison] = useState(false)
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null)

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
          setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la guia de especies.")
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

  const regions = useMemo(() => {
    const unique = new Set<string>()
    for (const item of speciesList) {
      for (const region of item.region) {
        unique.add(region)
      }
    }

    return ["all", ...Array.from(unique).sort((a, b) => a.localeCompare(b, "es"))]
  }, [speciesList])

  const filteredSpecies = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm)
    const normalizedRegion = normalizeText(selectedRegion)

    return speciesList.filter((species) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        normalizeText(species.commonName).includes(normalizedSearch) ||
        normalizeText(species.scientificName).includes(normalizedSearch)

      const matchesCategory = selectedCategory === "all" || species.category === selectedCategory
      const matchesRegion =
        selectedRegion === "all" ||
        species.region.some((region) => normalizeText(region).includes(normalizedRegion))

      return matchesSearch && matchesCategory && matchesRegion
    })
  }, [searchTerm, selectedCategory, selectedRegion, speciesList])

  const isCatalogEmpty = !loading && !error && speciesList.length === 0

  const getCategoryColor = (category: Species["category"]) => {
    const colors: Record<Species["category"], string> = {
      pez: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      molusco: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
      crustaceo: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      equinodermo: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
      alga: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300",
    }

    return colors[category]
  }

  if (showComparison) {
    return <SpeciesComparison onClose={() => setShowComparison(false)} />
  }

  if (selectedSpecies) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Button variant="outline" onClick={() => setSelectedSpecies(null)} className="bg-transparent w-full sm:w-auto">
            Volver a la guia
          </Button>
          <Button variant="outline" onClick={() => setShowComparison(true)} className="bg-transparent w-full sm:w-auto">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Comparar especies
          </Button>
        </div>

        <Card className="glass-card">
          <CardContent className="p-3 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <img
                src={selectedSpecies.imageUrl || "/placeholder.svg"}
                alt={selectedSpecies.commonName}
                className="w-full h-48 sm:h-64 object-cover rounded-lg border"
              />
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold capitalize dark:text-white">{selectedSpecies.commonName}</h1>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 italic">{selectedSpecies.scientificName}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getCategoryColor(selectedSpecies.category)}>{selectedSpecies.category}</Badge>
                  <Badge variant="outline">Valor {selectedSpecies.commercialValue}</Badge>
                </div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{selectedSpecies.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 text-sm">
              <div className="space-y-2">
                <p><strong>Talla promedio:</strong> {selectedSpecies.averageSize}</p>
                <p><strong>Peso promedio:</strong> {selectedSpecies.averageWeight}</p>
                {selectedSpecies.minSize && <p><strong>Talla minima legal:</strong> <span className="text-red-600 font-medium">{selectedSpecies.minSize}</span></p>}
                <p><strong>Temporada:</strong> {selectedSpecies.season.join(", ") || "N/D"}</p>
              </div>
              <div className="space-y-2">
                <p><strong>Habitat:</strong> {selectedSpecies.habitat.join(", ") || "N/D"}</p>
                <p><strong>Regiones:</strong> {selectedSpecies.region.join(", ") || "N/D"}</p>
                <p><strong>Metodos de pesca:</strong> {selectedSpecies.fishingMethod.join(", ") || "N/D"}</p>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 dark:text-white">Guia de identificacion</h3>
              <ul className="space-y-2">
                {selectedSpecies.identificationTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm dark:text-gray-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-5 border-b border-border">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Guia de especies</h2>
          <p className="text-sm text-muted-foreground mt-1">Catalogo alimentado desde la base de datos</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowComparison(true)} className="gap-2">
            <ArrowLeftRight className="w-4 h-4" />
            <span className="hidden sm:inline">Comparar</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push("/guia-especies/nueva-especie")} className="gap-2">
            <Fish className="w-4 h-4" />
            Sugerir especie
          </Button>
        </div>
      </div>

      <div className="py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Buscar por nombre comun o cientifico..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 themed-input" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />

          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="all">Todas las categorias</option>
            <option value="pez">Peces</option>
            <option value="molusco">Moluscos</option>
            <option value="crustaceo">Crustaceos</option>
            <option value="equinodermo">Equinodermos</option>
            <option value="alga">Algas</option>
          </select>

          <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {regions.map((region) => (
              <option key={region} value={region}>{region === "all" ? "Todas las regiones" : region}</option>
            ))}
          </select>

          <Separator orientation="vertical" className="h-5 hidden sm:block" />
          <span className="text-sm text-muted-foreground ml-auto sm:ml-0">
            {filteredSpecies.length} especie{filteredSpecies.length !== 1 ? "s" : ""}
          </span>

          <div className="flex items-center border border-input rounded-md overflow-hidden ml-auto sm:ml-0">
            <button onClick={() => setViewMode("grid")} className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`} title="Vista cuadricula">
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("list")} className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`} title="Vista lista">
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="glass-card">
              <Skeleton className="w-full h-44" />
              <CardContent className="p-3 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Fish className="w-14 h-14 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">No se pudo cargar la guia</p>
          <p className="text-sm text-muted-foreground max-w-md">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      ) : isCatalogEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Fish className="w-14 h-14 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">La guia esta vacia</p>
          <p className="text-sm text-muted-foreground">Todavia no hay especies cargadas. Puedes sugerir la primera.</p>
          <Button variant="outline" onClick={() => router.push("/guia-especies/nueva-especie")} className="gap-2">
            <Fish className="w-4 h-4" />
            Sugerir especie
          </Button>
        </div>
      ) : filteredSpecies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Fish className="w-14 h-14 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">Sin resultados</p>
          <p className="text-sm text-muted-foreground">Ajusta los filtros o el termino de busqueda</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpecies.map((species) => (
            <Card key={species.id} className="glass-card group cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-200 overflow-hidden" onClick={() => setSelectedSpecies(species)}>
              <div className="relative">
                <img src={species.imageUrl || "/placeholder.svg"} alt={species.commonName} className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-semibold capitalize text-white text-base leading-tight truncate">{species.commonName}</h3>
                  <p className="text-white/70 italic text-xs truncate">{species.scientificName}</p>
                </div>
              </div>
              <CardContent className="p-3 space-y-2">
                <div className="flex flex-wrap gap-1">
                  <Badge className={`${getCategoryColor(species.category)} text-xs`} variant="secondary">{species.category}</Badge>
                  <Badge variant="outline" className="text-xs">Valor {species.commercialValue}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{species.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                  <span>{species.averageSize}</span>
                  <span className="flex items-center gap-1 text-primary font-medium">Ver ficha <ChevronRight className="w-3 h-3" /></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
          {filteredSpecies.map((species) => (
            <div key={species.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors group" onClick={() => setSelectedSpecies(species)}>
              <img src={species.imageUrl || "/placeholder.svg"} alt={species.commonName} className="w-16 h-16 object-cover rounded-lg border border-border flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold capitalize text-sm truncate">{species.commonName}</h3>
                  <Badge className={`${getCategoryColor(species.category)} text-xs`} variant="secondary">{species.category}</Badge>
                </div>
                <p className="text-xs italic text-muted-foreground">{species.scientificName}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{species.description}</p>
              </div>
              <div className="flex-shrink-0 text-xs text-muted-foreground text-right hidden sm:block">
                <p>{species.averageSize}</p>
                <p>{species.region.length} reg.</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
