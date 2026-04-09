import { createContext, useContext, useMemo, useState } from 'react'
import { API_BASE_URL } from '../config/api'

const ACCESS_TOKEN_KEY = 'drhub_admin_access_token'
const USER_KEY = 'drhub_admin_user'
const TOKEN_COOKIE_MAX_AGE_SECONDS = 2 * 60 * 60

const AuthContext = createContext(null)

function setCookie(name, value, maxAgeSeconds) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`
}

function getCookie(name) {
  const encodedName = `${name}=`
  const cookiePair = document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(encodedName))

  if (!cookiePair) {
    return null
  }

  return decodeURIComponent(cookiePair.slice(encodedName.length))
}

function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`
}

function getStoredSession() {
  const token = getCookie(ACCESS_TOKEN_KEY)
  const userRaw = getCookie(USER_KEY)

  if (!token || !userRaw) {
    return { token: null, user: null }
  }

  try {
    return { token, user: JSON.parse(userRaw) }
  } catch {
    deleteCookie(ACCESS_TOKEN_KEY)
    deleteCookie(USER_KEY)
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const login = async ({ email, password }) => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.message || 'Login failed. Please try again.')
        return false
      }

      setCookie(ACCESS_TOKEN_KEY, data.token, TOKEN_COOKIE_MAX_AGE_SECONDS)
      setCookie(USER_KEY, JSON.stringify(data.user), TOKEN_COOKIE_MAX_AGE_SECONDS)
      setSession({ token: data.token, user: data.user })
      return true
    } catch {
      setError('Could not reach the server. Check your backend URL and try again.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const logout = () => {
    deleteCookie(ACCESS_TOKEN_KEY)
    deleteCookie(USER_KEY)
    setSession({ token: null, user: null })
  }

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      isAuthenticated: Boolean(session.token && session.user),
      isSubmitting,
      error,
      login,
      logout,
      setError,
    }),
    [session, isSubmitting, error]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
