import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchMe, loginLocal, loginWithBmk, type User } from '../api/auth'

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<User>
  loginBmk: (bmkAccessToken: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function persistTokens(access: string, refresh: string) {
  localStorage.setItem('vp_access', access)
  localStorage.setItem('vp_refresh', refresh)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('vp_access')
    if (!token) {
      setLoading(false)
      return
    }
    fetchMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('vp_access')
        localStorage.removeItem('vp_refresh')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const data = await loginLocal(username, password)
    persistTokens(data.access, data.refresh)
    setUser(data.user)
    return data.user
  }, [])

  const loginBmk = useCallback(async (bmkAccessToken: string) => {
    const data = await loginWithBmk(bmkAccessToken)
    persistTokens(data.access, data.refresh)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('vp_access')
    localStorage.removeItem('vp_refresh')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, loginBmk, logout }),
    [user, loading, login, loginBmk, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
