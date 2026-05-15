"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Clock, Fish, Save, Plus, Minus, Users, Navigation, Map as MapIcon, Pencil, ChevronDown } from "lucide-react"
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps"
import { SpeciesSelector } from "./species-selector"
import { useWeather } from "@/components/weather-provider"
import { listFishingEntries, queueFailedFishingEntry, saveFishingEntry } from "@/lib/entries/repository"

type Coordinates = { lat: number; lng: number }

const DEFAULT_COORDINATES: Coordinates = { lat: -42.7692, lng: -65.0385 }

const formatCoordinateLabel = (lat: number, lng: number) => `${lat.toFixed(6)}°, ${lng.toFixed(6)}°`
const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()

const PRODUCTION_TRIGGER_TERMS = ["vieira", "viera", "aequipecten", "tehuelchus", "scallop"]

export function LogbookEntry() {
  const { weatherSnapshot, refreshWeather, resetWeather } = useWeather()
  const [fishingGear, setFishingGear] = useState("")
  const [currentLocation, setCurrentLocation] = useState("Sin ubicación seleccionada")
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [locationError, setLocationError] = useState("")
  const [locationSource, setLocationSource] = useState("Pendiente")
  const [manualLat, setManualLat] = useState("")
  const [manualLng, setManualLng] = useState("")
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false)
  const [pendingCoordinates, setPendingCoordinates] = useState<Coordinates | null>(null)
  const [mapCenter, setMapCenter] = useState<Coordinates>(DEFAULT_COORDINATES)
  const [sailors, setSailors] = useState([{ name: "", divingTime: "" }])
  const [selectedSpecies, setSelectedSpecies] = useState<any[]>([])
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  // Inicializar date y time solo en el cliente para evitar hydration mismatch
  const [areaSuggestions, setAreaSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useEffect(() => {
    let isMounted = true

    if (date === "") setDate(new Date().toISOString().split("T")[0]);
    if (time === "") setTime(new Date().toTimeString().slice(0, 5));
    if (endTime === "") setEndTime(new Date().toTimeString().slice(0, 5));

    const loadAreaSuggestions = async () => {
      try {
        const entries = await listFishingEntries()
        if (!isMounted) return

        const areas = Array.from(new Set(entries.map((entry) => entry.area).filter((value): value is string => Boolean(value))))
        setAreaSuggestions(areas)
      } catch (error) {
        console.error("No se pudieron cargar sugerencias de áreas:", error)
      }
    }

    loadAreaSuggestions()

    return () => {
      isMounted = false
    }
  }, []);

  // Campos de producción
  const [sacoMuestras, setSacoMuestras] = useState("");
  const [kgPulpaVieira, setKgPulpaVieira] = useState("");
  const [numBolsas, setNumBolsas] = useState("");
  const [kgPorBolsa, setKgPorBolsa] = useState("");
  const [rindePulpaVieira, setRindePulpaVieira] = useState("");
  const [skipper, setSkipper] = useState("")
  const [area, setArea] = useState("")
  const [depth, setDepth] = useState("")
  const [crewWages, setCrewWages] = useState("");
  const [fuelConsumption, setFuelConsumption] = useState("");
  const [weather, setWeather] = useState("");
  const [observations, setObservations] = useState("");
  const isProductionEnabled = selectedSpecies.some((species: any) => {
    const searchableText = normalizeText(
      `${species?.name || ""} ${species?.commonName || ""} ${species?.scientificName || ""}`,
    )

    return PRODUCTION_TRIGGER_TERMS.some((term) => searchableText.includes(term))
  })

  const updateLocationCoordinates = (nextCoordinates: Coordinates, source: string) => {
    setCoordinates(nextCoordinates)
    setMapCenter(nextCoordinates)
    setCurrentLocation(formatCoordinateLabel(nextCoordinates.lat, nextCoordinates.lng))
    setManualLat(nextCoordinates.lat.toFixed(6))
    setManualLng(nextCoordinates.lng.toFixed(6))
    setLocationSource(source)
    setLocationError("")
  }

  const applyManualLocation = () => {
    const parsedLat = Number.parseFloat(manualLat)
    const parsedLng = Number.parseFloat(manualLng)

    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      setLocationError("Ingresa latitud y longitud válidas")
      return
    }

    if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
      setLocationError("Las coordenadas están fuera de rango")
      return
    }

    updateLocationCoordinates({ lat: parsedLat, lng: parsedLng }, "Carga manual")
  }

  const openMapDialog = () => {
    setPendingCoordinates(coordinates || mapCenter)
    setIsMapDialogOpen(true)
  }

  const closeMapDialog = () => {
    setIsMapDialogOpen(false)
    setPendingCoordinates(null)
  }

  const confirmMapSelection = () => {
    if (pendingCoordinates) {
      updateLocationCoordinates(pendingCoordinates, "Punto marcado en mapa")
    }
    closeMapDialog()
  }

  // GPS functionality
  const getCurrentLocation = () => {
    setCurrentLocation("Obteniendo ubicación...")
    setLocationError("")

    if (!navigator.geolocation) {
      setLocationError("GPS no disponible en este dispositivo")
      setCurrentLocation("GPS no disponible")
      setLocationSource("No disponible")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        updateLocationCoordinates({ lat: latitude, lng: longitude }, "GPS actual")
      },
      (error) => {
        let errorMessage = "Error al obtener ubicación"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de ubicación denegado"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Ubicación no disponible"
            break
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera agotado"
            break
        }
        setLocationError(errorMessage)
        setCurrentLocation(errorMessage)
        setLocationSource("Error GPS")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  useEffect(() => {
    getCurrentLocation()
  }, [])

  useEffect(() => {
    if (!coordinates) {
      resetWeather()
      return
    }

    void refreshWeather(coordinates)
  }, [coordinates, refreshWeather, resetWeather])

  const addSailor = () => {
    setSailors([...sailors, { name: "", divingTime: "" }])
  }

  const removeSailor = (index: number) => {
    setSailors(sailors.filter((_, i) => i !== index))
  }

  const updateSailor = (index: number, field: string, value: string) => {
    const updated = [...sailors]
    updated[index] = { ...updated[index], [field]: value }
    setSailors(updated)
  }
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Nueva entrada de bitácora</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Registra tu actividad pesquera artesanal</p>
        <div className="mt-3 xl:hidden">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between bg-transparent"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            aria-expanded={isSidebarOpen}
            aria-controls="entry-sidebar"
          >
            {isSidebarOpen ? "Ocultar ubicación y clima" : "Mostrar ubicación y clima"}
            <ChevronDown className={`w-4 h-4 transition-transform ${isSidebarOpen ? "rotate-180" : "rotate-0"}`} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Form */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>Datos generales de la jornada de pesca</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date" className="dark:text-gray-300">
                    Día de pesca
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="themed-input"
                  />
                </div>
                <div>
                  <Label htmlFor="time">
                    Hora de inicio
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="themed-input"
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">
                    Hora de finalización
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="themed-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="skipper">
                  Patrón
                </Label>
                <Input id="skipper" placeholder="Nombre del patrón" className="themed-input" value={skipper} onChange={e => setSkipper(e.target.value)} />
              </div>

              <div>
                <Label htmlFor="fishing-art">
                  Arte de pesca
                </Label>
                <Select value={fishingGear} onValueChange={setFishingGear}>
                  <SelectTrigger id="fishing-art" className="themed-input">
                    <SelectValue placeholder="Selecciona el arte de pesca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hookah">Buceo hookah (con narguile)</SelectItem>
                    <SelectItem value="semi-autonomo">Buceo semiatónomo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="area" className="dark:text-gray-300">
                  Zona de pesca
                </Label>
                <div className="relative">
                  <Input
                    id="area"
                    placeholder="ej: bahía Engaño, sector norte"
                    className="themed-input"
                    value={area}
                    autoComplete="off"
                    onChange={e => setArea(e.target.value)}
                    onFocus={() => {
                      if (areaSuggestions.length > 0) setShowSuggestions(true);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                  />
                  {areaSuggestions.length > 0 && showSuggestions && (
                    <ul className="absolute z-10 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow max-h-40 overflow-y-auto">
                      {areaSuggestions.filter(s => s.toLowerCase().includes(area.toLowerCase()) && s !== area).map((s, i) => (
                        <li
                          key={i}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                          onMouseDown={() => { setArea(s); setShowSuggestions(false); }}
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="depth">
                  Profundidad (m)
                </Label>
                <Input id="depth" type="number" placeholder="15" className="themed-input" value={depth} onChange={e => setDepth(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Crew Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Tripulación
              </CardTitle>
              <CardDescription>Marineros y tiempo de buceo individual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sailors.map((sailor, index) => (
                <div key={index} className="flex flex-col md:flex-row md:items-end space-y-2 md:space-y-0 md:space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor={`sailor-${index}`} className="dark:text-gray-300">
                      Marinero {index + 1}
                    </Label>                    <Input
                      id={`sailor-${index}`}
                      placeholder="Nombre del marinero"
                      value={sailor.name}
                      onChange={(e) => updateSailor(index, "name", e.target.value)}
                      className="themed-input"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`diving-time-${index}`} className="dark:text-gray-300">
                      Tiempo de buceo (min)
                    </Label>                    <Input
                      id={`diving-time-${index}`}
                      type="number"
                      placeholder="45"
                      value={sailor.divingTime}
                      onChange={(e) => updateSailor(index, "divingTime", e.target.value)}
                      className="themed-input"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSailor(index)}
                    disabled={sailors.length === 1}
                    className="bg-transparent self-end md:self-auto w-full md:w-auto"
                  >
                    <Minus className="w-4 h-4 md:mr-0 mr-2" />
                    <span className="md:hidden">Eliminar marinero</span>
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addSailor} className="w-full bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Agregar marinero
              </Button>
            </CardContent>
          </Card>

          {/* Catch Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Fish className="w-5 h-5 mr-2" />
                Capturas
              </CardTitle>
              <CardDescription>
                Especies capturadas con datos de la base de datos regional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SpeciesSelector selectedSpecies={selectedSpecies} onSpeciesChange={setSelectedSpecies} />
            </CardContent>
          </Card>

          {/* Economic and Operational Data */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Datos económicos y operacionales</CardTitle>
              <CardDescription>Información sobre costos y condiciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="crew-wages" className="dark:text-gray-300">
                    Salarios tripulación ($)
                  </Label>
                  <Input
                    id="crew-wages"
                    type="number"
                    placeholder="15000"
                    className="themed-input"
                    value={crewWages}
                    onChange={e => setCrewWages(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fuel-consumption" className="dark:text-gray-300">
                    Consumo combustible (L)
                  </Label>
                  <Input
                    id="fuel-consumption"
                    type="number"
                    step="0.1"
                    placeholder="25.5"
                    className="themed-input"
                    value={fuelConsumption}
                    onChange={e => setFuelConsumption(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="weather" className="dark:text-gray-300">
                  Condiciones climáticas
                </Label>
                <Textarea
                  id="weather"
                  placeholder="Ej: Viento moderado del NE, oleaje de 0.5m, buena visibilidad"
                  className="min-h-20 dark:bg-gray-700 dark:border-gray-600"
                  value={weather}
                  onChange={e => setWeather(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="observations" className="dark:text-gray-300">
                  Observaciones
                </Label>
                <Textarea
                  id="observations"
                  placeholder="Condiciones del mar, incidentes, observaciones sobre especies, etc..."
                  className="min-h-24 dark:bg-gray-700 dark:border-gray-600"
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                />
              </div>
              {/* Sección Producción */}
              {isProductionEnabled ? (
                <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <h3 className="font-semibold text-lg mb-2">Producción</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="saco-muestras" className="dark:text-gray-300">Sacó muestras</Label>
                      <Select value={sacoMuestras} onValueChange={setSacoMuestras}>
                        <SelectTrigger className="themed-input">
                          <SelectValue placeholder="¿Sacó muestras?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="si">Sí</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="kg-pulpa-vieira" className="dark:text-gray-300">Kg pulpa de vieira</Label>
                      <Input
                        id="kg-pulpa-vieira"
                        type="number"
                        placeholder="0"
                        className="themed-input"
                        value={kgPulpaVieira}
                        onChange={e => setKgPulpaVieira(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="num-bolsas" className="dark:text-gray-300">Nº de bolsas</Label>
                      <Input
                        id="num-bolsas"
                        type="number"
                        placeholder="0"
                        className="themed-input"
                        value={numBolsas}
                        onChange={e => setNumBolsas(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="kg-por-bolsa" className="dark:text-gray-300">Nº kg/bolsa</Label>
                      <Input
                        id="kg-por-bolsa"
                        type="number"
                        placeholder="0"
                        className="themed-input"
                        value={kgPorBolsa}
                        onChange={e => setKgPorBolsa(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rinde-pulpa-vieira" className="dark:text-gray-300">Rinde de pulpa de vieira (%)</Label>
                      <Input
                        id="rinde-pulpa-vieira"
                        type="number"
                        placeholder="0"
                        className="themed-input"
                        value={rindePulpaVieira}
                        onChange={e => setRindePulpaVieira(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm text-muted-foreground">
                  La sección de Producción se habilita al seleccionar Vieira (u otra especie que la requiera) en Capturas.
                </div>
              )}
            </CardContent>
          </Card>
          <Button className="w-full maritime-gradient" onClick={async () => {
            // Extraer datos serializables de cada especie con estructura consistente
            const serializableSpecies = selectedSpecies.map(s => {
              const { id, commonName, scientificName, crates, kg, size } = s || {};
              return { id, commonName, scientificName, crates, weight: kg, size };
            });
            // Filtrar solo datos planos de los marineros
            const serializableSailors = sailors.map(s => ({
              name: s.name,
              divingTime: s.divingTime
            }));
            const entry = {
              date,
              startTime: time,
              endTime,
              skipper,
              method: fishingGear,
              area,
              depth,
              sailors: serializableSailors,
              species: serializableSpecies.map(s => s.commonName || s.scientificName).join(', '),
              catches: serializableSpecies,
              crewWages,
              fuelConsumption,
              weather,
              observations,
              gps: coordinates ? `${coordinates.lat}, ${coordinates.lng}` : currentLocation,
              location: currentLocation,
              sacoMuestras: isProductionEnabled ? sacoMuestras : "",
              kgPulpaVieira: isProductionEnabled ? kgPulpaVieira : "",
              numBolsas: isProductionEnabled ? numBolsas : "",
              kgPorBolsa: isProductionEnabled ? kgPorBolsa : "",
              rindePulpaVieira: isProductionEnabled ? rindePulpaVieira : ""
            };

            try {
              await saveFishingEntry(entry)
            } catch (error) {
              console.error("No se pudo guardar la entrada en base de datos. Se guardará localmente como no cargada.", error)
              queueFailedFishingEntry(entry)
            }

            window.location.href = '/mis-datos';
          }}>
            <Save className="w-4 h-4 mr-2" />
            Guardar entrada completa (guardar en registro)
          </Button>
        </div>

        {/* Sidebar Info */}
        <div
          id="entry-sidebar"
          className={`order-first xl:order-last md:max-h-[calc(100vh-16rem)] ${isSidebarOpen ? "grid" : "hidden"} grid-cols-1 md:grid-cols-2 xl:grid xl:grid-cols-1 gap-4`}
        >
          {/* Location Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center text-base sm:text-lg">
                <MapPin className="w-4 h-4 mr-2" />
                Ubicación GPS
              </CardTitle>
              <CardDescription>
                Por defecto toma tu ubicación actual. También puedes elegirla desde el mapa o corregirla manualmente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-3 break-all">{currentLocation}</p>
              {coordinates && (
                <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                  <p>Lat: {coordinates.lat.toFixed(6)}</p>
                  <p>Lng: {coordinates.lng.toFixed(6)}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className={`${locationError ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"} text-center`}
                >
                  {locationError ? "Error de ubicación" : locationSource}
                </Badge>
              </div>

              <Button size="sm" variant="outline" onClick={getCurrentLocation} className="bg-transparent w-full">
                <Navigation className="w-3 h-3 mr-1" />
                Usar ubicación actual
              </Button>

              <div className="space-y-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                {googleMapsApiKey ? (
                  <button
                    type="button"
                    onClick={openMapDialog}
                    className="relative w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="pointer-events-none">
                      <APIProvider apiKey={googleMapsApiKey}>
                        <Map
                          style={{ height: "180px", width: "100%" }}
                          defaultCenter={coordinates || mapCenter}
                          defaultZoom={8}
                          gestureHandling="none"
                          disableDefaultUI={true}
                        >
                          {coordinates && <Marker position={coordinates} />}
                        </Map>
                      </APIProvider>
                    </div>
                    <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/50 via-transparent to-transparent p-3 text-white">
                      <span className="text-sm font-medium">Seleccionar desde el mapa</span>
                      <span className="inline-flex items-center rounded-md bg-white/20 px-2 py-1 text-xs">
                        <MapIcon className="w-3 h-3 mr-1" />
                        Abrir
                      </span>
                    </div>
                  </button>
                ) : (
                  <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                    Falta configurar la API key de Google Maps para mostrar la miniatura y abrir el mapa grande.
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="manual-lat">Latitud</Label>
                    <Input
                      id="manual-lat"
                      type="number"
                      step="0.000001"
                      placeholder="-42.769200"
                      className="themed-input mt-2"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="manual-lng">Longitud</Label>
                    <Input
                      id="manual-lng"
                      type="number"
                      step="0.000001"
                      placeholder="-65.038500"
                      className="themed-input mt-2"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                    />
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={applyManualLocation} className="bg-transparent w-full">
                  <Pencil className="w-3 h-3 mr-1" />
                  Guardar coordenadas manuales
                </Button>
              </div>


            </CardContent>
          </Card>

          {/* Weather Card */}
          {/* TODO: Add weather data api or manual */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Clock className="w-4 h-4 mr-2" />
                Condiciones actuales
              </CardTitle>
              <CardDescription className="text-xs">
                Datos en tiempo real según coordenadas seleccionadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {weatherSnapshot.error ? (
                <p className="text-xs text-amber-600 dark:text-amber-400">{weatherSnapshot.error}</p>
              ) : null}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex justify-between">
                  <span className="text-sm">Temperatura:</span>
                  <span className="text-sm font-medium">
                    {weatherSnapshot.isLoading
                      ? "Cargando..."
                      : weatherSnapshot.temperatureC != null
                        ? `${weatherSnapshot.temperatureC.toFixed(1)}°C`
                        : "N/D"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm dark:text-gray-300">Sensación térmica:</span>
                  <span className="text-sm font-medium dark:text-gray-200">
                    {weatherSnapshot.isLoading
                      ? "Cargando..."
                      : weatherSnapshot.apparentTemperatureC != null
                        ? `${weatherSnapshot.apparentTemperatureC.toFixed(1)}°C`
                        : "N/D"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm dark:text-gray-300">Viento:</span>
                  <span className="text-sm font-medium dark:text-gray-200">
                    {weatherSnapshot.isLoading
                      ? "Cargando..."
                      : weatherSnapshot.windKmh != null
                        ? `${weatherSnapshot.windKmh.toFixed(1)} km/h`
                        : "N/D"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm dark:text-gray-300">Dirección viento:</span>
                  <span className="text-sm font-medium dark:text-gray-200">
                    {weatherSnapshot.isLoading ? "Cargando..." : weatherSnapshot.windDirectionLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm dark:text-gray-300">Rachas:</span>
                  <span className="text-sm font-medium dark:text-gray-200">
                    {weatherSnapshot.isLoading
                      ? "Cargando..."
                      : weatherSnapshot.windGustsKmh != null
                        ? `${weatherSnapshot.windGustsKmh.toFixed(1)} km/h`
                        : "N/D"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm dark:text-gray-300">Oleaje (est.):</span>
                  <span className="text-sm font-medium dark:text-gray-200">
                    {weatherSnapshot.isLoading ? "Cargando..." : weatherSnapshot.waveEstimate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm dark:text-gray-300">Visibilidad:</span>
                  <span className="text-sm font-medium dark:text-gray-200">
                    {weatherSnapshot.isLoading
                      ? "Cargando..."
                      : weatherSnapshot.visibilityKm != null
                        ? `${weatherSnapshot.visibilityKm.toFixed(1)} km`
                        : "N/D"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm dark:text-gray-300">Humedad:</span>
                  <span className="text-sm font-medium dark:text-gray-200">
                    {weatherSnapshot.isLoading
                      ? "Cargando..."
                      : weatherSnapshot.relativeHumidity != null
                        ? `${Math.round(weatherSnapshot.relativeHumidity)}%`
                        : "N/D"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm dark:text-gray-300">Precipitación:</span>
                  <span className="text-sm font-medium dark:text-gray-200">
                    {weatherSnapshot.isLoading
                      ? "Cargando..."
                      : weatherSnapshot.precipitationMm != null
                        ? `${weatherSnapshot.precipitationMm.toFixed(1)} mm`
                        : "N/D"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm dark:text-gray-300">Nubosidad:</span>
                  <span className="text-sm font-medium dark:text-gray-200">
                    {weatherSnapshot.isLoading
                      ? "Cargando..."
                      : weatherSnapshot.cloudCover != null
                        ? `${Math.round(weatherSnapshot.cloudCover)}%`
                        : "N/D"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm dark:text-gray-300">Presión (MSL):</span>
                  <span className="text-sm font-medium dark:text-gray-200">
                    {weatherSnapshot.isLoading
                      ? "Cargando..."
                      : weatherSnapshot.pressureMsl != null
                        ? `${weatherSnapshot.pressureMsl.toFixed(0)} hPa`
                        : "N/D"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm dark:text-gray-300">Estado:</span>
                  <span className="text-sm font-medium dark:text-gray-200">
                    {weatherSnapshot.isLoading
                      ? "Cargando..."
                      : weatherSnapshot.weatherLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm dark:text-gray-300">Temp. max/min:</span>
                  <span className="text-sm font-medium dark:text-gray-200">
                    {weatherSnapshot.isLoading
                      ? "Cargando..."
                      : weatherSnapshot.temperatureMaxC != null && weatherSnapshot.temperatureMinC != null
                        ? `${weatherSnapshot.temperatureMaxC.toFixed(1)}° / ${weatherSnapshot.temperatureMinC.toFixed(1)}°`
                        : "N/D"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      <Dialog
        open={isMapDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsMapDialogOpen(true)
            return
          }
          closeMapDialog()
        }}
      >
        <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Seleccionar ubicación en el mapa</DialogTitle>
            <DialogDescription>
              Haz clic sobre el mapa para guardar el punto de pesca. También puedes acercarte o alejarte antes de marcar.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
            {googleMapsApiKey ? (
              <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <APIProvider apiKey={googleMapsApiKey}>
                  <Map
                    style={{ height: "60vh", minHeight: "300px", width: "100%" }}
                    defaultCenter={pendingCoordinates || coordinates || mapCenter}
                    defaultZoom={9}
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    onClick={(event: any) => {
                      const latLng = event?.detail?.latLng
                      if (!latLng) {
                        return
                      }

                      setPendingCoordinates({ lat: latLng.lat, lng: latLng.lng })
                    }}
                  >
                    {(pendingCoordinates || coordinates) && <Marker position={pendingCoordinates || coordinates!} />}
                  </Map>
                </APIProvider>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                Falta configurar la API key de Google Maps. Crea el archivo .env.local con NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para habilitar el selector.
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 px-6 pb-6">
            <Button type="button" variant="outline" onClick={closeMapDialog}>
              Cancelar
            </Button>
            <Button type="button" onClick={confirmMapSelection}>
              Aceptar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
