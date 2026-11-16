import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n'
import { usePhotoSrcs } from '../data/KingdomData'
import { pickPhotos, type GameProps } from './common'

const CARDS = 3
const REVEAL_AT = 0.5

function ScratchCard({ src, label, onRevealed }: { src?: string; label: string; onRevealed: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [revealed, setRevealed] = useState(false)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const strokes = useRef(0)

  useEffect(() => {
    const c = canvasRef.current!
    const rect = c.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    c.width = rect.width * dpr
    c.height = rect.height * dpr
    const ctx = c.getContext('2d')!
    ctx.scale(dpr, dpr)
    // gold foil
    const g = ctx.createLinearGradient(0, 0, rect.width, rect.height)
    g.addColorStop(0, '#f7d774')
    g.addColorStop(0.35, '#fff0b3')
    g.addColorStop(0.6, '#e2ab36')
    g.addColorStop(1, '#f7d774')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, rect.width, rect.height)
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    for (let i = 0; i < 70; i++) {
      ctx.font = `${8 + Math.random() * 10}px serif`
      ctx.fillText('✦', Math.random() * rect.width, Math.random() * rect.height)
    }
    ctx.fillStyle = '#7a4d00'
    ctx.font = 'bold 22px Quicksand, Varela Round, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, rect.width / 2, rect.height / 2)
  }, [label])

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const scratch = (p: { x: number; y: number }) => {
    const ctx = canvasRef.current!.getContext('2d')!
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = 44
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    const from = last.current ?? p
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    if (++strokes.current % 12 === 0) check()
  }

  const check = () => {
    const c = canvasRef.current!
    const data = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data
    let clear = 0
    let total = 0
    for (let i = 3; i < data.length; i += 4 * 16) {
      total++
      if (data[i] === 0) clear++
    }
    if (clear / total >= REVEAL_AT && !revealed) {
      setRevealed(true)
      onRevealed()
    }
  }

  return (
    <div className="scratch-card">
      {src ? <img src={src} alt="" draggable={false} /> : <span className="spinner" />}
      <motion.canvas
        ref={canvasRef}
        animate={{ opacity: revealed ? 0 : 1 }}
        transition={{ duration: 0.6 }}
        style={{ pointerEvents: revealed ? 'none' : 'auto' }}
        onPointerDown={(e) => {
          drawing.current = true
          last.current = null
          ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
          scratch(pos(e))
        }}
        onPointerMove={(e) => drawing.current && scratch(pos(e))}
        onPointerUp={() => {
          drawing.current = false
          last.current = null
          check()
        }}
      />
    </div>
  )
}

export function ScratchGame({ photos, allPhotos, onWin }: GameProps) {
  const { t } = useLang()
  const chosen = useMemo(() => pickPhotos(photos, allPhotos, CARDS), [photos, allPhotos])
  const srcs = usePhotoSrcs(chosen.map((p) => p.id))
  const [i, setI] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const total = Math.max(chosen.length, 1)

  if (chosen.length === 0) {
    return (
      <div className="game scratch">
        <button className="btn-gold" onClick={onWin}>
          {t('finish')}
        </button>
      </div>
    )
  }

  const p = chosen[i]
  return (
    <div className="game scratch">
      <p className="game-hint">
        {t('scratchHint')} · <span className="muted">{t('cardOf', { i: i + 1, n: total })}</span>
      </p>
      <ScratchCard key={p.id} src={srcs[p.id]} label={t('scratchMe')} onRevealed={() => setRevealed(true)} />
      {p.caption && revealed && <p className="caption">{p.caption}</p>}
      <div className="game-actions">
        {revealed && (
          <motion.button
            className="btn-gold"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => {
              if (i + 1 >= total) onWin()
              else {
                setI(i + 1)
                setRevealed(false)
              }
            }}
          >
            {i + 1 >= total ? t('finish') : t('next')} ✨
          </motion.button>
        )}
      </div>
    </div>
  )
}
