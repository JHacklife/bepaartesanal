"use client"

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps"

type Coordinates = { lat: number; lng: number }

const parseGpsCoordinates = (gps?: string | null): Coordinates | null => {
  if (!gps) return null

  const normalized = gps.replace(/[°]/g, "").trim()
  const match = normalized.match(/(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/)
  if (!match) return null

  const lat = Number.parseFloat(match[1])
  const lng = Number.parseFloat(match[2])

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null

  return { lat, lng }
}

const MapStateMessage = ({ message }: { message: string }) => (
  <div className="rounded-md border border-dashed p-4 text-xs text-muted-foreground">{message}</div>
)

type EntryLocationMapProps = {
  gps?: string | null
  height?: number
}

export function EntryLocationMap({ gps, height = 240 }: EntryLocationMapProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  const coordinates = parseGpsCoordinates(gps)

  if (!coordinates) {
    return <MapStateMessage message="No hay coordenadas GPS válidas para mostrar el mapa." />
  }

  if (!googleMapsApiKey) {
    return <MapStateMessage message="Falta la API key de Google Maps para visualizar el mapa." />
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <APIProvider apiKey={googleMapsApiKey}>
        <Map
          key={`${coordinates.lat}-${coordinates.lng}`}
          style={{ width: "100%", height: `${height}px` }}
          defaultCenter={coordinates}
          defaultZoom={11}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          <Marker position={coordinates} />
        </Map>
      </APIProvider>
    </div>
  )
}
