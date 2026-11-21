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

  guideAdmin: { en: "Psst, my prince… she doesn't know yet 🤫", he: 'פססט, הנסיך שלי... היא עוד לא יודעת 🤫' },
  guideSoon: { en: 'Something magical is being prepared for you, Danchuk… ✨', he: 'משהו קסום מתבשל בשבילך, דנצ׳וק... ✨' },
  guideOpen: { en: 'Welcome to your kingdom, my princess! Where shall we go today?', he: 'ברוכה הבאה לממלכה שלך, הנסיכה שלי! לאן נלך היום?' },

  // map + chapters
  mapTitle: { en: 'The Kingdom Map', he: 'מפת הממלכה' },
  mapGuide: { en: 'Choose your next adventure, Danchuk!', he: 'בחרי את ההרפתקה הבאה, דנצ׳וק!' },
  giftChest: { en: 'Birthday treasure', he: 'אוצר יום ההולדת' },
  chapterN: { en: 'Chapter {n}', he: 'פרק {n}' },
  opensOn: { en: 'Opens {date}', he: 'נפתח ב-{date}' },
  finishPrev: { en: 'Finish chapter {n} first', he: 'קודם מסיימים את פרק {n}' },
  done: { en: 'Completed', he: 'הושלם' },
  play: { en: 'Play', he: 'לשחק' },
  startQuest: { en: 'Start the quest ✨', he: 'מתחילים במסע ✨' },
  playAgain: { en: 'Play again', he: 'לשחק שוב' },
  questReady: { en: 'Ready for this adventure?', he: 'מוכנה להרפתקה הזאת?' },
  questWon: { en: 'You did it! The kingdom is proud of you! 🎉', he: 'הצלחת! כל הממלכה גאה בך! 🎉' },
  loveNote: { en: 'A love note for you', he: 'מכתב אהבה בשבילך' },
  youUnlocked: { en: 'You unlocked {n} new coupons!', he: 'פתחת {n} קופונים חדשים!' },
  toCoupons: { en: 'To the coupon book 🎟️', he: 'לספר הקופונים 🎟️' },
  backToMap: { en: 'Back to the map', he: 'חזרה למפה' },
  underConstruction: {
    en: 'The royal workshop is still building this adventure 🛠️',
    he: 'בית המלאכה המלכותי עוד בונה את ההרפתקה הזאת 🛠️',
  },
  skipTest: { en: 'Skip (test only)', he: 'דילוג (לבדיקה בלבד)' },

  // games
  memoryHint: { en: 'Find all the matching pairs!', he: 'מצאי את כל הזוגות!' },
  moves: { en: 'Moves: {n}', he: 'מהלכים: {n}' },
  quizHint: { en: 'Do you remember?', he: 'את זוכרת?' },
  quizDefaultQ: { en: 'Which chapter of our story is this from?', he: 'מאיזה פרק בסיפור שלנו התמונה הזאת?' },
  quizWrong: { en: 'Nope! Try again 😜', he: 'לא! נסי שוב 😜' },
  quizRight: { en: 'Exactly right! 💖', he: 'בדיוק! 💖' },
  questionOf: { en: 'Question {i} of {n}', he: 'שאלה {i} מתוך {n}' },
  scratchHint: { en: 'Scratch the gold to reveal a memory', he: 'גרדי את הזהב כדי לגלות זיכרון' },
  scratchMe: { en: 'Scratch me ✨', he: 'גרדי אותי ✨' },
  cardOf: { en: 'Card {i} of {n}', he: 'כרטיס {i} מתוך {n}' },
  next: { en: 'Next', he: 'הבא' },
  finish: { en: 'Finish', he: 'סיום' },

  // after dark
  adTitle: { en: 'After Dark', he: 'אחרי החשכה' },
  adEnterPin: { en: 'Whisper the secret code…', he: 'לחשי את הקוד הסודי…' },
  adWrongPin: { en: 'Wrong code, my love 😏', he: 'קוד שגוי, אהובה שלי 😏' },
  adLock: { en: 'Lock', he: 'נעילה' },
  adTonight: { en: "Tonight's secret card", he: 'הקלף הסודי של הלילה' },
  adNightN: { en: 'Night {n} of 30', he: 'לילה {n} מתוך 30' },
  adScratch: { en: 'Scratch to reveal 🔥', he: 'גרדי כדי לגלות 🔥' },
  adRevealedNew: { en: 'Added to your After Dark coupons 😈', he: 'נוסף לקופונים הלילתיים שלך 😈' },
  adNextCard: { en: 'Next card: {when}', he: 'הקלף הבא: {when}' },
  adFirstCard: { en: 'Your first secret card appears on your birthday at 20:00 🌙', he: 'הקלף הסודי הראשון מופיע ביום ההולדת שלך ב-20:00 🌙' },
  adAllRevealed: { en: 'All 30 nights revealed. You naughty queen 👑', he: 'כל 30 הלילות נחשפו. מלכה שובבה 👑' },
  adWildTitle: { en: 'The Wildcard 🃏', he: 'הקלף הפתוח 🃏' },
  adWildBody: {
    en: 'Write any wish you want. It becomes an official coupon, pre-approved by your husband.',
    he: 'כתבי כל משאלה שבא לך. היא הופכת לקופון רשמי, שהבעל כבר אישר מראש.',
  },
  adWildPlaceholder: { en: 'My wish is…', he: 'המשאלה שלי היא…' },
  adWildSave: { en: 'Seal my wish 💋', he: 'לחתום על המשאלה 💋' },
  adDice: { en: 'Dice of Desire', he: 'קוביות התשוקה' },
  adRoll: { en: 'Roll 🎲', he: 'לגלגל 🎲' },
  adDiceHint: { en: 'One die picks what, the other picks where. No re-rolls!', he: 'קובייה אחת בוחרת מה, השנייה איפה. בלי גלגול חוזר!' },
  adMyCoupons: { en: 'My After Dark coupons', he: 'הקופונים הלילתיים שלי' },
  adNotYet: { en: 'The night kingdom opens on your birthday… 🌙', he: 'ממלכת הלילה נפתחת ביום ההולדת שלך… 🌙' },
  tonightAt: { en: 'tonight at 20:00', he: 'הלילה ב-20:00' },
  tomorrowAt: { en: 'tomorrow at 20:00', he: 'מחר ב-20:00' },

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
