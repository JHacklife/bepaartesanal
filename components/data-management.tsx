"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DelayedComponent } from "@/components/ui/delayed-component"
import { Download, Eye, Trash2, Calendar, MoreVertical, FileText, MapPin, Fish, Users, Waves, Fuel, Wallet, ClipboardList } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useApiError } from "@/hooks/use-api-error"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EntryLocationMap } from "@/components/entry-location-map"
import { listFishingEntries } from "@/lib/entries/repository"
import type { FishingEntry } from "@/lib/entries/types"

const getTotalWeight = (entry: FishingEntry): string => {
  if (!entry.catches || entry.catches.length === 0) return "—"
  const total = entry.catches.reduce((sum, c) => {
    const weight = "weight" in c ? c.weight : (c as { peso?: string }).peso
    return sum + (parseFloat(weight || "0") || 0)
  }, 0)
  return total > 0 ? total.toFixed(1) : "—"
}

const getLoadMeta = (status?: string) => {
  const normalized = (status || "Cargado").toLowerCase()

  if (normalized.includes("no cargado") || normalized.includes("error") || normalized.includes("fallo")) {
    return {
      label: "No cargado",
      className: "bg-amber-100 text-amber-800",
      variant: "secondary" as const,
    }
  }

  return {
    label: "Cargado",
    className: "bg-green-100 text-green-800",
    variant: "secondary" as const,
  }
}

const getCatchName = (item: unknown) => {
  const catchItem = item as { name?: string; commonName?: string }
  return catchItem.name ?? catchItem.commonName ?? "—"
}

const getCatchWeight = (item: unknown) => {
  const catchItem = item as { weight?: string; peso?: string }
  return catchItem.weight ?? catchItem.peso ?? "—"
}

const getCatchCrates = (item: unknown) => {
  const catchItem = item as { crates?: string; cantidad?: string }
  return catchItem.crates ?? catchItem.cantidad ?? "—"
}

