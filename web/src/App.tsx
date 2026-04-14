// App.tsx — Root of the web application
//
// Two responsibilities:
//   1. Wrap the entire app in <AuthProvider> so every component can call useAuth()
//   2. Declare all client-side routes (URL → component mappings)
//
// Route structure:
//   /              → LandingPage (public)
//   /signin        → SignInPage (public; redirect to /dashboard if already logged in)
//   /register      → RegisterPage (public)
//   /dashboard     → DashboardPage (protected — requires login)

import './index.css'
import { Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './context/useAuth'
import Layout from './layout/Layout'
import LandingPage from './pages/LandingPage'
import SignInPage from './pages/SignInPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import SearchByArcitectPage from './pages/ArchitectSearchPage'
import SearchByStylePage from './pages/StyleSearchPage'
import MonumentDetailPage from './pages/MonumentDetailPage'
import ProtectedRoute from './components/ProtectedRoute'
import SearchbyPeriodPage from './pages/PeriodSearchPage'
import SharePage from './pages/SharePage'

// PublicOnlyRoute — the mirror of ProtectedRoute.
// If the user is already logged in, redirect them away from /signin and /register
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function App() {
  return (
    // AuthProvider must be an ancestor of everything that calls useAuth()
    <AuthProvider>
      <Routes>
        {/* Pages that use the shared Header + Footer shell */}
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route 
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        </Route>

        {/* Auth pages — full-screen, no Header/Footer */}
        <Route
          path="/signin"
          element={
            <PublicOnlyRoute>
              <SignInPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        {/* Protected pages — require login */}
        <Route 
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Search Filters */}
        <Route path="/search-by-architect" element={<SearchByArcitectPage />}/>
        <Route path="/search-by-period" element={<SearchbyPeriodPage/>}/>
        <Route path="/search-by-style" element={<SearchByStylePage/>}/>

        {/* Monument detail */}
        <Route path="/monument/:id" element={<MonumentDetailPage />}/>

        <Route path="/share/:shareId" element={<SharePage />} />
        {/* Catch-all — any unknown URL redirects to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
