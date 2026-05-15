"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeftRight, X, Plus, AlertTriangle, CheckCircle } from "lucide-react"

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
}

// Extended species data with comparison information
const speciesDatabase: Species[] = [
  {
    id: "merluza-comun",
    commonName: "Merluza Común",
    scientificName: "Merluccius hubbsi",
    category: "pez",
    habitat: ["plataforma continental", "aguas profundas"],
    averageSize: "30-60 cm",
    averageWeight: "0.5-3 kg",
    season: ["todo el año"],
    fishingMethod: ["red de arrastre", "red de enmalle", "línea"],
    commercialValue: "alta",
    description: "Especie de gran importancia comercial en Argentina. Habita aguas frías de la plataforma continental.",
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
    keyDifferences: [
      "Dos aletas dorsales claramente separadas",
      "Dientes más pequeños que merluza negra",
      "Color plateado brillante",
      "Tamaño menor que merluza negra",
    ],
    similarSpecies: ["merluza-negra", "abadejo"],
  },
  {
    id: "merluza-negra",
    commonName: "Merluza Negra",
    scientificName: "Dissostichus eleginoides",
    category: "pez",
    habitat: ["aguas profundas", "talud continental"],
    averageSize: "60-150 cm",
    averageWeight: "5-50 kg",
    season: ["marzo-septiembre"],
    fishingMethod: ["palangre", "red de arrastre"],
    commercialValue: "alta",
    description: "Pez de aguas profundas de alto valor comercial. Requiere permisos especiales para su captura.",
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
    keyDifferences: [
      "Color gris oscuro a negro",
      "Aletas dorsales continuas (no separadas)",
      "Mucho mayor tamaño que merluza común",
      "Dientes más grandes y prominentes",
      "Habita aguas más profundas",
    ],
    similarSpecies: ["merluza-comun", "abadejo"],
  },
  {
    id: "abadejo",
    commonName: "Abadejo",
    scientificName: "Genypterus blacodes",
    category: "pez",
    habitat: ["fondos rocosos", "plataforma continental"],
    averageSize: "40-80 cm",
    averageWeight: "1-5 kg",
    season: ["abril-octubre"],
    fishingMethod: ["línea", "red de enmalle"],
    commercialValue: "alta",
    description: "Pez de fondo de carne blanca muy apreciada. Común en fondos rocosos.",
    minSize: "40 cm",
    region: ["península valdés", "golfo san jorge"],
    imageUrl: "/placeholder.svg?height=200&width=300&text=Abadejo+fish+elongated+brown+mottled+pattern+bottom+dweller",
    identificationTips: [
      "Cuerpo alargado tipo anguila",
      "Color marrón con manchas irregulares",
      "Aleta dorsal muy larga",
      "Barbilla prominente en el mentón",
      "Piel lisa sin escamas visibles",
    ],
    keyDifferences: [
      "Cuerpo tipo anguila (más alargado)",
      "Barbilla prominente en el mentón",
      "Una sola aleta dorsal muy larga",
      "Color marrón moteado",
      "Piel lisa sin escamas aparentes",
    ],
    similarSpecies: ["merluza-comun", "merluza-negra"],
  },
  {
    id: "pulpo-comun",
    commonName: "Pulpo Común",
    scientificName: "Octopus tehuelchus",
    category: "molusco",
    habitat: ["fondos rocosos", "cuevas"],
    averageSize: "30-60 cm",
    averageWeight: "0.5-3 kg",
    season: ["marzo-noviembre"],
    fishingMethod: ["buceo libre", "buceo con aire comprimido", "nasas"],
    commercialValue: "alta",
    description: "Cefalópodo muy apreciado gastronómicamente. Habita cuevas y grietas rocosas.",
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
    keyDifferences: [
      "Ocho brazos (no diez como calamar)",
      "Cuerpo más redondeado y blando",
      "Brazos más gruesos y musculosos",
      "Ventosas en toda la longitud del brazo",
      "Comportamiento más sedentario",
    ],
    similarSpecies: ["calamar-illex"],
  },
  {
    id: "calamar-illex",
    commonName: "Calamar Illex",
    scientificName: "Illex argentinus",
    category: "molusco",
    habitat: ["aguas pelágicas", "plataforma continental"],
    averageSize: "15-35 cm",
    averageWeight: "0.1-0.8 kg",
    season: ["febrero-julio"],
    fishingMethod: ["jigger", "red de arrastre"],
    commercialValue: "alta",
    description: "Calamar de gran importancia comercial. Forma cardúmenes en aguas abiertas.",
    region: ["golfo san jorge", "península valdés"],
    imageUrl: "/placeholder.svg?height=200&width=300&text=Calamar+squid+elongated+body+ten+tentacles+fins+translucent",
    identificationTips: [
      "Cuerpo alargado y translúcido",
      "Diez tentáculos (8 brazos + 2 largos)",
      "Aletas triangulares en la parte posterior",
      "Color rosado a transparente",
      "Ojos grandes y prominentes",
    ],
    keyDifferences: [
      "Diez tentáculos (dos más largos para captura)",
      "Cuerpo más alargado y firme",
      "Aletas triangulares en la parte posterior",
      "Nada activamente en aguas abiertas",
      "Ventosas solo en los extremos de tentáculos",
    ],
    similarSpecies: ["pulpo-comun"],
  },
  {
    id: "mejillon",
    commonName: "Mejillón",
    scientificName: "Mytilus edulis platensis",
    category: "molusco",
    habitat: ["intermareales", "rocas", "muelles"],
    averageSize: "5-12 cm",
    averageWeight: "0.02-0.1 kg",
    season: ["todo el año"],
    fishingMethod: ["recolección manual", "buceo"],
    commercialValue: "media",
    description: "Bivalvo filtrador común en costas rocosas. Importante para acuicultura.",
    minSize: "5 cm",
    region: ["península valdés", "golfo nuevo", "comodoro rivadavia"],
    imageUrl: "/placeholder.svg?height=200&width=300&text=Mejillón+mussel+dark+blue+shell+bivalve+attached+rocks",
    identificationTips: [
      "Concha alargada de color azul oscuro",
      "Forma de lágrima característica",
      "Se adhiere a rocas con filamentos",
      "Interior nacarado",
      "Forma colonias densas",
    ],
    keyDifferences: [
      "Concha lisa de color azul oscuro",
      "Forma más alargada y estrecha",
      "Tamaño generalmente menor",
      "Superficie lisa sin estrías pronunciadas",
      "Se adhiere con biso más fino",
    ],
    similarSpecies: ["cholga"],
  },
  {
    id: "cholga",
    commonName: "Cholga",
    scientificName: "Aulacomya atra",
    category: "molusco",
    habitat: ["intermareales", "rocas"],
    averageSize: "8-15 cm",
    averageWeight: "0.05-0.2 kg",
    season: ["todo el año"],
    fishingMethod: ["recolección manual", "buceo"],
    commercialValue: "media",
    description: "Bivalvo de concha negra, común en costas patagónicas.",
    minSize: "6 cm",
    region: ["península valdés", "golfo nuevo"],
    imageUrl: "/placeholder.svg?height=200&width=300&text=Cholga+black+mussel+ribbed+shell+bivalve+rocky+shore",
    identificationTips: [
      "Concha negra con estrías radiales",
      "Más grande que el mejillón común",
      "Forma más redondeada",
      "Superficie rugosa",
      "Interior blanco nacarado",
    ],
    keyDifferences: [
      "Concha negra con estrías radiales marcadas",
      "Forma más ancha y redondeada",
      "Tamaño generalmente mayor",
      "Superficie rugosa con costillas",
      "Biso más grueso y resistente",
    ],
    similarSpecies: ["mejillon"],
  },
  {
    id: "centolla",
    commonName: "Centolla",
    scientificName: "Lithodes santolla",
    category: "crustaceo",
    habitat: ["fondos rocosos", "aguas frías"],
    averageSize: "15-25 cm",
    averageWeight: "1-4 kg",
    season: ["diciembre-julio"],
    fishingMethod: ["buceo", "nasas"],
    commercialValue: "alta",
    description: "Crustáceo de alto valor comercial. Habita aguas frías del sur de Argentina.",
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
    keyDifferences: [
      "Espinas largas y prominentes en caparazón",
      "Color rojo-naranja brillante",
      "Tamaño mayor que centollón",
      "Pinzas más grandes y asimétricas",
      "Espinas más afiladas y numerosas",
    ],
    similarSpecies: ["centollon"],
  },
  {
    id: "centollon",
    commonName: "Centollón",
    scientificName: "Paralomis granulosa",
    category: "crustaceo",
    habitat: ["fondos rocosos", "aguas profundas"],
    averageSize: "12-20 cm",
    averageWeight: "0.8-2.5 kg",
    season: ["todo el año"],
    fishingMethod: ["buceo", "nasas"],
    commercialValue: "alta",
    description: "Crustáceo similar a la centolla pero de menor tamaño. Muy apreciado gastronómicamente.",
    minSize: "10 cm caparazón",
    region: ["comodoro rivadavia", "golfo san jorge"],
    imageUrl: "/placeholder.svg?height=200&width=300&text=Centollón+false+king+crab+granular+texture+smaller+spines",
    identificationTips: [
      "Similar a centolla pero más pequeño",
      "Caparazón con textura granular",
      "Espinas menos pronunciadas",
      "Color más apagado",
      "Patas proporcionalmente más cortas",
    ],
    keyDifferences: [
      "Textura granular (no espinas largas)",
      "Color más apagado y parduzco",
      "Tamaño menor que centolla",
      "Espinas más cortas y romas",
      "Caparazón más liso en general",
    ],
    similarSpecies: ["centolla"],
  },
]

