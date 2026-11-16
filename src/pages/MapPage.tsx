import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useKingdom } from '../data/KingdomData'
import { CHAPTER_ICON, chapterStatus, type ChapterStatus } from '../data/chapters'
import { useLang } from '../i18n'
import { Guides } from '../components/Guides'
import { formatDate } from '../lib/format'

// Node positions on a 360-wide winding path (percent x, px y).
const POS = [
  { x: 50, y: 70 }, // gift chest
  { x: 26, y: 210 },
  { x: 74, y: 340 },
  { x: 26, y: 470 },
  { x: 74, y: 600 },
  { x: 26, y: 730 },
  { x: 60, y: 870 },
]
const HEIGHT = 960

export function MapPage() {
  const { t, lang } = useLang()
  const nav = useNavigate()
  const { chapters, progress, now, launched, previewAll } = useKingdom()

  const pathD = POS.map((p, i) => {
    const x = (p.x / 100) * 360
    if (i === 0) return `M ${x} ${p.y}`
    const prev = POS[i - 1]
    const px = (prev.x / 100) * 360
    const midY = (prev.y + p.y) / 2
    return `C ${px} ${midY}, ${x} ${midY}, ${x} ${p.y}`
  }).join(' ')

  const statusLabel = (st: ChapterStatus, n: number, opensAt: number) =>
    st === 'done'
      ? `✓ ${t('done')}`
      : st === 'locked-date'
        ? `🔒 ${t('opensOn', { date: formatDate(opensAt, lang) })}`
        : st === 'locked-prev'
          ? `🔒 ${t('finishPrev', { n: n - 1 })}`
          : `▶ ${t('play')}`

  return (
    <main className="page map-page">
      <header className="page-head">
        <Link to="/" className="back" aria-label={t('back')}>
          {lang === 'he' ? '→' : '←'}
        </Link>
        <h1 className="title small">{t('mapTitle')}</h1>
      </header>

      <Guides text={t('mapGuide')} size={80} />

      <div className="map" style={{ height: HEIGHT }} dir="ltr">
        <svg className="map-path" viewBox={`0 0 360 ${HEIGHT}`} preserveAspectRatio="none" aria-hidden>
          <path d={pathD} fill="none" stroke="rgba(255,209,102,0.55)" strokeWidth="5" strokeDasharray="2 12" strokeLinecap="round" />
        </svg>

        {/* scenery */}
        {[
          ['🌲', 6, 130], ['🌳', 88, 150], ['🍄', 90, 260], ['🌷', 8, 330], ['⛲', 88, 470], ['🦋', 10, 560],
          ['🌲', 90, 680], ['🌈', 6, 820], ['🌟', 88, 780], ['🌳', 12, 930],
        ].map(([e, x, y], i) => (
          <span key={i} className="scenery" style={{ left: `${x}%`, top: Number(y) }} aria-hidden>
            {e}
          </span>
        ))}

        {/* gift chest */}
        <motion.button
          className="map-node chest open"
          style={{ left: `${POS[0].x}%`, top: POS[0].y }}
          whileTap={{ scale: 0.92 }}
          onClick={() => nav('/coupons')}
        >
          <span className="node-medal">🎁</span>
          <span className="node-title">{t('giftChest')}</span>
        </motion.button>

        {chapters.map((c, i) => {
          const st = chapterStatus(c, progress.completedChapters, now, launched, previewAll)
          const p = POS[i + 1]
          const clickable = st === 'open' || st === 'done'
          return (
            <motion.button
              key={c.n}
              className={`map-node ${st}`}
              style={{ left: `${p.x}%`, top: p.y }}
              whileTap={clickable ? { scale: 0.92 } : undefined}
              onClick={() => clickable && nav(`/chapter/${c.n}`)}
              disabled={!clickable}
              dir={lang === 'he' ? 'rtl' : 'ltr'}
            >
              <span className="node-medal">
                {CHAPTER_ICON[c.n]}
                {st === 'done' && <span className="node-check">✓</span>}
              </span>
              <span className="node-kicker">{t('chapterN', { n: c.n })}</span>
              <span className="node-title">{lang === 'he' ? c.title_he : c.title_en}</span>
              <span className="node-status">{statusLabel(st, c.n, c.opensAt)}</span>
            </motion.button>
          )
        })}
      </div>
    </main>
  )
}
