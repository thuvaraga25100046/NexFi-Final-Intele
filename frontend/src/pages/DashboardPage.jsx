import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Camera,
  Check,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Database,
  Gauge,
  FilePlus2,
  MessageCircle,
  PencilLine,
  Plus,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  TriangleAlert,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import CashFlowForecastPanel from '../components/CashFlowForecastPanel.jsx'
import CreateRecordForm from '../components/CreateRecordForm.jsx'
import OpeningBalanceModal from '../components/OpeningBalanceModal.jsx'
import ResourceState from '../components/ResourceState.jsx'
import useApiResource from '../hooks/useApiResource.js'
import {
  fetchCashFlowForecast,
  fetchDashboardSummary,
  fetchOpeningBalance,
  fetchPayables,
  fetchReceivables,
  fetchTransactions,
} from '../services/api.js'
import useTranslation from '../i18n/useTranslation.js'
import { formatCurrency, formatDate } from '../i18n/formatters.js'
import { DEMO_MODE_CHANGED_EVENT, DEMO_MODE_KEY, isDemoModeEnabled, setDemoModeEnabled } from '../services/demoData.js'

const quickStats = [
  { key: 'dashboard.totalIncome', field: 'totalIncome', icon: ArrowDownLeft, tone: 'mint' },
  { key: 'dashboard.totalExpenses', field: 'totalExpenses', icon: ArrowUpRight, tone: 'rose' },
  { key: 'dashboard.totalReceivables', field: 'totalReceivables', icon: CircleDollarSign, tone: 'mint' },
  { key: 'dashboard.totalPayables', field: 'totalPayables', icon: CreditCard, tone: 'amber' },
]

const quickActions = [
  { kind: 'transaction', key: 'home.addTransaction', icon: FilePlus2, tone: 'mint' },
  { kind: 'receivable', key: 'home.addReceivable', icon: ArrowDownLeft, tone: 'blue' },
  { kind: 'payable', key: 'home.addPayable', icon: ArrowUpRight, tone: 'amber' },
]

