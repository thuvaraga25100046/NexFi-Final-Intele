import { useState } from 'react'
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CreditCard,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import Brand from './components/Brand.jsx'
import Logo from './components/Logo.jsx'
import SiteHeader from './components/SiteHeader.jsx'

const chartValues = [34, 48, 42, 62, 54, 73, 59, 86, 68, 78, 65, 96]

const features = [
  {
    icon: WalletCards,
    title: 'Everything, in view',
    description: 'Bring balances, income, and upcoming payments into one calm, clear picture.',
    color: 'mint',
  },
  {
    icon: TrendingUp,
    title: 'Progress you can feel',
    description: 'See where your money is moving and spot the habits that are moving you forward.',
    color: 'lime',
  },
  {
    icon: ShieldCheck,
    title: 'A little more peace',
    description: 'Know what is due, what is covered, and what is yours to plan with.',
    color: 'coral',
  },
]

function DashboardPreview() {
  const [period, setPeriod] = useState('Month')
  const balance = period === 'Month' ? '$24,560.80' : '$6,142.30'

  return (
    <div className="dashboard-shell" id="overview" aria-label="NexFi dashboard preview">
      <div className="dashboard-topline">
        <div className="dashboard-brand">
          <Logo className="dashboard-brand-logo" decorative variant="compact" />
          <span>NexFi</span>
        </div>
        <div className="avatar-button" aria-label="Jamie Doe account">
          <span>JD</span><ChevronDown size={13} />
        </div>
      </div>

      <div className="dashboard-greeting">
        <div>
          <span className="eyebrow dashboard-eyebrow">YOUR MONEY, AT A GLANCE</span>
          <h2>Good morning, Jamie</h2>
        </div>
        <span className="live-status"><span /> All accounts updated</span>
      </div>

      <div className="balance-row">
        <div>
          <span className="balance-label">Total balance</span>
          <p className="balance-amount">{balance}</p>
          <span className="balance-change"><ArrowUpRight size={14} /> 8.2% <span>vs. last {period.toLowerCase()}</span></span>
        </div>
        <div className="period-switch" role="group" aria-label="Chart period">
          {['Week', 'Month'].map((option) => (
            <button
              aria-pressed={period === option}
              className={period === option ? 'period-active' : ''}
              key={option}
              onClick={() => setPeriod(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-wrap" role="img" aria-label={`${period} balance trend, steadily increasing`}>
        <div className="chart-grid-lines"><span /><span /><span /></div>
        <div className="chart-bars">
          {chartValues.map((value, index) => (
            <span
              className={`chart-bar${index === chartValues.length - 1 ? ' chart-bar-current' : ''}`}
              key={`${value}-${index}`}
              style={{ '--bar-height': `${period === 'Week' ? Math.min(value + 8, 100) : value}%` }}
            />
          ))}
        </div>
        <div className="chart-labels"><span>Oct 01</span><span>Oct 08</span><span>Oct 15</span><span>Oct 22</span><span>Today</span></div>
      </div>

      <div className="dashboard-divider" />
      <div className="dashboard-section-heading">
        <span>Recent activity</span>
        <a href="#features">View all <ArrowRight size={13} /></a>
      </div>
      <div className="activity-row">
        <span className="activity-icon income-icon"><ArrowDownLeft size={16} /></span>
        <span className="activity-copy"><strong>Northstar Studio</strong><small>Today · Income</small></span>
        <strong className="activity-amount amount-positive">+$2,400.00</strong>
      </div>
      <div className="activity-row">
        <span className="activity-icon expense-icon"><CreditCard size={15} /></span>
        <span className="activity-copy"><strong>Everyday Market</strong><small>Yesterday · Groceries</small></span>
        <strong className="activity-amount">−$86.42</strong>
      </div>
    </div>
  )
}

function LandingPage() {
  return (
    <div className="site-shell" id="home">
      <SiteHeader variant="marketing" />

      <main>
        <section className="hero-section">
          <div className="hero-noise" aria-hidden="true" />
          <div className="hero-inner mx-auto grid w-full max-w-[1280px]">
            <div className="hero-copy">
              <div className="hero-kicker"><span className="kicker-line" /> A clearer kind of finance</div>
              <h1>Know What's<br /><span>Next</span></h1>
              <p className="hero-description">Feel good about your money today, and ready for whatever comes tomorrow.</p>
              <div className="hero-actions">
                <a className="button button-lime" href="#features">Find your next step <ArrowRight size={17} /></a>
                <a className="text-link" href="#how-it-works">See how it works <ArrowRight size={16} /></a>
              </div>
              <div className="hero-note"><span className="avatar-stack"><i>J</i><i>M</i><i>A</i></span><span>Made for real life, not spreadsheets.</span></div>
            </div>

            <div className="hero-product">
              <div className="product-halo" aria-hidden="true" />
              <div className="floating-note note-top"><span className="note-icon"><Sparkles size={15} /></span><span><b>A little more clarity</b><small>Starts with one view</small></span></div>
              <DashboardPreview />
              <div className="floating-note note-bottom"><span className="check-icon"><Check size={14} /></span><span><b>You're on track</b><small>Your plan is looking good</small></span></div>
            </div>
          </div>
          <div className="hero-footer mx-auto flex w-full max-w-[1280px] items-center justify-between">
            <span>LESS GUESSING. MORE LIVING.</span>
            <a href="#features">Meet your money where it is <ArrowDownLeft size={15} /></a>
          </div>
        </section>

        <section className="principles-strip" aria-label="NexFi principles">
          <div className="principles-inner mx-auto grid w-full max-w-[1280px]">
            <span>Made to make sense</span>
            <span><Check size={15} /> Clear by design</span>
            <span><Check size={15} /> Built for real life</span>
            <span><Check size={15} /> Your pace, your plan</span>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-inner mx-auto w-full max-w-[1280px]">
            <div className="section-heading-row">
              <div>
                <span className="eyebrow">A BETTER WAY TO MONEY</span>
                <h2 className="section-title">The big picture.<br /><span>And the little things.</span></h2>
              </div>
              <p className="section-intro">Good money decisions don't need to feel complicated. NexFi brings the details together, so the next move feels a little more obvious.</p>
            </div>
            <div className="feature-grid">
              {features.map(({ icon: Icon, title, description, color }, index) => (
                <article className="feature-item" key={title}>
                  <span className={`feature-icon feature-${color}`}><Icon size={21} strokeWidth={1.8} /></span>
                  <span className="feature-number">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <a href="#how-it-works" aria-label={`Learn more: ${title}`}><ArrowUpRight size={17} /></a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="clarity-section" id="how-it-works">
          <div className="clarity-inner mx-auto grid w-full max-w-[1280px]">
            <div className="clarity-visual">
              <img
                alt="A person reviewing a notebook and monthly budget at a desk"
                className="clarity-photo"
                loading="lazy"
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1100&q=85"
              />
              <div className="photo-caption"><span className="caption-mark"><TrendingUp size={16} /></span><span><b>A plan that feels like yours</b><small>Start with what matters to you.</small></span></div>
              <div className="photo-index">01 <span>/</span> 03</div>
            </div>
            <div className="clarity-copy">
              <span className="eyebrow">MONEY, WITH A LITTLE MORE MEANING</span>
              <h2 className="section-title">You bring the goals.<br /><span>We'll bring the clarity.</span></h2>
              <p>Maybe it's a quieter month. Maybe it's a bigger plan. Wherever you're headed, it's easier to move when you can see where you are.</p>
              <ul className="clarity-list">
                <li><span><Check size={13} /></span>See income and expenses together</li>
                <li><span><Check size={13} /></span>Keep upcoming receivables in sight</li>
                <li><span><Check size={13} /></span>Make your next move with confidence</li>
              </ul>
              <a className="button button-dark" href="#overview">Take a closer look <ArrowUpRight size={16} /></a>
            </div>
          </div>
        </section>

        <section className="closing-section" id="about">
          <div className="closing-inner mx-auto flex w-full max-w-[1280px] items-center justify-between">
            <div>
              <span className="eyebrow closing-eyebrow">YOUR NEXT CHAPTER, IN VIEW</span>
              <h2>Make room for what's next.</h2>
              <p>A clearer view can change how the whole month feels.</p>
            </div>
            <a className="button button-lime" href="#home">Meet NexFi <ArrowRight size={17} /></a>
            <Sparkles className="closing-sparkle" size={31} strokeWidth={1.3} aria-hidden="true" />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner mx-auto flex w-full max-w-[1280px] items-center justify-between">
          <Brand />
          <span className="footer-tagline">Know What's Next.</span>
          <span className="footer-legal">© 2026 NexFi. Made for your next.</span>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage