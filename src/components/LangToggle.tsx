import { useLang } from '../i18n'

export function LangToggle() {
  const { lang, setLang } = useLang()
  return (
    <button
      className="lang-toggle"
      onClick={() => setLang(lang === 'he' ? 'en' : 'he')}
      aria-label={lang === 'he' ? 'Switch to English' : 'החלפה לעברית'}
    >
      {lang === 'he' ? 'EN' : 'עב'}
    </button>
  )
}
