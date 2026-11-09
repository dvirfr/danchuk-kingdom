import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../auth'
import { useLang } from '../i18n'
import { Castle } from '../components/Castle'

export function Gate() {
  const { user, signIn, logout } = useAuth()
  const { t } = useLang()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const strangerSignedIn = !!user

  async function enter() {
    setBusy(true)
    setError(null)
    try {
      if (strangerSignedIn) await logout()
      setError(await signIn())
    } catch (e) {
      setError((e as { code?: string }).code ?? 'unknown')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="gate">
      <motion.h1
        className="title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {t('appName')}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <Castle className="castle" />
      </motion.div>

      {strangerSignedIn ? (
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2>🐉 {t('notInvitedTitle')}</h2>
          <p>{t('notInvitedBody', { email: user?.email ?? '' })}</p>
        </motion.div>
      ) : (
        <p className="subtitle">{t('gateSubtitle')}</p>
      )}

      <motion.button
        className="btn-gold"
        onClick={enter}
        disabled={busy}
        whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: ['0 0 12px #ffd16688', '0 0 28px #ffd166cc', '0 0 12px #ffd16688'] }}
        transition={{ repeat: Infinity, duration: 2.4 }}
      >
        {busy ? t('signingIn') : strangerSignedIn ? t('tryAnother') : `✨ ${t('signIn')}`}
      </motion.button>
      {error && (
        <p className="error">
          {error === 'auth/popup-blocked' ? t('popupBlocked') : t('signInError')}
          <br />
          <small>({error})</small>
        </p>
      )}
    </main>
  )
}
