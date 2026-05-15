"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DelayedComponent } from "@/components/ui/delayed-component"
import { Fish, TrendingUp, Calendar, MapPin } from "lucide-react"
import { InteractiveMap } from "./interactive-map"
import { listFishingEntries } from "@/lib/entries/repository"
import type { FishingEntry } from "@/lib/entries/types"

// ── Helpers ──────────────────────────────────────────────────────────────────
const getTimestamp = (e: Pick<FishingEntry, "date" | "startTime">) => {
  if (!e.date) return 0
  const ts = new Date(`${e.date}T${e.startTime || "00:00"}`).getTime()
  return Number.isNaN(ts) ? 0 : ts
}

const fmtDate = (date?: string) => {
  if (!date) return "sin fecha"
  const d = new Date(`${date}T00:00`)
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

const computeMonthly = (entries: FishingEntry[]) => {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleDateString("es-AR", { month: "short" }).replace(".", "")
    const month = entries.filter((e) => e.date?.startsWith(key))
    const total = month.reduce(
      (s, e) => s + (e.catches?.reduce((cs, c) => cs + (parseFloat(c.weight || "0") || 0), 0) ?? 0),
      0,
    )
    return { month: label, catch: Math.round(total * 10) / 10, trips: month.length }
  })
}

const computeSpecies = (entries: FishingEntry[]) => {
  const map: Record<string, number> = {}
  for (const e of entries) {
    const sp = e.species || "otros"
    const w = e.catches?.reduce((s, c) => s + (parseFloat(c.weight || "0") || 0), 0) ?? 0
    map[sp] = (map[sp] || 0) + w
  }
  const total = Object.values(map).reduce((s, v) => s + v, 0)
  if (total === 0) return []
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([species, w]) => ({
      species,
      percentage: Math.round((w / total) * 100),
      weight: `${w.toFixed(1)} kg`,
    }))
}

const computeStats = (entries: FishingEntry[]) => {
  const now = new Date()
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const month = entries.filter((e) => e.date?.startsWith(key))
  const totalWeight = month.reduce(
    (s, e) => s + (e.catches?.reduce((cs, c) => cs + (parseFloat(c.weight || "0") || 0), 0) ?? 0),
    0,
  )
  const days = new Set(month.map((e) => e.date)).size
  const zones = new Set(month.map((e) => e.area || e.location).filter(Boolean)).size
  return {
    totalWeight: totalWeight > 0 ? `${totalWeight.toFixed(1)} kg` : null,
    activeDays: days > 0 ? String(days) : null,
    zones: zones > 0 ? String(zones) : null,
  }
}

// ── Componente ───────────────────────────────────────────────────────────────
export function Dashboard() {
  const [entries, setEntries] = useState<FishingEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    listFishingEntries()
      .then((loaded) => { if (active) { setEntries(loaded); setLoading(false) } })
      .catch((err) => { console.error("No se pudieron cargar los datos del dashboard:", err); if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const monthlyData = useMemo(() => computeMonthly(entries), [entries])
  const speciesData = useMemo(() => computeSpecies(entries), [entries])
  const stats = useMemo(() => computeStats(entries), [entries])

  const latestVieira = [...entries]
    .sort((a, b) => getTimestamp(b) - getTimestamp(a))
    .find((e) => e.rindePulpaVieira)
  const performance = latestVieira
    ? { value: `${latestVieira.rindePulpaVieira}%`, description: `última salida del ${fmtDate(latestVieira.date)}` }
    : { value: "Sin datos", description: entries.length > 0 ? "sin dato de rendimiento" : "sin salidas registradas" }

  const hasMonthlyData = monthlyData.some((d) => d.catch > 0)
  const maxCatch = Math.max(...monthlyData.map((d) => d.catch), 1)

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Panel principal</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Resumen de tu actividad pesquera</p>
      </div>

      <DelayedComponent loading={loading} skeleton={<DashboardSkeleton />}>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total este mes</CardTitle>
              <Fish className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-lg sm:text-2xl font-bold ${!stats.totalWeight ? "text-muted-foreground" : ""}`}>
                {stats.totalWeight ?? "Sin datos"}
              </div>
              <p className="text-xs text-muted-foreground">
                capturas del mes actual
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Días activos</CardTitle>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-lg sm:text-2xl font-bold ${!stats.activeDays ? "text-muted-foreground" : ""}`}>
                {stats.activeDays ?? "0"}
              </div>
              <p className="text-xs text-muted-foreground">salidas este mes</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Zonas visitadas</CardTitle>
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-lg sm:text-2xl font-bold ${!stats.zones ? "text-muted-foreground" : ""}`}>
                {stats.zones ?? "0"}
              </div>
              <p className="text-xs text-muted-foreground">áreas distintas</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Rendimiento</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-lg sm:text-2xl font-bold ${performance.value === "Sin datos" ? "text-muted-foreground" : ""}`}>
                {performance.value}
              </div>
              <p className="text-xs text-muted-foreground">{performance.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Monthly Catch Chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Capturas mensuales</CardTitle>
              <CardDescription className="text-sm">
                Evolución de capturas en los últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {hasMonthlyData ? (
                <div className="space-y-3">
                  {monthlyData.map((data) => (
                    <div key={data.month} className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-6 sm:w-8 text-xs sm:text-sm font-medium capitalize flex-shrink-0">{data.month}</div>
                      <div className="flex-1 progress-bar min-w-0">
                        <div
                          className="progress-fill"
                          style={{ width: `${(data.catch / maxCatch) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs sm:text-sm font-medium w-12 sm:w-16 text-right">{data.catch} kg</div>
                      <div className="text-xs text-muted-foreground w-10 sm:w-12 text-right hidden sm:block">
                        {data.trips} viajes
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyChartState message="Las capturas mensuales aparecerán aquí cuando registres actividades." />
              )}
            </CardContent>
          </Card>

          {/* Species Distribution */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Distribución por especies</CardTitle>
              <CardDescription className="text-sm">Composición de capturas este año</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {speciesData.length > 0 ? (
                <div className="space-y-4">
                  {speciesData.map((data, index) => (
                    <div key={data.species} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize truncate pr-2">{data.species}</span>
                        <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">{data.weight}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 progress-bar">
                          <div
                            className={`progress-fill ${index === 0
                              ? ""
                              : index === 1
                                ? "indicator-success"
                                : index === 2
                                  ? "indicator-warning"
                                  : "indicator-muted"
                              }`}
                            style={{ width: `${data.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-medium w-6 sm:w-8 text-right flex-shrink-0">
                          {data.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyChartState message="Las especies capturadas aparecerán aquí cuando registres tus capturas." />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Interactive Map */}
        <InteractiveMap />
      </DelayedComponent>
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-20 mb-1" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardHeader>
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-8 flex-shrink-0" />
                  <Skeleton className="h-3 flex-1" />
                  <Skeleton className="h-4 w-12 flex-shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-5 w-36 mb-1" />
          <Skeleton className="h-4 w-52" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Fish className="w-8 h-8 mb-3 text-muted-foreground opacity-30" />
      <p className="text-sm font-medium text-muted-foreground">Sin registros aún</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">{message}</p>
    </div>
  )
}