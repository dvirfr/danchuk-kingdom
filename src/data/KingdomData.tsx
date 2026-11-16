import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ChapterContent, Coupon, CouponState, PhotoMeta, Progress } from '../types'
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
  now: number
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
  const [photos, setPhotos] = useState<PhotoMeta[]>([])
  const [storedChapters, setStoredChapters] = useState<Partial<ChapterContent>[]>([])
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
    const u4 = backend.subscribePhotos(setPhotos)
    const u5 = backend.subscribeChapters(setStoredChapters)
    const tick = setInterval(() => setNow(Date.now()), 30_000)
    return () => {
      u1()
      u2()
      u3()
      u4()
      u5()
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
      now,
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
    [coupons, states, progress, loaded, photos, storedChapters, now, isAdmin, previewFlag],
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
