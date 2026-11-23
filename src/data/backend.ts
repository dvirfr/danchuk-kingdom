import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  setDoc,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { AfterDarkState, ChapterContent, Coupon, CouponState, PhotoMeta, Progress, Redemption, Settings } from '../types'

export type Listener<T> = (v: T) => void

export interface Backend {
  subscribeCoupons(cb: Listener<Coupon[]>): Unsubscribe
  subscribeStates(cb: Listener<Record<string, CouponState>>): Unsubscribe
  subscribeProgress(cb: Listener<Progress>): Unsubscribe
  redeem(coupon: Coupon): Promise<Redemption>
  deliver(couponId: string, redemptionId: string): Promise<void>
  rate(couponId: string, redemptionId: string, rating: number, review?: string): Promise<void>
  importCoupons(coupons: Coupon[]): Promise<number>
  resetAllState(): Promise<void>

  subscribePhotos(cb: Listener<PhotoMeta[]>): Unsubscribe
  /** Full-size image source (data URL or URL). */
  getPhotoSrc(id: string): Promise<string>
  addPhoto(meta: PhotoMeta, full: string): Promise<void>
  updatePhoto(id: string, patch: Partial<PhotoMeta>): Promise<void>
  deletePhoto(id: string): Promise<void>

  subscribeChapters(cb: Listener<Partial<ChapterContent>[]>): Unsubscribe
  saveChapter(c: Partial<ChapterContent> & { n: number }): Promise<void>
  completeChapter(n: number): Promise<void>

  subscribeAfterDark(cb: Listener<AfterDarkState>): Unsubscribe
  revealNight(n: number): Promise<void>
  setWildText(text: string): Promise<void>
  subscribeSettings(cb: Listener<Settings>): Unsubscribe
  savePinHash(hash: string): Promise<void>
}

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

const rid = () => Math.random().toString(36).slice(2, 10)

export function newRedemption(coupon: Coupon, now = Date.now()): Redemption {
  return {
    id: rid(),
    at: now,
    dueAt: coupon.slaHours ? now + coupon.slaHours * 3_600_000 : null,
  }
}

function patchRedemption(
  state: CouponState,
  redemptionId: string,
  patch: Partial<Redemption>,
): CouponState {
  return {
    ...state,
    redemptions: state.redemptions.map((r) => (r.id === redemptionId ? { ...r, ...patch } : r)),
  }
}

// ---------------------------------------------------------------- Firestore
const couponsCol = collection(db, 'content', 'coupons', 'items')
const statesCol = collection(db, 'state', 'coupons', 'items')
const progressDoc = doc(db, 'state', 'progress')
const photosCol = collection(db, 'content', 'photos', 'items')
const photoDataCol = collection(db, 'content', 'photoData', 'items')
const chaptersCol = collection(db, 'content', 'chapters', 'items')
const afterDarkDoc = doc(db, 'state', 'afterDark')
const settingsDoc = doc(db, 'content', 'settings')

