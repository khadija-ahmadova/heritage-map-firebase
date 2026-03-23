import type { User } from "firebase/auth"
import { type ReactNode, useState, useEffect } from "react"
import { type UserRole, onAuthChanged, getCurrentUserRole } from "../lib/auth"
import { AuthContext } from "./AuthContext"

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
