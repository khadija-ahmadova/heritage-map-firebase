import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

type PrefsContextType = {
  isDark: boolean
  toggleTheme: () => void
  notifications: boolean
  setNotifications: (val: boolean) => void
  location: boolean
  setLocation: (val: boolean) => void
  colors: {
    background: string
    card: string
    text: string
    subtext: string
    border: string
    header: string
    accent: string  
    accentSecondary: string
  }
}

const lightColors = {
  background: '#ffffff',
  card: '#FFF3EC',
  text: '#1a1a1a',
  subtext: '#292828',
  border: '#ffddc4',
  header: '#ffffff',
  accent: '#6E3606',
  accentSecondary: '#E8A876',
}

const darkColors = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  subtext: '#BBBBBB',
  border: '#6B6A6A',
  header: '#545353',
  accent: '#52050A',
  accentSecondary: '#8B0E16',
}

const PrefsContext = createContext<PrefsContextType>({} as PrefsContextType)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [notifications, setNotificationsState] = useState(true)
  const [location, setLocationState] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      const [t, n, l] = await Promise.all([
        AsyncStorage.getItem('pref_theme'),
        AsyncStorage.getItem('pref_notifications'),
        AsyncStorage.getItem('pref_location'),
      ])
      if (t !== null) setIsDark(t === 'dark')
      if (n !== null) setNotificationsState(n === 'true')
      if (l !== null) setLocationState(l === 'true')
      setLoaded(true)
    }
    load()
  }, [])

  const toggleTheme = async () => {
    const next = !isDark
    setIsDark(next)
    await AsyncStorage.setItem('pref_theme', next ? 'dark' : 'light')
  }

  const setNotifications = async (val: boolean) => {
    setNotificationsState(val)
    await AsyncStorage.setItem('pref_notifications', String(val))
  }

  const setLocation = async (val: boolean) => {
    setLocationState(val)
    await AsyncStorage.setItem('pref_location', String(val))
  }

  if (!loaded) return null

  return (
    <PrefsContext.Provider
      value={{
        isDark,
        toggleTheme,
        notifications,
        setNotifications,
        location,
        setLocation,
        colors: isDark ? darkColors : lightColors,
      }}
    >
      {children}
    </PrefsContext.Provider>
  )
}

export const useTheme = () => useContext(PrefsContext)