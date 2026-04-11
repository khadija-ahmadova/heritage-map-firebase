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

  // — Saved Routes (Firestore-backed) —
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

  // Rehydrate wantToVisit and savedRoutes from Firestore on auth change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setWantToVisit([])
        setSavedRoutes([])
        return
      }

      // Load Want to Visit
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

      // Load Saved Routes
      const routesSnap = await getDocs(
        query(collection(db, 'routes'), where('user_uid', '==', user.uid))
      )
      const routes: SavedRoute[] = routesSnap.docs
        .map((d) => {
          const data = d.data()
          const routeMonuments: Monument[] = (data.landmarks as any[]).map((l) => ({
            id: l.landmark_id,
            name: l.name ?? '',
            location: l.location ?? '',
            period: l.period ?? '',
            architect: l.architect ?? '',
            description: l.description ?? '',
            coordinates: { latitude: l.latitude ?? 0, longitude: l.longitude ?? 0 },
          }))
          return {
            id: d.id,
            name: data.title ?? '',
            mode: data.mode as TravelMode,
            distanceKm: data.distanceKm ?? undefined,
            durationMin: data.durationMin ?? undefined,
            savedAt: data.creation_time?.toMillis() ?? Date.now(),
            monuments: routeMonuments,
          }
        })
        .sort((a, b) => b.savedAt - a.savedAt)
      setSavedRoutes(routes)
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
    const user = auth.currentUser
    // Generate a Firestore doc reference (ID known before write)
    const docRef = user ? doc(collection(db, 'routes')) : null
    const entry: SavedRoute = {
      ...route,
      id: docRef?.id ?? Date.now().toString(),
      savedAt: Date.now(),
    }
    setSavedRoutes((prev) => [entry, ...prev])

    if (user && docRef) {
      // Fire-and-forget — monument snapshots stored inline to avoid N+1 on load
      setDoc(docRef, {
        user_uid: user.uid,
        title: route.name,
        mode: route.mode,
        creation_time: serverTimestamp(),
        distanceKm: route.distanceKm ?? null,
        durationMin: route.durationMin ?? null,
        landmarks: route.monuments.map((m, i) => ({
          landmark_id: m.id,
          order_index: i,
          name: m.name,
          location: m.location ?? '',
          period: m.period ?? '',
          architect: m.architect ?? '',
          description: m.description ?? '',
          latitude: m.coordinates.latitude,
          longitude: m.coordinates.longitude,
        })),
      })
    }
  }

  const removeSavedRoute = (id: string) => {
    const user = auth.currentUser
    setSavedRoutes((prev) => prev.filter((r) => r.id !== id))
    if (user) {
      deleteDoc(doc(db, 'routes', id))
    }
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