function localDate(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function dayDifference(date) {
  const parts = date.split('-').map(Number)
  const target = Date.UTC(parts[0], parts[1] - 1, parts[2])
  const today = new Date()
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((target - start) / 86_400_000)
}

function dueStatus(date, status, t) {
  const days = dayDifference(date)
  if (status === 'overdue' || days < 0) return { label: t('home.overdue'), tone: 'overdue' }
  if (days === 0) return { label: t('home.dueToday'), tone: 'today' }
  return { label: t('home.dueInDays', { count: days }), tone: 'soon' }
}

function initials(name) {
  return name?.trim().charAt(0).toUpperCase() || '?'
}

function ModalFrame({ title, onClose, children }) {
  const { t } = useTranslation()
  return (
    <div className="home-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section aria-label={title} aria-modal="true" className="home-modal" role="dialog">
        <div className="home-modal-heading">
          <h2>{title}</h2>
          <button aria-label={t('actions.close')} className="home-icon-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        {children}
      </section>
    </div>
  )
}

function UpcomingList({ items, loading, error, retry, title, eyebrow, to, kind, language, currency, t }) {
  return (
    <section className="home-card upcoming-card">
      <div className="home-section-heading">
        <div><span className="home-kicker">{eyebrow}</span><h2>{title}</h2></div>
        <Link className="home-view-all" to={to}>{t('dashboard.viewAll')} <ArrowRight size={15} /></Link>
      </div>
      <ResourceState loading={loading} error={error} retry={retry} empty={!items.length} emptyTitle={kind === 'receivable' ? t('dashboard.noOpenReceivables') : t('dashboard.noOpenPayables')} />
      {!loading && !error && items.length > 0 && (
        <div className="upcoming-list">
          {items.map((item) => {
            const name = kind === 'receivable' ? item.customerName : item.vendorName
            const due = dueStatus(item.dueDate, item.status, t)
            return (
              <article className="upcoming-row" key={item.id}>
                <span className={`upcoming-avatar upcoming-avatar-${kind}`}>{initials(name)}</span>
                <span className="upcoming-details">
                  <strong>{name}</strong>
                  <span>{t('messages.due', { date: formatDate(item.dueDate, language) })}</span>
                </span>
                <span className="upcoming-amount-status">
                  <strong>{formatCurrency(item.amount, language, currency)}</strong>
                  <span className={`due-chip due-chip-${due.tone}`}>{due.label}</span>
                </span>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function ExecutiveSummary({ receivables, payables, language, currency }) {
  const loadForecast = useCallback((signal) => fetchCashFlowForecast(signal, 30), [])
  const forecast = useApiResource(loadForecast)
  const today = localDate()
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const monthEndKey = `${monthEnd.getFullYear()}-${String(monthEnd.getMonth() + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`
  const monthForecastDays = (forecast.data?.days ?? []).filter((day) => day.date <= monthEndKey)
  const monthEndBalance = monthForecastDays.at(-1)?.projectedBalance
  const lowestBalance = Math.min(
    Number(forecast.data?.openingBalance ?? 0),
    ...(forecast.data?.days ?? []).map((day) => Number(day.projectedBalance)),
  )
  const forecastOutflow = Number(forecast.data?.expectedOutflow ?? 0)
  const healthScore = forecast.data
    ? Math.round(Math.max(0, Math.min(100, forecastOutflow > 0 ? (lowestBalance / forecastOutflow) * 100 : lowestBalance > 0 ? 100 : 0)))
    : null
  const healthTone = healthScore === null ? 'pending' : healthScore >= 75 ? 'healthy' : healthScore >= 45 ? 'watch' : 'risk'
  const overduePayables = (payables.data ?? []).filter((item) => item.status !== 'paid' && (item.status === 'overdue' || dayDifference(item.dueDate) < 0))
  const upcomingPayables = (payables.data ?? []).filter((item) => item.status !== 'paid' && dayDifference(item.dueDate) >= 0 && dayDifference(item.dueDate) <= 14)
  const overdueReceivables = (receivables.data ?? []).filter((item) => item.status !== 'paid' && (item.status === 'overdue' || dayDifference(item.dueDate) < 0))
  const upcomingTotal = upcomingPayables.reduce((sum, item) => sum + Number(item.amount), 0)
  const overdueTotal = overduePayables.reduce((sum, item) => sum + Number(item.amount), 0)
  const overdueReceivableTotal = overdueReceivables.reduce((sum, item) => sum + Number(item.amount), 0)
  const recommendation = forecast.data?.shortageAlert
    ? {
      tone: 'risk',
      text: `Review outflows ahead of ${formatDate(forecast.data.shortageAlert.shortageDate, language)} and follow up on incoming invoices to protect your cash buffer.`,
    }
    : overdueReceivables.length
      ? {
        tone: 'watch',
        text: `Follow up on ${overdueReceivables.length} overdue ${overdueReceivables.length === 1 ? 'invoice' : 'invoices'} (${formatCurrency(overdueReceivableTotal, language, currency)}) to strengthen your cash position.`,
      }
      : upcomingPayables.length
        ? {
          tone: 'healthy',
          text: `Set aside ${formatCurrency(upcomingTotal, language, currency)} for ${upcomingPayables.length} ${upcomingPayables.length === 1 ? 'obligation' : 'obligations'} due in the next 14 days.`,
        }
        : {
          tone: 'healthy',
          text: 'Your projected cash balance stays positive. Keep monitoring weekly to stay ahead of changes.',
        }
  const loading = forecast.loading || payables.loading || receivables.loading
  const error = forecast.error || payables.error || receivables.error

  function retryAll() {
    forecast.retry()
    payables.retry()
    receivables.retry()
  }

  return (
    <section className="executive-summary-card" aria-labelledby="executive-summary-heading">
      <div className="executive-summary-heading">
        <div>
          <span className="home-kicker">YOUR MONEY, AT A GLANCE</span>
          <h2 id="executive-summary-heading">Executive summary</h2>
        </div>
        <span className="executive-summary-period"><span /> 30-day outlook</span>
      </div>
      {error ? (
        <ResourceState loading={false} error={error} retry={retryAll} empty={false} />
      ) : (
        <>
          <div className="executive-summary-metrics">
            <article className={`executive-metric executive-health executive-${healthTone}`}>
              <span className="executive-metric-icon"><Gauge size={18} /></span>
              <span className="executive-metric-label">Cash health score</span>
              <strong>{loading || healthScore === null ? '—' : `${healthScore}`}<small>{loading || healthScore === null ? '' : '/100'}</small></strong>
              <span className="executive-health-track"><i style={{ width: `${healthScore ?? 0}%` }} /></span>
              <span className="executive-metric-caption">{healthScore === null ? 'Calculating outlook' : healthScore >= 75 ? 'Healthy cash buffer' : healthScore >= 45 ? 'Keep an eye on cash flow' : 'Cash flow needs attention'}</span>
            </article>
            <article className="executive-metric">
              <span className="executive-metric-icon executive-icon-violet"><ArrowRight size={18} /></span>
              <span className="executive-metric-label">Month-end forecast</span>
              <strong>{loading || monthEndBalance === undefined ? '—' : formatCurrency(monthEndBalance, language, currency)}</strong>
              <span className={`executive-metric-caption${Number(monthEndBalance) < 0 ? ' executive-caption-risk' : ''}`}>
                {monthEndBalance === undefined ? 'Forecast unavailable' : `Projected ${formatDate(monthForecastDays.at(-1)?.date, language)}`}
              </span>
            </article>
            <article className="executive-metric">
              <span className="executive-metric-icon executive-icon-amber"><CreditCard size={18} /></span>
              <span className="executive-metric-label">Upcoming obligations</span>
              <strong>{loading ? '—' : formatCurrency(upcomingTotal, language, currency)}</strong>
              <span className="executive-metric-caption">
                {loading ? 'Loading obligations' : `${upcomingPayables.length} due in 14 days${overduePayables.length ? ` · ${overduePayables.length} overdue (${formatCurrency(overdueTotal, language, currency)})` : ''}`}
              </span>
            </article>
          </div>
          <div className={`executive-recommendation executive-recommendation-${recommendation.tone}`}>
            <span className="executive-recommendation-icon"><Sparkles size={17} /></span>
            <div><span>AI recommendation</span><p>{loading ? 'Reviewing your cash flow and upcoming activity…' : recommendation.text}</p></div>
            <span className="executive-recommendation-indicator" aria-hidden="true" />
          </div>
        </>
      )}
    </section>
  )
}

export default function DashboardPage() {
  const { t, language, currency } = useTranslation()
  const [openingBalanceDialogOpen, setOpeningBalanceDialogOpen] = useState(false)
  const [recordKind, setRecordKind] = useState(null)
  const [smartTool, setSmartTool] = useState(null)
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [invoiceName, setInvoiceName] = useState('')
  const [demoMode, setDemoMode] = useState(() => isDemoModeEnabled())
  const [demoModeError, setDemoModeError] = useState('')
  const invoiceInput = useRef(null)
  const summary = useApiResource(fetchDashboardSummary)
  const openingBalance = useApiResource(fetchOpeningBalance)
  const transactions = useApiResource(fetchTransactions)
  const receivables = useApiResource(fetchReceivables)
  const payables = useApiResource(fetchPayables)
  const forecast = useApiResource(fetchCashFlowForecast)
  const [greetingHour] = useState(() => new Date().getHours())
  const [today] = useState(() => localDate())
  const openReceivables = receivables.data.filter((item) => item.status !== 'paid')
  const openPayables = payables.data.filter((item) => item.status !== 'paid')
  const recentTransactions = [...transactions.data]
    .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate))
    .slice(0, 5)
  const upcomingReceivables = [...openReceivables]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4)
  const upcomingPayables = [...openPayables]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4)
  const greeting = greetingHour < 12 ? t('home.goodMorning') : greetingHour < 18 ? t('home.goodAfternoon') : t('home.goodEvening')
  const weekFlow = (forecast.data?.days ?? []).slice(0, 7)
    .reduce((total, day) => total + Number(day.incoming || 0) - Number(day.outgoing || 0), 0)
  const lowestPostPurchase = (forecast.data?.days ?? [])
    .reduce((lowest, day) => Math.min(lowest, Number(day.projectedBalance || 0) - (Number(purchaseAmount) || 0)), Number(forecast.data?.openingBalance || 0) - (Number(purchaseAmount) || 0))
  const purchaseIsSafe = lowestPostPurchase >= 0
  const recommendations = [
    t('forecast.followUpReceivables'),
    t('forecast.delayPayments'),
    t('forecast.reduceExpenses'),
  ]

  useEffect(() => {
    const syncDemoMode = () => setDemoMode(isDemoModeEnabled())
    const syncDemoModeForStorage = (event) => {
      if (event.key === DEMO_MODE_KEY) syncDemoMode()
    }
    window.addEventListener(DEMO_MODE_CHANGED_EVENT, syncDemoMode)
    window.addEventListener('storage', syncDemoModeForStorage)
    return () => {
      window.removeEventListener(DEMO_MODE_CHANGED_EVENT, syncDemoMode)
      window.removeEventListener('storage', syncDemoModeForStorage)
    }
  }, [])

  const summaryValue = (field) => summary.loading ? '…' : summary.error ? '—' : formatCurrency(summary.data[field], language, currency)
  const formatGreetingDate = new Intl.DateTimeFormat(language === 'ta' ? 'ta-IN' : language === 'si' ? 'si-LK' : 'en-LK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(today)

  return (
    <div className="workspace-page home-dashboard">
      <section className="home-welcome" aria-label={t('home.greeting')}>
        <div>
          <span className="home-kicker">{t('dashboard.eyebrow')}</span>
          <h1>{greeting}</h1>
          <p>{formatGreetingDate}</p>
        </div>
        <div className="home-welcome-actions">
          <button
            aria-pressed={demoMode}
            className={`demo-mode-button${demoMode ? ' demo-mode-active' : ''}`}
            onClick={() => {
              const enabled = !demoMode
              try {
                setDemoModeEnabled(enabled)
                setDemoMode(enabled)
                setDemoModeError('')
              } catch (error) {
                setDemoModeError(error.message || 'Demo mode could not be changed.')
              }
            }}
            type="button"
          >
            <Database size={15} />
            <span>{demoMode ? 'Demo data on' : 'Use demo data'}</span>
          </button>
          {demoModeError && <span className="demo-mode-error" role="alert">{demoModeError}</span>}
          <span className="home-welcome-mark" aria-hidden="true"><Sparkles size={22} /></span>
        </div>
      </section>

      <section className="home-hero-balance" aria-labelledby="home-balance-title">
        <div className="hero-balance-glow" aria-hidden="true" />
        <div className="hero-balance-top">
          <span id="home-balance-title">{t('dashboard.cashBalance')}</span>
          <span className="hero-balance-icon"><Wallet size={19} /></span>
        </div>
        <strong className="hero-balance-amount">{summaryValue('currentCashBalance')}</strong>
        <div className="hero-balance-bottom">
          <div className="hero-opening-balance">
            <span>{t('openingBalance.contribution')}</span>
            <strong>{openingBalance.loading ? '…' : openingBalance.error ? '—' : formatCurrency(openingBalance.data.amount, language, currency)}</strong>
            <button
              aria-label={t('openingBalance.edit')}
              disabled={openingBalance.loading || Boolean(openingBalance.error)}
              onClick={() => setOpeningBalanceDialogOpen(true)}
              type="button"
            >
              <PencilLine size={13} />{t('openingBalance.edit')}
            </button>
          </div>
          <span className={`hero-week-chip${weekFlow < 0 ? ' hero-week-chip-down' : ''}`}>
            {weekFlow < 0 ? <ArrowDownLeft size={14} /> : <TrendingUp size={14} />}
            {formatCurrency(Math.abs(weekFlow), language, currency)} {weekFlow < 0 ? t('home.outThisWeek') : t('home.expectedThisWeek')}
          </span>
        </div>
      </section>

      <section className="home-stats-scroller" aria-label={t('home.quickStats')}>
        {quickStats.map(({ key, field, icon: Icon, tone }) => (
          <article className="home-stat-card" key={field}>
            <span className={`home-stat-icon stat-icon-${tone}`}><Icon size={18} /></span>
            <span className="home-stat-label">{t(key)}</span>
            <strong>{summaryValue(field)}</strong>
            <small>{t('messages.allTime')}</small>
          </article>
        ))}
      </section>

      <ExecutiveSummary
        language={language}
        currency={currency}
        payables={payables}
        receivables={receivables}
      />

      {summary.error && <ResourceState loading={false} error={summary.error} retry={summary.retry} empty={false} />}

      <CashFlowForecastPanel onShortageAction={() => setSmartTool('guidance')} />

      <section className="home-card quick-actions-card">
        <div className="home-section-heading">
          <div><span className="home-kicker">{t('home.moveMoney')}</span><h2>{t('home.quickActions')}</h2></div>
        </div>
        <div className="quick-actions-grid">
          {quickActions.map(({ kind, key, icon: Icon, tone }) => (
            <button className="quick-action-tile" key={kind} onClick={() => setRecordKind(kind)} type="button">
              <span className={`quick-action-icon quick-icon-${tone}`}><Icon size={19} /></span>
              <span>{t(key)}</span>
              <ArrowRight className="quick-action-arrow" size={15} />
            </button>
          ))}
          <button className="quick-action-tile" onClick={() => invoiceInput.current?.click()} type="button">
            <span className="quick-action-icon quick-icon-blue"><Camera size={19} /></span>
            <span>{t('home.scanInvoice')}</span>
            <ArrowRight className="quick-action-arrow" size={15} />
          </button>
          <input
            accept="image/*"
            aria-label={t('home.scanInvoice')}
            capture="environment"
            className="visually-hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                setInvoiceName(file.name)
                setRecordKind('transaction')
              }
              event.target.value = ''
            }}
            ref={invoiceInput}
            tabIndex="-1"
            type="file"
          />
        </div>
        {invoiceName && (
          <p className="invoice-hint" role="status">
            <Check size={15} />{t('home.invoiceManualEntry', { name: invoiceName })}
          </p>
        )}
      </section>

      <section className="smart-tools-grid" aria-label={t('home.smartTools')}>
        <button className="home-card smart-tool-card simulator-card" onClick={() => setSmartTool('simulator')} type="button">
          <span className="smart-tool-icon"><ShoppingBag size={19} /></span>
          <span className="home-kicker">{t('home.smartTools')}</span>
          <strong>{t('home.whatIfTitle')}</strong>
          <span>{t('home.whatIfSubtitle')}</span>
          <span className="smart-tool-link">{t('home.trySimulator')} <ArrowRight size={15} /></span>
        </button>
        <button className="home-card smart-tool-card ask-card" onClick={() => setSmartTool('guidance')} type="button">
          <span className="smart-tool-icon"><MessageCircle size={19} /></span>
          <span className="home-kicker">{t('home.askEyebrow')}</span>
          <strong>{t('home.askTitle')}</strong>
          <span>{t('home.askSubtitle')}</span>
          <span className="smart-tool-link">{t('home.getGuidance')} <ArrowRight size={15} /></span>
        </button>
      </section>

      <section className="home-two-column">
        <UpcomingList
          eyebrow={t('dashboard.moneyOnItsWay')}
          error={receivables.error}
          items={upcomingReceivables}
          kind="receivable"
          language={language}
          loading={receivables.loading}
          retry={receivables.retry}
          t={t}
          title={t('dashboard.upcomingReceivables')}
          to="/receivables"
          currency={currency}
        />
        <UpcomingList
          eyebrow={t('dashboard.moneyToPlanFor')}
          error={payables.error}
          items={upcomingPayables}
          kind="payable"
          language={language}
          loading={payables.loading}
          retry={payables.retry}
          t={t}
          title={t('dashboard.upcomingPayables')}
          to="/payables"
          currency={currency}
        />
      </section>

      <section className="home-card recent-card">
        <div className="home-section-heading">
          <div><span className="home-kicker">{t('dashboard.keepingTrack')}</span><h2>{t('dashboard.recentTransactions')}</h2></div>
          <Link className="home-view-all" to="/transactions">{t('dashboard.allTransactions')} <ArrowRight size={15} /></Link>
        </div>
        <ResourceState loading={transactions.loading} error={transactions.error} retry={transactions.retry} empty={!transactions.data.length} emptyTitle={t('dashboard.noTransactions')} />
        {!transactions.loading && !transactions.error && recentTransactions.length > 0 && (
          <div className="recent-transaction-list">
            {recentTransactions.map((item) => {
              const income = item.type === 'income'
              const title = item.category?.trim() || item.description?.trim() || t(`types.${item.type}`)
              return (
                <article className="recent-transaction-row" key={item.id}>
                  <span className={`recent-transaction-icon ${income ? 'recent-icon-income' : 'recent-icon-expense'}`}>
                    {income ? <ArrowDownLeft size={17} /> : <ReceiptText size={17} />}
                  </span>
                  <span className="recent-transaction-details">
                    <strong>{title}</strong>
                    <span>{formatDate(item.transactionDate, language)}{item.description?.trim() && item.category?.trim() ? ` · ${item.description.trim()}` : ''}</span>
                  </span>
                  <strong className={`recent-transaction-amount ${income ? 'amount-income' : 'amount-expense'}`}>
                    {income ? '+' : '−'}{formatCurrency(item.amount, language, currency)}
                  </strong>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <div className="home-footer-note"><span className="home-footer-mark"><TrendingUp size={16} /></span><span>{t('footer.tagline')}</span></div>

      <button aria-label={t('home.quickAdd')} className="home-floating-add" onClick={() => setRecordKind('transaction')} type="button">
        <Plus size={24} /><span>{t('home.quickAdd')}</span>
      </button>

      {openingBalanceDialogOpen && (
        <OpeningBalanceModal amount={openingBalance.data?.amount ?? 0} onClose={() => setOpeningBalanceDialogOpen(false)} />
      )}

      {recordKind && (
        <ModalFrame title={t(`forms.add${recordKind[0].toUpperCase()}${recordKind.slice(1)}`)} onClose={() => {
          setRecordKind(null)
          setInvoiceName('')
        }}>
          {invoiceName && <p className="invoice-modal-note">{t('home.invoiceManualEntry', { name: invoiceName })}</p>}
          <CreateRecordForm
            kind={recordKind}
            onCancel={() => {
              setRecordKind(null)
              setInvoiceName('')
            }}
            onCreated={() => {
              setRecordKind(null)
              setInvoiceName('')
            }}
          />
        </ModalFrame>
      )}

      {smartTool === 'simulator' && (
        <ModalFrame title={t('home.whatIfTitle')} onClose={() => setSmartTool(null)}>
          <p className="smart-modal-copy">{t('home.simulatorDescription')}</p>
          <label className="simulator-field">
            <span>{t('home.purchaseAmount')}</span>
            <input min="0" onChange={(event) => setPurchaseAmount(event.target.value)} placeholder="0.00" step="0.01" type="number" value={purchaseAmount} />
          </label>
          {purchaseAmount && (
            <div className={`simulator-result ${purchaseIsSafe ? 'simulator-result-safe' : 'simulator-result-risk'}`} role="status">
              {purchaseIsSafe ? <CheckCircle2 size={18} /> : <TriangleAlert size={18} />}
              <span>
                <strong>{t(purchaseIsSafe ? 'home.purchaseLooksSafe' : 'home.purchaseAtRisk')}</strong>
                {t('home.lowestAfterPurchase', { amount: formatCurrency(lowestPostPurchase, language, currency) })}
              </span>
            </div>
          )}
        </ModalFrame>
      )}

      {smartTool === 'guidance' && (
        <ModalFrame title={t('home.askTitle')} onClose={() => setSmartTool(null)}>
          <p className="smart-modal-copy">{t('home.guidanceDisclaimer')}</p>
          {forecast.loading ? (
            <ResourceState loading empty={false} />
          ) : forecast.error ? (
            <ResourceState loading={false} error={forecast.error} retry={forecast.retry} empty={false} />
          ) : forecast.data?.shortageAlert ? (
            <div className="guidance-answer guidance-answer-risk">
              <strong>{t('home.guidanceShortage', {
                date: formatDate(forecast.data.shortageAlert.shortageDate, language),
                amount: formatCurrency(forecast.data.shortageAlert.shortageAmount, language, currency),
              })}</strong>
              <ul>{recommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}</ul>
            </div>
          ) : (
            <div className="guidance-answer guidance-answer-safe">
              <strong>{t('home.guidanceSafe', {
                date: forecast.data?.days?.length ? formatDate(forecast.data.days[forecast.data.days.length - 1].date, language) : '',
              })}</strong>
              <p>{t('home.guidanceNextStep')}</p>
            </div>
          )}
        </ModalFrame>
      )}
    </div>
  )
}
