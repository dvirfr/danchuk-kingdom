import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useKingdom } from '../data/KingdomData'
import { chapterOf, isUnlocked, sortCoupons, stateOf } from '../data/coupons'
import { useLang, type StringKey } from '../i18n'
import { couponText, formatDate, formatDuration } from '../lib/format'
import { CouponCard, LockedCard } from '../components/CouponCard'
import { Modal } from '../components/Modal'
import { RedeemCeremony } from '../components/RedeemCeremony'
import { RateModal } from '../components/RateModal'
import type { Coupon, Redemption } from '../types'

type Tab = 'wallet' | 'todo' | 'used'

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

export function Coupons() {
  const { t, lang } = useLang()
  const { backend, coupons, states, progress, launched, previewAll, loaded } = useKingdom()
  const [tab, setTab] = useState<Tab>('wallet')
  const [confirm, setConfirm] = useState<Coupon | null>(null)
  const [ceremony, setCeremony] = useState<Coupon | null>(null)
  const [rating, setRating] = useState<{ coupon: Coupon; r: Redemption } | null>(null)
  const now = useNow()
  const units = { d: t('d'), h: t('h'), m: t('m') }

  const regular = useMemo(() => sortCoupons(coupons.filter((c) => c.section === 'regular')), [coupons])
  const unlocked = regular.filter((c) => isUnlocked(c, progress, launched, previewAll))
  const wallet = unlocked.filter((c) => stateOf(c, states).usesLeft > 0)
  const locked = regular.filter((c) => !isUnlocked(c, progress, launched, previewAll))

  const lockedByChapter = useMemo(() => {
    const m = new Map<number, number>()
    for (const c of locked) {
      const ch = chapterOf(c)
      if (ch !== null) m.set(ch, (m.get(ch) ?? 0) + 1)
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0])
  }, [locked])

  const all = regular.flatMap((c) => stateOf(c, states).redemptions.map((r) => ({ coupon: c, r })))
  const todo = all.filter((x) => !x.r.deliveredAt).sort((a, b) => (a.r.dueAt ?? Infinity) - (b.r.dueAt ?? Infinity))
  const used = all.filter((x) => x.r.deliveredAt).sort((a, b) => b.r.at - a.r.at)

  async function doRedeem(c: Coupon) {
    setConfirm(null)
    try {
      await backend.redeem(c)
      setCeremony(c)
    } catch (e) {
      console.error(e)
    }
  }

  const tabs: { id: Tab; label: string; n?: number }[] = [
    { id: 'wallet', label: t('tabWallet'), n: wallet.length },
    { id: 'todo', label: t('tabTodo'), n: todo.length },
    { id: 'used', label: t('tabUsed'), n: used.length },
  ]

  return (
    <main className="page">
      <header className="page-head">
        <Link to="/" className="back" aria-label={t('back')}>
          {lang === 'he' ? '→' : '←'}
        </Link>
        <h1 className="title small">{t('couponBook')}</h1>
      </header>

      <nav className="tabs">
        {tabs.map((x) => (
          <button key={x.id} className={`tab ${tab === x.id ? 'on' : ''}`} onClick={() => setTab(x.id)}>
            {x.label}
            {!!x.n && <span className="tab-count">{x.n}</span>}
          </button>
        ))}
      </nav>

      {!loaded && <p className="muted">✨ {t('loading')}</p>}

      <AnimatePresence mode="wait">
        <motion.section
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'wallet' && (
            <>
              {wallet.length === 0 && loaded && <p className="empty">{t('emptyWallet')}</p>}
              <div className="coupon-grid">
                {wallet.map((c) => (
                  <CouponCard key={c.id} coupon={c} state={stateOf(c, states)} onRedeem={setConfirm} />
                ))}
                {lockedByChapter.map(([ch, n]) => (
                  <LockedCard key={ch} label={t('lockedChapter', { n: ch })} count={n} />
                ))}
              </div>
              {locked.length > 0 && <p className="muted center small-text">{t('lockedCount', { n: locked.length })}</p>}
            </>
          )}

          {tab === 'todo' && (
            <div className="list">
              {todo.length === 0 && <p className="empty">{t('emptyTodo')}</p>}
              {todo.map(({ coupon, r }) => {
                const left = r.dueAt === null ? null : r.dueAt - now
                return (
                  <div key={r.id} className={`list-item rarity-edge-${coupon.rarity}`}>
                    <span className="li-icon">{coupon.icon}</span>
                    <div className="li-body">
                      <b>{couponText(coupon, lang).title}</b>
                      <span className={`sla ${left !== null && left < 0 ? 'late' : ''}`}>
                        {left === null
                          ? t('byAgreement')
                          : left >= 0
                            ? `⏳ ${t('dueIn', { time: formatDuration(left, units) })}`
                            : `🚨 ${t('overdue', { time: formatDuration(left, units) })}`}
                      </span>
                    </div>
                    <button
                      className="btn-gold small"
                      onClick={async () => {
                        await backend.deliver(coupon.id, r.id)
                        setRating({ coupon, r })
                      }}
                    >
                      {t('markDelivered')}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'used' && (
            <div className="list">
              {used.length === 0 && <p className="empty">{t('emptyUsed')}</p>}
              {used.map(({ coupon, r }) => (
                <div key={r.id} className={`list-item used rarity-edge-${coupon.rarity}`}>
                  <span className="li-icon">{coupon.icon}</span>
                  <div className="li-body">
                    <b>{couponText(coupon, lang).title}</b>
                    <span className="muted small-text">{t('ratedOn', { date: formatDate(r.at, lang) })}</span>
                    {r.review && <span className="review">💬 {t(r.review as StringKey)}</span>}
                  </div>
                  {r.rating ? (
                    <span className="stars-static" aria-label={`${r.rating}/5`}>
                      {'★'.repeat(r.rating)}
                      <span className="dim">{'★'.repeat(5 - r.rating)}</span>
                    </span>
                  ) : (
                    <button className="btn-outline small" onClick={() => setRating({ coupon, r })}>
                      {t('rateNow')}
                    </button>
                  )}
                  <span className="mini-stamp">{t('redeemed')}</span>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </AnimatePresence>

      <Modal open={!!confirm} onClose={() => setConfirm(null)}>
        {confirm && (
          <>
            <span className="coupon-icon big">{confirm.icon}</span>
            <h2 className="modal-title">{t('redeemConfirmTitle', { title: couponText(confirm, lang).title })}</h2>
            <p className="muted">{t('redeemConfirmBody')}</p>
            <div className="modal-actions">
              <button className="btn-gold" onClick={() => doRedeem(confirm)}>
                {t('yesRedeem')}
              </button>
              <button className="btn-link" onClick={() => setConfirm(null)}>
                {t('notNow')}
              </button>
            </div>
          </>
        )}
      </Modal>

      <RedeemCeremony
        coupon={ceremony}
        onClose={() => {
          setCeremony(null)
          setTab('todo')
        }}
      />

      <RateModal
        open={!!rating}
        title={rating ? couponText(rating.coupon, lang).title : ''}
        onClose={() => setRating(null)}
        onSubmit={async (stars, review) => {
          if (rating) await backend.rate(rating.coupon.id, rating.r.id, stars, review)
          setRating(null)
          setTab('used')
        }}
      />
    </main>
  )
}