export const firestoreBackend: Backend = {
  subscribeCoupons: (cb) =>
    onSnapshot(couponsCol, (snap) => cb(snap.docs.map((d) => d.data() as Coupon)), (e) =>
      console.error('[data] coupons', e),
    ),

  subscribeStates: (cb) =>
    onSnapshot(
      statesCol,
      (snap) => cb(Object.fromEntries(snap.docs.map((d) => [d.id, d.data() as CouponState]))),
      (e) => console.error('[data] states', e),
    ),

  subscribeProgress: (cb) =>
    onSnapshot(
      progressDoc,
      (snap) => cb((snap.data() as Progress | undefined) ?? { completedChapters: [] }),
      (e) => console.error('[data] progress', e),
    ),

  redeem: (coupon) =>
    runTransaction(db, async (tx) => {
      const ref = doc(statesCol, coupon.id)
      const snap = await tx.get(ref)
      const cur = (snap.data() as CouponState | undefined) ?? { usesLeft: coupon.uses, redemptions: [] }
      if (cur.usesLeft <= 0) throw new Error('no-uses-left')
      const r = newRedemption(coupon)
      tx.set(ref, { usesLeft: cur.usesLeft - 1, redemptions: [...cur.redemptions, r] })
      return r
    }),

  deliver: (couponId, redemptionId) =>
    runTransaction(db, async (tx) => {
      const ref = doc(statesCol, couponId)
      const cur = (await tx.get(ref)).data() as CouponState
      tx.set(ref, patchRedemption(cur, redemptionId, { deliveredAt: Date.now() }))
    }),

  rate: (couponId, redemptionId, rating, review) =>
    runTransaction(db, async (tx) => {
      const ref = doc(statesCol, couponId)
      const cur = (await tx.get(ref)).data() as CouponState
      tx.set(ref, patchRedemption(cur, redemptionId, review ? { rating, review } : { rating }))
    }),

  importCoupons: async (coupons) => {
    const batch = writeBatch(db)
    for (const c of coupons) batch.set(doc(couponsCol, c.id), c)
    await batch.commit()
    return coupons.length
  },

  resetAllState: async () => {
    const snap = await getDocs(statesCol)
    const batch = writeBatch(db)
    snap.docs.forEach((d) => batch.delete(d.ref))
    batch.set(progressDoc, { completedChapters: [] })
    batch.set(afterDarkDoc, { revealed: [] })
    await batch.commit()
  },

  subscribePhotos: (cb) =>
    onSnapshot(
      photosCol,
      (snap) => cb(snap.docs.map((d) => d.data() as PhotoMeta).sort((a, b) => a.createdAt - b.createdAt)),
      (e) => console.error('[data] photos', e),
    ),

  getPhotoSrc: async (id) => {
    const snap = await getDoc(doc(photoDataCol, id))
    return (snap.data()?.src as string) ?? ''
  },

  addPhoto: async (meta, full) => {
    // full image first, so the meta never points at a missing image
    await setDoc(doc(photoDataCol, meta.id), { id: meta.id, src: full })
    await setDoc(doc(photosCol, meta.id), meta)
  },

  updatePhoto: (id, patch) => updateDoc(doc(photosCol, id), patch),

  deletePhoto: async (id) => {
    await deleteDoc(doc(photosCol, id))
    await deleteDoc(doc(photoDataCol, id))
  },

  subscribeChapters: (cb) =>
    onSnapshot(
      chaptersCol,
      (snap) => cb(snap.docs.map((d) => d.data() as Partial<ChapterContent>)),
      (e) => console.error('[data] chapters', e),
    ),

  saveChapter: (c) => setDoc(doc(chaptersCol, String(c.n)), c, { merge: true }),

  completeChapter: (n) => setDoc(progressDoc, { completedChapters: arrayUnion(n) }, { merge: true }),

  subscribeAfterDark: (cb) =>
    onSnapshot(
      afterDarkDoc,
      (snap) => cb({ revealed: [], ...((snap.data() as AfterDarkState | undefined) ?? {}) }),
      (e) => console.error('[data] afterDark', e),
    ),
  revealNight: (n) => setDoc(afterDarkDoc, { revealed: arrayUnion(n) }, { merge: true }),
  setWildText: (text) => setDoc(afterDarkDoc, { wildText: text }, { merge: true }),
  subscribeSettings: (cb) =>
    onSnapshot(
      settingsDoc,
      (snap) => cb((snap.data() as Settings | undefined) ?? {}),
      (e) => console.error('[data] settings', e),
    ),
  savePinHash: (pinHash) => setDoc(settingsDoc, { pinHash }, { merge: true }),
}

