import { useEffect, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Database,
  FilePlus2,
  PencilLine,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import CreateRecordForm from '../components/CreateRecordForm.jsx'
import OpeningBalanceModal from '../components/OpeningBalanceModal.jsx'
import useApiResource from '../hooks/useApiResource.js'
import {
  fetchCashFlowForecast,
  fetchDashboardSummary,
  fetchOpeningBalance,
  fetchTransactions,
} from '../services/api.js'
import useTranslation from '../i18n/useTranslation.js'
import { formatCurrency, formatDate } from '../i18n/formatters.js'
import {
  DEMO_MODE_CHANGED_EVENT,
  isDemoModeEnabled,
  setDemoModeEnabled,
} from '../services/demoData.js'

function CompactSparkline({ data, color, width = 80, height = 24 }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - 4) + 2
    const y = height - 2 - ((v - min) / range) * (height - 4)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible" aria-hidden="true">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CompactForecastChart({ days = [], language, currency, t }) {
  const width = 540
  const height = 180
  const padding = { top: 15, right: 20, bottom: 25, left: 55 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  const balances = days.length
    ? days.map((d) => Number(d.projectedBalance))
    : [148000, 151000, 149000, 158000, 162000, 168000, 172500]

  const min = Math.min(0, ...balances) * 0.95
  const max = Math.max(...balances) * 1.05
  const range = max - min || 1

  const getX = (idx) => padding.left + (idx / Math.max(balances.length - 1, 1)) * plotWidth
  const getY = (val) => padding.top + plotHeight - ((val - min) / range) * plotHeight

  const pts = balances.map((b, i) => `${getX(i)},${getY(b)}`).join(' ')
  const areaD = `M ${getX(0)} ${getY(balances[0])} ${balances.slice(1).map((b, i) => `L ${getX(i + 1)} ${getY(b)}`).join(' ')} L ${getX(balances.length - 1)} ${padding.top + plotHeight} L ${getX(0)} ${padding.top + plotHeight} Z`

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto block select-none">
        <defs>
          <linearGradient id="compactAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* Baseline grid */}
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + plotHeight}
          y2={padding.top + plotHeight}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
        />
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + plotHeight / 2}
          y2={padding.top + plotHeight / 2}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeDasharray="3 3"
        />
        {/* Area & line */}
        <path d={areaD} fill="url(#compactAreaGrad)" />
        <polyline
          points={pts}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* End dot */}
        <circle
          cx={getX(balances.length - 1)}
          cy={getY(balances[balances.length - 1])}
          r="4"
          fill="#ffffff"
          stroke="#6366f1"
          strokeWidth="2.5"
        />
        {/* Y-axis labels */}
        <text
          x={padding.left - 8}
          y={getY(max) + 4}
          textAnchor="end"
          className="fill-slate-400 text-[10px] font-mono"
        >
          {formatCurrency(max, language, currency)}
        </text>
        <text
          x={padding.left - 8}
          y={getY(min) - 2}
          textAnchor="end"
          className="fill-slate-400 text-[10px] font-mono"
        >
          {formatCurrency(min, language, currency)}
        </text>
        {/* X labels */}
        <text
          x={padding.left}
          y={height - 6}
          textAnchor="start"
          className="fill-slate-400 text-[10px]"
        >
          {t ? t('dashboard.chartToday') : 'Today'}
        </text>
        <text
          x={width - padding.right}
          y={height - 6}
          textAnchor="end"
          className="fill-slate-400 text-[10px]"
        >
          {t ? t('dashboard.chart30Days') : '+30 Days'}
        </text>
      </svg>
    </div>
  )
}

