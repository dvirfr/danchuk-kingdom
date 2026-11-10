import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  runTransaction,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Coupon, CouponState, Progress, Redemption } from '../types'

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
}

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
    await batch.commit()
  },
}

// ---------------------------------------------------------------- Demo (dev only)
export function createDemoBackend(seedUrl: string): Backend {
  let coupons: Coupon[] = []
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
      emit()
    },
  }
}
