import { useState } from 'react'

export type TravelMode = 'foot-walking' | 'driving-car' | 'cycling-regular'

export interface RouteResult {
  coordinates: { latitude: number; longitude: number }[]
  distanceKm: number
  durationMin: number
}

const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY

export function useRoute() {
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchRoute = async (
    stops: { latitude: number; longitude: number }[],
    mode: TravelMode
  ) => {
    if (stops.length < 2) return
    setLoading(true)
    setError('')

    try {
      const coordinates = stops.map((s) => [s.longitude, s.latitude])

      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/${mode}/geojson`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: ORS_API_KEY,
          },
          body: JSON.stringify({ coordinates }),
        }
      )

      const data = await response.json()

      if (!data.features || data.features.length === 0) {
        setError('No route found.')
        return
      }

      const feature = data.features[0]
      const coords = feature.geometry.coordinates.map(([lng, lat]: number[]) => ({
        latitude: lat,
        longitude: lng,
      }))

      const summary = feature.properties.summary
      setRouteResult({
        coordinates: coords,
        distanceKm: Math.round((summary.distance / 1000) * 10) / 10,
        durationMin: Math.round(summary.duration / 60),
      })
    } catch {
      setError('Failed to fetch route.')
    } finally {
      setLoading(false)
    }
  }

  const clearRoute = () => setRouteResult(null)

  return { routeResult, loading, error, fetchRoute, clearRoute }
}