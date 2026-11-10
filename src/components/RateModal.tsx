import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLang, type StringKey } from '../i18n'
import { Modal } from './Modal'

const REVIEWS: StringKey[] = ['review1', 'review2', 'review3', 'review4', 'review5', 'review6']

export function RateModal({
  open,
  title,
  onSubmit,
  onClose,
}: {
  open: boolean
  title: string
  onSubmit: (rating: number, review?: string) => void
  onClose: () => void
}) {
  const { t } = useLang()
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState<StringKey | null>(null)

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="modal-title">{t('rateTitle')}</h2>
      <p className="muted">{title}</p>
      <div className="stars" role="radiogroup">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            className={`star-btn ${n <= rating ? 'on' : ''}`}
            whileTap={{ scale: 1.4 }}
            onClick={() => setRating(n)}
            aria-label={`${n}`}
          >
            ★
          </motion.button>
        ))}
      </div>
      <div className="chips">
        {REVIEWS.map((k) => (
          <button key={k} className={`chip ${review === k ? 'on' : ''}`} onClick={() => setReview(review === k ? null : k)}>
            {t(k)}
          </button>
        ))}
      </div>
      <button
        className="btn-gold"
        disabled={!rating}
        onClick={() => {
          onSubmit(rating, review ?? undefined)
          setRating(0)
          setReview(null)
        }}
      >
        {t('rateSubmit')}
      </button>
    </Modal>
  )
}