// ---------------------------------------------------------------- Demo (dev only)
export function createDemoBackend(seedUrl: string, photosManifestUrl?: string): Backend {
  let coupons: Coupon[] = []
  let photos: PhotoMeta[] = []
  const photoSrc = new Map<string, string>()
  // demo: persist chapter texts across reloads and deliver them late, like Firestore does
  let chapters: Partial<ChapterContent>[] = (() => {
    try {
      return JSON.parse(localStorage.getItem('demoChapters') || '[]')
    } catch {
      return []
    }
  })()
  let afterDark: AfterDarkState = { revealed: [] }
  let settings: Settings = {}
  const subsAd = new Set<Listener<AfterDarkState>>()
  const subsSt = new Set<Listener<Settings>>()
  const emitAd = () => subsAd.forEach((f) => f(afterDark))
  const subsPh = new Set<Listener<PhotoMeta[]>>()
  const subsCh = new Set<Listener<Partial<ChapterContent>[]>>()
  const emitPh = () => subsPh.forEach((f) => f(photos))
  const emitCh = () => subsCh.forEach((f) => f(chapters))
  if (photosManifestUrl) {
    const base = photosManifestUrl.replace(/[^/]+$/, '')
    fetch(photosManifestUrl)
      .then((r) => r.json())
      .then((rows: { file: string; chapter: number; w: number; h: number }[]) => {
        photos = rows.map((r, i) => {
          const src = base + 'photos/' + r.file
          photoSrc.set(r.file, src)
          return { id: r.file, chapter: r.chapter, createdAt: i, w: r.w, h: r.h, thumb: src }
        })
        emitPh()
      })
      .catch((e) => console.warn('[demo] no photos', e))
  }
  let states: Record<string, CouponState> = {}
  let progress: Progress = { completedChapters: [] }
  const subs = { c: new Set<Listener<Coupon[]>>(), s: new Set<Listener<typeof states>>(), p: new Set<Listener<Progress>>() }
  const emit = () => {
    subs.c.forEach((f) => f(coupons))
    subs.s.forEach((f) => f(states))
    subs.p.forEach((f) => f(progress))
  }
  fetch(seedUrl)
    .then((r) => r.json())
    .then((rows: Coupon[]) => {
      coupons = rows
      emit()
    })
    .catch((e) => console.warn('[demo] no seed', e))

  const sub = <T,>(set: Set<Listener<T>>, cb: Listener<T>, v: () => T) => {
    set.add(cb)
    cb(v())
    return () => void set.delete(cb)
  }

  return {
    subscribeCoupons: (cb) => sub(subs.c, cb, () => coupons),
    subscribeStates: (cb) => sub(subs.s, cb, () => states),
    subscribeProgress: (cb) => sub(subs.p, cb, () => progress),
    redeem: async (coupon) => {
      const cur = states[coupon.id] ?? { usesLeft: coupon.uses, redemptions: [] }
      if (cur.usesLeft <= 0) throw new Error('no-uses-left')
      const r = newRedemption(coupon)
      states = { ...states, [coupon.id]: { usesLeft: cur.usesLeft - 1, redemptions: [...cur.redemptions, r] } }
      emit()
      return r
    },
    deliver: async (id, rId) => {
      states = { ...states, [id]: patchRedemption(states[id], rId, { deliveredAt: Date.now() }) }
      emit()
    },
    rate: async (id, rId, rating, review) => {
      states = { ...states, [id]: patchRedemption(states[id], rId, { rating, review }) }
      emit()
    },
    importCoupons: async (rows) => {
      coupons = rows
      emit()
      return rows.length
    },
    resetAllState: async () => {
      states = {}
      progress = { completedChapters: [] }
      afterDark = { revealed: [] }
      emit()
      emitAd()
    },
    subscribePhotos: (cb) => sub(subsPh, cb, () => photos),
    getPhotoSrc: async (id) => photoSrc.get(id) ?? '',
    addPhoto: async (meta, full) => {
      photoSrc.set(meta.id, full)
      photos = [...photos, meta]
      emitPh()
    },
    updatePhoto: async (id, patch) => {
      photos = photos.map((p) => (p.id === id ? { ...p, ...patch } : p))
      emitPh()
    },
    deletePhoto: async (id) => {
      photos = photos.filter((p) => p.id !== id)
      emitPh()
    },
    subscribeChapters: (cb) => {
      subsCh.add(cb)
      const id = setTimeout(() => cb(chapters), 600)
      return () => {
        clearTimeout(id)
        subsCh.delete(cb)
      }
    },
    saveChapter: async (c) => {
      chapters = [...chapters.filter((x) => x.n !== c.n), { ...(chapters.find((x) => x.n === c.n) ?? {}), ...c }]
      try {
        localStorage.setItem('demoChapters', JSON.stringify(chapters))
      } catch {
        /* ignore */
      }
      emitCh()
    },
    completeChapter: async (n) => {
      if (!progress.completedChapters.includes(n)) progress = { completedChapters: [...progress.completedChapters, n] }
      emit()
    },
    subscribeAfterDark: (cb) => sub(subsAd, cb, () => afterDark),
    revealNight: async (n) => {
      if (!afterDark.revealed.includes(n)) afterDark = { ...afterDark, revealed: [...afterDark.revealed, n] }
      emitAd()
    },
    setWildText: async (wildText) => {
      afterDark = { ...afterDark, wildText }
      emitAd()
    },
    subscribeSettings: (cb) => sub(subsSt, cb, () => settings),
    savePinHash: async (pinHash) => {
      settings = { ...settings, pinHash }
      subsSt.forEach((f) => f(settings))
    },
  }
}
