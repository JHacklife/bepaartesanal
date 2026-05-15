import type { FishingEntry, NewFishingEntry } from "./types"

const STORAGE_KEY = "bepa-entries"
const UNSENT_STORAGE_KEY = "bepa-unsent-entries"

type StorageProvider = "localStorage" | "sql" | "file"

const parseCoordinatesFromText = (value?: string): [number, number] | undefined => {
  if (!value) return undefined

  const matches = value.match(/-?\d+(?:\.\d+)?/g)
  if (!matches || matches.length < 2) return undefined

  const lat = Number.parseFloat(matches[0])
  const lng = Number.parseFloat(matches[1])

  if (Number.isNaN(lat) || Number.isNaN(lng)) return undefined
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return undefined

  return [lat, lng]
}

const normalizeEntry = (raw: Record<string, unknown>, index: number): FishingEntry => {
  const nowIso = new Date().toISOString()
  const date = typeof raw.date === "string" ? raw.date : undefined
  const startTime = typeof raw.startTime === "string" ? raw.startTime : undefined

  const idCandidate = raw.id
  const id =
    typeof idCandidate === "string"
      ? idCandidate
      : typeof idCandidate === "number"
        ? String(idCandidate)
        : `${date || "entry"}-${startTime || "00:00"}-${index}`

  let coordinates: [number, number] | undefined
  if (Array.isArray(raw.coordinates) && raw.coordinates.length >= 2) {
    const lat = Number(raw.coordinates[0])
    const lng = Number(raw.coordinates[1])

    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      coordinates = [lat, lng]
    }
  }

  if (!coordinates) {
    coordinates = parseCoordinatesFromText(typeof raw.gps === "string" ? raw.gps : undefined)
  }

  return {
    id,
    date,
    startTime,
    endTime: typeof raw.endTime === "string" ? raw.endTime : undefined,
    skipper: typeof raw.skipper === "string" ? raw.skipper : undefined,
    method: typeof raw.method === "string" ? raw.method : undefined,
    area: typeof raw.area === "string" ? raw.area : undefined,
    depth: typeof raw.depth === "string" || typeof raw.depth === "number" ? raw.depth : undefined,
    sailors: Array.isArray(raw.sailors) ? (raw.sailors as FishingEntry["sailors"]) : [],
    species: typeof raw.species === "string" ? raw.species : undefined,
    catches: Array.isArray(raw.catches) ? (raw.catches as FishingEntry["catches"]) : [],
    crewWages: typeof raw.crewWages === "string" ? raw.crewWages : undefined,
    fuelConsumption: typeof raw.fuelConsumption === "string" ? raw.fuelConsumption : undefined,
    weather: typeof raw.weather === "string" ? raw.weather : undefined,
    observations: typeof raw.observations === "string" ? raw.observations : undefined,
    gps: typeof raw.gps === "string" ? raw.gps : undefined,
    location: typeof raw.location === "string" ? raw.location : undefined,
    coordinates,
    status: typeof raw.status === "string" ? raw.status : undefined,
    enfilacion: typeof raw.enfilacion === "string" ? raw.enfilacion : undefined,
    sacoMuestras: typeof raw.sacoMuestras === "string" ? raw.sacoMuestras : undefined,
    kgPulpaVieira: typeof raw.kgPulpaVieira === "string" ? raw.kgPulpaVieira : undefined,
    numBolsas: typeof raw.numBolsas === "string" ? raw.numBolsas : undefined,
    kgPorBolsa: typeof raw.kgPorBolsa === "string" ? raw.kgPorBolsa : undefined,
    rindePulpaVieira: typeof raw.rindePulpaVieira === "string" ? raw.rindePulpaVieira : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : nowIso,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : nowIso,
  }
}

const getConfiguredProvider = (): StorageProvider => {
  const envValue = (process.env.NEXT_PUBLIC_STORAGE_PROVIDER || "localStorage").toLowerCase()

  if (envValue === "sql") return "sql"
  if (envValue === "file") return "file"

  return "localStorage"
}

const isClient = () => typeof window !== "undefined"

const readUnsentEntries = (): FishingEntry[] => {
  if (!isClient()) return []

  const raw = window.localStorage.getItem(UNSENT_STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((entry, index) => normalizeEntry(entry as Record<string, unknown>, index))
  } catch {
    return []
  }
}

const saveUnsentEntries = (entries: FishingEntry[]) => {
  if (!isClient()) return
  window.localStorage.setItem(UNSENT_STORAGE_KEY, JSON.stringify(entries))
}

const markAsUnsent = (entry: FishingEntry): FishingEntry => ({
  ...entry,
  status: "No cargado",
})

