export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'spicy'
export type Section = 'regular' | 'after_dark'

export type Coupon = {
  id: string
  section: Section
  /** gift | chapter1..chapter6 | entry | night1..night30 | wildcard */
  unlock: string
  rarity: Rarity
  uses: number
  /** Hours the husband has to deliver; null = by royal agreement */
  slaHours: number | null
  icon?: string
  title_en: string
  title_he: string
  desc_en: string
  desc_he: string
  fine_en: string
  fine_he: string
}

export type Redemption = {
  id: string
  at: number
  dueAt: number | null
  deliveredAt?: number
  rating?: number
  review?: string
}

export type CouponState = {
  usesLeft: number
  redemptions: Redemption[]
}

export type Progress = {
  completedChapters: number[]
}
