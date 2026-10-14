import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import LiveHeroChart from '../components/LiveHeroChart.jsx'
import useLiveSeries from '../hooks/useLiveSeries.js'
import {
  AtSign,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  ChartNoAxesCombined,
  Check,
  CreditCard,
  Globe,
  Landmark,
  MapPin,
  PieChart,
  Play,
  Share2,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Brand from '../components/Brand.jsx'
import Logo from '../components/Logo.jsx'
import SiteHeader from '../components/SiteHeader.jsx'

const features = [
  { icon: ChartNoAxesCombined, title: 'AI market predictions', description: 'Explore emerging trends with clear, forward-looking insights.', color: 'violet' },
  { icon: CreditCard, title: 'Expense tracking', description: 'See where your money goes and keep everyday spending in view.', color: 'blue' },
  { icon: PieChart, title: 'Investment analytics', description: 'Bring performance and allocation into one easy-to-read picture.', color: 'mint' },
  { icon: BellRing, title: 'Smart notifications', description: 'Stay ahead of important changes, upcoming bills, and milestones.', color: 'amber' },
  { icon: Landmark, title: 'Financial reports', description: 'Turn your activity into thoughtful summaries you can act on.', color: 'pink' },
  { icon: Wallet, title: 'Portfolio monitoring', description: 'Keep balances and assets together in a single clear view.', color: 'cyan' },
]

const metrics = [
  { target: 3, suffix: '', value: '3', label: 'Languages' },
  { target: 4, suffix: '', value: '4', label: 'Currencies' },
  { target: 95, suffix: '%', value: '95%', label: 'Prediction accuracy' },
  { target: 24, suffix: '/7', value: '24/7', label: 'AI monitoring' },
]

const launchHighlights = [
  {
    icon: Wallet,
    label: 'YOUR OVERVIEW',
    title: 'See the full picture',
    description: 'Bring balances, income, and everyday spending into one clear view.',
    color: 'violet',
  },
  {
    icon: BellRing,
    label: 'STAY ON TRACK',
    title: 'Keep plans close',
    description: 'Keep upcoming bills and financial priorities easy to find.',
    color: 'mint',
  },
  {
    icon: ChartNoAxesCombined,
    label: 'MAKE YOUR NEXT MOVE',
    title: 'Turn details into direction',
    description: 'Use thoughtful insights to understand your finances and plan ahead.',
    color: 'blue',
  },
]

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref.current || !('IntersectionObserver' in window)) {
      setVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.15 })

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
      <div className={`reveal${visible ? ' is-visible' : ''} ${className}`} ref={ref} style={{ '--reveal-delay': `${delay}ms` }}>
        {children}
      </div>
  )
}

function AnimatedMetric({ target, prefix = '', suffix = '', value, label }) {
  const ref = useRef(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!ref.current || !('IntersectionObserver' in window)) {
      setCount(target)
      return undefined
    }

    let frame
    let start
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      const animate = (time) => {
        if (start === undefined) start = time
        const progress = Math.min((time - start) / 1400, 1)
        const eased = 1 - (1 - progress) ** 4
        setCount(Math.round(target * eased))
        if (progress < 1) frame = requestAnimationFrame(animate)
      }
      frame = requestAnimationFrame(animate)
      observer.disconnect()
    }, { threshold: 0.4 })

    observer.observe(ref.current)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [target])

  return (
      <div className="metric-card" ref={ref}>
        <strong>{count === target ? value : `${prefix}${count}${suffix}`}</strong>
        <span>{label}</span>
      </div>
  )
}

const DOWN_PILL_STYLE = { color: '#fb7185', background: 'rgba(251,113,133,.12)', borderColor: 'rgba(251,113,133,.35)' }

