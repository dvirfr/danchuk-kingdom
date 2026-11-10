import type { Coupon, CouponState, Progress, Rarity, Section } from '../types'
import { DEFAULT_ICONS, RARITY_FALLBACK_ICON } from './icons'

const RARITIES: Rarity[] = ['common', 'rare', 'epic', 'legendary', 'spicy']
const SECTIONS: Section[] = ['regular', 'after_dark']

/** Turn one CSV row (as exported from coupons.csv) into a Coupon, or throw with a readable reason. */
export function rowToCoupon(row: Record<string, string>, line: number): Coupon {
  const need = (k: string) => {
    const v = row[k]
    if (!v) throw new Error(`Row ${line}: missing "${k}"`)
    return v
  }
  const id = need('id')
  const rarity = need('rarity') as Rarity
  const section = need('section') as Section
  if (!RARITIES.includes(rarity)) throw new Error(`Row ${line} (${id}): unknown rarity "${rarity}"`)
  if (!SECTIONS.includes(section)) throw new Error(`Row ${line} (${id}): unknown section "${section}"`)
  const uses = Number(row.uses || 1)
  if (!Number.isInteger(uses) || uses < 1) throw new Error(`Row ${line} (${id}): uses must be 1 or more`)
  const sla = row.sla_hours ? Number(row.sla_hours) : null
  return {
    id,
    section,
    unlock: need('unlock'),
    rarity,
    uses,
    slaHours: sla && sla > 0 ? sla : null,
    icon: row.icon || DEFAULT_ICONS[id] || RARITY_FALLBACK_ICON[rarity],
    title_en: need('title_en'),
    title_he: need('title_he'),
    desc_en: row.desc_en ?? '',
    desc_he: row.desc_he ?? '',
    fine_en: row.fine_print_en ?? '',
    fine_he: row.fine_print_he ?? '',
  }
}

export function stateOf(c: Coupon, states: Record<string, CouponState>): CouponState {
  return states[c.id] ?? { usesLeft: c.uses, redemptions: [] }
}

/** Chapter number for "chapterN" unlock keys, else null. */
export function chapterOf(c: Coupon): number | null {
  const m = /^chapter(\d+)$/.exec(c.unlock)
  return m ? Number(m[1]) : null
}

export function isUnlocked(c: Coupon, progress: Progress, launched: boolean, previewAll: boolean) {
  if (previewAll) return true
  if (!launched) return false
  if (c.section !== 'regular') return false // After Dark has its own rules (phase 4)
  if (c.unlock === 'gift') return true
  const ch = chapterOf(c)
  return ch !== null && progress.completedChapters.includes(ch)
}

export const RARITY_ORDER: Record<Rarity, number> = { common: 0, rare: 1, epic: 2, legendary: 3, spicy: 4 }

export function sortCoupons(list: Coupon[]) {
  return [...list].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
}
