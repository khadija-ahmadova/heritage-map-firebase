import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface Monument {
  id: string
  name: string
  coordinates: { latitude: number; longitude: number }
  location: string
  period: string
  architect: string
  description: string
}

interface UseMonumentsResult {
  monuments: Monument[]
  loading: boolean
  error: Error | null
}

// fetch monuments from firebase and return them as a list
export function useMonuments(): UseMonumentsResult {
  const [monuments, setMonuments] = useState<Monument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    getDocs(collection(db, 'monuments'))
      .then((snapshot) => {
        const docs = snapshot.docs.map((doc) => {
          const data = doc.data()
          const geoPoint = data.coordinates
          return {
            id: doc.id,
            name: data.name ?? '',
            coordinates: {
              latitude: geoPoint?.latitude ?? 0,
              longitude: geoPoint?.longitude ?? 0,
            },
            location: data.location ?? '',
            period: data.period ?? '',
            architect: data.architect ?? '',
            description: data.description ?? '',
          } satisfies Monument
        })
        setMonuments(docs)
      })
      .catch((err: Error) => {
        setError(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return { monuments, loading, error }
}
