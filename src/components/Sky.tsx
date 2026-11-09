import { useMemo } from 'react'

// Twinkling stars + drifting golden sparkles. Pure CSS animation, cheap on phones.
export function Sky() {
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 70,
        size: Math.random() * 2.2 + 0.8,
        delay: Math.random() * 4,
        dur: 2 + Math.random() * 3,
      })),
    [],
  )
  const sparkles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        dur: 8 + Math.random() * 8,
        size: 6 + Math.random() * 8,
      })),
    [],
  )
  return (
    <div className="sky" aria-hidden>
      {stars.map((s) => (
        <span
          key={s.id}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="sparkle"
          style={{
            left: `${s.left}%`,
            fontSize: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  )
}
