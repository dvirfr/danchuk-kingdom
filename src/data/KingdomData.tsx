import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Coupon, CouponState, Progress } from '../types'
import { createDemoBackend, firestoreBackend, type Backend } from './backend'
import { DEMO } from '../demo'
import { LAUNCH_AT } from '../config'
import { useAuth } from '../auth'
import { DEFAULT_ICONS, RARITY_FALLBACK_ICON } from './icons'

const backend: Backend = DEMO ? createDemoBackend(`${import.meta.env.BASE_URL}demo/coupons.json`) : firestoreBackend

type Ctx = {
  backend: Backend
  coupons: Coupon[]
  states: Record<string, CouponState>
  progress: Progress
  loaded: boolean
  launched: boolean
  /** Admin-only: see every coupon unlocked, regardless of date/progress (local to this device). */
  previewAll: boolean
  setPreviewAll: (v: boolean) => void
}

const DataContext = createContext<Ctx | null>(null)

export function KingdomDataProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [states, setStates] = useState<Record<string, CouponState>>({})
  const [progress, setProgress] = useState<Progress>({ completedChapters: [] })
  const [loaded, setLoaded] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [previewFlag, setPreviewFlag] = useState(() => {
    try {
      return localStorage.getItem('previewAll') === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const u1 = backend.subscribeCoupons((c) => {
      setCoupons(c.map((x) => ({ ...x, icon: x.icon || DEFAULT_ICONS[x.id] || RARITY_FALLBACK_ICON[x.rarity] })))
      setLoaded(true)
    })
    const u2 = backend.subscribeStates(setStates)
    const u3 = backend.subscribeProgress(setProgress)
    const tick = setInterval(() => setNow(Date.now()), 30_000)
    return () => {
      u1()
      u2()
      u3()
      clearInterval(tick)
    }
  }, [])

  const value = useMemo<Ctx>(
    () => ({
      backend,
      coupons,
      states,
      progress,
      loaded,
      launched: now >= LAUNCH_AT.getTime(),
      previewAll: isAdmin && previewFlag,
      setPreviewAll: (v) => {
        setPreviewFlag(v)
        try {
          localStorage.setItem('previewAll', v ? '1' : '0')
        } catch {
          /* ignore */
        }
      },
    }),
    [coupons, states, progress, loaded, now, isAdmin, previewFlag],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useKingdom() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useKingdom outside KingdomDataProvider')
  return ctx
}
