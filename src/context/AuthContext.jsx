import { createContext, useMemo, useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const AuthContext = createContext(null)

const DEFAULT_USERS = [
  { id: 'admin', name: 'Admin User', email: 'admin@hospital.com', password: 'Admin123!', role: 'admin', avatar: 'A' },
  { id: 'doctor', name: 'Dr. Sarah Jenkins', email: 'doctor@hospital.com', password: 'Doctor123!', role: 'doctor', avatar: 'S' },
  { id: 'receptionist', name: 'Front Desk', email: 'reception@hospital.com', password: 'Reception123!', role: 'receptionist', avatar: 'R' },
  { id: 'patient', name: 'Patient One', email: 'patient@hospital.com', password: 'Patient123!', role: 'patient', avatar: 'P' }
]

const createSession = (user) => {
  const now = new Date()
  return {
    lastLogin: now.toLocaleString(),
    expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 4).toLocaleString(),
    activePage: '/dashboard',
    browser: navigator.userAgent
  }
}

const AuthProvider = ({ children }) => {
  const [accounts, setAccounts] = useLocalStorage('shms_accounts', DEFAULT_USERS)
  const [currentUser, setCurrentUser] = useLocalStorage('shms_current_user', null)
  const [session, setSession] = useLocalStorage('shms_session', null)
  const [error, setError] = useState(null)

  const login = (email, password) => {
    const account = accounts.find((user) => user.email.toLowerCase() === email.toLowerCase())
    if (!account) {
      setError('No account matches that email.')
      return { success: false, error: 'No account matches that email.' }
    }

    if (account.password !== password) {
      setError('Invalid password. Please try again.')
      return { success: false, error: 'Invalid password. Please try again.' }
    }

    setCurrentUser(account)
    setSession(createSession(account))
    setError(null)
    return { success: true, user: account }
  }

  const quickLogin = (role) => {
    const account = accounts.find((user) => user.role === role)
    if (!account) {
      setError('No user found for that role.')
      return { success: false, error: 'No user found for that role.' }
    }

    setCurrentUser(account)
    setSession(createSession(account))
    setError(null)
    return { success: true, user: account }
  }

  const signup = ({ name, email, password, phone }) => {
    if (accounts.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
      setError('This email is already registered.')
      return false
    }

    const newUser = {
      id: `pt-${Date.now()}`,
      name,
      email,
      password,
      phone,
      role: 'patient',
      avatar: name.charAt(0).toUpperCase()
    }

    const updatedAccounts = [...accounts, newUser]
    setAccounts(updatedAccounts)
    setCurrentUser(newUser)
    setSession(createSession(newUser))
    setError(null)
    return newUser
  }

  const logout = () => {
    setCurrentUser(null)
    setSession(null)
    setError(null)
  }

  const updateProfile = (updates) => {
    if (!currentUser) return
    const updatedAccounts = accounts.map((user) =>
      user.id === currentUser.id ? { ...user, ...updates } : user,
    )
    setAccounts(updatedAccounts)
    setCurrentUser({ ...currentUser, ...updates })
  }

  const value = useMemo(
    () => ({
      currentUser,
      accounts,
      isAuthenticated: Boolean(currentUser),
      login,
      quickLogin,
      signup,
      logout,
      updateProfile,
      session,
      authError: error
    }),
    [accounts, currentUser, error, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
