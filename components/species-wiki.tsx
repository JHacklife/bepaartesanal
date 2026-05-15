"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { Search, Fish, ArrowLeftRight, Grid, List, ChevronRight, SlidersHorizontal } from "lucide-react"
import { SpeciesComparison } from "./species-comparison"

interface Species {
  id: string
  commonName: string
  scientificName: string
  category: "pez" | "molusco" | "crustaceo" | "equinodermo" | "alga"
  habitat: string[]
  averageSize: string
  averageWeight: string
  season: string[]
  fishingMethod: string[]
  commercialValue: "alta" | "media" | "baja"
  description: string
  minSize?: string
  region: string[]
  imageUrl: string
  identificationTips: string[]
  keyDifferences?: string[]
  similarSpecies?: string[]
  rarity: "común" | "poco común" | "raro"
  conservationStatus: "estable" | "vulnerable" | "en peligro"
}

const speciesDatabase: Species[] = [
  {
    id: "merluza-comun",
    commonName: "merluza común",
    scientificName: "Merluccius hubbsi",
    category: "pez",
    habitat: ["plataforma continental", "aguas profundas"],
    averageSize: "30-60 cm",
    averageWeight: "0.5-3 kg",
    season: ["todo el año"],
    fishingMethod: ["red de arrastre", "red de enmalle", "línea"],
    commercialValue: "alta",
    description:
      "Especie de gran importancia comercial en Argentina. Habita aguas frías de la plataforma continental patagónica.",
    minSize: "35 cm",
    region: ["golfo san jorge", "península valdés", "comodoro rivadavia"],
    imageUrl: "/placeholder.svg?height=200&width=300&text=Merluza+Común+fish+silver+elongated+body+large+mouth",
    identificationTips: [
      "Cuerpo alargado y plateado",
      "Boca grande con dientes prominentes",
      "Dos aletas dorsales separadas",
      "Línea lateral bien marcada",
      "Cola ligeramente bifurcada",
    ],
    rarity: "común",
    conservationStatus: "estable",
  },
  {
    id: "merluza-negra",
    commonName: "merluza negra",
    scientificName: "Dissostichus eleginoides",
    category: "pez",
    habitat: ["aguas profundas", "talud continental"],
    averageSize: "60-150 cm",
    averageWeight: "5-50 kg",
    season: ["marzo-septiembre"],
    fishingMethod: ["palangre", "red de arrastre"],
    commercialValue: "alta",
    description:
      "Pez de aguas profundas de alto valor comercial. Requiere permisos especiales para su captura debido a su importancia económica.",
    minSize: "60 cm",
    region: ["comodoro rivadavia", "golfo san jorge"],
    imageUrl: "/placeholder.svg?height=200&width=300&text=Merluza+Negra+dark+fish+large+deep+water+elongated",
    identificationTips: [
      "Cuerpo robusto de color gris oscuro a negro",
      "Cabeza grande con boca amplia",
      "Escamas pequeñas y adherentes",
      "Aletas dorsales continuas",
      "Puede alcanzar gran tamaño",
    ],
    rarity: "poco común",
    conservationStatus: "vulnerable",
  },
  {
    id: "pulpo-comun",
    commonName: "pulpo común",
    scientificName: "Octopus tehuelchus",
    category: "molusco",
    habitat: ["fondos rocosos", "cuevas"],
    averageSize: "30-60 cm",
    averageWeight: "0.5-3 kg",
    season: ["marzo-noviembre"],
    fishingMethod: ["buceo libre", "buceo con aire comprimido", "nasas"],
    commercialValue: "alta",
    description:
      "Cefalópodo muy apreciado gastronómicamente. Habita cuevas y grietas rocosas, siendo una especie emblemática de la pesca artesanal patagónica.",
    minSize: "500 g",
    region: ["península valdés", "comodoro rivadavia", "golfo nuevo"],
    imageUrl:
      "/placeholder.svg?height=200&width=300&text=Pulpo+octopus+eight+arms+suction+cups+reddish+brown+tentacles",
    identificationTips: [
      "Ocho brazos con ventosas",
      "Color variable (rojo, marrón, gris)",
      "Cabeza bulbosa con ojos grandes",
      "Capacidad de cambiar color y textura",
      "Se esconde en grietas rocosas",
    ],
    rarity: "común",
    conservationStatus: "estable",
  },
  {
    id: "centolla",
    commonName: "centolla",
    scientificName: "Lithodes santolla",
    category: "crustaceo",
    habitat: ["fondos rocosos", "aguas frías"],
    averageSize: "15-25 cm",
    averageWeight: "1-4 kg",
    season: ["diciembre-julio"],
    fishingMethod: ["buceo", "nasas"],
    commercialValue: "alta",
    description:
      "Crustáceo de alto valor comercial conocido como el 'rey de los crustáceos'. Habita aguas frías del extremo sur de Argentina.",
    minSize: "12 cm caparazón",
    region: ["canal beagle", "estrecho de magallanes"],
    imageUrl: "/placeholder.svg?height=200&width=300&text=Centolla+king+crab+spiny+red+orange+large+claws+carapace",
    identificationTips: [
      "Caparazón espinoso de color rojo-naranja",
      "Patas largas y robustas",
      "Pinzas grandes y asimétricas",
      "Abdomen plegado bajo el cuerpo",
      "Espinas prominentes en el caparazón",
    ],
    rarity: "poco común",
    conservationStatus: "vulnerable",
  },
  // Agregar más especies aquí...
]

