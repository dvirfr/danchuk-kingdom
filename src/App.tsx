import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import { LangProvider, useLang } from './i18n'
import { KingdomDataProvider } from './data/KingdomData'
import { Sky } from './components/Sky'
import { LangToggle } from './components/LangToggle'
import { Gate } from './pages/Gate'
import { Home } from './pages/Home'
import { Coupons } from './pages/Coupons'
import { Admin } from './pages/Admin'

function Shell() {
  const { loading, isFamily, isAdmin } = useAuth()
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
        <KingdomDataProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/coupons" element={<Coupons />} />
            {isAdmin && <Route path="/admin" element={<Admin />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </KingdomDataProvider>
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
