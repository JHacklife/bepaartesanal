import badgesConfig from './badges.json'
import type { FishingEntry } from '@/lib/entries/types'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  condition: BadgeCondition
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
}

export interface BadgeCondition {
  type: string
  value: unknown
}

export interface EarnedBadge {
  id: string
  name: string
  icon: string
  earnedAt: string
  rarity: string
}

const badges: Badge[] = badgesConfig.badges as Badge[]

export const getAllBadges = (): Badge[] => badges

export const getBadgeById = (id: string): Badge | undefined => {
  return badges.find(b => b.id === id)
}

interface UserStats {
  totalEntries: number
  totalWeight: number
  entries: FishingEntry[]
  createdAt: Date
}

export const evaluateBadges = (stats: UserStats): string[] => {
  const earnedIds: string[] = []

  badges.forEach(badge => {
    if (evaluateBadgeCondition(badge.condition, stats)) {
      earnedIds.push(badge.id)
    }
  })

  return earnedIds
}

const evaluateBadgeCondition = (condition: BadgeCondition, stats: UserStats): boolean => {
  switch (condition.type) {
    case 'total-entries':
      return stats.totalEntries >= (condition.value as number)

    case 'total-weight':
      return stats.totalWeight >= (condition.value as number)

    case 'single-entry-weight': {
      const maxWeight = Math.max(
        ...stats.entries.map(e => {
          if (!e.catches || e.catches.length === 0) return 0
          return e.catches.reduce((sum, c) => {
            const weight = 'weight' in c ? c.weight : (c as { peso?: string }).peso
            return sum + (parseFloat(weight || '0') || 0)
          }, 0)
        })
      )
      return maxWeight >= (condition.value as number)
    }

    case 'favorite-species': {
      const speciesCounts: Record<string, number> = {}
      stats.entries.forEach(entry => {
        if (entry.species) {
          speciesCounts[entry.species] = (speciesCounts[entry.species] || 0) + 1
        }
      })
      const favorite = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1])[0]
      return favorite && favorite[0].includes(condition.value as string)
    }

    case 'unique-species-count': {
      const uniqueSpecies = new Set<string>()
      stats.entries.forEach(entry => {
        if (entry.species) {
          uniqueSpecies.add(entry.species)
        }
      })
      return uniqueSpecies.size >= (condition.value as number)
    }

    case 'consecutive-days': {
      if (stats.entries.length === 0) return false
      const dates = stats.entries
        .map(e => e.date)
        .filter(Boolean)
        .sort()

      let maxConsecutive = 1
      let currentConsecutive = 1

      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]!)
        const curr = new Date(dates[i]!)
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)

        if (diff === 1) {
          currentConsecutive++
          maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
        } else if (diff > 1) {
          currentConsecutive = 1
        }
      }

      return maxConsecutive >= (condition.value as number)
    }

    case 'all-entries-synced': {
      return stats.entries.every(e => e.status === 'Cargado' || e.status === 'Sincronizado')
    }

    case 'registration-date': {
      if (condition.value === 'early') {
        const accountAgeMonths = (Date.now() - stats.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
        return accountAgeMonths > 6
      }
      return false
    }

    default:
      return false
  }
}

export const formatBadgeRarity = (rarity: string): string => {
  const rarityMap: Record<string, string> = {
    common: 'Común',
    uncommon: 'Poco común',
    rare: 'Rara',
    legendary: 'Legendaria'
  }
  return rarityMap[rarity] || rarity
}
