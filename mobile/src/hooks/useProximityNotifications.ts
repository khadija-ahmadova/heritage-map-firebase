import { useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import type { Monument } from './useMonuments'

const THRESHOLD_METERS = 1500
function haversineDistance(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371000
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const sinLat = Math.sin(dLat / 2)
  const sinLon = Math.sin(dLon / 2)
  const c =
    sinLat * sinLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLon * sinLon
  return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c))
}

export function useProximityNotifications(
  userLocation: { latitude: number; longitude: number } | null,
  monuments: Monument[],
  enabled: boolean
) {
  // Tracks which monument IDs have already fired this session
  const notifiedIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!enabled || !userLocation || monuments.length === 0) return

    for (const monument of monuments) {
      if (notifiedIds.current.has(monument.id)) continue

      const distance = haversineDistance(userLocation, monument.coordinates)

      if (distance <= THRESHOLD_METERS) {
        notifiedIds.current.add(monument.id)

        const body = monument.fun_fact
          ? `Did you know? ${monument.fun_fact}`
          : `You're ${Math.round(distance)}m from ${monument.name}!`

        Notifications.scheduleNotificationAsync({
          content: {
            title: `📍 Near ${monument.name}`,
            body,
            sound: true,
            data: { monumentId: monument.id }, 
          },
          trigger: null, // fire immediately
        })
      }
    }
  }, [userLocation, monuments, enabled])
}