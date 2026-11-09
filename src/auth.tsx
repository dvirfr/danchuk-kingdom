import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, type User } from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import { ADMIN_EMAIL, FAMILY_EMAILS } from './config'

type AuthState = {
  user: User | null
  loading: boolean
  isFamily: boolean
  isAdmin: boolean
  signIn: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u)
        setLoading(false)
      }),
    [],
  )

  const email = user?.email?.toLowerCase() ?? ''
  const verified = !!user?.emailVerified

  const value: AuthState = {
    user,
    loading,
    isFamily: verified && FAMILY_EMAILS.includes(email),
    isAdmin: verified && email === ADMIN_EMAIL.toLowerCase(),
    signIn: async () => {
      try {
        await signInWithPopup(auth, googleProvider)
      } catch (err: unknown) {
        const code = (err as { code?: string }).code
        if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
          await signInWithRedirect(auth, googleProvider)
          return
        }
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return
        throw err
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
