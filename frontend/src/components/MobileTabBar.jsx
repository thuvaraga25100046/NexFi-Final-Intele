import { ArrowLeftRight, CircleDollarSign, CreditCard, LayoutDashboard, Settings2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const tabs = [
  { label: 'Home', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', to: '/transactions', icon: ArrowLeftRight },
  { label: 'Receivables', to: '/receivables', icon: CircleDollarSign },
  { label: 'Payables', to: '/payables', icon: CreditCard },
  { label: 'Settings', to: '/settings', icon: Settings2 },
]

export default function MobileTabBar() {
  return (
    <nav className="mobile-tab-bar" aria-label="App navigation">
      {tabs.map(({ label, to, icon: Icon }) => (
        <NavLink
          aria-label={label}
          className={({ isActive }) => `mobile-tab${isActive ? ' mobile-tab-active' : ''}`}
          key={to}
          to={to}
        >
          <Icon size={20} strokeWidth={1.9} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}