import React, { createContext, useContext, useState } from 'react'
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

  const saveMonument = (monument: Monument) => {
    setWantToVisit((prev) =>
      prev.find((m) => m.id === monument.id) ? prev : [...prev, monument]
    )
  }

  const unsaveMonument = (id: string) => {
    setWantToVisit((prev) => prev.filter((m) => m.id !== id))
  }

  const isSaved = (id: string) => wantToVisit.some((m) => m.id === id)

  return (
    <SavedContext.Provider value={{ wantToVisit, saveMonument, unsaveMonument, isSaved }}>
      {children}
    </SavedContext.Provider>
  )
}

export const useSaved = () => useContext(SavedContext)
