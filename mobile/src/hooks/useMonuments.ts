import { useState, useEffect } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface Monument {
  id: string
  name: string
  coordinates: { latitude: number; longitude: number }
  location: string
  period: string
  architect: string
  description: string
  simplified_desc: string
  fun_fact?: string
  photos: string[]
}

interface UseMonumentsResult {
  monuments: Monument[]
  loading: boolean
  error: Error | null
}

export function useMonuments(): UseMonumentsResult {
  const [monuments, setMonuments] = useState<Monument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'monuments'))
        const docs = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data()
            const geoPoint = data.coordinates

            const photosSnap = await getDocs(
              query(collection(db, 'monuments', doc.id, 'photos'), orderBy('uploaded_at', 'desc'))
            )
            const photos = photosSnap.docs.map((p) => p.data().image_url as string)

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
              simplified_desc: data.simplified_desc ?? '',
              fun_fact: data.fun_fact ?? '',
              photos,
            } satisfies Monument
          })
        )
        setMonuments(docs)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  return { monuments, loading, error }
}