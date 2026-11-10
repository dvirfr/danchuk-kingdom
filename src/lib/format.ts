import type { Lang } from '../i18n'
import type { Coupon } from '../types'

export function couponText(c: Coupon, lang: Lang) {
  return lang === 'he'
    ? { title: c.title_he, desc: c.desc_he, fine: c.fine_he }
    : { title: c.title_en, desc: c.desc_en, fine: c.fine_en }
}

export function formatDuration(ms: number, u: { d: string; h: string; m: string }) {
  const abs = Math.abs(ms)
  const d = Math.floor(abs / 86_400_000)
  const h = Math.floor((abs % 86_400_000) / 3_600_000)
  const m = Math.floor((abs % 3_600_000) / 60_000)
  const parts = d > 0 ? [[d, u.d], [h, u.h]] : h > 0 ? [[h, u.h], [m, u.m]] : [[m, u.m]]
  return parts
    .filter(([n], i) => i === 0 || n !== 0)
    .map(([n, unit]) => `${n}${unit}`)
    .join(' ')
}

export function formatDate(ts: number, lang: Lang) {
  return new Date(ts).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
