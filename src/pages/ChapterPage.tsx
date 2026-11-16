import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useKingdom } from '../data/KingdomData'
import { useAuth } from '../auth'
import { CHAPTER_GAME, CHAPTER_ICON, chapterStatus } from '../data/chapters'
import { chapterOf } from '../data/coupons'
import { useLang } from '../i18n'
import { couponText } from '../lib/format'
import { Guides } from '../components/Guides'
import { MemoryGame } from '../games/MemoryGame'
import { QuizGame } from '../games/QuizGame'
import { ScratchGame } from '../games/ScratchGame'
import type { GameProps } from '../games/common'
import type { GameType } from '../types'

const GAMES: Partial<Record<GameType, (p: GameProps) => React.ReactElement>> = {
  memory: MemoryGame,
  quiz: QuizGame,
  scratch: ScratchGame,
}

type Stage = 'intro' | 'play' | 'won'

export function ChapterPage() {
  const { n: nParam } = useParams()
  const n = Number(nParam)
  const { t, lang } = useLang()
  const nav = useNavigate()
  const { isAdmin } = useAuth()
  const { backend, chapters, photos, coupons, progress, now, launched, previewAll } = useKingdom()
  const [stage, setStage] = useState<Stage>('intro')

  const chapter = chapters.find((c) => c.n === n)
  const status = chapter ? chapterStatus(chapter, progress.completedChapters, now, launched, previewAll) : null
  const chapterPhotos = useMemo(() => photos.filter((p) => p.chapter === n), [photos, n])
  const unlocked = useMemo(
    () => coupons.filter((c) => c.section === 'regular' && chapterOf(c) === n).sort((a, b) => a.id.localeCompare(b.id)),
    [coupons, n],
  )

  const onWin = useCallback(async () => {
    setStage('won')
    try {
      await backend.completeChapter(n)
    } catch (e) {
      console.error(e)
    }
  }, [backend, n])

  useEffect(() => {
    if (stage !== 'won') return
    const colors = ['#ffd166', '#ff8fc8', '#c39bff', '#ffffff']
    confetti({ particleCount: 140, spread: 100, origin: { y: 0.55 }, colors, zIndex: 2000 })
    const id = setTimeout(() => confetti({ particleCount: 80, spread: 140, origin: { y: 0.3 }, shapes: ['star'], colors, zIndex: 2000 }), 500)
    return () => clearTimeout(id)
  }, [stage])

  if (!chapter || !status) return <Navigate to="/map" replace />
  if (status === 'locked-date' || status === 'locked-prev') return <Navigate to="/map" replace />

  const title = lang === 'he' ? chapter.title_he : chapter.title_en
  const story = lang === 'he' ? chapter.story_he : chapter.story_en
  const note = lang === 'he' ? chapter.note_he : chapter.note_en
  const Game = GAMES[CHAPTER_GAME[n]]

  return (
    <main className="page chapter-page">
      <header className="page-head">
        <Link to="/map" className="back" aria-label={t('backToMap')}>
          {lang === 'he' ? '→' : '←'}
        </Link>
        <div>
          <div className="kicker">
            {CHAPTER_ICON[n]} {t('chapterN', { n })}
          </div>
          <h1 className="title small">{title}</h1>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {stage === 'intro' && (
          <motion.section key="intro" className="stage" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Guides text={t('questReady')} size={100} />
            <div className="card story">
              <p>{story}</p>
            </div>
            <button className="btn-gold" onClick={() => setStage('play')}>
              {status === 'done' ? t('playAgain') : t('startQuest')}
            </button>
            {status === 'done' && (
              <button className="btn-link" onClick={() => setStage('won')}>
                💌 {t('loveNote')}
              </button>
            )}
          </motion.section>
        )}

        {stage === 'play' && (
          <motion.section key="play" className="stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {Game ? (
              <Game chapter={n} photos={chapterPhotos} allPhotos={photos} chapters={chapters} onWin={onWin} />
            ) : (
              <div className="card">
                <p>{t('underConstruction')}</p>
                {isAdmin && (
                  <button className="btn-outline small" style={{ marginTop: '0.8rem' }} onClick={onWin}>
                    {t('skipTest')}
                  </button>
                )}
              </div>
            )}
          </motion.section>
        )}

        {stage === 'won' && (
          <motion.section key="won" className="stage" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <Guides text={t('questWon')} size={90} />
            <motion.div
              className="card love-note"
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 120 }}
            >
              <h2>💌 {t('loveNote')}</h2>
              <p>{note}</p>
            </motion.div>
            {unlocked.length > 0 && (
              <div className="unlocked">
                <p className="muted">{t('youUnlocked', { n: unlocked.length })}</p>
                <div className="unlocked-row">
                  {unlocked.map((c, i) => (
                    <motion.div
                      key={c.id}
                      className={`mini-coupon rarity-${c.rarity}`}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 + i * 0.12 }}
                    >
                      <span>{c.icon}</span>
                      <small>{couponText(c, lang).title}</small>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            <button className="btn-gold" onClick={() => nav('/coupons')}>
              {t('toCoupons')}
            </button>
            <button className="btn-link" onClick={() => nav('/map')}>
              {t('backToMap')}
            </button>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  )
}
