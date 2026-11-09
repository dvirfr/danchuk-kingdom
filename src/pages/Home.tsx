import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../auth'
import { useLang } from '../i18n'
import { LAUNCH_AT } from '../config'
import { Castle } from '../components/Castle'

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])
  const ms = Math.max(0, target.getTime() - now)
  return {
    done: ms === 0,
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms % 86_400_000) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
  }
}

export function Home() {
  const { isAdmin, logout } = useAuth()
  const { t } = useLang()
  const c = useCountdown(LAUNCH_AT)

  return (
    <main className="home">
      <motion.h1 className="title" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        {isAdmin ? t('greetingAdmin') : t('greeting')}
      </motion.h1>

      <Castle className="castle small" />

      <div className="card">
        {c.done ? (
          <h2>🎉 {t('opened')}</h2>
        ) : (
          <>
            <p className="muted">{t('countdown')}</p>
            <div className="countdown">
              <div>
                <b>{c.days}</b>
                <span>{t('days')}</span>
              </div>
              <div>
                <b>{c.hours}</b>
                <span>{t('hours')}</span>
              </div>
              <div>
                <b>{c.minutes}</b>
                <span>{t('minutes')}</span>
              </div>
            </div>
          </>
        )}
        <p className="muted small-text">{t('comingSoon')}</p>
      </div>

      <button className="btn-link" onClick={logout}>
        {t('signOut')}
      </button>
    </main>
  )
}
