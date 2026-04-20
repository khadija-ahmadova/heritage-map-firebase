import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import ProtectedRoute from '../components/ProtectedRoute'
import { AuthContext } from '../context/AuthContext'
import type { AuthContextValue } from '../context/AuthContext'
import type { User } from 'firebase/auth'

function renderWithAuth(ui: React.ReactNode, auth: Partial<AuthContextValue>) {
  const value: AuthContextValue = {
    user: null,
    role: null,
    loading: false,
    ...auth,
  }
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={ui} />
          <Route path="/signin" element={<div>Sign In Page</div>} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

const fakeUser = { uid: 'u1' } as User

describe('ProtectedRoute', () => {
  it('renders nothing while loading', () => {
    const { container } = renderWithAuth(
      <ProtectedRoute><div>Secret</div></ProtectedRoute>,
      { loading: true, user: null }
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('redirects to /signin when not logged in', () => {
    renderWithAuth(
      <ProtectedRoute><div>Secret</div></ProtectedRoute>,
      { user: null }
    )
    expect(screen.getByText('Sign In Page')).toBeInTheDocument()
  })

  it('renders children when logged in with no role requirement', () => {
    renderWithAuth(
      <ProtectedRoute><div>Secret</div></ProtectedRoute>,
      { user: fakeUser, role: 'visitor' }
    )
    expect(screen.getByText('Secret')).toBeInTheDocument()
  })

  it('redirects to /dashboard when user has wrong role', () => {
    renderWithAuth(
      <ProtectedRoute requiredRole="moderator"><div>Mod Panel</div></ProtectedRoute>,
      { user: fakeUser, role: 'visitor' }
    )
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
  })

  it('renders children when user has the required role', () => {
    renderWithAuth(
      <ProtectedRoute requiredRole="moderator"><div>Mod Panel</div></ProtectedRoute>,
      { user: fakeUser, role: 'moderator' }
    )
    expect(screen.getByText('Mod Panel')).toBeInTheDocument()
  })
})
