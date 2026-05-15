export type WeatherApiResponse = {
  temperatureC: number | null
  apparentTemperatureC: number | null
  temperatureMaxC: number | null
  temperatureMinC: number | null
  relativeHumidity: number | null
  precipitationMm: number | null
  cloudCover: number | null
  pressureMsl: number | null
  windKmh: number | null
  windDirectionDeg: number | null
  windGustsKmh: number | null
  weatherCode: number | null
  isDay: number | null
  visibilityKm: number | null
  fetchedAt: string
}

export type WeatherSnapshot = Omit<WeatherApiResponse, "fetchedAt"> & {
  windDirectionLabel: string
  waveEstimate: string
  weatherLabel: string
  isLoading: boolean
  error: string
  fetchedAt: string | null
}

export const initialWeatherSnapshot: WeatherSnapshot = {
  temperatureC: null,
  apparentTemperatureC: null,
  temperatureMaxC: null,
  temperatureMinC: null,
  relativeHumidity: null,
  precipitationMm: null,
  cloudCover: null,
  pressureMsl: null,
  windKmh: null,
  windDirectionDeg: null,
  windGustsKmh: null,
  weatherCode: null,
  isDay: null,
  visibilityKm: null,
  windDirectionLabel: "N/D",
  waveEstimate: "N/D",
  weatherLabel: "N/D",
  isLoading: false,
  error: "",
  fetchedAt: null,
}