// Predefined comparison groups for commonly confused species
const comparisonGroups = [
  {
    name: "Merluzas y Peces Alargados",
    description: "Especies que se confunden por su forma alargada",
    species: ["merluza-comun", "merluza-negra", "abadejo"],
  },
  {
    name: "Cefalópodos",
    description: "Pulpos y calamares - diferencias clave",
    species: ["pulpo-comun", "calamar-illex"],
  },
  {
    name: "Mejillones",
    description: "Bivalvos similares de zonas rocosas",
    species: ["mejillon", "cholga"],
  },
  {
    name: "Centollas",
    description: "Crustáceos espinosos de alto valor",
    species: ["centolla", "centollon"],
  },
]

interface SpeciesComparisonProps {
  onClose?: () => void
}

export function SpeciesComparison({ onClose }: SpeciesComparisonProps) {
  const [selectedSpecies, setSelectedSpecies] = useState<Species[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>("")

  const handleAddSpecies = (speciesId: string) => {
    const species = speciesDatabase.find((s) => s.id === speciesId)
    if (species && !selectedSpecies.find((s) => s.id === speciesId) && selectedSpecies.length < 3) {
      setSelectedSpecies([...selectedSpecies, species])
    }
  }

  const handleRemoveSpecies = (speciesId: string) => {
    setSelectedSpecies(selectedSpecies.filter((s) => s.id !== speciesId))
  }

  const handleLoadGroup = (groupName: string) => {
    const group = comparisonGroups.find((g) => g.name === groupName)
    if (group) {
      const groupSpecies = group.species
        .map((id) => speciesDatabase.find((s) => s.id === id))
        .filter((s): s is Species => s !== undefined)
      setSelectedSpecies(groupSpecies)
      setSelectedGroup(groupName)
    }
  }

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2 flex items-center">
            <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Comparación de especies
          </h3>
          <p className="text-sm text-gray-600">Compara especies similares para identificar diferencias clave</p>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
            <X className="w-4 h-4 mr-2 sm:mr-0" />
            <span className="sm:hidden">Cerrar</span>
          </Button>
        )}
      </div>

      {/* Quick Comparison Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Comparaciones comunes</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {comparisonGroups.map((group) => (
              <Button
                key={group.name}
                variant="outline"
                className="justify-start h-auto p-3 bg-transparent text-left"
                onClick={() => handleLoadGroup(group.name)}
              >
                <div className="w-full">
                  <div className="font-medium text-sm">{group.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{group.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manual Species Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Selección Manual</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
            <Select onValueChange={handleAddSpecies}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Agregar especie..." />
              </SelectTrigger>
              <SelectContent>
                {speciesDatabase
                  .filter((species) => !selectedSpecies.find((s) => s.id === species.id))
                  .map((species) => (
                    <SelectItem key={species.id} value={species.id}>
                      <span className="block sm:hidden">{species.commonName}</span>
                      <span className="hidden sm:block">{species.commonName} ({species.scientificName})</span>
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

      {/* Comparison Results */}
      {selectedSpecies.length >= 2 && (
        <div className="space-y-4 sm:space-y-6">
          {/* Side-by-side Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Comparación Visual</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className={`grid gap-3 sm:gap-4 ${selectedSpecies.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : selectedSpecies.length === 3
                    ? "grid-cols-1 sm:grid-cols-3 lg:grid-cols-3"
                    : "grid-cols-3"
                }`}>
                {selectedSpecies.map((species) => (
                  <div key={species.id} className="text-center">
                    <img
                      src={species.imageUrl || "/placeholder.svg"}
                      alt={species.commonName}
                      className="w-full h-32 sm:h-48 object-cover rounded-lg border mb-2 sm:mb-3"
                    />
                    <h4 className="font-semibold text-sm sm:text-base">{species.commonName}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 italic truncate">{species.scientificName}</p>
                    <div className="flex justify-center space-x-1 mt-2">
                      <Badge className={`${getCategoryColor(species.category)} text-xs`} variant="secondary">
                        {species.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Características comparativas</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-4">
                {selectedSpecies.map((species, index) => (
                  <Card key={species.id} className="border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-3">
                      <h4 className="font-semibold text-sm mb-3 text-center bg-gray-50 dark:bg-gray-800 py-2 rounded">
                        {species.commonName}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Tamaño:</span>
                          <span>{species.averageSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Peso:</span>
                          <span>{species.averageWeight}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Hábitat:</span>
                          <span className="text-right flex-1 ml-2">{species.habitat.join(", ")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Temporada:</span>
                          <span className="text-right flex-1 ml-2">{species.season.join(", ")}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Valor comercial:</span>
                          <Badge className={`${getCommercialValueColor(species.commercialValue)} text-xs`} variant="secondary">
                            {species.commercialValue}
                          </Badge>
                        </div>
                        {species.minSize && (
                          <div className="flex justify-between">
                            <span className="font-medium">Talla mínima:</span>
                            <span className="text-red-600 font-medium">{species.minSize}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Característica</th>
                      {selectedSpecies.map((species) => (
                        <th key={species.id} className="text-left py-2 font-medium min-w-32 lg:min-w-48">
                          {species.commonName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr className="border-b">
                      <td className="py-3 font-medium">Tamaño promedio</td>
                      {selectedSpecies.map((species) => (
                        <td key={species.id} className="py-3">
                          {species.averageSize}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium">Peso promedio</td>
                      {selectedSpecies.map((species) => (
                        <td key={species.id} className="py-3">
                          {species.averageWeight}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium">Hábitat</td>
                      {selectedSpecies.map((species) => (
                        <td key={species.id} className="py-3">
                          {species.habitat.join(", ")}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium">Temporada</td>
                      {selectedSpecies.map((species) => (
                        <td key={species.id} className="py-3">
                          {species.season.join(", ")}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium">Valor comercial</td>
                      {selectedSpecies.map((species) => (
                        <td key={species.id} className="py-3">
                          <Badge className={`${getCommercialValueColor(species.commercialValue)} text-xs`} variant="secondary">
                            {species.commercialValue}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    {selectedSpecies.some((s) => s.minSize) && (
                      <tr className="border-b">
                        <td className="py-3 font-medium">Talla mínima legal</td>
                        {selectedSpecies.map((species) => (
                          <td key={species.id} className="py-3">
                            {species.minSize ? (
                              <span className="text-red-600 font-medium">{species.minSize}</span>
                            ) : (
                              <span className="text-gray-400">No aplica</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Key Differences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Diferencias clave para identificación
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className={`grid gap-3 sm:gap-4 ${selectedSpecies.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : selectedSpecies.length === 3
                    ? "grid-cols-1 sm:grid-cols-3 lg:grid-cols-3"
                    : "grid-cols-3"
                }`}>
                {selectedSpecies.map((species) => (
                  <div key={species.id} className="space-y-3">
                    <h4 className="font-semibold text-center text-sm sm:text-base bg-gray-50 dark:bg-gray-800 py-2 rounded">
                      {species.commonName}
                    </h4>
                    <div className="space-y-2">
                      {species.keyDifferences?.map((difference, index) => (
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

          {/* Identification Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Consejos de identificación</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className={`grid gap-3 sm:gap-4 ${selectedSpecies.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : selectedSpecies.length === 3
                    ? "grid-cols-1 sm:grid-cols-3 lg:grid-cols-3"
                    : "grid-cols-3"
                }`}>
                {selectedSpecies.map((species) => (
                  <div key={species.id} className="space-y-3">
                    <h4 className="font-semibold text-center text-sm sm:text-base bg-blue-50 dark:bg-blue-900 py-2 rounded">
                      {species.commonName}
                    </h4>
                    <ul className="space-y-2">
                      {species.identificationTips.map((tip, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-xs sm:text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
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
            <p className="text-gray-500 text-sm sm:text-base">Selecciona al menos 2 especies para comenzar la comparación</p>
          </CardContent>
        </Card>
      )}

      {selectedSpecies.length === 0 && (
        <Card>
          <CardContent className="text-center py-6 sm:py-8">
            <Plus className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4 text-sm sm:text-base">Selecciona un grupo de comparación común o agrega especies manualmente</p>
            <p className="text-xs sm:text-sm text-gray-400">Puedes comparar hasta 3 especies simultáneamente</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
