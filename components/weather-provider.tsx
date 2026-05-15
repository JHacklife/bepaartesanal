"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import axios from "axios"
import {
  initialWeatherSnapshot,
  type WeatherApiResponse,
  type WeatherSnapshot,
} from "@/lib/weather/types"

type Coordinates = { lat: number; lng: number }

const getWaveEstimate = (windKmh: number | null) => {
  if (windKmh == null) return "N/D"
  if (windKmh < 10) return "0.2-0.5 m"
  if (windKmh < 20) return "0.5-1 m"
  if (windKmh < 30) return "1-1.5 m"
  return "> 1.5 m"
}

const getWindDirectionLabel = (degrees: number | null) => {
  if (degrees == null) return "N/D"

  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"]
  const normalized = ((degrees % 360) + 360) % 360
  const index = Math.round(normalized / 45) % directions.length
  return `${directions[index]} (${Math.round(normalized)}°)`
}

const getWeatherCodeLabel = (code: number | null, isDay: number | null) => {
  if (code == null) return "N/D"

  if (code === 0) return isDay === 0 ? "Despejado (noche)" : "Despejado"
  if ([1, 2, 3].includes(code)) return "Parcialmente nublado"
  if ([45, 48].includes(code)) return "Niebla"
  if ([51, 53, 55, 56, 57].includes(code)) return "Llovizna"
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Lluvia"
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Nieve"
  if ([95, 96, 99].includes(code)) return "Tormenta"
  return `Código ${code}`
}

type WeatherContextValue = {
  weatherSnapshot: WeatherSnapshot
  refreshWeather: (coordinates: Coordinates) => Promise<void>
  resetWeather: () => void
}

const WeatherContext = createContext<WeatherContextValue | null>(null)

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [weatherSnapshot, setWeatherSnapshot] = useState<WeatherSnapshot>(initialWeatherSnapshot)

  const resetWeather = useCallback(() => {
    setWeatherSnapshot(initialWeatherSnapshot)
  }, [])

  const refreshWeather = useCallback(async ({ lat, lng }: Coordinates) => {
    setWeatherSnapshot((prev) => ({ ...prev, isLoading: true, error: "" }))

    try {
      const { data } = await axios.get<WeatherApiResponse>("/api/weather", {
        params: { lat, lng },
        headers: { Accept: "application/json" },
      })

      setWeatherSnapshot({
        temperatureC: data.temperatureC,
        apparentTemperatureC: data.apparentTemperatureC,
        temperatureMaxC: data.temperatureMaxC,
        temperatureMinC: data.temperatureMinC,
        relativeHumidity: data.relativeHumidity,
        precipitationMm: data.precipitationMm,
        cloudCover: data.cloudCover,
        pressureMsl: data.pressureMsl,
        windKmh: data.windKmh,
        windDirectionDeg: data.windDirectionDeg,
        windGustsKmh: data.windGustsKmh,
        weatherCode: data.weatherCode,
        isDay: data.isDay,
        visibilityKm: data.visibilityKm,
        windDirectionLabel: getWindDirectionLabel(data.windDirectionDeg),
        waveEstimate: getWaveEstimate(data.windKmh),
        weatherLabel: getWeatherCodeLabel(data.weatherCode, data.isDay),
        fetchedAt: data.fetchedAt,
        isLoading: false,
        error: "",
      })
    } catch {
      setWeatherSnapshot((prev) => ({
        ...prev,
        isLoading: false,
        error: "No se pudo obtener el clima actual",
      }))
    }
  }, [])

  const value = useMemo(
    () => ({ weatherSnapshot, refreshWeather, resetWeather }),
    [weatherSnapshot, refreshWeather, resetWeather],
  )

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
}

export function useWeather() {
  const context = useContext(WeatherContext)
  if (!context) {
    throw new Error("useWeather debe usarse dentro de WeatherProvider")
  }
  return context
}
