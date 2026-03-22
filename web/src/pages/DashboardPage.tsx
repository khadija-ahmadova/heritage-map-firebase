// Placeholder for authenticated landing page
//
// Needs to be replace this with map and landmark markers

import { useAuth } from '../context/AuthContext'
import { signOut } from '../lib/auth'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { user, role } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-bg-seashell flex flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-3xl font-bold text-accent-bordeaux">Heritage Maps Baku</h1>
      <p className="text-gray-600">
        Welcome, <span className="font-medium">{user?.displayName ?? user?.email}</span>
      </p>
      <p className="text-sm text-gray-400">
        Role: <span className="font-medium text-accent-brown">{role}</span>
      </p>
      <p className="text-sm text-gray-400 text-center max-w-sm">
        Authentication is working correctly.
      </p>
      <button
        onClick={handleSignOut}
        className="mt-4 px-6 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}
