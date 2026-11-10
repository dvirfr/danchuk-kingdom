import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import type { Coupon } from '../types'
import { useLang } from '../i18n'
import { couponText } from '../lib/format'
import { Modal } from './Modal'

export function RedeemCeremony({ coupon, onClose }: { coupon: Coupon | null; onClose: () => void }) {
  const { t, lang } = useLang()

  useEffect(() => {
    if (!coupon) return
    const colors = ['#ffd166', '#ff8fc8', '#c39bff', '#ffffff']
    const burst = (x: number) =>
      confetti({ particleCount: 90, spread: 75, startVelocity: 45, origin: { x, y: 0.65 }, colors, zIndex: 2000 })
    burst(0.25)
    setTimeout(() => burst(0.75), 250)
    setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.4 }, shapes: ['star'], colors, zIndex: 2000 }), 600)
  }, [coupon])

  return (
    <Modal open={!!coupon} onClose={onClose}>
      {coupon && (
        <div className="ceremony">
          <div className={`ceremony-card rarity-${coupon.rarity}`}>
            <span className="coupon-icon big">{coupon.icon}</span>
            <h2>{couponText(coupon, lang).title}</h2>
            <motion.div
              className="stamp"
              initial={{ scale: 3, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: -14 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 14 }}
            >
              {t('redeemed')}
            </motion.div>
          </div>
          <p className="show-him">{t('showHim')}</p>
          <button className="btn-gold" onClick={onClose}>
            👑 OK
          </button>
        </div>
      )}
    </Modal>
  )
}
