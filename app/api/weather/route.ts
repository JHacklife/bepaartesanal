import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api/handler"

export const runtime = "nodejs"

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number
    apparent_temperature?: number
    relative_humidity_2m?: number
    precipitation?: number
    cloud_cover?: number
    pressure_msl?: number
    wind_speed_10m?: number
    wind_direction_10m?: number
    wind_gusts_10m?: number
    weather_code?: number
    is_day?: number
    visibility?: number
  }
  hourly?: {
    time?: string[]
    temperature_2m?: number[]
    apparent_temperature?: number[]
    relative_humidity_2m?: number[]
    precipitation?: number[]
    cloud_cover?: number[]
    pressure_msl?: number[]
    wind_speed_10m?: number[]
    wind_direction_10m?: number[]
    wind_gusts_10m?: number[]
    weather_code?: number[]
    is_day?: number[]
    visibility?: number[]
  }
  daily?: {
    time?: string[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
  }
}

const getNearestIndex = (times: string[]) => {
  if (times.length === 0) return -1

  const now = Date.now()
  let nearestIndex = 0
  let nearestDiff = Number.POSITIVE_INFINITY

  times.forEach((value, index) => {
    const parsed = Date.parse(value)
    if (Number.isNaN(parsed)) return

    const diff = Math.abs(parsed - now)
    if (diff < nearestDiff) {
      nearestDiff = diff
      nearestIndex = index
    }
  })

  return nearestIndex
}

export const GET = withApiHandler("GET", "/api/weather", async (request: NextRequest) => {
  const latRaw = request.nextUrl.searchParams.get("lat")
  const lngRaw = request.nextUrl.searchParams.get("lng")

  const lat = Number.parseFloat(latRaw || "")
  const lng = Number.parseFloat(lngRaw || "")

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ message: "Parámetros lat/lng inválidos" }, { status: 400 })
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ message: "Parámetros lat/lng fuera de rango" }, { status: 400 })
  }

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,is_day,visibility",
    hourly:
      "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,is_day,visibility",
    daily: "temperature_2m_max,temperature_2m_min",
    forecast_days: "1",
    past_days: "0",
    timezone: "auto",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
    timeformat: "iso8601",
    models: "best_match",
    cell_selection: "land",
  })

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  })

  if (!response.ok) {
    return NextResponse.json({ message: "No se pudo obtener el clima" }, { status: 502 })
  }

  const payload = (await response.json()) as OpenMeteoResponse
  const times = payload.hourly?.time || []
  const index = getNearestIndex(times)

  const temperatureC =
    payload.current?.temperature_2m ?? (index >= 0 ? payload.hourly?.temperature_2m?.[index] ?? null : null)
  const apparentTemperatureC =
    payload.current?.apparent_temperature ??
    (index >= 0 ? payload.hourly?.apparent_temperature?.[index] ?? null : null)
  const relativeHumidity =
    payload.current?.relative_humidity_2m ??
    (index >= 0 ? payload.hourly?.relative_humidity_2m?.[index] ?? null : null)
  const precipitationMm =
    payload.current?.precipitation ?? (index >= 0 ? payload.hourly?.precipitation?.[index] ?? null : null)
  const cloudCover = payload.current?.cloud_cover ?? (index >= 0 ? payload.hourly?.cloud_cover?.[index] ?? null : null)
  const pressureMsl = payload.current?.pressure_msl ?? (index >= 0 ? payload.hourly?.pressure_msl?.[index] ?? null : null)
  const windKmh =
    payload.current?.wind_speed_10m ?? (index >= 0 ? payload.hourly?.wind_speed_10m?.[index] ?? null : null)
  const windDirectionDeg =
    payload.current?.wind_direction_10m ??
    (index >= 0 ? payload.hourly?.wind_direction_10m?.[index] ?? null : null)
  const windGustsKmh =
    payload.current?.wind_gusts_10m ?? (index >= 0 ? payload.hourly?.wind_gusts_10m?.[index] ?? null : null)
  const weatherCode = payload.current?.weather_code ?? (index >= 0 ? payload.hourly?.weather_code?.[index] ?? null : null)
  const isDay = payload.current?.is_day ?? (index >= 0 ? payload.hourly?.is_day?.[index] ?? null : null)
  const visibilityM =
    payload.current?.visibility ?? (index >= 0 ? payload.hourly?.visibility?.[index] ?? null : null)
  const temperatureMaxC = payload.daily?.temperature_2m_max?.[0] ?? null
  const temperatureMinC = payload.daily?.temperature_2m_min?.[0] ?? null

  return NextResponse.json({
    temperatureC,
    apparentTemperatureC,
    relativeHumidity,
    precipitationMm,
    cloudCover,
    pressureMsl,
    windKmh,
    windDirectionDeg,
    windGustsKmh,
    weatherCode,
    isDay,
    visibilityKm: visibilityM == null ? null : Number((visibilityM / 1000).toFixed(1)),
    temperatureMaxC,
    temperatureMinC,
    fetchedAt: new Date().toISOString(),
  })
})