"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation, Route, Clock, Fuel, TrendingUp, MapPin } from "lucide-react"

// Datos de rutas calculadas entre ubicaciones
const routeData = [
  {
    id: "route-1",
    name: "Ruta Península Valdés",
    startLocation: "Puerto Pirámides",
    endLocation: "Bahía Engaño",
    distance: 12.3,
    estimatedTime: "45 min",
    fuelConsumption: 8.5,
    difficulty: "fácil",
    conditions: "protegida",
    waypoints: [
      { name: "Punta Pirámides", coordinates: [-42.5833, -64.2833] },
      { name: "Bahía Engaño", coordinates: [-42.7833, -65.0167] },
    ],
    description: "Ruta costera protegida ideal para condiciones de viento moderado",
  },
  {
    id: "route-2",
    name: "Ruta Golfo San Jorge",
    startLocation: "Comodoro Rivadavia",
    endLocation: "Zona de pesca profunda",
    distance: 28.7,
    estimatedTime: "1h 20min",
    fuelConsumption: 22.3,
    difficulty: "moderada",
    conditions: "expuesta",
    waypoints: [
      { name: "Puerto Comodoro", coordinates: [-45.8667, -67.5] },
      { name: "Zona profunda", coordinates: [-45.9, -67.2] },
    ],
    description: "Ruta hacia aguas profundas, requiere condiciones climáticas favorables",
  },
  {
    id: "route-3",
    name: "Ruta Golfo Nuevo",
    startLocation: "Puerto Madryn",
    endLocation: "Punta Ninfas",
    distance: 15.8,
    estimatedTime: "55 min",
    fuelConsumption: 11.2,
    difficulty: "fácil",
    conditions: "semi-protegida",
    waypoints: [
      { name: "Puerto Madryn", coordinates: [-42.7667, -65.0333] },
      { name: "Punta Ninfas", coordinates: [-42.9333, -64.3167] },
    ],
    description: "Ruta panorámica con buena protección y múltiples puntos de refugio",
  },
]

// Análisis de patrones de movimiento
const movementPatterns = {
  totalDistance: 156.8,
  totalTime: "12h 35min",
  averageSpeed: 12.5,
  fuelEfficiency: 2.8,
  mostUsedRoute: "Ruta Península Valdés",
  preferredConditions: "protegida",
  seasonalTrends: [
    { season: "Verano", frequency: 45, avgDistance: 18.2 },
    { season: "Otoño", frequency: 38, avgDistance: 22.1 },
    { season: "Invierno", frequency: 22, avgDistance: 15.7 },
    { season: "Primavera", frequency: 35, avgDistance: 19.8 },
  ],
}

interface RouteAnalysisProps {
  onRouteSelect?: (routeId: string) => void
  selectedRoute?: string | null
}

