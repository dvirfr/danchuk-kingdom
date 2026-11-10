import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'he' | 'en'

const strings = {
  appName: { en: "Danchuk's Enchanted Kingdom", he: 'הממלכה הקסומה של דנצ׳וק' },
  gateSubtitle: {
    en: 'Only the princess (and her prince) may enter.',
    he: 'רק הנסיכה (והנסיך שלה) רשאים להיכנס.',
  },
  signIn: { en: 'Enter with Google', he: 'כניסה עם Google' },
  signingIn: { en: 'Opening the gates…', he: 'פותחים את השערים…' },
  signInError: { en: 'The gate got stuck. Try again?', he: 'השער נתקע. ננסה שוב?' },
  popupBlocked: {
    en: 'The browser blocked the Google window. Allow pop-ups for this site and tap again.',
    he: 'הדפדפן חסם את חלון Google. אפשרו חלונות קופצים לאתר הזה ולחצו שוב.',
  },
  notInvitedTitle: { en: 'This kingdom is private', he: 'הממלכה הזאת פרטית' },
  notInvitedBody: {
    en: 'You are signed in as {email}, which is not on the royal guest list. The dragons have been notified.',
    he: 'נכנסת בתור {email}, שלא מופיע ברשימת האורחים המלכותית. הדרקונים קיבלו הודעה.',
  },
  tryAnother: { en: 'Try another account', he: 'לנסות חשבון אחר' },
  signOut: { en: 'Leave the kingdom', he: 'יציאה מהממלכה' },
  greeting: { en: 'Happy birthday, Danchuk!', he: 'יום הולדת שמח, דנצ׳וק!' },
  greetingAdmin: { en: 'Welcome back, my prince', he: 'ברוך שובך, הנסיך שלי' },
  countdown: { en: 'The kingdom opens in', he: 'הממלכה נפתחת בעוד' },
  days: { en: 'days', he: 'ימים' },
  hours: { en: 'hours', he: 'שעות' },
  minutes: { en: 'min', he: 'דק׳' },
  opened: { en: 'The kingdom is open!', he: 'הממלכה פתוחה!' },
  comingSoon: { en: 'The map is being drawn by royal cartographers…', he: 'הקרטוגרפים המלכותיים משרטטים את המפה…' },
  loading: { en: 'Summoning magic…', he: 'מזמנים קסמים…' },

  // navigation
  couponBook: { en: 'Coupon Book', he: 'ספר הקופונים' },
  admin: { en: 'Royal Admin', he: 'ניהול מלכותי' },
  back: { en: 'Back', he: 'חזרה' },

  // coupon book
  tabWallet: { en: 'Coupons', he: 'הקופונים' },
  tabTodo: { en: 'His to-do', he: 'משימות הבעל' },
  tabUsed: { en: 'Used', he: 'מומשו' },
  emptyWallet: { en: 'No coupons yet. Adventures unlock more!', he: 'עוד אין קופונים. הרפתקאות יפתחו עוד!' },
  emptyTodo: { en: 'Nothing pending. The husband is suspiciously free.', he: 'אין משימות פתוחות. הבעל פנוי באופן חשוד.' },
  emptyUsed: { en: 'Nothing used yet. Go on, treat yourself!', he: 'עוד לא מומש כלום. קדימה, תפנקי את עצמך!' },
  lockedCount: { en: '{n} more coupons hidden in the kingdom…', he: 'עוד {n} קופונים מחכים בממלכה…' },
  lockedChapter: { en: 'Chapter {n}', he: 'פרק {n}' },
  usesLeft: { en: '{n} of {total} left', he: 'נותרו {n} מתוך {total}' },
  tapToFlip: { en: 'Tap to flip', he: 'לחצי להפוך' },
  finePrint: { en: 'Fine print', he: 'האותיות הקטנות' },
  redeem: { en: 'Use this coupon', he: 'לממש את הקופון' },
  redeemConfirmTitle: { en: 'Use "{title}" now?', he: 'לממש עכשיו את "{title}"?' },
  redeemConfirmBody: {
    en: 'The husband will be notified (by you, showing him this screen).',
    he: 'הבעל יקבל הודעה (ממך, כשתראי לו את המסך הזה).',
  },
  yesRedeem: { en: 'Yes, redeem! ✨', he: 'כן, לממש! ✨' },
  notNow: { en: 'Not yet', he: 'עוד לא' },
  redeemed: { en: 'REDEEMED', he: 'מומש' },
  showHim: { en: 'Show this to your husband 👀', he: 'תראי את זה לבעל 👀' },
  dueIn: { en: 'Due in {time}', he: 'להשלים תוך {time}' },
  overdue: { en: 'Overdue by {time}! Penalty: extra kisses 💋', he: 'באיחור של {time}! קנס: נשיקות נוספות 💋' },
  byAgreement: { en: 'Timing: by royal agreement', he: 'מועד: בהסכמה מלכותית' },
  markDelivered: { en: 'Delivered ✓', he: 'בוצע ✓' },
  rateTitle: { en: 'Rate the service', he: 'דרגי את השירות' },
  rateSubmit: { en: 'Submit review', he: 'שליחת ביקורת' },
  ratedOn: { en: 'Used on {date}', he: 'מומש ב-{date}' },
  rateNow: { en: 'Rate it ⭐', he: 'לדרג ⭐' },
  d: { en: 'd', he: ' ימים' },
  h: { en: 'h', he: ' שעות' },
  m: { en: 'm', he: ' דק׳' },

  rarity_common: { en: 'Common', he: 'רגיל' },
  rarity_rare: { en: 'Rare', he: 'נדיר' },
  rarity_epic: { en: 'Epic', he: 'אפי' },
  rarity_legendary: { en: 'Legendary', he: 'אגדי' },
  rarity_spicy: { en: 'Spicy', he: 'פיקנטי' },

  review1: { en: 'Would redeem again', he: 'הייתי מממשת שוב' },
  review2: { en: 'Exceeded expectations', he: 'מעל ומעבר' },
  review3: { en: 'Talked through the whole thing', he: 'דיבר כל הזמן' },
  review4: { en: 'Fell asleep on the job', he: 'נרדם בתפקיד' },
  review5: { en: 'Took his sweet time', he: 'לקח את הזמן שלו' },
  review6: { en: '5 stars, would marry again', he: '5 כוכבים, הייתי מתחתנת איתו שוב' },
} as const

export type StringKey = keyof typeof strings

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: StringKey, vars?: Record<string, string | number>) => string
}

const LangContext = createContext<Ctx | null>(null)

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('lang')
    if (saved === 'he' || saved === 'en') return saved
  } catch {
    /* storage unavailable */
  }
  return navigator.language?.startsWith('he') ? 'he' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
    document.title = strings.appName[lang]
  }, [lang])

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang: (l) => {
        setLangState(l)
        try {
          localStorage.setItem('lang', l)
        } catch {
          /* ignore */
        }
      },
      t: (key, vars) => {
        let s: string = strings[key][lang]
        if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v))
        return s
      },
    }),
    [lang],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang outside LangProvider')
  return ctx
}
