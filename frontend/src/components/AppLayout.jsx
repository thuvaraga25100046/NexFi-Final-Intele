import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Brand from './Brand.jsx'
import MobileTabBar from './MobileTabBar.jsx'
import SiteHeader from './SiteHeader.jsx'

export default function AppLayout({ children }) {
  return (
    <div className="workspace-shell">
      <SiteHeader />
      <main className="workspace-main">{children}</main>
      <footer className="workspace-footer">
        <div className="workspace-footer-inner">
          <Brand />
          <span>Know What's Next.</span>
          <Link to="/" aria-label="Back to NexFi home">nexfi.com <ArrowUpRight size={13} /></Link>
        </div>
      </footer>
      <MobileTabBar />
    </div>
  )
}