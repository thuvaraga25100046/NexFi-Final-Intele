import { AlertCircle, ArrowUpRight, Database } from 'lucide-react'
import { Link } from 'react-router-dom'
import Brand from './Brand.jsx'
import MobileTabBar from './MobileTabBar.jsx'
import SiteHeader from './SiteHeader.jsx'
import useTranslation from '../i18n/useTranslation.js'

export default function AppLayout({ children }) {
  const { t } = useTranslation()

  return (
    <div className="workspace-shell">
      <SiteHeader />

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