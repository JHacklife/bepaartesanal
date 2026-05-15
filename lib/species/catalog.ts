import type { Species } from "./types"
import speciesCatalogJson from "./catalog.json"

export const speciesCatalog: Species[] = speciesCatalogJson as Species[]
