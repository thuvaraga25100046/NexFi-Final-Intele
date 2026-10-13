import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowUpRight, CircleUserRound, Menu, X, Home, ArrowDownLeft, FileText, Settings } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Brand from './Brand.jsx'
import useTranslation from '../i18n/useTranslation.js'
import useProfilePhoto from '../hooks/useProfilePhoto.js'

const applicationLinks = [
    { key: 'navigation.home', to: '/dashboard', icon: Home, label: 'Home' },
    { key: 'navigation.transactions', to: '/transactions', icon: ArrowDownLeft, label: 'Income' },
    { key: 'navigation.payables', to: '/payables', icon: ArrowUpRight, label: 'Outflow' },
    { key: 'navigation.receivables', to: '/receivables', icon: FileText, label: 'Cheque' },
    { key: 'navigation.settings', to: '/settings', icon: Settings, label: 'Settings' },
]

export default function SiteHeader({ variant = 'application' }) {
    const { t, language, setLanguage } = useTranslation()
    const { photo: profilePhoto, remove: removeProfilePhoto } = useProfilePhoto()
    const [menuOpen, setMenuOpen] = useState(false)
    const marketing = variant === 'marketing'
    const closeMenu = () => setMenuOpen(false)

    // Sliding highlight that glides from the old tab to the newly clicked one
    const { pathname } = useLocation()
    const navRef = useRef(null)
    const [pill, setPill] = useState({ x: 0, y: 0, w: 0, h: 0 })
    const [pillAnimated, setPillAnimated] = useState(false)

    const movePill = useCallback(() => {
        const active = navRef.current?.querySelector('a[aria-current="page"]')
        if (!active || active.offsetWidth === 0) {
            setPill((prev) => (prev.w === 0 ? prev : { ...prev, w: 0 }))
            return
        }
        setPill({ x: active.offsetLeft, y: active.offsetTop, w: active.offsetWidth, h: active.offsetHeight })
    }, [])

    useLayoutEffect(() => {
        if (!marketing) movePill()
    }, [marketing, movePill, pathname, menuOpen, language])

    useEffect(() => {
        if (marketing) return undefined
        window.addEventListener('resize', movePill)
        document.fonts?.ready.then(movePill)
        return () => window.removeEventListener('resize', movePill)
    }, [marketing, movePill])

    // Turn the animation on only after the first position is set, so the pill doesn't fly in from the corner on page load
    useEffect(() => {
        if (pillAnimated || pill.w === 0) return undefined
        const id = requestAnimationFrame(() => requestAnimationFrame(() => setPillAnimated(true)))
        return () => cancelAnimationFrame(id)
    }, [pill.w, pillAnimated])

    return (
        <header className="site-header border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
            <div className="nav-inner mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 sm:px-8 py-3.5">
                <Brand />
                <nav ref={navRef} className={`main-nav relative flex items-center gap-1.5 ${menuOpen ? ' main-nav-open' : ''}`} aria-label={t('navigation.main')}>
                    {marketing ? (
                        <>
                            <a href="#home" onClick={closeMenu}>Home</a>
                            <a href="#features" onClick={closeMenu}>Features</a>
                            <a href="#pricing" onClick={closeMenu}>Pricing</a>
                            <a href="#about" onClick={closeMenu}>About</a>
                            <a href="#contact" onClick={closeMenu}>Contact</a>
                        </>
                    ) : (
                        <>
              <span
                  aria-hidden="true"
                  className="nav-pill pointer-events-none absolute left-0 top-0 rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/30"
                  style={{
                      width: pill.w,
                      height: pill.h,
                      opacity: pill.w ? 1 : 0,
                      transform: `translate(${pill.x}px, ${pill.y}px)`,
                      transition: pillAnimated
                          ? 'transform 520ms cubic-bezier(0.34, 1.4, 0.64, 1), width 520ms cubic-bezier(0.34, 1.4, 0.64, 1), height 300ms ease, opacity 200ms ease'
                          : 'none',
                  }}
              />
                            {applicationLinks.map(({ key, to, icon: Icon, label }) => (
                                <NavLink
                                    className={({ isActive }) =>
                                        `group relative z-10 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-[color,background-color,transform] duration-300 active:scale-95 ${
                                            isActive
                                                ? 'text-white'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`
                                    }
                                    end={to === '/dashboard'}
                                    key={to}
                                    onClick={closeMenu}
                                    to={to}
                                >
                                    {({ isActive }) => (
                                        <>
                                            {Icon && (
                                                <Icon
                                                    size={16}
                                                    className={`transition-transform duration-300 ${
                                                        isActive ? 'scale-110' : 'group-hover:-translate-y-0.5'
                                                    }`}
                                                />
                                            )}
                                            <span>{label || t(key)}</span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </>
                    )}
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
                                {profilePhoto ? (
                                    <img src={profilePhoto} alt="" onError={removeProfilePhoto} className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                                ) : (
                                    <CircleUserRound size={22} />
                                )}
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