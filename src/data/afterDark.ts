import { LAUNCH_AT } from '../config'
import type { AfterDarkState, Coupon } from '../types'

export const NIGHTS = 30
const DAY = 86_400_000
const EVENING_H = 20 // each new card appears at 20:00 Israel time

/** When night k's scratch card becomes available (k = 1..30). */
export function nightOpensAt(k: number) {
  return LAUNCH_AT.getTime() + (k - 1) * DAY + EVENING_H * 3_600_000
}

/** How many nightly cards are available to scratch by `now`. */
export function nightsOpen(now: number, previewAll: boolean) {
  if (previewAll) return NIGHTS
  let n = 0
  while (n < NIGHTS && now >= nightOpensAt(n + 1)) n++
  return n
}

export function nightOf(c: Coupon): number | null {
  const m = /^night(\d+)$/.exec(c.unlock)
  return m ? Number(m[1]) : null
}

export function isAfterDarkUnlocked(c: Coupon, ad: AfterDarkState, launched: boolean, previewAll: boolean) {
  if (previewAll) return true
  if (!launched) return false
  if (c.unlock === 'entry') return true
  if (c.unlock === 'wildcard') return ad.revealed.includes(NIGHTS)
  const n = nightOf(c)
  return n !== null && ad.revealed.includes(n)
}

const SALT = 'danchuk-kingdom:after-dark:'
export const DEFAULT_PIN = '2511'

export async function hashPin(pin: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(SALT + pin.trim()))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Unlock lasts 15 minutes per browser tab, then the PIN is asked again.
const KEY = 'ad-unlocked-until'
export function isPinSessionValid() {
  try {
    return Number(sessionStorage.getItem(KEY) || 0) > Date.now()
  } catch {
    return false
  }
}
export function startPinSession() {
  try {
    sessionStorage.setItem(KEY, String(Date.now() + 15 * 60_000))
  } catch {
    /* ignore */
  }
}
export function endPinSession() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export type Face = { en: string; he: string; icon: string }
export const DICE_ACTIONS: Face[] = [
  { en: 'Kiss', he: 'נשיקה', icon: '💋' },
  { en: 'Massage', he: 'עיסוי', icon: '🤲' },
  { en: 'Lick', he: 'ליקוק', icon: '👅' },
  { en: 'Gentle bite', he: 'נשיכה עדינה', icon: '😈' },
  { en: 'Tease', he: 'להתגרות', icon: '🪶' },
  { en: 'Your choice', he: 'לבחירתך', icon: '🎲' },
]
export const DICE_PLACES: Face[] = [
  { en: 'Neck', he: 'צוואר', icon: '🦢' },
  { en: 'Lips', he: 'שפתיים', icon: '👄' },
  { en: 'Back', he: 'גב', icon: '🌙' },
  { en: 'Thighs', he: 'ירכיים', icon: '🔥' },
  { en: 'Ears', he: 'אוזניים', icon: '👂' },
  { en: 'Anywhere you want', he: 'איפה שבא לך', icon: '✨' },
]
