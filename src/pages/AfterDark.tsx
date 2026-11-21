import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useKingdom } from '../data/KingdomData'
import { useLang } from '../i18n'
import {
  DEFAULT_PIN,
  DICE_ACTIONS,
  DICE_PLACES,
  NIGHTS,
  endPinSession,
  hashPin,
  isPinSessionValid,
  nightOf,
  nightOpensAt,
  nightsOpen,
  startPinSession,
} from '../data/afterDark'
import { couponText } from '../lib/format'
import { ScratchCard } from '../games/ScratchGame'
import { Coupons } from './Coupons'
import type { Coupon } from '../types'

export function AfterDark() {
  const [unlocked, setUnlocked] = useState(isPinSessionValid)
  return (
    <div className="after-dark">
      <div className="ad-bg" aria-hidden />
      {unlocked ? <AfterDarkInside onLock={() => setUnlocked(false)} /> : <PinGate onOk={() => setUnlocked(true)} />}
    </div>
  )
}

function PinGate({ onOk }: { onOk: () => void }) {
  const { t, lang } = useLang()
  const { settings } = useKingdom()
  const [pin, setPin] = useState('')
  const [wrong, setWrong] = useState(0)

  const fail = () => {
    setWrong((w) => w + 1)
    setPin('')
  }

  // Opens as soon as the typed digits match; ✓ (or 8 digits) submits a wrong guess.
  useEffect(() => {
    if (pin.length < 4) return
    let alive = true
    ;(async () => {
      const expected = settings.pinHash ?? (await hashPin(DEFAULT_PIN))
      if (!alive) return
      if ((await hashPin(pin)) === expected) {
        startPinSession()
        onOk()
      } else if (pin.length >= 8) fail()
    })()
    return () => {
      alive = false
    }
  }, [pin, settings.pinHash, onOk])

  const press = (d: string) => setPin((p) => (p.length < 8 ? p + d : p))

  return (
    <main className="page ad-gate">
      <header className="page-head">
        <Link to="/map" className="back">
          {lang === 'he' ? '→' : '←'}
        </Link>
      </header>
      <motion.div className="ad-moon" animate={{ rotate: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 5 }}>
        🌙
      </motion.div>
      <h1 className="title small ad-title">{t('adTitle')}</h1>
      <p className="muted">{wrong ? t('adWrongPin') : t('adEnterPin')}</p>
      <motion.div key={wrong} className="pin-dots" animate={wrong ? { x: [0, -10, 10, -6, 6, 0] } : {}} dir="ltr">
        {Array.from({ length: Math.max(4, pin.length) }, (_, i) => (
          <span key={i} className={i < pin.length ? 'on' : ''} />
        ))}
      </motion.div>
      <div className="pin-pad" dir="ltr">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].map((k) => (
          <button
            key={k}
            className="pin-key"
            onClick={() => {
              if (k === '⌫') setPin((p) => p.slice(0, -1))
              else if (k === '✓') {
                if (pin.length) fail()
              } else press(k)
            }}
          >
            {k}
          </button>
        ))}
      </div>
    </main>
  )
}

function AfterDarkInside({ onLock }: { onLock: () => void }) {
  const { t, lang } = useLang()
  const nav = useNavigate()
  const { coupons, afterDark, backend, now, launched, previewAll } = useKingdom()

  const nightCoupons = useMemo(() => {
    const m = new Map<number, Coupon>()
    coupons.filter((c) => c.section === 'after_dark').forEach((c) => {
      const n = nightOf(c)
      if (n) m.set(n, c)
    })
    return m
  }, [coupons])

  const open = launched || previewAll ? nightsOpen(now, previewAll) : 0
  const nextToScratch = Array.from({ length: open }, (_, i) => i + 1).find((n) => !afterDark.revealed.includes(n))
  const wildUnlocked = previewAll || afterDark.revealed.includes(NIGHTS)
  const nextWhen = (() => {
    if (open >= NIGHTS) return null
    const at = nightOpensAt(open + 1)
    const sameDay = new Date(at).toDateString() === new Date(now).toDateString()
    return sameDay ? t('tonightAt') : t('tomorrowAt')
  })()

  return (
    <main className="page ad-inside">
      <header className="page-head">
        <Link to="/map" className="back">
          {lang === 'he' ? '→' : '←'}
        </Link>
        <h1 className="title small ad-title">🌙 {t('adTitle')}</h1>
        <button
          className="btn-link ad-lock"
          onClick={() => {
            endPinSession()
            onLock()
            nav('/map')
          }}
        >
          🔒 {t('adLock')}
        </button>
      </header>

      {!launched && !previewAll ? (
        <p className="empty">{t('adNotYet')}</p>
      ) : (
        <>
          <section className="ad-section">
            <h2 className="ad-h2">{t('adTonight')}</h2>
            {nextToScratch && nightCoupons.get(nextToScratch) ? (
              <NightCard key={nextToScratch} n={nextToScratch} coupon={nightCoupons.get(nextToScratch)!} onReveal={() => backend.revealNight(nextToScratch)} />
            ) : (
              <p className="muted center">
                {afterDark.revealed.length >= NIGHTS
                  ? t('adAllRevealed')
                  : open === 0
                    ? t('adFirstCard')
                    : nextWhen
                      ? t('adNextCard', { when: nextWhen })
                      : ''}
              </p>
            )}
          </section>

          {wildUnlocked && !afterDark.wildText && <WildcardForm onSave={(txt) => backend.setWildText(txt)} />}

          <Dice />

          <section className="ad-section">
            <h2 className="ad-h2">{t('adMyCoupons')}</h2>
            <Coupons section="after_dark" embedded />
          </section>
        </>
      )}
    </main>
  )
}

