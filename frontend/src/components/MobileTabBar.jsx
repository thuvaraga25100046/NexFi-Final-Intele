import { ArrowLeftRight, CircleDollarSign, CreditCard, LayoutDashboard, Settings2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import useTranslation from '../i18n/useTranslation.js'

const tabs = [
  { key: 'navigation.home', to: '/dashboard', icon: LayoutDashboard },
  { key: 'navigation.transactions', to: '/transactions', icon: ArrowLeftRight },
  { key: 'navigation.receivables', to: '/receivables', icon: CircleDollarSign },
  { key: 'navigation.payables', to: '/payables', icon: CreditCard },
  { key: 'navigation.settings', to: '/settings', icon: Settings2 },
]

export default function MobileTabBar() {
  const { t } = useTranslation()
  return (
    <nav className="mobile-tab-bar" aria-label={t('navigation.app')}>
      {tabs.map(({ key, to, icon: Icon }) => (
        <NavLink
          aria-label={t(key)}
          className={({ isActive }) => `mobile-tab${isActive ? ' mobile-tab-active' : ''}`}
          key={to}
          to={to}
        >
          <Icon size={20} strokeWidth={1.9} />
          <span>{t(key)}</span>
        </NavLink>
      ))}
    </nav>
  )
}