// ProtectedRoute.tsx — Blocks unauthenticated users from accessing a page
//
// How it works:
//   - While Firebase is restoring the session (loading = true): show nothing
//   - If the user is NOT logged in: redirect to /signin
//   - If the user IS logged in: render the actual page (children)

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  // restrict to a specific role
  requiredRole?: 'visitor' | 'researcher' | 'moderator'
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, role, loading } = useAuth()

  // Still waiting for Firebase to restore the session from localStorage
  if (loading) return null

  // Not logged in → send to sign-in page.
  if (!user) return <Navigate to="/signin" replace />

  // Logged in but wrong role
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  // All checks pass — render the protected page
  return <>{children}</>
}