function NightCard({ n, coupon, onReveal }: { n: number; coupon: Coupon; onReveal: () => void }) {
  const { t, lang } = useLang()
  const [revealed, setRevealed] = useState(false)
  const txt = couponText(coupon, lang)
  return (
    <div className="night-card">
      <p className="muted center small-text">{t('adNightN', { n })}</p>
      <ScratchCard
        theme="night"
        label={t('adScratch')}
        onRevealed={() => {
          setRevealed(true)
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 }, colors: ['#ff4d6d', '#ffd6e2', '#ffd166'], shapes: ['circle'], zIndex: 2000 })
          setTimeout(onReveal, 2200)
        }}
      >
        <div className="night-reveal rarity-spicy">
          <span className="coupon-icon big">{coupon.icon}</span>
          <h3>{txt.title}</h3>
          <p>{txt.desc}</p>
          {txt.fine && <p className="fine-print">{txt.fine}</p>}
        </div>
      </ScratchCard>
      <AnimatePresence>{revealed && <motion.p className="center ad-added" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{t('adRevealedNew')}</motion.p>}</AnimatePresence>
    </div>
  )
}

function WildcardForm({ onSave }: { onSave: (text: string) => void }) {
  const { t } = useLang()
  const [text, setText] = useState('')
  return (
    <section className="ad-section card wildcard">
      <h2 className="ad-h2">{t('adWildTitle')}</h2>
      <p>{t('adWildBody')}</p>
      <textarea rows={3} value={text} placeholder={t('adWildPlaceholder')} onChange={(e) => setText(e.target.value)} />
      <button className="btn-gold" disabled={!text.trim()} onClick={() => onSave(text.trim())}>
        {t('adWildSave')}
      </button>
    </section>
  )
}

function Dice() {
  const { t, lang } = useLang()
  const [a, setA] = useState(0)
  const [p, setP] = useState(0)
  const [rolling, setRolling] = useState(false)
  const [rolled, setRolled] = useState(false)

  const roll = () => {
    setRolling(true)
    let ticks = 0
    const id = setInterval(() => {
      setA(Math.floor(Math.random() * 6))
      setP(Math.floor(Math.random() * 6))
      if (++ticks > 12) {
        clearInterval(id)
        setRolling(false)
        setRolled(true)
      }
    }, 80)
  }

  const face = (f: { en: string; he: string; icon: string }) => (
    <motion.div className="die" animate={rolling ? { rotate: [0, 90, 180, 270, 360] } : { rotate: 0 }} transition={{ duration: 0.4, repeat: rolling ? Infinity : 0 }}>
      <span>{f.icon}</span>
      <small>{rolled || rolling ? (lang === 'he' ? f.he : f.en) : '?'}</small>
    </motion.div>
  )

  return (
    <section className="ad-section card dice-box">
      <h2 className="ad-h2">🎲 {t('adDice')}</h2>
      <p className="muted small-text">{t('adDiceHint')}</p>
      <div className="dice-row">
        {face(DICE_ACTIONS[a])}
        {face(DICE_PLACES[p])}
      </div>
      <button className="btn-gold" onClick={roll} disabled={rolling}>
        {t('adRoll')}
      </button>
    </section>
  )
}