function ModalFrame({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 relative animate-in fade-in"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function KPICard({ title, value, trend, trendLabel, icon, iconBg, color, }) {
  return (
    <article className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-400/40 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center`}>
          <icon />
        </div>
      </div>
      <div>
        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <TrendingUp size={12} className="text-emerald-500" /> +{trend}%
        </span>
        <CompactSparkline data={[110, 115, 120, 128, 134, 142, 148]} color="#10b981" width={60} height={18} />
      </div>
    </article>
  )
}

export default function DashboardPage() {
  const { t, language, currency } = useTranslation()
  const [openingBalanceDialogOpen, setOpeningBalanceDialogOpen] = useState(false)
  const [recordKind, setRecordKind] = useState(null)
  const [demoMode, setDemoMode] = useState(() => isDemoModeEnabled())

  const summary = useApiResource(fetchDashboardSummary)
  const openingBalance = useApiResource(fetchOpeningBalance)
  const transactions = useApiResource(fetchTransactions)
  const forecast = useApiResource(fetchCashFlowForecast)

  const balance = Number(summary.data?.currentCashBalance ?? openingBalance.data?.amount ?? 148250)
  const income = Number(summary.data?.totalIncome ?? 42600)
  const expenses = Number(summary.data?.totalExpenses ?? 18340)
  const totalReceivables = Number(summary.data?.totalReceivables ?? 0)
  const totalPayables = Number(summary.data?.totalPayables ?? 0)

  // 30-day forecast end balance
  const forecastEnd = forecast.data?.days?.length
    ? Number(forecast.data.days[forecast.data.days.length - 1].projectedBalance)
    : balance + (income - expenses) * 0.95

  // Financial health score calculation
  const healthScore = Math.round(
    50 +
      (balance / 200000) * 20 +
      (income > 0 ? Math.min(10, Math.round(income / 5000)) : 0) +
      (totalReceivables > 0 ? Math.min(10, Math.round(totalReceivables / 25000)) : 0) -
      (totalPayables > 0 ? Math.min(10, Math.round(totalPayables / 25000)) : 0)
  )
  const healthColor = healthScore >= 80 ? 'emerald' : healthScore >= 60 ? 'indigo' : 'rose'

  // Recent 5 transactions
  const recentList = [...(transactions.data || [])]
    .sort((a, b) => (b.transactionDate || '').localeCompare(a.transactionDate || ''))
    .slice(0, 5)

  // Forecast data for mini chart
  const forecastDays = forecast.data?.days || []
  const forecastMiniData = forecastDays.map((d) => Number(d.projectedBalance))

  useEffect(() => {
    const syncDemoMode = () => setDemoMode(isDemoModeEnabled())
    window.addEventListener(DEMO_MODE_CHANGED_EVENT, syncDemoMode)
    return () => window.removeEventListener(DEMO_MODE_CHANGED_EVENT, syncDemoMode)
  }, [])

  return (
    <div className="fintech-dashboard max-w-7xl mx-auto pb-12">
      {/* Ambient background lights */}
      <div className="fintech-ambient-mesh">
        <div className="mesh-glow-1" />
        <div className="mesh-glow-2" />
      </div>

      {/* Top Control Bar */}
      <header className="fintech-header-bar mb-6">
        <div>
          <span className="fintech-kicker block mb-1">
            {t('dashboard.executiveCommand')}
          </span>
          <h1 className="fintech-title">
            {t('dashboard.overviewTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('dashboard.overviewSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpeningBalanceDialogOpen(true)}
            className="fintech-btn-pill flex items-center gap-2 text-xs font-semibold border shadow-sm hover:border-slate-400 transition-all"
            type="button"
          >
            <PencilLine size={13} />
            <span>{t('dashboard.baseCapital')}</span>
          </button>

          <button
            onClick={() => {
              const next = !demoMode
              setDemoModeEnabled(next)
              setDemoMode(next)
            }}
            className={`fintech-btn-pill flex items-center gap-2 text-xs font-semibold border shadow-sm transition-all ${
              demoMode
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
            type="button"
          >
            <Database size={13} />
            <span>{demoMode ? t('dashboard.demoActive') : t('dashboard.enableDemo')}</span>
          </button>
        </div>
      </header>

      {/* 1. Executive KPI Section */}
      <section aria-label="Executive KPIs" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KPICard
          title={t('dashboard.currentBalance')}
          value={formatCurrency(balance, language, currency)}
          trend="+18.4"
          trendLabel="%"
          icon={Wallet}
          iconBg="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
          color="#10b981"
        />
        <KPICard
          title={t('dashboard.totalIncome')}
          value={formatCurrency(income, language, currency)}
          trend="+12.8"
          trendLabel="%"
          icon={ArrowDownLeft}
          iconBg="bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400"
          color="#0d9488"
        />
        <KPICard
          title={t('dashboard.totalExpenses')}
          value={formatCurrency(expenses, language, currency)}
          trend="3.4"
          trendLabel="% controlled"
          icon={CreditCard}
          iconBg="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
          color="#f43f5e"
        />
        <KPICard
          title={t('dashboard.forecastedEndBalance')}
          value={formatCurrency(forecastEnd, language, currency)}
          trend="+9.1"
          trendLabel="% outlook"
          icon={Sparkles}
          iconBg="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
          color="#6366f1"
        />
        <KPICard
          title={t('dashboard.financialHealthScore')}
          value={`${healthScore}/100`}
          trend={healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Attention'}
          icon={
            <Bot size={20} className={healthColor === 'emerald' ? 'text-emerald-500' : healthColor === 'indigo' ? 'text-indigo-500' : 'text-rose-500'} />
          }
          iconBg={`bg-${healthColor}-50 dark:bg-${healthColor}-950/40 text-${healthColor}-600 dark:text-${healthColor}-400`}
          color={healthColor}
        />
      </section>

      {/* 2. Forecast & Insights Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left: 30-Day Cash Flow Forecast Chart */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                {t('dashboard.outlook30dTitle')}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('forecast.title')}
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-600 border border-emerald-200 dark:border-emerald-800">
              {t('dashboard.positiveTrajectory')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {t('dashboard.forecastDescription')}
          </p>
          <CompactForecastChart
            days={forecast.data?.days || []}
            language={language}
            currency={currency}
            t={t}
          />
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <span>{t('dashboard.minBuffer')}</span>
            <strong className="text-slate-900 dark:text-white font-semibold">
              {formatCurrency(balance * 0.92, language, currency)}
            </strong>
          </div>
        </div>

        {/* Right: AI Insights & Financial Health */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40 shadow-sm flex flex-col justify-between">
          {/* AI Pulse Bar */}
          <div className="h-1.5 bg-emerald-500/20 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-emerald-500 w-3/4 animate-pulse" />
          </div>

          {/* Health Score Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl bg-${healthColor}-600 text-white flex items-center justify-center`}>
                <Bot size={17} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('dashboard.aiTitle')}
                </h2>
                <span className="text-[10px] text-indigo-500 font-semibold">
                  {t('dashboard.aiTier')}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{healthScore}</span>
              <span className="text-xs text-slate-400">/100</span>
            </div>
          </div>

          {/* Core Summary Bullet Points */}
          <div className="space-y-3 my-3 text-sm">
            <div className="flex items-start gap-2 p-2 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-300">
                {t('dashboard.aiPoint1')}
              </span>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <ShieldCheck size={15} className="text-teal-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-300">
                {t('dashboard.aiPoint2')}
              </span>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <Sparkles size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-300">
                {t('dashboard.aiPoint3')}
              </span>
            </div>
          </div>

          {/* CTA to AI Assistant */}
          <Link
            to="/ai-assistant"
            className="mt-4 w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <span>{t('dashboard.askAiCopilotCta')}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 3. Recent Activity Section */}
      <section aria-label="Recent Financial Activity" className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('dashboard.recentActivity')}
          </h2>
          <Link
            to="/transactions"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>{t('dashboard.viewAllTransactions')}</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          {recentList.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentList.map((item) => {
                const isIncome = item.type === 'income'
                return (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isIncome
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div className="min-w-0">
                        <strong className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate block">
                          {item.category || item.description || t('dashboard.transactionFallback')}
                        </strong>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(item.transactionDate, language)} {item.description && `· ${item.description}`}
                        </span>
                      </div>
                    </div>
                    <strong
                      className={`text-xs sm:text-sm font-extrabold flex-shrink-0 ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {isIncome ? '+' : '−'}
                      {formatCurrency(item.amount, language, currency)}
                    </strong>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              {t('dashboard.noRecentActivity')}
            </div>
          )}
        </div>
      </section>

      {/* 4. Quick Actions Section */}
      <section aria-label="Quick Actions">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {t('home.quickActions')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setRecordKind('transaction')}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/20 transition-all flex items-center gap-3 text-left cursor-pointer group"
            type="button"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <FilePlus2 size={16} />
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                {t('home.addTransaction')}
              </strong>
              <span className="text-[10px] text-slate-400">
                {t('dashboard.recordFlow')}
              </span>
            </div>
          </button>

          <button
            onClick={() => setRecordKind('receivable')}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50/20 transition-all flex items-center gap-3 text-left cursor-pointer group"
            type="button"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <ArrowDownLeft size={16} />
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                {t('home.addReceivable')}
              </strong>
              <span className="text-[10px] text-slate-400">
                {t('dashboard.invoiceDebtor')}
              </span>
            </div>
          </button>

          <button
            onClick={() => setRecordKind('payable')}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-50/20 transition-all flex items-center gap-3 text-left cursor-pointer group"
            type="button"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <ArrowUpRight size={16} />
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                {t('home.addPayable')}
              </strong>
              <span className="text-[10px] text-slate-400">
                {t('dashboard.scheduleBill')}
              </span>
            </div>
          </button>

          <Link
            to="/ai-assistant"
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-50/20 transition-all flex items-center gap-3 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Bot size={16} />
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                {t('dashboard.askCopilot')}
              </strong>
              <span className="text-[10px] text-slate-400">
                {t('dashboard.financialAdvisor')}
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Opening Balance Modal */}
      {openingBalanceDialogOpen && (
        <OpeningBalanceModal
          amount={openingBalance.data?.amount ?? 0}
          onClose={() => setOpeningBalanceDialogOpen(false)}
        />
      )}

      {/* Record Creation Modal */}
      {recordKind && (
        <ModalFrame
          title={
            recordKind === 'transaction'
              ? t('dashboard.addTransactionModal')
              : recordKind === 'receivable'
                ? t('dashboard.addReceivableModal')
                : t('dashboard.addPayableModal')
          }
          onClose={() => setRecordKind(null)}
        >
          <CreateRecordForm
            kind={recordKind}
            onCancel={() => setRecordKind(null)}
            onCreated={() => {
              setRecordKind(null)
              summary.retry()
              transactions.retry()
              forecast.retry()
            }}
          />
        </ModalFrame>
      )}
    </div>
  )
}