function DashboardIllustration() {
  const { values, balance, change } = useLiveSeries()
  const up = change >= 0
  const pct = Math.abs(change).toFixed(1)

  return (
      <div className="hero-visual" aria-label="NexFi financial dashboard preview">
        <div className="visual-orbit visual-orbit-one" aria-hidden="true" />
        <div className="visual-orbit visual-orbit-two" aria-hidden="true" />
        <div className="visual-glow" aria-hidden="true" />
        <div className="preview-card">
          <div className="preview-topbar">
            <div className="preview-brand"><Logo className="preview-logo" decorative variant="compact" /><b>NexFi</b></div>
            <span className="preview-avatar">AM</span>
          </div>
          <div className="preview-intro"><span>YOUR FINANCIAL SNAPSHOT</span><strong>Good morning</strong></div>
          <div className="preview-balance">
            <div><span>Total balance</span><strong className="tabular-nums">{balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</strong></div>
            <span className="balance-pill tabular-nums" style={up ? undefined : DOWN_PILL_STYLE}>{up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {pct}%</span>
          </div>
          <LiveHeroChart values={values} />
          <div className="preview-chart-labels"><span>Sep 01</span><span>Sep 08</span><span>Sep 15</span><span>Sep 22</span><span>Today</span></div>
          <div className="preview-activity-title"><b>Recent activity</b><a href="#features">View all <ArrowUpRight size={13} /></a></div>
          <div className="preview-activity">
            <span className="activity-avatar income"><ArrowDownRight size={15} /></span>
            <span><b>Northstar Studio</b><small>Today · Income</small></span>
            <strong>+$2,400.00</strong>
          </div>
          <div className="preview-activity">
            <span className="activity-avatar expense"><CreditCard size={14} /></span>
            <span><b>Everyday Market</b><small>Yesterday · Groceries</small></span>
            <strong>−$86.42</strong>
          </div>
        </div>
        <div className="floating-insight"><span><Sparkles size={15} /></span><div><b>Looking good</b><small>Your plan is on track</small></div><Check size={16} /></div>
        <div className="floating-trend"><ChartNoAxesCombined size={17} /><span><b>{up ? 'Positive trend' : 'Negative trend'}</b><small>{up ? 'Up' : 'Down'} {pct}% this month</small></span></div>
      </div>
  )
}

function LandingPage() {
  const { isLoggedIn, user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  return (
      <div className="site-shell fintech-home" id="home">
        <SiteHeader variant="marketing" />

        <main>
          <section className="hero-section">
            <div className="hero-backdrop" aria-hidden="true"><span /><span /><span /></div>
            <div className="hero-inner mx-auto grid w-full max-w-[1280px]">
              <Reveal className="hero-copy">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 mb-4">
                  <MapPin size={13} /> Now available in Sri Lanka 🇱🇰
                </div>
                <div className="hero-kicker"><span className="kicker-pulse" /> FINANCE, WITH FORESIGHT</div>
                <h1>Know What's Next <span>in Finance</span></h1>
                <p className="hero-description">AI-powered insights bring your spending, plans, and possibilities into focus—so you can move forward with confidence.</p>
                <div className="hero-actions">
                  <button
                      onClick={(e) => {
                        e.preventDefault()
                        window.location.href = '/auth'
                      }}
                      className="button button-primary"
                  >
                    Get started <ArrowRight size={17} />
                  </button>
                  <a
                      className="button button-ghost"
                      href="#demo"
                      onClick={(e) => {
                        e.preventDefault()
                        window.location.href = '/auth'
                      }}
                  >
                    <span className="play-icon"><Play size={13} fill="currentColor" /></span> View demo
                  </a>
                </div>
                <div className="hero-trust"><ShieldCheck size={16} /> A clearer picture. A more confident next step.</div>
              </Reveal>
              <Reveal className="hero-product" delay={160}>
                <DashboardIllustration />
              </Reveal>
            </div>
            <div className="hero-scroll-cue"><span /> Explore the NexFi experience</div>
          </section>

          {isLoggedIn ? null : (
              <div className="auth-prompt-section">
                <div className="max-w-md w-full mx-auto px-4 py-8 text-center">
                  <div className="rounded-xl bg-slate-900/50 p-8 mb-6">
                    <ShieldCheck size={48} className="mx-auto mb-4 text-indigo-500" />
                    <h3 className="text-xl font-bold text-slate-100 mb-2">Welcome to NexFi</h3>
                    <p className="text-slate-400 mb-6">Create your account to explore all features</p>
                    <div className="flex gap-3 justify-center">
                      <a
                          href="/signup"
                          className="button button-primary flex-1"
                      >
                        Sign up
                      </a>
                      <a
                          href="/signin"
                          className="button button-outlined flex-1"
                      >
                        Log in
                      </a>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mt-4">
                    Already have an account?{' '}
                    <a href="/signin" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                      Log in
                    </a>
                  </p>
                </div>
              </div>
          )}

          <section className="metrics-section" aria-label="NexFi platform metrics">
            <div className="metrics-inner mx-auto grid w-full max-w-[1280px]">
              <p className="metrics-label">A smarter view<br />starts here</p>
              {metrics.map((metric) => <AnimatedMetric key={metric.label} {...metric} />)}
            </div>
            <p className="metrics-disclaimer">Illustrative product metrics for preview purposes.</p>
          </section>

          <section className="features-section" id="features">
            <div className="section-inner mx-auto w-full max-w-[1280px]">
              <Reveal className="section-heading-row">
                <div>
                  <span className="eyebrow">YOUR FINANCES, IN FOCUS</span>
                  <h2 className="section-title">Everything you need<br /><span>to move with confidence.</span></h2>
                </div>
                <p className="section-intro">From everyday spending to the bigger picture, NexFi brings the signals together in one clear, considered workspace.</p>
              </Reveal>
              <div className="feature-grid">
                {features.map(({ icon: Icon, title, description, color }, index) => (
                    <Reveal className="feature-reveal" delay={index * 70} key={title}>
                      <article className="feature-item">
                        <span className={`feature-icon feature-${color}`}><Icon size={21} strokeWidth={1.8} /></span>
                        <span className="feature-number">0{index + 1}</span>
                        <h3>{title}</h3>
                        <p>{description}</p>
                        <a href="#demo" aria-label={`Learn more about ${title}`}><ArrowUpRight size={17} /></a>
                      </article>
                    </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section className="demo-section" id="demo">
            <div className="demo-inner mx-auto w-full max-w-[1280px]">
              <Reveal className="demo-copy">
                <span className="eyebrow">ONE CLEARER VIEW</span>
                <h2>Less second-guessing.<br /><span>More room to plan.</span></h2>
                <p>Bring the day-to-day details together, spot what is changing, and see your next steps without getting lost in the numbers.</p>
                <ul>
                  <li><Check size={15} /> See income and spending in context</li>
                  <li><Check size={15} /> Keep upcoming plans close at hand</li>
                  <li><Check size={15} /> Turn information into a next step</li>
                </ul>
                <Link className="text-link" to="/dashboard">Explore the dashboard <ArrowRight size={16} /></Link>
              </Reveal>
              <Reveal className="demo-side" delay={120}>
                <div className="demo-insight-card">
                  <div className="demo-insight-top"><span className="demo-insight-icon"><Sparkles size={18} /></span><span className="demo-status">INSIGHT PREVIEW</span></div>
                  <h3>Your month, at a glance</h3>
                  <p>Income is trending ahead of expenses. You have a little more room for the goals that matter.</p>
                  <div className="demo-bars" aria-label="Illustrative income and expense comparison">
                    <div><span>Income</span><i><b style={{ width: '78%' }} /></i><strong>$4,820</strong></div>
                    <div><span>Expenses</span><i><b style={{ width: '52%' }} /></i><strong>$3,210</strong></div>
                    <div><span>Goals</span><i><b style={{ width: '36%' }} /></i><strong>$1,100</strong></div>
                  </div>
                  <small className="demo-note">Illustrative dashboard data</small>
                </div>
              </Reveal>
            </div>
          </section>

          <section className="launch-section" id="about">
            <div className="section-inner mx-auto w-full max-w-[1280px]">
              <Reveal className="launch-heading">
                <span className="eyebrow">MADE FOR YOUR NEXT MOVE</span>
                <h2 className="section-title">Your money, in focus.<br /><span>Your next move, in reach.</span></h2>
                <p>A clearer way to understand today and plan for what comes next.</p>
              </Reveal>
              <div className="launch-grid">
                {launchHighlights.map(({ icon: Icon, label, title, description, color }, index) => (
                    <Reveal className="launch-reveal" delay={index * 90} key={title}>
                      <article className="launch-card">
                        <span className={`launch-icon feature-${color}`}><Icon size={20} /></span>
                        <span className="launch-label">{label}</span>
                        <h3>{title}</h3>
                        <p>{description}</p>
                      </article>
                    </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section className="pricing-section" id="pricing">
            <div className="pricing-glow" aria-hidden="true" />
            <Reveal className="pricing-content">
              <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
              <h2>Start Making Smarter<br />Financial Decisions Today</h2>
              <p>Get a clearer view of your money and make your next move with confidence.</p>
              <button
                  onClick={() => { window.location.href = '/auth' }}
                  className="button button-primary"
              >
                Join NexFi <ArrowRight size={17} />
              </button>
            </Reveal>
          </section>
        </main>

        <footer className="site-footer" id="contact">
          <div className="footer-inner mx-auto w-full max-w-[1280px]">
            <div className="footer-brand-block"><Brand /><p>Know what’s next. Make it yours.</p></div>
            <div className="footer-links">
              <div><b>Explore</b><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#about">About NexFi</a></div>
              <div><b>Get started</b><Link to="/dashboard">Dashboard</Link><a href="#demo">Product demo</a><a href="#contact">Contact</a></div>
            </div>
            <div className="footer-bottom">
              <span>© 2026 NexFi. Made for what’s next.</span>
              <div className="footer-socials" aria-label="Social media">
                <a href="https://www.linkedin.com/" aria-label="LinkedIn"><AtSign size={16} /></a>
                <a href="https://x.com/" aria-label="X"><Share2 size={16} /></a>
                <a href="https://www.instagram.com/" aria-label="Instagram"><Globe size={16} /></a>
              </div>
            </div>
          </div>
        </footer>
      </div>
  )
}

export default LandingPage