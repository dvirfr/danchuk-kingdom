import type { ChapterContent, PhotoMeta } from '../types'

export type GameProps = {
  chapter: number
  photos: PhotoMeta[]
  allPhotos: PhotoMeta[]
  chapters: ChapterContent[]
  onWin: () => void
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Chapter photos first, topped up from the rest of the album, no duplicates. */
export function pickPhotos(chapterPhotos: PhotoMeta[], all: PhotoMeta[], n: number): PhotoMeta[] {
  const ids = new Set(chapterPhotos.map((p) => p.id))
  const rest = shuffle(all.filter((p) => !ids.has(p.id)))
  return [...shuffle(chapterPhotos), ...rest].slice(0, n)
}

/** Emoji stand-ins when there aren't enough photos yet. */
export const FALLBACK_EMOJI = ['👑', '💖', '🏰', '🦋', '🌸', '✨', '🎀', '🌙', '🍓', '🦄']
