import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n'
import { usePhotoSrcs } from '../data/KingdomData'
import { FALLBACK_EMOJI, pickPhotos, shuffle, type GameProps } from './common'

const PAIRS = 6

type Card = { key: string; face: string; isPhoto: boolean; pair: string }

export function MemoryGame({ photos, allPhotos, onWin }: GameProps) {
  const { t } = useLang()
  const chosen = useMemo(() => pickPhotos(photos, allPhotos, PAIRS), [photos, allPhotos])
  const srcs = usePhotoSrcs(chosen.map((p) => p.id))

  const deck = useMemo<Card[]>(() => {
    const faces: Omit<Card, 'key'>[] = []
    chosen.forEach((p) => faces.push({ face: p.id, isPhoto: true, pair: p.id }))
    let e = 0
    while (faces.length < PAIRS) {
      const em = FALLBACK_EMOJI[e++]
      faces.push({ face: em, isPhoto: false, pair: em })
    }
    return shuffle(faces.flatMap((f, i) => [{ ...f, key: `${i}a` }, { ...f, key: `${i}b` }]))
  }, [chosen])

  const [open, setOpen] = useState<string[]>([])
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [moves, setMoves] = useState(0)

  useEffect(() => {
    if (open.length !== 2) return
    const [a, b] = open.map((k) => deck.find((c) => c.key === k)!)
    setMoves((m) => m + 1)
    if (a.pair === b.pair) {
      setMatched((s) => new Set(s).add(a.pair))
      setOpen([])
    } else {
      const id = setTimeout(() => setOpen([]), 850)
      return () => clearTimeout(id)
    }
  }, [open, deck])

  useEffect(() => {
    if (matched.size === PAIRS) {
      const id = setTimeout(onWin, 700)
      return () => clearTimeout(id)
    }
  }, [matched, onWin])

  const flip = (c: Card) => {
    if (open.length >= 2 || open.includes(c.key) || matched.has(c.pair)) return
    setOpen((o) => [...o, c.key])
  }

  return (
    <div className="game memory">
      <p className="game-hint">
        {t('memoryHint')} · <span className="muted">{t('moves', { n: moves })}</span>
      </p>
      <div className="memory-grid">
        {deck.map((c) => {
          const up = open.includes(c.key) || matched.has(c.pair)
          return (
            <div key={c.key} className="mem-wrap" data-pair={c.pair} onClick={() => flip(c)}>
              <motion.div
                className={`mem-card ${matched.has(c.pair) ? 'matched' : ''}`}
                animate={{ rotateY: up ? 180 : 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="mem-face mem-back">✦</div>
                <div className="mem-face mem-front">
                  {c.isPhoto ? (
                    srcs[c.face] ? <img src={srcs[c.face]} alt="" draggable={false} /> : <span className="spinner" />
                  ) : (
                    <span className="mem-emoji">{c.face}</span>
                  )}
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
