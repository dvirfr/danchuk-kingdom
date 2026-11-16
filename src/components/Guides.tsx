// Original storybook guide characters, drawn as SVG and inspired by Dvir and Dana.
// The prince has short dark hair, stubble and brown eyes; the princess has long
// blonde ombré hair, freckles, blue-green eyes, drop earrings and a clover necklace.
import { motion, AnimatePresence } from 'framer-motion'

type Size = { size?: number; className?: string; wave?: boolean }

export function Prince({ size = 140, className = '', wave = false }: Size) {
  return (
    <svg className={`guide prince ${className}`} viewBox="0 0 200 300" width={size} height={size * 1.5} aria-hidden>
      <defs>
        <radialGradient id="p-skin" cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#f2c7a3" />
          <stop offset="1" stopColor="#d79c75" />
        </radialGradient>
        <linearGradient id="p-tunic" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f7a5f" />
          <stop offset="1" stopColor="#1d5040" />
        </linearGradient>
        <linearGradient id="p-cape" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a5fb0" />
          <stop offset="1" stopColor="#24397a" />
        </linearGradient>
        <linearGradient id="p-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9a0" />
          <stop offset="1" stopColor="#e0a82e" />
        </linearGradient>
      </defs>

      <g className="g-bob">
        {/* cape */}
        <path d="M56 165 Q100 150 144 165 L162 286 Q100 298 38 286 Z" fill="url(#p-cape)" />
        {/* legs + boots */}
        <rect x="82" y="245" width="15" height="34" rx="4" fill="#22304d" />
        <rect x="103" y="245" width="15" height="34" rx="4" fill="#22304d" />
        <ellipse cx="88" cy="283" rx="13" ry="7" fill="#3b2516" />
        <ellipse cx="112" cy="283" rx="13" ry="7" fill="#3b2516" />
        {/* tunic */}
        <path d="M62 172 Q100 157 138 172 L147 255 Q100 266 53 255 Z" fill="url(#p-tunic)" />
        <path d="M100 166 L100 222" stroke="url(#p-gold)" strokeWidth="3" />
        {[180, 194, 208].map((y) => (
          <circle key={y} cx="100" cy={y} r="3" fill="url(#p-gold)" />
        ))}
        <rect x="56" y="222" width="88" height="9" rx="3" fill="url(#p-gold)" />
        <rect x="93" y="220" width="14" height="13" rx="2" fill="#c8901e" />
        <ellipse cx="64" cy="173" rx="13" ry="6" fill="url(#p-gold)" />
        <ellipse cx="136" cy="173" rx="13" ry="6" fill="url(#p-gold)" />
        {/* left arm */}
        <path d="M61 178 Q52 205 54 232" stroke="url(#p-tunic)" strokeWidth="17" strokeLinecap="round" fill="none" />
        <circle cx="54" cy="238" r="8.5" fill="url(#p-skin)" />
        {/* right arm (waves) */}
        <g className={wave ? 'g-wave' : ''} style={{ transformOrigin: '139px 178px' }}>
          <path d="M139 178 Q155 160 163 138" stroke="url(#p-tunic)" strokeWidth="17" strokeLinecap="round" fill="none" />
          <circle cx="165" cy="131" r="8.5" fill="url(#p-skin)" />
        </g>
        {/* neck + collar */}
        <rect x="89" y="140" width="22" height="24" fill="#d99e78" />
        <path d="M84 162 L100 176 L116 162" fill="#f4efe6" />

        {/* head */}
        <ellipse cx="51" cy="106" rx="8" ry="11" fill="#d99e78" />
        <ellipse cx="149" cy="106" rx="8" ry="11" fill="#d99e78" />
        <ellipse cx="100" cy="100" rx="48" ry="55" fill="url(#p-skin)" />
        {/* stubble */}
        <path
          d="M55 108 Q58 158 100 160 Q142 158 145 108 Q141 140 120 146 Q100 151 80 146 Q59 140 55 108 Z"
          fill="#3a2a24"
          opacity="0.32"
        />
        <path d="M84 125 Q100 119 116 125 Q100 122 84 125 Z" fill="#3a2a24" opacity="0.28" />
        <ellipse cx="100" cy="151" rx="13" ry="6" fill="#3a2a24" opacity="0.18" />
        {/* hair: short and dark, with sideburns and a tousled front */}
        <path
          d="M52 104 Q46 52 100 42 Q154 52 148 104 L145 104 Q144 82 137 70 Q128 74 120 66 Q112 72 103 65 Q94 72 86 66 Q78 73 68 69 Q57 80 55 104 Z"
          fill="#2b1e18"
        />
        <path d="M60 58 Q72 46 86 50 M98 46 Q110 42 122 49" stroke="#4a362c" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
        {/* brows */}
        <path d="M68 85 Q79 78 91 84" stroke="#2b1e18" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M109 84 Q121 78 132 85" stroke="#2b1e18" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        {/* eyes */}
        <g className="g-blink">
          <ellipse cx="80" cy="100" rx="7.5" ry="8.5" fill="#fff" />
          <circle cx="81" cy="101" r="5.2" fill="#6b3f22" />
          <circle cx="81" cy="101" r="2.4" fill="#1a0f08" />
          <circle cx="83" cy="98.5" r="1.6" fill="#fff" />
          <ellipse cx="120" cy="100" rx="7.5" ry="8.5" fill="#fff" />
          <circle cx="121" cy="101" r="5.2" fill="#6b3f22" />
          <circle cx="121" cy="101" r="2.4" fill="#1a0f08" />
          <circle cx="123" cy="98.5" r="1.6" fill="#fff" />
        </g>
        {/* nose */}
        <path d="M100 104 Q95 118 101 121" stroke="#b67a57" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        {/* big smile */}
        <path d="M79 128 Q100 150 121 128 Q100 135 79 128 Z" fill="#7a2e2e" />
        <path d="M83 129.5 Q100 135.5 117 129.5 L115 134 Q100 138.5 85 134 Z" fill="#fff" />
        {/* cheeks */}
        <ellipse cx="68" cy="121" rx="8" ry="5" fill="#ff8a8a" opacity="0.22" />
        <ellipse cx="132" cy="121" rx="8" ry="5" fill="#ff8a8a" opacity="0.22" />
        {/* crown */}
        <path d="M73 56 L77 31 L89 44 L100 25 L111 44 L123 31 L127 56 Z" fill="url(#p-gold)" stroke="#c8901e" strokeWidth="1.5" />
        <circle cx="100" cy="47" r="4" fill="#e0245e" />
        <circle cx="84" cy="50" r="2.6" fill="#3a8bd6" />
        <circle cx="116" cy="50" r="2.6" fill="#3a8bd6" />
      </g>
    </svg>
  )
}

