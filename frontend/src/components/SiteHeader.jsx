import { useState } from 'react'
import { ArrowUpRight, CircleUserRound, Menu, X, Home, ArrowDownLeft, FileText, Settings } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import Brand from './Brand.jsx'
import useTranslation from '../i18n/useTranslation.js'

const applicationLinks = [
  { key: 'navigation.home', to: '/dashboard', icon: Home, label: 'Home' },
  { key: 'navigation.transactions', to: '/transactions', icon: ArrowDownLeft, label: 'Income' },
  { key: 'navigation.payables', to: '/payables', icon: ArrowUpRight, label: 'Outflow' },
  { key: 'navigation.receivables', to: '/receivables', icon: FileText, label: 'Cheque' },
  { key: 'navigation.settings', to: '/settings', icon: Settings, label: 'Settings' },
]

export default function SiteHeader({ variant = 'application' }) {
  const { t, language, setLanguage } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const marketing = variant === 'marketing'
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="nav-inner mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 sm:px-8 py-3.5">
        <Brand />
        <nav className={`main-nav flex items-center gap-1.5 ${menuOpen ? ' main-nav-open' : ''}`} aria-label={t('navigation.main')}>
          {marketing ? (
            <>
              <a href="#home" onClick={closeMenu}>Home</a>
              <a href="#features" onClick={closeMenu}>Features</a>
              <a href="#pricing" onClick={closeMenu}>Pricing</a>
              <a href="#about" onClick={closeMenu}>About</a>
              <a href="#contact" onClick={closeMenu}>Contact</a>
            </>
          ) : applicationLinks.map(({ key, to, icon: Icon, label }) => (
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
              end={to === '/dashboard'}
              key={to}
              onClick={closeMenu}
              to={to}
            >
              {Icon && <Icon size={16} />}
              <span>{label || t(key)}</span>
            </NavLink>
          ))}
          {marketing && <Link className="mobile-nav-cta" to="/signin" onClick={closeMenu}>Get started <ArrowUpRight size={15} /></Link>}
        </nav>
        <div className="nav-actions flex items-center gap-3">
          {marketing ? (
            <>
              <Link className="marketing-login" to="/signin">Log in</Link>
              <Link className="button button-dark nav-cta" to="/signup">Sign up <ArrowUpRight size={16} /></Link>
            </>
          ) : (
            <>
              <div className="language-switcher hidden sm:flex items-center gap-1" role="group" aria-label={t('language.label')}>
                <button aria-pressed={language === 'en'} onClick={() => setLanguage('en')} type="button" className="px-2 py-1 text-xs font-bold rounded hover:bg-slate-100 dark:hover:bg-slate-800">EN</button>
                <button aria-pressed={language === 'si'} onClick={() => setLanguage('si')} type="button" className="px-2 py-1 text-xs font-bold rounded hover:bg-slate-100 dark:hover:bg-slate-800">සිං</button>
                <button aria-pressed={language === 'ta'} onClick={() => setLanguage('ta')} type="button" className="px-2 py-1 text-xs font-bold rounded hover:bg-slate-100 dark:hover:bg-slate-800">தமிழ்</button>
              </div>
              <Link className="app-profile flex items-center gap-2" aria-label={t('navigation.account')} to="/settings">
                <CircleUserRound size={22} />
              </Link>
            </>
          )}
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t('navigation.closeMenu') : t('navigation.openMenu')}
            className="menu-toggle md:hidden p-2 rounded-lg text-slate-700 dark:text-slate-300"
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