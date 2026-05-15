export interface CrewMember {
  name?: string
  divingTime?: string
}

export interface CatchItem {
  id: string
  commonName: string
  scientificName: string
  crates: string
  weight: string
  size?: string
}

export interface FishingEntry {
  id: string
  date?: string
  startTime?: string
  endTime?: string
  skipper?: string
  method?: string
  area?: string
  depth?: string | number
  sailors?: CrewMember[]
  species?: string
  catches?: CatchItem[]
  crewWages?: string
  fuelConsumption?: string
  weather?: string
  observations?: string
  gps?: string
  location?: string
  coordinates?: [number, number]
  status?: string
  enfilacion?: string
  sacoMuestras?: string
  kgPulpaVieira?: string
  numBolsas?: string
  kgPorBolsa?: string
  rindePulpaVieira?: string
  createdAt: string
  updatedAt: string
}

export type NewFishingEntry = Omit<FishingEntry, "id" | "createdAt" | "updatedAt"> & {
  id?: string
}