export function SpeciesWiki() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedRarity, setSelectedRarity] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const router = useRouter()
  const [showComparison, setShowComparison] = useState(false)
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null)

  const filteredSpecies = useMemo(() => {
    return speciesDatabase.filter((species) => {
      const matchesSearch =
        species.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        species.scientificName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "all" || species.category === selectedCategory
      const matchesRarity = selectedRarity === "all" || species.rarity === selectedRarity

      return matchesSearch && matchesCategory && matchesRarity
    })
  }, [searchTerm, selectedCategory, selectedRarity])

  const getCategoryColor = (category: string) => {
    const colors = {
      pez: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      molusco: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      crustaceo: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      equinodermo: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      alga: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      común: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "poco común": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      raro: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }
    return colors[rarity as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  if (showComparison) {
    return <SpeciesComparison onClose={() => setShowComparison(false)} />
  }
  if (selectedSpecies) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <Button variant="outline" onClick={() => setSelectedSpecies(null)} className="bg-transparent w-full sm:w-auto">
            ← Volver a la guía
          </Button>
          <Button variant="outline" onClick={() => setShowComparison(true)} className="bg-transparent w-full sm:w-auto">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Comparar especies
          </Button>
        </div>

        <Card className="glass-card">
          <CardContent className="p-3 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <img
                  src={selectedSpecies.imageUrl || "/placeholder.svg"}
                  alt={selectedSpecies.commonName}
                  className="w-full h-48 sm:h-64 object-cover rounded-lg border"
                />
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold capitalize dark:text-white">{selectedSpecies.commonName}</h1>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 italic">{selectedSpecies.scientificName}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getCategoryColor(selectedSpecies.category)}>{selectedSpecies.category}</Badge>
                  <Badge className={getRarityColor(selectedSpecies.rarity)}>{selectedSpecies.rarity}</Badge>
                  <Badge variant="outline" className="dark:border-gray-600">
                    {selectedSpecies.conservationStatus}
                  </Badge>
                </div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{selectedSpecies.description}</p>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 dark:text-white">Características físicas</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>Talla promedio:</strong> {selectedSpecies.averageSize}
                  </li>
                  <li>
                    <strong>Peso promedio:</strong> {selectedSpecies.averageWeight}
                  </li>
                  {selectedSpecies.minSize && (
                    <li>
                      <strong>Talla mínima legal:</strong>{" "}
                      <span className="text-red-600 font-medium">{selectedSpecies.minSize}</span>
                    </li>
                  )}
                  <li>
                    <strong>Valor comercial:</strong> {selectedSpecies.commercialValue}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 dark:text-white">Hábitat y distribución</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>Hábitat:</strong> {selectedSpecies.habitat.join(", ")}
                  </li>
                  <li>
                    <strong>Temporada:</strong> {selectedSpecies.season.join(", ")}
                  </li>
                  <li>
                    <strong>Regiones:</strong> {selectedSpecies.region.join(", ")}
                  </li>
                  <li>
                    <strong>Métodos de pesca:</strong> {selectedSpecies.fishingMethod.join(", ")}
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 dark:text-white">Guía de identificación</h3>
              <ul className="space-y-2">
                {selectedSpecies.identificationTips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
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
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-5 border-b border-border">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Guía de especies</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enciclopedia de especies marinas de la Patagonia argentina
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComparison(true)}
            className="gap-2"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span className="hidden sm:inline">Comparar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/guia-especies/nueva-especie")}
            className="gap-2"
          >
            <Fish className="w-4 h-4" />
            Sugerir especie
          </Button>
        </div>
      </div>

      {/* ── Toolbar: búsqueda + filtros ──────────────────────────────── */}
      <div className="py-4 space-y-3">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nombre común o científico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 themed-input"
          />
        </div>

        {/* Filtros + controles */}
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />

          {/* Categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Todas las categorías</option>
            <option value="pez">Peces</option>
            <option value="molusco">Moluscos</option>
            <option value="crustaceo">Crustáceos</option>
            <option value="equinodermo">Equinodermos</option>
            <option value="alga">Algas</option>
          </select>

          {/* Frecuencia */}
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Todas las frecuencias</option>
            <option value="común">Común</option>
            <option value="poco común">Poco común</option>
            <option value="raro">Raro</option>
          </select>

          {/* Separador y contador */}
          <Separator orientation="vertical" className="h-5 hidden sm:block" />
          <span className="text-sm text-muted-foreground ml-auto sm:ml-0">
            {filteredSpecies.length} especie{filteredSpecies.length !== 1 ? "s" : ""}
          </span>

          {/* Vista */}
          <div className="flex items-center border border-input rounded-md overflow-hidden ml-auto sm:ml-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
              title="Vista cuadrícula"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
              title="Vista lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chips de filtro activos */}
        {(selectedCategory !== "all" || selectedRarity !== "all" || searchTerm) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Filtros activos:</span>
            {searchTerm && (
              <Badge variant="secondary" className="gap-1 cursor-pointer text-xs" onClick={() => setSearchTerm("")}>
                "{searchTerm}" ×
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="gap-1 cursor-pointer text-xs" onClick={() => setSelectedCategory("all")}>
                {selectedCategory} ×
              </Badge>
            )}
            {selectedRarity !== "all" && (
              <Badge variant="secondary" className="gap-1 cursor-pointer text-xs" onClick={() => setSelectedRarity("all")}>
                {selectedRarity} ×
              </Badge>
            )}
            <button
              onClick={() => { setSearchTerm(""); setSelectedCategory("all"); setSelectedRarity("all") }}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              Limpiar todo
            </button>
          </div>
        )}
      </div>

      {/* ── Grid / List ─────────────────────────────────────────────── */}
      {filteredSpecies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Fish className="w-14 h-14 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">Sin resultados</p>
          <p className="text-sm text-muted-foreground">Ajusta los filtros o el término de búsqueda</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpecies.map((species) => (
            <Card
              key={species.id}
              className="glass-card group cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-200 overflow-hidden"
              onClick={() => setSelectedSpecies(species)}
            >
              <div className="relative">
                <img
                  src={species.imageUrl || "/placeholder.svg"}
                  alt={species.commonName}
                  className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-semibold capitalize text-white text-base leading-tight truncate">
                    {species.commonName}
                  </h3>
                  <p className="text-white/70 italic text-xs truncate">{species.scientificName}</p>
                </div>
              </div>
              <CardContent className="p-3 space-y-2">
                <div className="flex flex-wrap gap-1">
                  <Badge className={`${getCategoryColor(species.category)} text-xs`} variant="secondary">
                    {species.category}
                  </Badge>
                  <Badge className={`${getRarityColor(species.rarity)} text-xs`} variant="secondary">
                    {species.rarity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{species.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                  <span>{species.averageSize}</span>
                  <span className="flex items-center gap-1 text-primary font-medium">
                    Ver ficha <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
          {filteredSpecies.map((species) => (
            <div
              key={species.id}
              className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors group"
              onClick={() => setSelectedSpecies(species)}
            >
              <img
                src={species.imageUrl || "/placeholder.svg"}
                alt={species.commonName}
                className="w-16 h-16 object-cover rounded-lg border border-border flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold capitalize text-sm truncate">{species.commonName}</h3>
                  <Badge className={`${getCategoryColor(species.category)} text-xs`} variant="secondary">
                    {species.category}
                  </Badge>
                  <Badge className={`${getRarityColor(species.rarity)} text-xs`} variant="secondary">
                    {species.rarity}
                  </Badge>
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
