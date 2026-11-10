// Default emoji per coupon id; a non-empty "icon" column in the CSV overrides it.
export const DEFAULT_ICONS: Record<string, string> = {
  R01: '🥐', R02: '🍽️', R03: '☕', R04: '📺', R05: '🦶', R06: '😴',
  R07: '💆‍♀️', R08: '🧺', R09: '👨‍🍳', R10: '📵', R11: '💌',
  R12: '🛁', R13: '🥡', R14: '🍫', R15: '🤫', R16: '🛍️',
  R17: '🌸', R18: '🌹', R19: '💃', R20: '🛌', R21: '🚗',
  R22: '🏖️', R23: '🧖‍♀️', R24: '🌅', R25: '🌙', R26: '🎁',
  R27: '👑', R28: '🧳', R29: '🍷', R30: '✅', R31: '📸',
  R32: '🕯️', R33: '🦋', R34: '🩰', R35: '👧', R36: '✨',
  S01: '🔥', S02: '🚿', S03: '🕺', S04: '👠', S05: '💋',
  S06: '🙈', S07: '🎀', S08: '⚡', S09: '👔', S10: '🧊',
  S11: '🍓', S12: '🎭', S13: '🏨', S14: '🪩', S15: '📱',
  S16: '🚘', S17: '⏰', S18: '🙌', S19: '🧸', S20: '💡',
  S21: '😈', S22: '🌶️', S23: '👕', S24: '🪞', S25: '🐢',
  S26: '😏', S27: '🫧', S28: '🪶', S29: '🛏️', S30: '🏃',
  S31: '🎲', S32: '🫒', S33: '🎶', S34: '🚪', S35: '👂',
  S36: '🃏',
}

export const RARITY_FALLBACK_ICON: Record<string, string> = {
  common: '💝',
  rare: '💖',
  epic: '💜',
  legendary: '👑',
  spicy: '🌶️',
}
