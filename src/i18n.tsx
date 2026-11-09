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
