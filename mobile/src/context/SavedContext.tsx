import React, { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { Monument } from '../hooks/useMonuments'
import type { TravelMode } from '../hooks/useRoute'

export interface SavedRoute {
  id: string
  name: string
  monuments: Monument[]
  mode: TravelMode
  distanceKm?: number
  durationMin?: number
  savedAt: number
}

interface SavedContextType {
  // — Want to Visit (Firebase-backed) —
  wantToVisit: Monument[]
  saveMonument: (monument: Monument) => void
  unsaveMonument: (id: string) => void
  isSaved: (id: string) => boolean

  // — Saved Routes (in-memory) —
  savedRoutes: SavedRoute[]
  saveRoute: (route: Omit<SavedRoute, 'id' | 'savedAt'>) => void
  removeSavedRoute: (id: string) => void

  // — Past Routes (in-memory, last 3) —
  pastRoutes: SavedRoute[]
  pushPastRoute: (route: Omit<SavedRoute, 'id' | 'savedAt'>) => void
}

const SavedContext = createContext<SavedContextType>({
  wantToVisit: [],
  saveMonument: () => {},
  unsaveMonument: () => {},
  isSaved: () => false,
  savedRoutes: [],
  saveRoute: () => {},
  removeSavedRoute: () => {},
  pastRoutes: [],
  pushPastRoute: () => {},
})

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [wantToVisit, setWantToVisit] = useState<Monument[]>([])
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([])
  const [pastRoutes, setPastRoutes] = useState<SavedRoute[]>([])

  // Rehydrate wantToVisit from Firestore on auth change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setWantToVisit([])
        return
      }
      const savedSnap = await getDocs(
        query(collection(db, 'saved_landmarks'), where('user_uid', '==', user.uid))
      )
      const monumentSnaps = await Promise.all(
        savedSnap.docs.map((savedDoc) =>
          getDoc(doc(db, 'monuments', savedDoc.data().landmark_id as string))
        )
      )
      const monuments: Monument[] = monumentSnaps
        .filter((snap) => snap.exists())
        .map((snap) => {
          const data = snap.data()
          const geoPoint = data.coordinates
          return {
            id: snap.id,
            name: data.name ?? '',
            coordinates: {
              latitude: geoPoint?.latitude ?? 0,
              longitude: geoPoint?.longitude ?? 0,
            },
            location: data.location ?? '',
            period: data.period ?? '',
            architect: data.architect ?? '',
            description: data.description ?? '',
          }
        })
      setWantToVisit(monuments)
    })
    return unsubscribe
  }, [])

  // — Want to Visit —
  const saveMonument = (monument: Monument) => {
    const user = auth.currentUser
    if (!user) return
    setWantToVisit((prev) =>
      prev.find((m) => m.id === monument.id) ? prev : [...prev, monument]
    )
    setDoc(doc(db, 'saved_landmarks', `${user.uid}_${monument.id}`), {
      user_uid: user.uid,
      landmark_id: monument.id,
      save_time: serverTimestamp(),
    })
  }

  const unsaveMonument = (id: string) => {
    const user = auth.currentUser
    if (!user) return
    setWantToVisit((prev) => prev.filter((m) => m.id !== id))
    deleteDoc(doc(db, 'saved_landmarks', `${user.uid}_${id}`))
  }

  const isSaved = (id: string) => wantToVisit.some((m) => m.id === id)

  // — Saved Routes —
  const saveRoute = (route: Omit<SavedRoute, 'id' | 'savedAt'>) => {
    const entry: SavedRoute = {
      ...route,
      id: Date.now().toString(),
      savedAt: Date.now(),
    }
    setSavedRoutes((prev) => [entry, ...prev])
  }

  const removeSavedRoute = (id: string) => {
    setSavedRoutes((prev) => prev.filter((r) => r.id !== id))
  }

  // — Past Routes —
  const pushPastRoute = (route: Omit<SavedRoute, 'id' | 'savedAt'>) => {
    const entry: SavedRoute = {
      ...route,
      id: Date.now().toString(),
      savedAt: Date.now(),
    }
    setPastRoutes((prev) => [entry, ...prev].slice(0, 3))
  }

  return (
    <SavedContext.Provider
      value={{
        wantToVisit,
        saveMonument,
        unsaveMonument,
        isSaved,
        savedRoutes,
        saveRoute,
        removeSavedRoute,
        pastRoutes,
        pushPastRoute,
      }}
    >
      {children}
    </SavedContext.Provider>
  )
}

export const useSaved = () => useContext(SavedContext)
