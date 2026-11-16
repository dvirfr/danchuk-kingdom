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

export type GameType = 'memory' | 'quiz' | 'scratch' | 'jigsaw' | 'slide' | 'final'

/** Lightweight photo record (with a small thumbnail) — safe to load in bulk. */
export type PhotoMeta = {
  id: string
  chapter: number
  createdAt: number
  w: number
  h: number
  thumb: string
  caption?: string
  /** Chapter-2 quiz: question + correct answer + two wrong answers (any language). */
  quizQ?: string
  quizA?: string
  quizW1?: string
  quizW2?: string
}

/** Full-size image, loaded only when a game needs it. */
export type PhotoData = { id: string; src: string }

export type ChapterContent = {
  n: number
  title_en: string
  title_he: string
  story_en: string
  story_he: string
  note_en: string
  note_he: string
  /** ms timestamp when this chapter opens */
  opensAt: number
}
