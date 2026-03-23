import { useContext } from "react"
import { type AuthContextValue, AuthContext } from "./AuthContext"

// Hook that any component calls to read auth state
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === null) {
    throw new Error('useAuth() must be used inside <AuthProvider>. Check that AuthProvider wraps your app in main.tsx.')
  }
  return ctx
}