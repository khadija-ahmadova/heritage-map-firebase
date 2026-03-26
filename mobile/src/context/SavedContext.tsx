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

interface SavedContextType {
  wantToVisit: Monument[]
  saveMonument: (monument: Monument) => void
  unsaveMonument: (id: string) => void
  isSaved: (id: string) => boolean
}

const SavedContext = createContext<SavedContextType>({
  wantToVisit: [],
  saveMonument: () => {},
  unsaveMonument: () => {},
  isSaved: () => false,
})

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [wantToVisit, setWantToVisit] = useState<Monument[]>([])

  // Rehydrate from Firestore when user signs in; clear when they sign out
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

  const saveMonument = (monument: Monument) => {
    const user = auth.currentUser
    if (!user) return
    // UI reflects immediately
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
    // UI reflects immediately
    setWantToVisit((prev) => prev.filter((m) => m.id !== id))
    deleteDoc(doc(db, 'saved_landmarks', `${user.uid}_${id}`))
  }

  const isSaved = (id: string) => wantToVisit.some((m) => m.id === id)

  return (
    <SavedContext.Provider value={{ wantToVisit, saveMonument, unsaveMonument, isSaved }}>
      {children}
    </SavedContext.Provider>
  )
}

export const useSaved = () => useContext(SavedContext)
