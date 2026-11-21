import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import { LangProvider, useLang } from './i18n'
import { KingdomDataProvider } from './data/KingdomData'
import { Sky } from './components/Sky'
import { LangToggle } from './components/LangToggle'
import { Gate } from './pages/Gate'
import { Home } from './pages/Home'
import { Coupons } from './pages/Coupons'
import { Admin } from './pages/Admin'
import { MapPage } from './pages/MapPage'
import { ChapterPage } from './pages/ChapterPage'
import { AfterDark } from './pages/AfterDark'

// Remount per chapter so game/stage state never leaks between chapters.
function ChapterRoute() {
  const { n } = useParams()
  return <ChapterPage key={n} />
}

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
            <Route path="/map" element={<MapPage />} />
            <Route path="/chapter/:n" element={<ChapterRoute />} />
            <Route path="/after-dark" element={<AfterDark />} />
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
