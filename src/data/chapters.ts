import type { ChapterContent, GameType } from '../types'
import { LAUNCH_AT } from '../config'

const L = LAUNCH_AT.getTime()
const at = (iso: string) => new Date(iso).getTime()

export const CHAPTER_GAME: Record<number, GameType> = {
  1: 'memory',
  2: 'quiz',
  3: 'scratch',
  4: 'jigsaw',
  5: 'slide',
  6: 'final',
}

export const CHAPTER_ICON: Record<number, string> = { 1: '🌸', 2: '💞', 3: '💍', 4: '🏡', 5: '🌙', 6: '🏰' }

const ph = (en: string, he: string) => ({ en, he })
const PLACEHOLDER_STORY = ph(
  'Once upon a time… (Dvir will write the real story of this chapter here.)',
  'היה היה פעם... (כאן דביר יכתוב את הסיפור האמיתי של הפרק.)',
)
const PLACEHOLDER_NOTE = ph('A love note from your prince will appear here. 💌', 'כאן יופיע מכתב אהבה מהנסיך שלך. 💌')

const titles: Record<number, [string, string]> = {
  1: ['How It All Began', 'איך הכול התחיל'],
  2: ['Falling in Love', 'מתאהבים'],
  3: ['The Ring & the "Yes"', 'הטבעת וה"כן"'],
  4: ['A Family with Michelle', 'משפחה עם מישל'],
  5: ['Romy Arrives', 'רומי מגיעה לעולם'],
  6: ['Today & Forever', 'היום ולתמיד'],
}

const opens: Record<number, number> = {
  1: L,
  2: L,
  3: L,
  4: at('2026-12-02T00:00:00+02:00'),
  5: at('2026-12-09T00:00:00+02:00'),
  6: at('2026-12-16T00:00:00+02:00'),
}

export const DEFAULT_CHAPTERS: ChapterContent[] = [1, 2, 3, 4, 5, 6].map((n) => ({
  n,
  title_en: titles[n][0],
  title_he: titles[n][1],
  story_en: PLACEHOLDER_STORY.en,
  story_he: PLACEHOLDER_STORY.he,
  note_en: PLACEHOLDER_NOTE.en,
  note_he: PLACEHOLDER_NOTE.he,
  opensAt: opens[n],
}))

/** Merge stored overrides on top of defaults (empty stored fields fall back to defaults). */
export function mergeChapters(stored: Partial<ChapterContent>[]): ChapterContent[] {
  return DEFAULT_CHAPTERS.map((d) => {
    const s = stored.find((x) => x.n === d.n) ?? {}
    const out = { ...d }
    for (const [k, v] of Object.entries(s)) {
      if (v !== '' && v !== undefined && v !== null) (out as Record<string, unknown>)[k] = v
    }
    return out
  })
}

export type ChapterStatus = 'locked-date' | 'locked-prev' | 'open' | 'done'

export function chapterStatus(
  c: ChapterContent,
  completed: number[],
  now: number,
  launched: boolean,
  previewAll: boolean,
): ChapterStatus {
  if (completed.includes(c.n)) return 'done'
  if (previewAll) return 'open'
  if (!launched || now < c.opensAt) return 'locked-date'
  // chapters are played in order
  if (c.n > 1 && !completed.includes(c.n - 1)) return 'locked-prev'
  return 'open'
}
