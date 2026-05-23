import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { DataProvider } from './context/DataContext'
import Header from './components/Layout/Header'
import Sidebar from './components/Layout/Sidebar'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import ToastCenter from './components/Shared/Toast'
import ErrorBoundary from './components/Shared/ErrorBoundary'
import LoadingSkeleton from './components/Shared/Skeleton'
import useLocalStorage from './hooks/useLocalStorage'

const Login = lazy(() => import('./pages/Auth/Login'))
const Register = lazy(() => import('./pages/Auth/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Patients = lazy(() => import('./pages/Patients'))
const Doctors = lazy(() => import('./pages/Doctors'))
const Appointments = lazy(() => import('./pages/Appointments'))
const PharmacyBilling = lazy(() => import('./pages/PharmacyBilling'))
const HealthAnalytics = lazy(() => import('./pages/HealthAnalytics'))
const NotFound = lazy(() => import('./pages/NotFound'))

const AppShell = ({ theme, setTheme, sidebarCollapsed, setSidebarCollapsed }) => {
  const location = useLocation()
  const authPages = ['/login', '/signup', '/register']
  const isAuthPage = authPages.includes(location.pathname)
  const layoutClass = useMemo(() => (sidebarCollapsed ? 'sidebar-collapsed' : ''), [sidebarCollapsed])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <div className={`app-container ${layoutClass}`}>
      {!isAuthPage && <Sidebar collapsed={sidebarCollapsed} />}
      <div className={`main-content ${isAuthPage ? 'auth-shell' : ''}`}>
        {!isAuthPage && <Header collapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed((value) => !value)} theme={theme} setTheme={setTheme} />}
        <ErrorBoundary>
          <div key={location.pathname} className="page-transition">
            <Suspense fallback={<LoadingSkeleton />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/register" element={<Register />} />
                <Route element={<ProtectedRoute roles={['admin', 'doctor', 'receptionist', 'patient']} />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/doctors" element={<Doctors />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/pharmacy" element={<PharmacyBilling />} />
                  <Route path="/analytics" element={<HealthAnalytics />} />
                </Route>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </ErrorBoundary>
      </div>
      <ToastCenter />
    </div>
  )
}

function App() {
  const [theme, setTheme] = useLocalStorage('shms_theme', 'light')
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('shms_sidebar_collapsed', false)

  // Ensure sidebar starts expanded on first load (clear persisted collapsed flag)
  useEffect(() => {
    try {
      if (localStorage.getItem('shms_sidebar_collapsed') !== null) {
        localStorage.removeItem('shms_sidebar_collapsed')
        setSidebarCollapsed(false)
      }
    } catch (err) {
      // ignore storage errors
    }
    // run only once on mount
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <AuthProvider>
      <AppProvider>
        <DataProvider>
          <BrowserRouter>
            <AppShell theme={theme} setTheme={setTheme} sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
          </BrowserRouter>
        </DataProvider>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