export function RouteAnalysis({ onRouteSelect, selectedRoute }: RouteAnalysisProps) {
  const [activeTab, setActiveTab] = useState<"routes" | "patterns">("routes")

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      fácil: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      moderada: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      difícil: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }
    return colors[difficulty as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getConditionsColor = (conditions: string) => {
    const colors = {
      protegida: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "semi-protegida": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      expuesta: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    }
    return colors[conditions as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold dark:text-white mb-2">Análisis de rutas</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Rutas de navegación y patrones de movimiento entre zonas de pesca
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={activeTab === "routes" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("routes")}
            className={activeTab === "routes" ? "" : "bg-transparent"}
          >
            <Route className="w-4 h-4 mr-2" />
            Rutas
          </Button>
          <Button
            variant={activeTab === "patterns" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("patterns")}
            className={activeTab === "patterns" ? "" : "bg-transparent"}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Patrones
          </Button>
        </div>
      </div>

      {activeTab === "routes" && (
        <div className="space-y-4">
          {/* Estadísticas rápidas de rutas */}          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rutas disponibles</p>
                    <p className="text-lg font-semibold">{routeData.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">              <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Distancia total</p>
                  <p className="text-lg font-semibold">
                    {routeData.reduce((sum, route) => sum + route.distance, 0).toFixed(1)} km
                  </p>
                </div>
              </div>
            </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tiempo promedio</p>
                    <p className="text-lg font-semibold">1h 0min</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">              <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Fuel className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Combustible total</p>
                  <p className="text-lg font-semibold">
                    {routeData.reduce((sum, route) => sum + route.fuelConsumption, 0).toFixed(1)} L
                  </p>
                </div>
              </div>
            </CardContent>
            </Card>
          </div>

          {/* Lista de rutas */}
          <div className="space-y-4">
            {routeData.map((route) => (
              <Card
                key={route.id}
                className={`cursor-pointer transition-all hover:shadow-md glass-card ${selectedRoute === route.id
                    ? "ring-2 ring-blue-500 dark:ring-blue-400"
                    : "hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                onClick={() => onRouteSelect?.(route.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center dark:text-white">
                      <Navigation className="w-5 h-5 mr-2" />
                      {route.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getDifficultyColor(route.difficulty)} variant="secondary">
                        {route.difficulty}
                      </Badge>
                      <Badge className={getConditionsColor(route.conditions)} variant="secondary">
                        {route.conditions}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="dark:text-gray-400">
                    {route.startLocation} → {route.endLocation}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{route.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Distancia:</span>
                      <p className="font-medium dark:text-white">{route.distance} km</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Tiempo estimado:</span>
                      <p className="font-medium dark:text-white">{route.estimatedTime}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Combustible:</span>
                      <p className="font-medium dark:text-white">{route.fuelConsumption} L</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Puntos de paso:</span>
                      <p className="font-medium dark:text-white">{route.waypoints.length}</p>
                    </div>
                  </div>

                  {/* Waypoints */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Puntos de navegación:</h4>
                    <div className="flex items-center space-x-2">
                      {route.waypoints.map((waypoint, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 ml-1 mr-2">{waypoint.name}</span>
                          {index < route.waypoints.length - 1 && (
                            <div className="w-4 h-px bg-gray-300 dark:bg-gray-600"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "patterns" && (
        <div className="space-y-6">          {/* Resumen de patrones */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Resumen de movimientos</CardTitle>
              <CardDescription>
                Análisis de tus patrones de navegación y eficiencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Estadísticas generales</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distancia total:</span>
                      <span className="font-medium">{movementPatterns.totalDistance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tiempo total:</span>
                      <span className="font-medium">{movementPatterns.totalTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Velocidad promedio:</span>
                      <span className="font-medium dark:text-white">{movementPatterns.averageSpeed} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Eficiencia combustible:</span>
                      <span className="font-medium dark:text-white">{movementPatterns.fuelEfficiency} km/L</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Preferencias</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Ruta más usada:</span>
                      <p className="font-medium dark:text-white">{movementPatterns.mostUsedRoute}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Condiciones preferidas:</span>
                      <Badge className={getConditionsColor(movementPatterns.preferredConditions)} variant="secondary">
                        {movementPatterns.preferredConditions}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Recomendaciones</h4>
                  <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <p>• Considera rutas más directas para reducir consumo</p>
                    <p>• Aprovecha condiciones protegidas en invierno</p>
                    <p>• Planifica paradas de combustible en rutas largas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tendencias estacionales */}          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Patrones estacionales</CardTitle>
              <CardDescription>
                Frecuencia y distancia de navegación por temporada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movementPatterns.seasonalTrends.map((trend, index) => (
                  <div key={trend.season} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{trend.season}</span>
                      <div className="text-sm text-muted-foreground">
                        {trend.frequency} viajes • {trend.avgDistance} km promedio
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Frecuencia</span>
                          <span>{trend.frequency}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${index === 0
                                ? "bg-green-500"
                                : index === 1
                                  ? "bg-yellow-500"
                                  : index === 2
                                    ? "bg-blue-500"
                                    : "bg-purple-500"
                              }`}
                            style={{ width: `${trend.frequency}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Distancia</div>
                        <div className="text-sm font-medium dark:text-white">{trend.avgDistance} km</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Consejos de navegación */}          <Card className="glass-card">
            <CardHeader>
              <CardTitle>💡 Consejos de navegación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium">Eficiencia de combustible:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Mantén velocidad constante entre 8-12 nudos</li>
                    <li>• Aprovecha corrientes favorables</li>
                    <li>• Planifica rutas directas cuando sea posible</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Seguridad:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Verifica condiciones meteorológicas</li>
                    <li>• Comunica tu ruta antes de partir</li>
                    <li>• Lleva equipo de emergencia completo</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
