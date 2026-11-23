import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AfterDarkState, ChapterContent, Coupon, CouponState, PhotoMeta, Progress, Settings } from '../types'
import { mergeChapters } from './chapters'
import { createDemoBackend, firestoreBackend, type Backend } from './backend'
import { DEMO } from '../demo'
import { LAUNCH_AT } from '../config'
import { useAuth } from '../auth'
import { DEFAULT_ICONS, RARITY_FALLBACK_ICON } from './icons'

const backend: Backend = DEMO
  ? createDemoBackend(`${import.meta.env.BASE_URL}demo/coupons.json`, `${import.meta.env.BASE_URL}demo/photos.json`)
  : firestoreBackend

type Ctx = {
  backend: Backend
  coupons: Coupon[]
  states: Record<string, CouponState>
  progress: Progress
  loaded: boolean
  photos: PhotoMeta[]
  chapters: ChapterContent[]
  /** true once the stored chapter texts have arrived from the database */
  chaptersLoaded: boolean
  afterDark: AfterDarkState
  settings: Settings
  now: number
  launched: boolean
  /** Admin-only: see every coupon unlocked, regardless of date/progress (local to this device). */
  previewAll: boolean
  setPreviewAll: (v: boolean) => void
  /** Admin-only: pretend the clock is at this moment (ms) on this device; null = real time. */
  simAt: number | null
  setSimAt: (v: number | null) => void
}

const DataContext = createContext<Ctx | null>(null)

export function KingdomDataProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [states, setStates] = useState<Record<string, CouponState>>({})
  const [progress, setProgress] = useState<Progress>({ completedChapters: [] })
  const [loaded, setLoaded] = useState(false)
  const [photos, setPhotos] = useState<PhotoMeta[]>([])
  const [storedChapters, setStoredChapters] = useState<Partial<ChapterContent>[]>([])
  const [chaptersLoaded, setChaptersLoaded] = useState(false)
  const [afterDark, setAfterDark] = useState<AfterDarkState>({ revealed: [] })
  const [settings, setSettings] = useState<Settings>({})
  const [realNow, setNow] = useState(() => Date.now())
  const [simAtState, setSimAtState] = useState<number | null>(() => {
    try {
      const v = Number(localStorage.getItem('simAt'))
      return v > 0 ? v : null
    } catch {
      return null
    }
  })
  const simAt = isAdmin ? simAtState : null
  const now = simAt ?? realNow
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
    const u4 = backend.subscribePhotos(setPhotos)
    const u5 = backend.subscribeChapters((c) => {
      setStoredChapters(c)
      setChaptersLoaded(true)
    })
    const u6 = backend.subscribeAfterDark(setAfterDark)
    const u7 = backend.subscribeSettings(setSettings)
    const tick = setInterval(() => setNow(Date.now()), 30_000)
    return () => {
      u1()
      u2()
      u3()
      u4()
      u5()
      u6()
      u7()
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
      photos,
      chapters: mergeChapters(storedChapters),
      chaptersLoaded,
      afterDark,
      settings,
      now,
      launched: now >= LAUNCH_AT.getTime(),
      previewAll: isAdmin && previewFlag,
      simAt,
      setSimAt: (v) => {
        setSimAtState(v)
        try {
          if (v) localStorage.setItem('simAt', String(v))
          else localStorage.removeItem('simAt')
        } catch {
          /* ignore */
        }
      },
      setPreviewAll: (v) => {
        setPreviewFlag(v)
        try {
          localStorage.setItem('previewAll', v ? '1' : '0')
        } catch {
          /* ignore */
        }
      },
    }),
    [coupons, states, progress, loaded, photos, storedChapters, chaptersLoaded, afterDark, settings, now, simAt, isAdmin, previewFlag],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useKingdom() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useKingdom outside KingdomDataProvider')
  return ctx
}

// Full-size photos are fetched lazily and cached for the session.
const srcCache = new Map<string, Promise<string>>()

export function usePhotoSrcs(ids: string[]) {
  const { backend } = useKingdom()
  const [srcs, setSrcs] = useState<Record<string, string>>({})
  const key = ids.join(',')
  useEffect(() => {
    let alive = true
    Promise.all(
      ids.map((id) => {
        if (!srcCache.has(id)) srcCache.set(id, backend.getPhotoSrc(id).catch(() => ''))
        return srcCache.get(id)!.then((src) => [id, src] as const)
      }),
    ).then((pairs) => alive && setSrcs(Object.fromEntries(pairs)))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, backend])
  return srcs
}
