// Original storybook castle illustration (hand-drawn SVG, no third-party art).
export function Castle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 -20 320 285" role="img" aria-label="castle">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdf3ff" />
          <stop offset="1" stopColor="#d9c4f0" />
        </linearGradient>
        <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff8fc8" />
          <stop offset="1" stopColor="#b44ea0" />
        </linearGradient>
        <linearGradient id="gateGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9a8" />
          <stop offset="1" stopColor="#f7b84b" />
        </linearGradient>
      </defs>

      {/* back towers */}
      <rect x="62" y="96" width="34" height="120" fill="url(#wall)" />
      <polygon points="56,98 79,30 102,98" fill="url(#roof)" />
      <rect x="224" y="96" width="34" height="120" fill="url(#wall)" />
      <polygon points="218,98 241,30 264,98" fill="url(#roof)" />

      {/* center keep */}
      <rect x="120" y="70" width="80" height="146" fill="url(#wall)" />
      <polygon points="112,74 160,0 208,74" fill="url(#roof)" />
      <line x1="160" y1="0" x2="160" y2="-14" stroke="#c9a227" strokeWidth="2" />
      <path className="flag" d="M160 -14 q12 4 22 0 v10 q-10 4 -22 0 z" fill="#ffd166" />
      <circle cx="160" cy="104" r="12" fill="#ffe9a8" className="window-glow" />
      <path d="M160 96 l3 6 6 1 -4.5 4 1 6 -5.5-3 -5.5 3 1-6 -4.5-4 6-1z" fill="#f7b84b" />

      {/* front wall */}
      <rect x="40" y="160" width="240" height="60" fill="url(#wall)" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={40 + i * 20} y="150" width="12" height="12" fill="url(#wall)" />
      ))}

      {/* front towers */}
      <rect x="28" y="130" width="30" height="90" fill="url(#wall)" />
      <polygon points="22,132 43,80 64,132" fill="url(#roof)" />
      <rect x="262" y="130" width="30" height="90" fill="url(#wall)" />
      <polygon points="256,132 277,80 298,132" fill="url(#roof)" />

      {/* windows */}
      {[
        [74, 130],
        [236, 130],
        [38, 160],
        [272, 160],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="10" height="16" rx="5" fill="#ffe9a8" className="window-glow" />
      ))}

      {/* gate */}
      <path d="M140 220 v-36 a20 20 0 0 1 40 0 v36 z" fill="url(#gateGlow)" className="gate-glow" />
      <path d="M140 220 v-36 a20 20 0 0 1 40 0 v36" fill="none" stroke="#9b6a12" strokeWidth="3" />

      {/* hill */}
      <ellipse cx="160" cy="236" rx="170" ry="28" fill="#3b2a6b" />
    </svg>
  )
}