const exportToCSV = (data: unknown[], filename: string) => {
  if (typeof window === "undefined" || typeof document === "undefined") return

  if (data.length === 0) {
    alert("No hay datos para exportar")
    return
  }

  const headers = Object.keys(data[0] as Record<string, unknown>)
  const csvContent = [
    headers.join(","),
    ...data.map(row =>
      headers.map(header => {
        const value = (row as Record<string, unknown>)[header]
        const stringValue = String(value ?? "")
        return stringValue.includes(",") ? `"${stringValue}"` : stringValue
      }).join(",")
    )
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function DataManagement() {
  const { handleApiError } = useApiError()
  const [selectedEntry, setSelectedEntry] = useState<FishingEntry | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [entries, setEntries] = useState<FishingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [entryToDelete, setEntryToDelete] = useState<FishingEntry | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    const loadEntries = async () => {
      try {
        const loadedEntries = await listFishingEntries()
        if (isMounted) { setEntries(loadedEntries); setLoading(false) }
      } catch (error) {
        console.error("No se pudieron cargar entradas:", error)
        if (isMounted) setLoading(false)
      }
    }
    loadEntries()
    return () => { isMounted = false }
  }, [])

  const handleView = (entry: FishingEntry) => {
    setSelectedEntry(entry)
    setDialogOpen(true)
  }

  const handleDelete = (entry: FishingEntry) => {
    setEntryToDelete(entry)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!entryToDelete?.id) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/entries/${entryToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        try {
          const error = await response.json()
          handleApiError(error, "Error", error.message || "No se pudo eliminar la entrada")
        } catch {
          handleApiError(null, "Error", `Error ${response.status}: No se pudo eliminar la entrada`)
        }
        return
      }

      // Remove from local state
      setEntries(entries.filter((e) => e.id !== entryToDelete.id))
      setDeleteDialogOpen(false)
      setEntryToDelete(null)
      toast.success("Entrada eliminada correctamente")
    } catch (error) {
      console.error("Error eliminando entrada:", error)
      handleApiError(error, "Error", "No se pudo eliminar la entrada")
    } finally {
      setDeleting(false)
    }
  }

  const handleExportAll = () => {
    toast.success("Exportando todos los registros...")
    exportToCSV(entries, "registros-pesca-completo.csv")
  }

  const handleExportLastMonth = () => {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const filtered = entries.filter((entry) => {
      try {
        const entryDate = new Date(entry.date || "")
        return entryDate >= lastMonth
      } catch {
        return false
      }
    })
    toast.success(`Exportando ${filtered.length} registros del último mes...`)
    exportToCSV(filtered, "registros-pesca-mes.csv")
  }

  const handleExportBySpecies = () => {
    const speciesMap: Record<string, FishingEntry[]> = {}
    entries.forEach((entry) => {
      const species = entry.species || "Sin especie"
      if (!speciesMap[species]) speciesMap[species] = []
      speciesMap[species].push(entry)
    })

    Object.entries(speciesMap).forEach(([species, data]) => {
      const filename = `registros-pesca-${species.toLowerCase().replace(/\s+/g, "-")}.csv`
      exportToCSV(data, filename)
    })
    toast.success(`Exportados ${Object.keys(speciesMap).length} archivos por especie...`)
  }

  const loadedCount = entries.filter((e) => getLoadMeta(e.status).label === "Cargado").length

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Gestión de datos</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Administra y exporta tus registros de pesca</p>
        </div>
      </div>

      <DelayedComponent loading={loading} skeleton={<DataManagementSkeleton />}>
        {/* Summary Cards */}
        <div className="flex space-x-4">
          <Card className="glass-card flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de entradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{entries.length}</div>
              <p className="text-xs text-muted-foreground">Desde el inicio</p>
            </CardContent>
          </Card>

          <Card className="glass-card flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cargadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${loadedCount === entries.length && entries.length > 0 ? "text-green-600" : ""}`}>
                {loadedCount}
              </div>
              <p className="text-xs text-muted-foreground">
                {entries.length - loadedCount > 0 ? `${entries.length - loadedCount} no cargadas` : "al día"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg sm:text-xl">Registro de entradas</CardTitle>
                <CardDescription className="text-sm">Historial completo de tus actividades pesqueras</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportAll}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar todo (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportLastMonth}>
                    <Download className="w-4 h-4 mr-2" />
                    Último mes (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportBySpecies}>
                    <Download className="w-4 h-4 mr-2" />
                    Por especie (CSV)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <p className="px-6 sm:px-0 text-xs text-muted-foreground mb-3">
              Carga: <strong>Cargado</strong> = guardado en base de datos. <strong>No cargado</strong> = guardado local por
              problema de conexión o envío.
            </p>
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <FileText className="w-10 h-10 mb-3 text-muted-foreground opacity-30" />
                <p className="text-sm font-medium text-muted-foreground">Sin registros aún</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Usá <span className="font-medium">Nueva entrada</span> para registrar tu primera actividad de pesca.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block sm:hidden space-y-3 px-6 max-h-[600px] overflow-y-auto pr-2">
                  {entries.map((entry, idx) => (
                    <Card key={entry.id || entry.date || idx} className="border border-gray-200 dark:border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{entry.date ?? "Sin fecha"}</div>
                            <div className="text-xs text-muted-foreground">{entry.location ?? entry.area ?? "Sin ubicación"}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={getLoadMeta(entry.status).variant}
                              className={`text-xs ${getLoadMeta(entry.status).className}`}
                            >
                              {getLoadMeta(entry.status).label}
                            </Badge>
                            <Button size="sm" variant="ghost">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-muted-foreground text-xs">Arte</div>
                            <Badge variant="outline" className="text-xs">{entry.method ?? "—"}</Badge>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">Peso total</div>
                            <div className="font-medium">{getTotalWeight(entry)} kg</div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-muted-foreground text-xs">Especie(s)</div>
                            <div className="font-medium">{entry.species ?? "—"}</div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <Button size="sm" variant="ghost" onClick={() => handleView(entry)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(entry)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block max-h-[324px] overflow-y-auto rounded-md border">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Patrón</TableHead>
                        <TableHead>Arte</TableHead>
                        <TableHead>Especie(s)</TableHead>
                        <TableHead>Peso (kg)</TableHead>
                        <TableHead className="hidden lg:table-cell">Ubicación</TableHead>
                        <TableHead>Carga</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry, idx) => (
                        <TableRow key={entry.id || entry.date || idx}>
                          <TableCell className="font-medium">{entry.date ?? "—"}</TableCell>
                          <TableCell>{entry.skipper ?? "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{entry.method ?? "—"}</Badge>
                          </TableCell>
                          <TableCell>{entry.species ?? "—"}</TableCell>
                          <TableCell>{getTotalWeight(entry)}</TableCell>
                          <TableCell className="hidden lg:table-cell max-w-32 truncate">
                            {entry.location ?? entry.area ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getLoadMeta(entry.status).variant}
                              className={`text-xs ${getLoadMeta(entry.status).className}`}
                            >
                              {getLoadMeta(entry.status).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" onClick={() => handleView(entry)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(entry)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </DelayedComponent>

      {/* Popup de detalles de entrada */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader>
            <div className="border-b bg-muted/30 px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <DialogTitle className="text-xl">Detalle de entrada</DialogTitle>
                  <DialogDescription>Vista completa y ordenada de la actividad registrada</DialogDescription>
                </div>
                {selectedEntry && (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{selectedEntry.date ?? "Sin fecha"}</Badge>
                    <Badge variant="outline">{selectedEntry.method ?? "Sin arte"}</Badge>
                    <Badge
                      variant={getLoadMeta(selectedEntry.status).variant}
                      className={getLoadMeta(selectedEntry.status).className}
                    >
                      {getLoadMeta(selectedEntry.status).label}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </DialogHeader>
          {selectedEntry && (
            <div className="px-6 pb-4">
              <div className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">Peso total</p>
                    <p className="text-lg font-semibold">{getTotalWeight(selectedEntry)} kg</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">Especies</p>
                    <p className="text-lg font-semibold">{selectedEntry.catches?.length ?? 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">Tripulación</p>
                    <p className="text-lg font-semibold">{selectedEntry.sailors?.length ?? 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">Carga</p>
                    <p className="text-lg font-semibold">{getLoadMeta(selectedEntry.status).label}</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="captura" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="captura" className="gap-1"><Fish className="h-4 w-4" /> Captura</TabsTrigger>
                  <TabsTrigger value="operacion" className="gap-1"><ClipboardList className="h-4 w-4" /> Operación</TabsTrigger>
                  <TabsTrigger value="tripulacion" className="gap-1"><Users className="h-4 w-4" /> Tripulación</TabsTrigger>
                  <TabsTrigger value="ubicacion" className="gap-1"><MapPin className="h-4 w-4" /> Ubicación</TabsTrigger>
                </TabsList>

                <TabsContent value="captura" className="mt-4 space-y-4 max-h-[46vh] overflow-y-auto pr-1">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Resumen de captura</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><strong>Especie(s):</strong> {selectedEntry.species ?? "No registrado"}</div>
                      <div><strong>Peso total:</strong> {getTotalWeight(selectedEntry)} kg</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Detalle por especie</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {selectedEntry.catches && selectedEntry.catches.length > 0 ? (
                        selectedEntry.catches.map((item, index) => (
                          <div key={index} className="rounded-md border p-3">
                            <p className="font-medium">{getCatchName(item)}</p>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span>Cajones/U: {getCatchCrates(item)}</span>
                              <span>Peso: {getCatchWeight(item)} kg</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No hay capturas registradas.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="operacion" className="mt-4 max-h-[46vh] overflow-y-auto pr-1">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Datos operativos y económicos</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div><strong>Fecha:</strong> {selectedEntry.date ?? "No registrado"}</div>
                      <div><strong>Inicio:</strong> {selectedEntry.startTime ?? "No registrado"}</div>
                      <div><strong>Fin:</strong> {selectedEntry.endTime ?? "No registrado"}</div>
                      <div><strong>Patrón:</strong> {selectedEntry.skipper ?? "No registrado"}</div>
                      <div><strong>Arte:</strong> {selectedEntry.method ?? "No registrado"}</div>
                      <div><strong>Profundidad:</strong> {selectedEntry.depth != null ? `${selectedEntry.depth} m` : "No registrado"}</div>
                      <div><strong>Salarios:</strong> {selectedEntry.crewWages ? `$${selectedEntry.crewWages}` : "No registrado"}</div>
                      <div className="flex items-center gap-1"><Fuel className="h-4 w-4 text-muted-foreground" /><strong>Combustible:</strong> {selectedEntry.fuelConsumption ? `${selectedEntry.fuelConsumption} L` : "No registrado"}</div>
                      <div><strong>Clima:</strong> {selectedEntry.weather ?? "No registrado"}</div>
                      <div className="sm:col-span-2"><strong>Observaciones:</strong> {selectedEntry.observations ?? "No registrado"}</div>
                    </CardContent>
                  </Card>

                  {(selectedEntry.sacoMuestras || selectedEntry.kgPulpaVieira || selectedEntry.rindePulpaVieira) && (
                    <Card className="mt-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Producción</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                        <div><strong>Saco muestras:</strong> {selectedEntry.sacoMuestras || "No registrado"}</div>
                        <div><strong>Kg pulpa vieira:</strong> {selectedEntry.kgPulpaVieira || "No registrado"}</div>
                        <div><strong>N° bolsas:</strong> {selectedEntry.numBolsas || "No registrado"}</div>
                        <div><strong>Kg por bolsa:</strong> {selectedEntry.kgPorBolsa || "No registrado"}</div>
                        <div className="sm:col-span-2 flex items-center gap-1"><Waves className="h-4 w-4 text-muted-foreground" /><strong>Rinde pulpa vieira:</strong> {selectedEntry.rindePulpaVieira ? `${selectedEntry.rindePulpaVieira}%` : "No registrado"}</div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="tripulacion" className="mt-4 max-h-[46vh] overflow-y-auto pr-1">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Detalle de tripulación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {selectedEntry.sailors && selectedEntry.sailors.length > 0 ? (
                        selectedEntry.sailors.map((member, index) => (
                          <div key={index} className="flex items-center justify-between rounded-md border p-3">
                            <span className="font-medium">{member.name ?? `Marinero ${index + 1}`}</span>
                            <Badge variant="outline">{member.divingTime ? `${member.divingTime} min` : "Sin tiempo"}</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No hay tripulantes registrados.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ubicacion" className="mt-4 max-h-[46vh] overflow-y-auto pr-1">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Ubicación y área</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><strong>Área:</strong> {selectedEntry.area ?? "No registrado"}</div>
                      <div><strong>Ubicación:</strong> {selectedEntry.location ?? "No registrado"}</div>
                      <div><strong>GPS:</strong> {selectedEntry.gps ?? "No registrado"}</div>

                      <div className="pt-2">
                        <p className="mb-2 text-xs text-muted-foreground">Mapa de la entrada</p>
                        <EntryLocationMap gps={selectedEntry.gps} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <div className="flex justify-end border-t px-6 py-4">
            <DialogClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar entrada?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la entrada del{" "}
              <strong>{entryToDelete?.date ?? "Sin fecha"}</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────
function DataManagementSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex space-x-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="glass-card flex-1">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-12 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-5 w-44 mb-1" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-3 px-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <div className="flex gap-2 ml-auto">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
