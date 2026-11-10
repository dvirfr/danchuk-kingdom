import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Coupon, CouponState } from '../types'
import { useLang, type StringKey } from '../i18n'
import { couponText } from '../lib/format'

type Props = {
  coupon: Coupon
  state: CouponState
  onRedeem: (c: Coupon) => void
}

export function CouponCard({ coupon, state, onRedeem }: Props) {
  const { t, lang } = useLang()
  const [flipped, setFlipped] = useState(false)
  const txt = couponText(coupon, lang)
  const multi = coupon.uses > 1
  const spent = state.usesLeft <= 0

  return (
    <div className={`coupon-wrap ${spent ? 'spent' : ''}`}>
      <motion.div
        className="coupon-inner"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        aria-label={txt.title}
      >
        {/* front */}
        <div className={`coupon-face front rarity-${coupon.rarity}`}>
          <span className="rarity-badge">{t(`rarity_${coupon.rarity}` as StringKey)}</span>
          <span className="coupon-icon" aria-hidden>
            {coupon.icon}
          </span>
          <h3 className="coupon-title">{txt.title}</h3>
          {multi && (
            <span className="uses-chip">{t('usesLeft', { n: state.usesLeft, total: coupon.uses })}</span>
          )}
          <span className="flip-hint">{t('tapToFlip')} ↻</span>
        </div>

        {/* back */}
        <div className={`coupon-face back rarity-${coupon.rarity}`}>
          <p className="coupon-desc">{txt.desc}</p>
          {txt.fine && (
            <p className="fine-print">
              <b>{t('finePrint')}:</b> {txt.fine}
            </p>
          )}
          <button
            className="btn-gold small"
            disabled={spent}
            onClick={(e) => {
              e.stopPropagation()
              onRedeem(coupon)
            }}
          >
            {t('redeem')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export function LockedCard({ label, count }: { label: string; count: number }) {
  return (
    <div className="coupon-wrap locked">
      <div className="coupon-face front locked-face">
        <span className="coupon-icon" aria-hidden>
          🔒
        </span>
        <h3 className="coupon-title">{label}</h3>
        <span className="uses-chip">×{count}</span>
      </div>
    </div>
  )
}
