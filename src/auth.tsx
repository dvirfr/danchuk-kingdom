import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getRedirectResult, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import { ADMIN_EMAIL, DANA_EMAIL, FAMILY_EMAILS } from './config'
import { DEMO, DEMO_AS } from './demo'

type AuthState = {
  user: User | null
  loading: boolean
  isFamily: boolean
  isAdmin: boolean
  /** Resolves to an error code, or null on success / user cancel. */
  signIn: () => Promise<string | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (DEMO) {
      const email = DEMO_AS === 'dana' ? DANA_EMAIL : ADMIN_EMAIL
      setUser({ email, emailVerified: true } as User)
      setLoading(false)
      return
    }
    // Surface errors from any earlier redirect attempt (older builds used redirects).
    getRedirectResult(auth).catch((e) => console.error('[auth] redirect result', e))
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const email = user?.email?.toLowerCase() ?? ''
  const verified = !!user?.emailVerified

  const value: AuthState = {
    user,
    loading,
    isFamily: verified && FAMILY_EMAILS.includes(email),
    isAdmin: verified && email === ADMIN_EMAIL.toLowerCase(),
    // Popup only: redirect sign-in breaks on github.io because the auth domain
    // (firebaseapp.com) is cross-site and modern browsers partition its storage.
    signIn: async () => {
      try {
        await signInWithPopup(auth, googleProvider)
        return null
      } catch (err: unknown) {
        const code = (err as { code?: string }).code ?? 'unknown'
        console.error('[auth] sign-in failed', err)
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return null
        return code
      }
    },
    logout: () => signOut(auth),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
