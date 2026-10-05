import { useState } from 'react'
import { ArrowUpRight, CircleUserRound, Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import Brand from './Brand.jsx'

const applicationLinks = [
  { label: 'Home', to: '/dashboard' },
  { label: 'Transactions', to: '/transactions' },
  { label: 'Receivables', to: '/receivables' },
  { label: 'Payables', to: '/payables' },
  { label: 'Settings', to: '/settings' },
]

export default function SiteHeader({ variant = 'application' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const marketing = variant === 'marketing'
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="nav-inner mx-auto flex w-full max-w-[1280px] items-center justify-between">
        <Brand />
        <nav className={`main-nav${menuOpen ? ' main-nav-open' : ''}`} aria-label="Main navigation">
          {marketing ? (
            <>
              <a href="#features" onClick={closeMenu}>Why NexFi</a>
              <a href="#how-it-works" onClick={closeMenu}>How it works</a>
              <a href="#about" onClick={closeMenu}>About</a>
              <NavLink to="/dashboard" onClick={closeMenu}>Home</NavLink>
            </>
          ) : applicationLinks.map(({ label, to }) => (
            <NavLink
              className={({ isActive }) => isActive ? 'app-nav-active' : undefined}
              end={to === '/dashboard'}
              key={to}
              onClick={closeMenu}
              to={to}
            >
              {label}
            </NavLink>
          ))}
          {marketing && <Link className="mobile-nav-cta" to="/dashboard" onClick={closeMenu}>Open Home <ArrowUpRight size={15} /></Link>}
        </nav>
        <div className="nav-actions">
          {marketing ? (
            <Link className="button button-dark nav-cta" to="/dashboard">Get started <ArrowUpRight size={16} /></Link>
          ) : (
            <>
              <Link className="button button-dark nav-cta" to="/dashboard">Overview <ArrowUpRight size={16} /></Link>
              <span className="app-profile" aria-label="NexFi account"><CircleUserRound size={19} /><span>JD</span></span>
            </>
          )}
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
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