// AuthContext.tsx — Global authentication state for the web app
//
// Flow when the app loads:
//   1. loading = true (we don't know yet if someone is logged in)
//   2. Firebase restores the previous session from localStorage
//   3. onAuthChanged fires → we fetch the role from Firestore
//   4. loading = false → the rest of the app renders with real user data

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User } from 'firebase/auth'
import { onAuthChanged, getCurrentUserRole, type UserRole } from '../lib/auth'


interface AuthContextValue {
  user: User | null        // Firebase User object; null = not logged in
  role: UserRole | null    // role from Firestore; null = not loaded yet
  loading: boolean         // true while Firebase is restoring the session
}

const AuthContext = createContext<AuthContextValue | null>(null)

// AuthProvider wraps the entire app
// It owns the state and keeps it in sync with Firebase.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        // User is logged in — fetch their role from Firestore
        const userRole = await getCurrentUserRole(firebaseUser.uid)
        setRole(userRole)
      } else {
        // User logged out — clear the role
        setRole(null)
      }

      // Stop showing the loading screen
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook that any component calls to read auth state
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === null) {
    throw new Error('useAuth() must be used inside <AuthProvider>. Check that AuthProvider wraps your app in main.tsx.')
  }
  return ctx
}
