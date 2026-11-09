import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import { LangProvider, useLang } from './i18n'
import { Sky } from './components/Sky'
import { LangToggle } from './components/LangToggle'
import { Gate } from './pages/Gate'
import { Home } from './pages/Home'

function Shell() {
  const { loading, isFamily } = useAuth()
  const { t } = useLang()

  return (
    <>
      <Sky />
      <LangToggle />
      {loading ? (
        <div className="loading">✨ {t('loading')}</div>
      ) : !isFamily ? (
        <Gate />
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  )
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <HashRouter>
          <Shell />
        </HashRouter>
      </AuthProvider>
    </LangProvider>
  )
}
