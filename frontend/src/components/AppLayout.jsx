import { AlertCircle, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Brand from './Brand.jsx'
import MobileTabBar from './MobileTabBar.jsx'
import SiteHeader from './SiteHeader.jsx'
import useBackendHealth from '../hooks/useBackendHealth.js'
import useTranslation from '../i18n/useTranslation.js'

export default function AppLayout({ children }) {
  const { t } = useTranslation()
  const { status, lastCheckedAt } = useBackendHealth()
  const backendMessage = status === 'healthy'
    ? t('messages.backendConnected')
    : status === 'checking'
      ? t('messages.checkingBackend')
      : t('messages.backendUnavailable')

  return (
    <div className="workspace-shell">
      <SiteHeader />
      {status === 'unavailable' && (
        <div className="backend-status-banner" role="alert">
          <AlertCircle size={17} />
          <span>{backendMessage}</span>
          {lastCheckedAt && <small>{lastCheckedAt.toLocaleTimeString()}</small>}
        </div>
      )}
      <main className="workspace-main">{children}</main>
      <footer className="workspace-footer">
        <div className="workspace-footer-inner">
          <Brand />
          <span>{t('footer.tagline')}</span>
          <Link to="/" aria-label={t('navigation.backHome')}>nexfi.com <ArrowUpRight size={13} /></Link>
        </div>
      </footer>
      <MobileTabBar />
    </div>
  )
}