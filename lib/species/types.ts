export interface Species {
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
