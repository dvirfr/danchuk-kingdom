import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang } from '../i18n'
import { usePhotoSrcs } from '../data/KingdomData'
import { pickPhotos, shuffle, type GameProps } from './common'

const MAX_Q = 5

type Q = { photoId: string; question: string; options: string[]; answer: string }

export function QuizGame({ photos, allPhotos, chapters, onWin }: GameProps) {
  const { t, lang } = useLang()

  const questions = useMemo<Q[]>(() => {
    const title = (n: number) => {
      const c = chapters.find((x) => x.n === n)
      return c ? (lang === 'he' ? c.title_he : c.title_en) : `#${n}`
    }
    // 1) questions Dvir wrote in the admin page (any chapter's photos with quiz data)
    const written = shuffle(allPhotos.filter((p) => p.quizA && p.quizW1 && p.quizW2))
      .sort((a, b) => Number(b.chapter === photos[0]?.chapter) - Number(a.chapter === photos[0]?.chapter))
      .map((p) => ({
        photoId: p.id,
        question: p.quizQ || t('quizDefaultQ'),
        answer: p.quizA!,
        options: shuffle([p.quizA!, p.quizW1!, p.quizW2!]),
      }))
    if (written.length >= 3) return written.slice(0, MAX_Q)
    // 2) automatic fallback: "which chapter is this photo from?"
    const auto = pickPhotos(photos, allPhotos, MAX_Q)
      .filter((p) => !written.some((w) => w.photoId === p.id))
      .map((p) => {
        const wrong = shuffle([1, 2, 3, 4, 5, 6].filter((n) => n !== p.chapter)).slice(0, 2)
        return {
          photoId: p.id,
          question: t('quizDefaultQ'),
          answer: title(p.chapter),
          options: shuffle([title(p.chapter), ...wrong.map(title)]),
        }
      })
    return [...written, ...auto].slice(0, MAX_Q)
  }, [photos, allPhotos, chapters, lang, t])

  const srcs = usePhotoSrcs(questions.map((q) => q.photoId))
  const [i, setI] = useState(0)
  const [wrong, setWrong] = useState<string[]>([])
  const [right, setRight] = useState(false)

  if (questions.length === 0) {
    // no photos at all yet: let her through
    return (
      <div className="game quiz">
        <button className="btn-gold" onClick={onWin}>
          {t('finish')}
        </button>
      </div>
    )
  }

  const q = questions[i]

  const choose = (opt: string) => {
    if (right) return
    if (opt === q.answer) {
      setRight(true)
      setTimeout(() => {
        if (i + 1 >= questions.length) onWin()
        else {
          setI(i + 1)
          setWrong([])
          setRight(false)
        }
      }, 900)
    } else setWrong((w) => [...w, opt])
  }

  return (
    <div className="game quiz">
      <p className="game-hint">
        {t('quizHint')} · <span className="muted">{t('questionOf', { i: i + 1, n: questions.length })}</span>
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          className="quiz-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
        >
          <div className="quiz-photo">{srcs[q.photoId] ? <img src={srcs[q.photoId]} alt="" /> : <span className="spinner" />}</div>
          <h3 className="quiz-q">{q.question}</h3>
          <div className="quiz-options">
            {q.options.map((o) => {
              const isWrong = wrong.includes(o)
              const isRight = right && o === q.answer
              return (
                <motion.button
                  key={o}
                  className={`quiz-opt ${isWrong ? 'wrong' : ''} ${isRight ? 'right' : ''}`}
                  animate={isWrong ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  disabled={isWrong || right}
                  onClick={() => choose(o)}
                >
                  {o}
                </motion.button>
              )
            })}
          </div>
          <p className="quiz-feedback">{right ? t('quizRight') : wrong.length ? t('quizWrong') : ' '}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
