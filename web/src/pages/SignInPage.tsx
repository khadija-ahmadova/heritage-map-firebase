// Email/password login form

import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signIn } from '../lib/auth'

export default function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // If ProtectedRoute redirected here, it passes the original destination in
  // location.state.from so we can send the user back after a successful login
  const from = (location.state as { from?: string })?.from ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (err: unknown) {
      setError(friendlyAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-seashell flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-accent-bordeaux mb-2">Sign in</h1>
        <p className="text-sm text-gray-500 mb-6">
          Welcome back to Heritage Maps Baku
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-bordeaux"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-bordeaux"
            />
          </div>

          {/* Error message — only shown when there's an error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent-bordeaux text-white rounded-lg py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent-bordeaux font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}


// map common Firebase error to user friendly messages
function friendlyAuthError(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    switch ((err as { code: string }).code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password.'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.'
      case 'auth/user-disabled':
        return 'This account has been disabled.'
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.'
    }
  }
  return 'Something went wrong. Please try again.'
}
