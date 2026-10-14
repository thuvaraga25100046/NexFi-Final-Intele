import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'

import {
    ArrowUpRight,
    Calculator,
    Menu,
    X,
    Home,
    ArrowDownLeft,
    Bot,
    FileText,
    Settings,
} from 'lucide-react'

import { Link, NavLink, useLocation } from 'react-router-dom'

import Brand from './Brand.jsx'
import ProfileMenu from './ProfileMenu.jsx'
import useTranslation from '../i18n/useTranslation.js'

const applicationLinks = [
    {
        key: 'navigation.home',
        to: '/dashboard',
        icon: Home,
        label: 'Home',
    },
    {
        key: 'navigation.transactions',
        to: '/transactions',
        icon: ArrowDownLeft,
        label: 'Income',
    },
    {
        key: 'navigation.payables',
        to: '/payables',
        icon: ArrowUpRight,
        label: 'Outflow',
    },
    {
        key: 'navigation.receivables',
        to: '/receivables',
        icon: FileText,
        label: 'Cheque',
    },
    {
        key: 'navigation.aiAssistant',
        to: '/ai-assistant',
        icon: Bot,
        label: 'AI Assistant',
    },
    {
        key: 'navigation.whatIf',
        to: '/what-if',
        icon: Calculator,
        label: 'What-If',
    },
    {
        key: 'navigation.settings',
        to: '/settings',
        icon: Settings,
        label: 'Settings',
    },
]

export default function SiteHeader({ variant = 'application' }) {
    const { t, language, setLanguage } = useTranslation()

    const [menuOpen, setMenuOpen] = useState(false)
    const [pill, setPill] = useState({
        x: 0,
        y: 0,
        w: 0,
        h: 0,
    })
    const [pillAnimated, setPillAnimated] = useState(false)

    const marketing = variant === 'marketing'
    const { pathname } = useLocation()
    const navRef = useRef(null)

    const closeMenu = useCallback(() => {
        setMenuOpen(false)
    }, [])

    // Move the active navigation highlight
    const movePill = useCallback(() => {
        if (marketing || !navRef.current) {
            setPill((previous) =>
                previous.w === 0
                    ? previous
                    : { ...previous, w: 0 }
            )
            return
        }

        const activeLink = navRef.current.querySelector(
            'a[aria-current="page"]'
        )

        if (!activeLink || activeLink.offsetWidth === 0) {
            setPill((previous) =>
                previous.w === 0
                    ? previous
                    : { ...previous, w: 0 }
            )
            return
        }

        setPill({
            x: activeLink.offsetLeft,
            y: activeLink.offsetTop,
            w: activeLink.offsetWidth,
            h: activeLink.offsetHeight,
        })
    }, [marketing])

    // Update the highlight after navigation or language changes
    useLayoutEffect(() => {
        if (!marketing) {
            movePill()
        }
    }, [marketing, movePill, pathname, menuOpen, language])

    // Recalculate navigation position on window resize
    useEffect(() => {
        if (marketing) return undefined

        window.addEventListener('resize', movePill)

        if (document.fonts?.ready) {
            document.fonts.ready.then(movePill)
        }

        return () => {
            window.removeEventListener('resize', movePill)
        }
    }, [marketing, movePill])

    // Enable animation after the initial position is calculated
    useEffect(() => {
        if (marketing || pillAnimated || pill.w === 0) {
            return undefined
        }

        const frameId = window.requestAnimationFrame(() => {
            setPillAnimated(true)
        })

        return () => {
            window.cancelAnimationFrame(frameId)
        }
    }, [marketing, pill.w, pillAnimated])

    // Close mobile menu when the route changes
    useEffect(() => {
        setMenuOpen(false)
    }, [pathname])

    return (
        <header className="site-header sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
            <div className="nav-inner mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-3.5 sm:px-8">
                <Brand />

                <nav
                    ref={navRef}
                    className={`main-nav relative flex items-center gap-1.5 ${
                        menuOpen ? 'main-nav-open' : ''
                    }`}
                    aria-label={t('navigation.main')}
                >
                    {marketing ? (
                        <>
                            <a href="#home" onClick={closeMenu}>
                                Home
                            </a>

                            <a href="#features" onClick={closeMenu}>
                                Features
                            </a>

                            <a href="#pricing" onClick={closeMenu}>
                                Pricing
                            </a>

                            <a href="#about" onClick={closeMenu}>
                                About
                            </a>

                            <a href="#contact" onClick={closeMenu}>
                                Contact
                            </a>

                            <Link
                                className="mobile-nav-cta"
                                to="/signin"
                                onClick={closeMenu}
                            >
                                Get started
                                <ArrowUpRight size={15} />
                            </Link>
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

                            {applicationLinks.map(
                                ({ key, to, icon: Icon, label }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        end={to === '/dashboard'}
                                        onClick={closeMenu}
                                        className={({ isActive }) =>
                                            `group relative z-10 flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-[color,background-color,transform] duration-300 active:scale-95 ${
                                                isActive
                                                    ? 'text-white'
                                                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon
                                                    size={16}
                                                    className={`transition-transform duration-300 ${
                                                        isActive
                                                            ? 'scale-110'
                                                            : 'group-hover:-translate-y-0.5'
                                                    }`}
                                                />

                                                <span>
                                                    {t(key) || label}
                                                </span>
                                            </>
                                        )}
                                    </NavLink>
                                )
                            )}
                        </>
                    )}
                </nav>

                <div className="nav-actions flex items-center gap-3">
                    {marketing ? (
                        <>
                            <Link
                                className="marketing-login"
                                to="/signin"
                            >
                                Log in
                            </Link>

                            <Link
                                className="button button-dark nav-cta"
                                to="/signup"
                            >
                                Sign up
                                <ArrowUpRight size={16} />
                            </Link>
                        </>
                    ) : (
                        <>
                            <div
                                className="language-switcher hidden items-center gap-1 sm:flex"
                                role="group"
                                aria-label={t('language.label')}
                            >
                                <button
                                    type="button"
                                    aria-pressed={language === 'en'}
                                    onClick={() => setLanguage('en')}
                                    className="rounded px-2 py-1 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    EN
                                </button>

                                <button
                                    type="button"
                                    aria-pressed={language === 'si'}
                                    onClick={() => setLanguage('si')}
                                    className="rounded px-2 py-1 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    සිං
                                </button>

                                <button
                                    type="button"
                                    aria-pressed={language === 'ta'}
                                    onClick={() => setLanguage('ta')}
                                    className="rounded px-2 py-1 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    தமிழ்
                                </button>
                            </div>

                            <ProfileMenu />
                        </>
                    )}

                    <button
                        type="button"
                        aria-expanded={menuOpen}
                        aria-label={
                            menuOpen
                                ? t('navigation.closeMenu')
                                : t('navigation.openMenu')
                        }
                        className="menu-toggle rounded-lg p-2 text-slate-700 dark:text-slate-300 md:hidden"
                        onClick={() => setMenuOpen((previous) => !previous)}
                    >
                        {menuOpen ? (
                            <X size={22} />
                        ) : (
                            <Menu size={22} />
                        )}
                    </button>
                </div>
            </div>
        </header>
    )
}