const markAsLoaded = (entry: FishingEntry): FishingEntry => ({
  ...entry,
  status: "Cargado",
})

export interface EntriesRepository {
  list(): Promise<FishingEntry[]>
  add(entry: NewFishingEntry): Promise<FishingEntry>
}

const getErrorMessage = async (response: Response, fallbackMessage: string) => {
  try {
    const payload = (await response.json()) as {
      error?: string
      message?: string
      title?: string
    }
    if (payload && typeof payload.message === "string") {
      return payload.message
    }
    if (payload && typeof payload.error === "string") {
      return payload.error
    }
    if (payload && typeof payload.title === "string") {
      return payload.title
    }
  } catch {
    return fallbackMessage
  }

  return fallbackMessage
}

class LocalStorageEntriesRepository implements EntriesRepository {
  private isClient(): boolean {
    return typeof window !== "undefined"
  }

  private readRawEntries(): FishingEntry[] {
    if (!this.isClient()) return []

    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []

      return parsed.map((entry, index) => normalizeEntry(entry as Record<string, unknown>, index))
    } catch {
      return []
    }
  }

  private persist(entries: FishingEntry[]) {
    if (!this.isClient()) return

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }

  async list(): Promise<FishingEntry[]> {
    return this.readRawEntries()
  }

  async add(entry: NewFishingEntry): Promise<FishingEntry> {
    const existing = this.readRawEntries()
    const nowIso = new Date().toISOString()

    const completeEntry = normalizeEntry(
      {
        ...entry,
        id: entry.id || `entry-${Date.now()}`,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      0,
    )

    this.persist([completeEntry, ...existing])

    return completeEntry
  }
}

class SqlEntriesRepository implements EntriesRepository {
  private readLocalEntriesFallback(): FishingEntry[] {
    if (!isClient()) return []

    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed.map((entry, index) => normalizeEntry(entry as Record<string, unknown>, index))
    } catch {
      return []
    }
  }

  async list(): Promise<FishingEntry[]> {
    const unsentEntries = readUnsentEntries().map(markAsUnsent)

    try {
      const response = await fetch("/api/entries", {
        cache: "no-store",
      })

      if (!response.ok) {
        const message = await getErrorMessage(response, "No se pudieron obtener entradas desde SQL.")
        console.warn("Fallo de SQL al listar entradas. Usando fallback local.", message)
        const localEntries = this.readLocalEntriesFallback().map(markAsUnsent)
        return [...unsentEntries, ...localEntries]
      }

      const remoteEntries = ((await response.json()) as FishingEntry[]).map(markAsLoaded)
      return [...unsentEntries, ...remoteEntries]
    } catch (error) {
      console.warn("Fallo de conexión al listar entradas. Usando fallback local.", error)
      const localEntries = this.readLocalEntriesFallback().map(markAsUnsent)
      return [...unsentEntries, ...localEntries]
    }
  }

  async add(entry: NewFishingEntry): Promise<FishingEntry> {
    const response = await fetch("/api/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    })

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "No se pudo guardar la entrada en SQL."))
    }

    return markAsLoaded((await response.json()) as FishingEntry)
  }
}

class UnsupportedEntriesRepository implements EntriesRepository {
  constructor(private readonly providerName: Exclude<StorageProvider, "localStorage">) { }

  async list(): Promise<FishingEntry[]> {
    throw new Error(`El proveedor ${this.providerName} no está implementado aún.`)
  }

  async add(_entry: NewFishingEntry): Promise<FishingEntry> {
    throw new Error(`El proveedor ${this.providerName} no está implementado aún.`)
  }
}

const createRepository = (): EntriesRepository => {
  const provider = getConfiguredProvider()

  if (provider === "localStorage") {
    return new LocalStorageEntriesRepository()
  }

  if (provider === "sql") {
    return new SqlEntriesRepository()
  }

  return new UnsupportedEntriesRepository(provider)
}

export const entriesRepository = createRepository()

export const listFishingEntries = async (): Promise<FishingEntry[]> => entriesRepository.list()

export const saveFishingEntry = async (entry: NewFishingEntry): Promise<FishingEntry> => entriesRepository.add(entry)

export const queueFailedFishingEntry = (entry: NewFishingEntry): FishingEntry => {
  const nowIso = new Date().toISOString()
  const normalized = normalizeEntry(
    {
      ...entry,
      id: entry.id || `offline-${Date.now()}`,
      createdAt: nowIso,
      updatedAt: nowIso,
      status: "No cargado",
    },
    0,
  )

  const existing = readUnsentEntries()
  saveUnsentEntries([normalized, ...existing])

  return normalized
}
