import { useState } from 'react'
import { ArrowUpRight, CircleUserRound, Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import Brand from './Brand.jsx'
import useTranslation from '../i18n/useTranslation.js'

const applicationLinks = [
  { key: 'navigation.home', to: '/dashboard' },
  { key: 'navigation.transactions', to: '/transactions' },
  { key: 'navigation.receivables', to: '/receivables' },
  { key: 'navigation.payables', to: '/payables' },
  { key: 'navigation.aiAssistant', to: '/ai-assistant' },
  { key: 'navigation.settings', to: '/settings' },
]

export default function SiteHeader({ variant = 'application' }) {
  const { t, language, setLanguage } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const marketing = variant === 'marketing'
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="nav-inner mx-auto flex w-full max-w-[1280px] items-center justify-between">
        <Brand />
        <nav className={`main-nav${menuOpen ? ' main-nav-open' : ''}`} aria-label={t('navigation.main')}>
          {marketing ? (
            <>
              <a href="#home" onClick={closeMenu}>Home</a>
              <a href="#features" onClick={closeMenu}>Features</a>
              <a href="#pricing" onClick={closeMenu}>Pricing</a>
              <a href="#about" onClick={closeMenu}>About</a>
              <a href="#contact" onClick={closeMenu}>Contact</a>
            </>
          ) : applicationLinks.map(({ key, to }) => (
            <NavLink
              className={({ isActive }) => isActive ? 'app-nav-active' : undefined}
              end={to === '/dashboard'}
              key={to}
              onClick={closeMenu}
              to={to}
            >
              {t(key)}
            </NavLink>
          ))}
          {marketing && <Link className="mobile-nav-cta" to="/signin" onClick={closeMenu}>Get started <ArrowUpRight size={15} /></Link>}
        </nav>
        <div className="nav-actions">
          {marketing ? (
            <>
              <Link className="marketing-login" to="/signin">Log in</Link>
              <Link className="button button-dark nav-cta" to="/signup">Sign up <ArrowUpRight size={16} /></Link>
            </>
          ) : (
            <>
              <div className="language-switcher" role="group" aria-label={t('language.label')}>
                <button aria-pressed={language === 'en'} onClick={() => setLanguage('en')} type="button">EN</button>
                <button aria-pressed={language === 'si'} onClick={() => setLanguage('si')} type="button">සිං</button>
                <button aria-pressed={language === 'ta'} onClick={() => setLanguage('ta')} type="button">தமிழ்</button>
              </div>
              <Link className="button button-dark nav-cta" to="/dashboard">{t('navigation.overview')} <ArrowUpRight size={16} /></Link>
              <Link className="app-profile" aria-label={t('navigation.account')} to="/settings"><CircleUserRound size={19} /><span>NP</span></Link>
            </>
          )}
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t('navigation.closeMenu') : t('navigation.openMenu')}
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            type="button"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  )
}