export function Princess({ size = 140, className = '' }: Size) {
  return (
    <svg className={`guide princess ${className}`} viewBox="0 0 200 300" width={size} height={size * 1.5} aria-hidden>
      <defs>
        <radialGradient id="d-skin" cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#fde6d6" />
          <stop offset="1" stopColor="#f1bfa3" />
        </radialGradient>
        {/* ombré: darker roots, golden blonde lengths */}
        <linearGradient id="d-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d5e40" />
          <stop offset="0.22" stopColor="#b98f58" />
          <stop offset="0.45" stopColor="#e8c47c" />
          <stop offset="1" stopColor="#f7dfa6" />
        </linearGradient>
        <linearGradient id="d-gown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0d6ff" />
          <stop offset="1" stopColor="#b98ad9" />
        </linearGradient>
        <linearGradient id="d-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset="1" stopColor="#e3ac36" />
        </linearGradient>
      </defs>

      <g className="g-bob g-bob-late">
        {/* hair (back) */}
        <path d="M46 92 Q38 38 100 34 Q162 38 154 92 L166 236 Q144 252 122 240 L100 158 L78 240 Q56 252 34 236 Z" fill="url(#d-hair)" />
        {/* gown */}
        <path d="M70 166 Q100 156 130 166 L134 206 Q170 258 166 290 Q100 302 34 290 Q30 258 66 206 Z" fill="url(#d-gown)" />
        <path d="M66 206 Q100 216 134 206" stroke="url(#d-gold)" strokeWidth="5" fill="none" />
        <path d="M50 262 Q100 276 150 262" stroke="#fff" strokeWidth="2" opacity="0.5" fill="none" />
        <path d="M58 240 Q100 252 142 240" stroke="#fff" strokeWidth="2" opacity="0.35" fill="none" />
        {/* puff sleeves */}
        <circle cx="66" cy="173" r="14" fill="#e9c6fb" />
        <circle cx="134" cy="173" r="14" fill="#e9c6fb" />
        {/* arms meeting at the front */}
        <path d="M64 182 Q70 205 92 212" stroke="#f1bfa3" strokeWidth="11" strokeLinecap="round" fill="none" />
        <path d="M136 182 Q130 205 108 212" stroke="#f1bfa3" strokeWidth="11" strokeLinecap="round" fill="none" />
        <circle cx="100" cy="212" r="8" fill="#f6cdb5" />
        {/* neck */}
        <rect x="91" y="136" width="18" height="28" fill="#f1bfa3" />
        <path d="M70 166 Q100 186 130 166" fill="#f0d6ff" />
        {/* clover necklace */}
        <path d="M88 150 Q100 162 112 150" stroke="#e8e8f0" strokeWidth="1" fill="none" />
        <g transform="translate(100 160)">
          {[0, 90, 180, 270].map((r) => (
            <circle key={r} cx="0" cy="-2.6" r="2.3" fill="#f5f5fa" stroke="#c9c9d6" strokeWidth="0.6" transform={`rotate(${r})`} />
          ))}
        </g>

        {/* face */}
        <ellipse cx="100" cy="98" rx="45" ry="50" fill="url(#d-skin)" />
        {/* freckles */}
        {[
          [78, 112], [84, 116], [73, 117], [88, 110], [122, 112], [116, 116], [127, 117], [112, 110], [96, 106], [104, 106],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.2" fill="#c98466" opacity="0.6" />
        ))}
        {/* brows */}
        <path d="M70 82 Q80 77 90 81" stroke="#8a6a45" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M110 81 Q120 77 130 82" stroke="#8a6a45" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        {/* eyes: blue-green */}
        <g className="g-blink">
          <ellipse cx="81" cy="97" rx="8.5" ry="9.5" fill="#fff" />
          <circle cx="82" cy="98" r="6" fill="#4f9488" />
          <circle cx="82" cy="98" r="2.8" fill="#14302b" />
          <circle cx="84.5" cy="95" r="2" fill="#fff" />
          <ellipse cx="119" cy="97" rx="8.5" ry="9.5" fill="#fff" />
          <circle cx="120" cy="98" r="6" fill="#4f9488" />
          <circle cx="120" cy="98" r="2.8" fill="#14302b" />
          <circle cx="122.5" cy="95" r="2" fill="#fff" />
        </g>
        <path d="M71 90 Q81 84 91 90" stroke="#3b2a20" strokeWidth="2" fill="none" />
        <path d="M109 90 Q119 84 129 90" stroke="#3b2a20" strokeWidth="2" fill="none" />
        <path d="M71 90 L67 87 M73 88 L70 84" stroke="#3b2a20" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M129 90 L133 87 M127 88 L130 84" stroke="#3b2a20" strokeWidth="1.5" strokeLinecap="round" />
        {/* nose */}
        <path d="M100 103 Q97 112 101 114" stroke="#d39a7c" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* smile */}
        <path d="M84 123 Q100 140 116 123 Q100 129 84 123 Z" fill="#b8475a" />
        <path d="M87 124.3 Q100 129.5 113 124.3 L111.5 128 Q100 132 88.5 128 Z" fill="#fff" />
        <ellipse cx="70" cy="116" rx="8" ry="5" fill="#ff8aa8" opacity="0.3" />
        <ellipse cx="130" cy="116" rx="8" ry="5" fill="#ff8aa8" opacity="0.3" />
        {/* drop earrings */}
        <circle cx="56" cy="112" r="2.4" fill="#e8e8f0" />
        <path d="M56 115 Q52 122 56 126 Q60 122 56 115 Z" fill="#cde9f5" stroke="#9fc4d6" strokeWidth="0.6" />
        <circle cx="144" cy="112" r="2.4" fill="#e8e8f0" />
        <path d="M144 115 Q140 122 144 126 Q148 122 144 115 Z" fill="#cde9f5" stroke="#9fc4d6" strokeWidth="0.6" />

        {/* hair (front): middle part framing the face */}
        <path d="M100 46 Q66 48 57 82 Q50 112 58 152 Q44 122 46 90 Q50 44 100 40 Z" fill="url(#d-hair)" />
        <path d="M100 46 Q134 48 143 82 Q150 112 142 152 Q156 122 154 90 Q150 44 100 40 Z" fill="url(#d-hair)" />
        <path d="M56 80 Q60 44 100 42 Q140 44 144 80 Q128 56 100 52 Q72 56 56 80 Z" fill="url(#d-hair)" />
        <path d="M100 42 L100 54" stroke="#6e5036" strokeWidth="1.5" />
        {/* tiara */}
        <path d="M74 50 Q100 38 126 50 L122 40 L112 44 L100 28 L88 44 L78 40 Z" fill="url(#d-gold)" stroke="#c8901e" strokeWidth="1.2" />
        <circle cx="100" cy="38" r="3.6" fill="#ff7eb6" />
        <circle cx="86" cy="45" r="2" fill="#bfe6ff" />
        <circle cx="114" cy="45" r="2" fill="#bfe6ff" />
      </g>
    </svg>
  )
}

/** The two guides side by side with a speech bubble. */
export function Guides({ text, size = 110, speaker = 'both' }: { text?: string; size?: number; speaker?: 'prince' | 'princess' | 'both' }) {
  return (
    <div className={`guides speaker-${speaker}`}>
      <AnimatePresence mode="wait">
        {text && (
          <motion.div
            key={text}
            className="bubble"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="guides-row">
        <Prince size={size} wave />
        <Princess size={size} />
      </div>
    </div>
  )
}
