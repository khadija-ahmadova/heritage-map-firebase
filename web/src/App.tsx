// App.tsx — Root of the web application
//
// Two responsibilities:
//   1. Wrap the entire app in <AuthProvider> so every component can call useAuth()
//   2. Declare all client-side routes (URL → component mappings)
//
//
// Route structure:
//   /                    → LandingPage           (Layout)
//   /dashboard           → DashboardPage         (Layout, protected)
//   /monument/:id        → MonumentDetailPage    (own header)
//   /saved-routes        → SavedRoutesPage       (protected, own layout)
//   /signin              → SignInPage            (no header)
//   /register            → RegisterPage          (no header)
//   /search-by-architect → ArchitectSearchPage
//   /search-by-period    → PeriodSearchPage
//   /search-by-style     → StyleSearchPage

import './index.css'
import { Route, Routes, Navigate } from 'react-router-dom'
import { useAuth } from './context/useAuth'
import Layout from './layout/Layout'
import LandingPage from './pages/LandingPage'
import SignInPage from './pages/SignInPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import SearchByArcitectPage from './pages/ArchitectSearchPage'
import SearchByStylePage from './pages/StyleSearchPage'
import MonumentDetailPage from './pages/MonumentDetailPage'
import ContributePage from './pages/ContributePage'
import ModeratorPage from './pages/ModeratorPage'
import SubmitMonumentPage from './pages/SubmitMonumentPage'
import MyContributionsPage from './pages/MyContributionsPage'
import ProtectedRoute from './components/ProtectedRoute'
import SearchbyPeriodPage from './pages/PeriodSearchPage'
import SavedRoutesPage from './pages/SavedRoutesPage'
import { RouteProvider } from './context/RouteContext'

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
      <RouteProvider>
        <Routes>
          {/* Layout routes */}
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

          {/* Standalone pages */}
          <Route path="/monument/:id" element={<MonumentDetailPage />} />

          <Route
            path="/saved-routes"
            element={
              <ProtectedRoute>
                <SavedRoutesPage />
              </ProtectedRoute>
            }
          />

          {/* Auth */}
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

          {/* Search */}
          <Route path="/search-by-architect" element={<SearchByArcitectPage />} />
          <Route path="/search-by-period" element={<SearchbyPeriodPage />} />
          <Route path="/search-by-style" element={<SearchByStylePage />} />
        <Route path="/share/:shareId" element={<SharePage />} />
        {/* Researcher contribution form */}
        <Route
          path="/contribute/:id"
          element={
            <ProtectedRoute requiredRole="researcher">
              <ContributePage />
            </ProtectedRoute>
          }
        />

        {/* Moderator review queue */}
        <Route
          path="/moderator"
          element={
            <ProtectedRoute requiredRole="moderator">
              <ModeratorPage />
            </ProtectedRoute>
          }
        />

        {/* Researcher: submit new monument */}
        <Route
          path="/submit-monument"
          element={
            <ProtectedRoute requiredRole="researcher">
              <SubmitMonumentPage />
            </ProtectedRoute>
          }
        />

        {/* Researcher: view own contributions */}
        <Route
          path="/my-contributions"
          element={
            <ProtectedRoute requiredRole="researcher">
              <MyContributionsPage />
            </ProtectedRoute>
          }
        />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RouteProvider>
  )
}

export default App
