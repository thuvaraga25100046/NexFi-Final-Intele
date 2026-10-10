import { LayoutDashboard, LayoutGrid, LayoutChart, Shield, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import useTranslation from '../i18n/useTranslation.js'

const tabs = [
  { key: 'navigation.home', to: '/dashboard', icon: LayoutDashboard },
  { key: 'navigation.transactions', to: '/transactions', icon: LayoutGrid },
  { key: 'navigation.receivables', to: '/receivables', icon: LayoutChart },
  { key: 'navigation.payables', to: '/payables', icon: Shield },
  { key: 'navigation.settings', to: '/settings', icon: Settings },
]

export default function MobileTabBar() {
  const { t } = useTranslation()
  return (
    <nav
      className="mobile-tab-bar fixed bottom-0 left-0 right-0 flex flex-col md:flex-row justify-around items-center py-2 bg-slate-950/80 backdrop-blur-sm z-50"
      aria-label={t('navigation.app')}
    >
      {tabs.map(({ key, to, icon: Icon }) => (
        <NavLink
          aria-label={t(key)}
          className={({ isActive }) => `
            mobile-tab
            flex-1
            transition-all
            duration-200
            text-slate-400
            ${isActive 
              ? 'text-indigo-600 font-medium shadow-lg ring-2 ring-indigo-500/50'
              : ''}
          `
          }
          key={to}
          to={to}
        >
          <Icon size={22} strokeWidth={2.2} />
          <span className="hidden md:block text-xs">{t(key)}</span>
        </NavLink>
      ))}
    </nav>
  )
}