"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Fish, Calendar, Layers, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { listFishingEntries } from "@/lib/entries/repository"
import type { FishingEntry } from "@/lib/entries/types"

interface MapInstance {
  setView: (coords: [number, number], zoom: number) => void
  getZoom: () => number
  zoomIn: () => void
  zoomOut: () => void
  remove: () => void
}

type MapFishingEntry = {
  id: string | number
  date: string
  timestamp: number
  location: string
  coordinates: [number, number]
  species: string[]
  totalWeight: number
  method: string
  depth: number
  weather: string
}

const parseNumber = (value: unknown): number => {
  if (typeof value === "number") return value
  if (typeof value !== "string") return 0

  const parsed = Number.parseFloat(value.replace(",", "."))
  return Number.isNaN(parsed) ? 0 : parsed
}

const getEntryTimestamp = (entry: Pick<FishingEntry, "date" | "startTime">): number => {
  if (!entry.date) return 0
  const timestamp = new Date(`${entry.date}T${entry.startTime || "00:00"}`).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const mapEntryToMapItem = (entry: FishingEntry): MapFishingEntry | null => {
  const coordinates = entry.coordinates
  if (!coordinates || coordinates.length < 2) return null

  const speciesFromCatches = (entry.catches || [])
    .map((item) => item.commonName || item.scientificName)
    .filter((item): item is string => Boolean(item))

  const species = speciesFromCatches.length > 0
    ? speciesFromCatches
    : (entry.species || "")
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

  const totalWeight = (entry.catches || []).reduce((acc, item) => acc + parseNumber(item.weight), 0)
  // TODO: Argregar boton de aceptar y cancelar
  return {
    id: entry.id,
    date: entry.date || "Sin fecha",
    timestamp: getEntryTimestamp(entry),
    location: entry.area || entry.location || "Ubicación no registrada",
    coordinates,
    species,
    totalWeight,
    method: entry.method || "sin dato",
    depth: parseNumber(entry.depth),
    weather: entry.weather || "sin dato",
  }
}

export function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<MapInstance | null>(null)
  const markersRef = useRef<any[]>([])
  const [fishingEntries, setFishingEntries] = useState<MapFishingEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<MapFishingEntry | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [showLayers, setShowLayers] = useState(false)
  const [activeLayer, setActiveLayer] = useState("satellite")
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadEntries = async () => {
      try {
        const entries = await listFishingEntries()
        if (!isMounted) return

        const mappedEntries = entries
          .map(mapEntryToMapItem)
          .filter((entry): entry is MapFishingEntry => entry !== null)
          .sort((a, b) => b.timestamp - a.timestamp)

        setFishingEntries(mappedEntries)
        setSelectedEntry((current) => {
          if (mappedEntries.length === 0) return null
          if (current && mappedEntries.some((entry) => entry.id === current.id)) {
            return mappedEntries.find((entry) => entry.id === current.id) || mappedEntries[0]
          }
          return mappedEntries[0]
        })
      } catch (error) {
        console.error("No se pudieron cargar entradas para el mapa:", error)
      }
    }

    loadEntries()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    let isCancelled = false

    const handleLeafletLoadError = () => {
      if (isCancelled) return
      setMapError("Error al cargar el mapa")
      setMapLoaded(false)
    }

    // Cargar Leaflet dinámicamente
    const initializeMap = () => {
      if (!window.L || !mapRef.current || isCancelled || mapInstanceRef.current) return

      try {
        // Evita el error "Map container is already initialized" en remounts de Strict Mode.
        const container = mapRef.current as HTMLDivElement & { _leaflet_id?: number }
        if (container._leaflet_id) {
          container._leaflet_id = undefined
        }

        // Crear el mapa centrado en Península Valdés
        const map = window.L.map(container, {
          center: [-42.7, -64.8],
          zoom: 8,
          zoomControl: false, // Desactivar controles por defecto
        })

        // Capas de mapa
        const layers = {
          satellite: window.L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
              attribution: "© Esri",
              maxZoom: 18,
            },
          ),
          street: window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 18,
          }),
          ocean: window.L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",
            {
              attribution: "© Esri",
              maxZoom: 16,
            },
          ),
        }

        // Agregar capa inicial
        layers.satellite.addTo(map)

        // Crear marcadores para cada entrada
        fishingEntries.forEach((entry) => {
          const marker = window.L.marker([entry.coordinates[0], entry.coordinates[1]])

          // Crear popup personalizado
          const popupContent = `
            <div class="p-3 min-w-64">
              <h3 class="font-semibold text-lg mb-2">${entry.location}</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Fecha:</span>
                  <span class="font-medium">${entry.date}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Método:</span>
                  <span class="font-medium capitalize">${entry.method}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Captura:</span>
                  <span class="font-medium">${entry.totalWeight} kg</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Profundidad:</span>
                  <span class="font-medium">${entry.depth} m</span>
                </div>
                <div class="mt-3">
                  <span class="text-gray-600">Especies:</span>
                  <div class="flex flex-wrap gap-1 mt-1">
                    ${entry.species.map((species) => `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs capitalize">${species}</span>`).join("")}
                  </div>
                </div>
              </div>
            </div>
          `

          marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: "custom-popup",
          })

          // Evento click en marcador
          marker.on("click", () => {
            setSelectedEntry(entry)
          })

          marker.addTo(map)
          markersRef.current.push(marker)
        })

        // Guardar referencia del mapa
        mapInstanceRef.current = map
        setMapLoaded(true)

        // Función para cambiar capas
        window.switchMapLayer = (layerName: string) => {
          Object.values(layers).forEach((layer) => map.removeLayer(layer))
          layers[layerName as keyof typeof layers].addTo(map)
          setActiveLayer(layerName)
        }
      } catch (error) {
        console.error("Error initializing map:", error)
        if (!isCancelled) {
          setMapError("Error al inicializar el mapa")
          setMapLoaded(false)
        }
      }
    }

    const loadLeaflet = async () => {
      // Cargar CSS de Leaflet una sola vez
      const cssHref = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      const existingCss = document.querySelector(`link[href=\"${cssHref}\"]`)
      if (!existingCss) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = cssHref
        document.head.appendChild(link)
      }

      // Si Leaflet ya está disponible, inicializar directamente
      if (window.L) {
        initializeMap()
        return
      }

      // Reutilizar script existente para evitar doble carga e inicialización múltiple
      const existingScript = document.querySelector('script[data-leaflet="true"]') as HTMLScriptElement | null
      if (existingScript) {
        existingScript.addEventListener("load", initializeMap, { once: true })
        existingScript.addEventListener("error", handleLeafletLoadError, { once: true })
        return
      }

      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.dataset.leaflet = "true"
      script.onload = () => initializeMap()
      script.onerror = handleLeafletLoadError
      document.head.appendChild(script)
    }

    loadLeaflet()

    return () => {
      isCancelled = true

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      if (mapRef.current) {
        const container = mapRef.current as HTMLDivElement & { _leaflet_id?: number }
        container._leaflet_id = undefined
      }

      markersRef.current = []
    }
  }, [fishingEntries])

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut()
    }
  }

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-42.7, -64.8], 8)
    }
  }

  const handleLayerChange = (layerName: string) => {
    if (window.switchMapLayer) {
      window.switchMapLayer(layerName)
    }
    setShowLayers(false)
  }

  const getMethodColor = (method: string) => {
    const colors = {
      buceo: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      red: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      nasas: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "buceo libre": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
    }
    return colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getWeatherColor = (weather: string) => {
    const colors = {
      excelentes: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      buenas: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      regulares: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      malas: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }
    return colors[weather as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Mapa principal */}
      <div className="xl:col-span-4">
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Mapa de zonas de pesca
                </CardTitle>
                <CardDescription>
                  Ubicaciones de entradas recientes con detalles de captura
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLayers(!showLayers)}
                    className="bg-transparent"
                  >
                    <Layers className="w-4 h-4 mr-2" />
                    Capas
                  </Button>
                  {showLayers && (
                    <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-[1000] min-w-32">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => handleLayerChange("satellite")}
                          className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${activeLayer === "satellite" ? "bg-blue-100 dark:bg-blue-900" : ""
                            }`}
                        >
                          Satélite
                        </button>
                        <button
                          onClick={() => handleLayerChange("street")}
                          className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${activeLayer === "street" ? "bg-blue-100 dark:bg-blue-900" : ""
                            }`}
                        >
                          Calles
                        </button>
                        <button
                          onClick={() => handleLayerChange("ocean")}
                          className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${activeLayer === "ocean" ? "bg-blue-100 dark:bg-blue-900" : ""
                            }`}
                        >
                          Océano
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 relative">
            <div className="relative bg-gray-100 dark:bg-gray-700 rounded-b-lg overflow-hidden">
              <div
                ref={mapRef}
                className="w-full h-[26rem] sm:h-[30rem] xl:h-[34rem] rounded-b-lg"
                style={{ minHeight: "420px", maxHeight: "640px" }}
              />

              {/* Controles de zoom */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2 z-[1000]">
                <Button size="sm" variant="outline" onClick={handleZoomIn} className="bg-white dark:bg-gray-800">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleZoomOut} className="bg-white dark:bg-gray-800">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleResetView} className="bg-white dark:bg-gray-800">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* Leyenda */}
              <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg z-[1000] border dark:border-gray-700">
                <h4 className="font-medium text-sm mb-2 dark:text-white">Leyenda</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="dark:text-gray-300">Ubicaciones de pesca</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3 text-blue-500" />
                    <span className="dark:text-gray-300">Haz clic para detalles</span>
                  </div>
                </div>
              </div>

              {!mapLoaded && !mapError && (
                <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 rounded-b-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cargando mapa...</p>
                  </div>
                </div>
              )}

              {mapError && (
                <div className="absolute inset-0 bg-red-100 dark:bg-red-700 rounded-b-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-red-600 dark:text-red-400">{mapError}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {selectedEntry && (
          <Card className="glass-card mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Fish className="w-4 h-4 mr-2" />
                Desglose del punto seleccionado
              </CardTitle>
              <CardDescription>
                Haz clic en un punto del mapa o en una entrada para ver su detalle completo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedEntry.location}</h3>
                    <p className="text-sm text-muted-foreground">{selectedEntry.date}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getMethodColor(selectedEntry.method)} variant="secondary">
                      {selectedEntry.method}
                    </Badge>
                    <Badge className={getWeatherColor(selectedEntry.weather)} variant="secondary">
                      {selectedEntry.weather}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <p className="text-muted-foreground mb-1">Captura total</p>
                    <p className="font-semibold">{selectedEntry.totalWeight} kg</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <p className="text-muted-foreground mb-1">Profundidad</p>
                    <p className="font-semibold">{selectedEntry.depth} m</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <p className="text-muted-foreground mb-1">Latitud</p>
                    <p className="font-semibold">{selectedEntry.coordinates[0].toFixed(4)}°</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <p className="text-muted-foreground mb-1">Longitud</p>
                    <p className="font-semibold">{selectedEntry.coordinates[1].toFixed(4)}°</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Especies registradas</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.species.map((species, index) => (
                      <Badge key={index} variant="outline" className="capitalize dark:border-gray-600">
                        {species}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Panel lateral con detalles */}
      <div className="space-y-4 xl:col-span-4">
        {/* Lista de entradas */}
        {fishingEntries.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Entradas recientes
              </CardTitle>
              <CardDescription>
                Haz clic en una entrada para verla en el mapa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fishingEntries.slice(0, 8).map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedEntry?.id === entry.id
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      }`}
                    onClick={() => {
                      setSelectedEntry(entry)
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([entry.coordinates[0], entry.coordinates[1]], 12)
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium dark:text-white">{entry.location}</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{entry.date}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <Badge className={getMethodColor(entry.method)} variant="secondary">
                        {entry.method}
                      </Badge>
                      <span className="font-medium dark:text-gray-300">{entry.totalWeight} kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Declaración global para TypeScript
declare global {
  interface Window {
    L: any
    switchMapLayer: (layerName: string) => void
  }
}
