import React, { useEffect, useState } from 'react'
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

function CompactSparkline({ data = [0, 0, 0, 0, 0, 0, 0], color, width = 80, height = 24 }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * (width - 4) + 2
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
    : [0, 0, 0, 0, 0, 0, 0]

  const min = Math.min(0, ...balances)
  const max = Math.max(...balances) || 1
  const range = max - min || 1

  const getX = (idx) => padding.left + (idx / Math.max(balances.length - 1, 1)) * plotWidth
  const getY = (val) => padding.top + plotHeight - ((val - min) / range) * plotHeight

  const pts = balances.map((b, i) => `${getX(i)},${getY(b)}`).join(' ')
  const lastX = getX(balances.length - 1)
  const firstX = getX(0)
  const bottomY = padding.top + plotHeight
  
  const pathSegments = balances.map((b, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(b)}`)
  const areaD = `${pathSegments.join(' ')} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto block select-none">
        <defs>
          <linearGradient id="compactAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + plotHeight}
          y2={padding.top + plotHeight}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-800"
        />
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + plotHeight / 2}
          y2={padding.top + plotHeight / 2}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-800"
          strokeDasharray="3 3"
        />
        <path d={areaD} fill="url(#compactAreaGrad)" />
        <polyline
          points={pts}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={lastX}
          cy={getY(balances[balances.length - 1])}
          r="4"
          fill="#ffffff"
          stroke="#6366f1"
          strokeWidth="2.5"
        />
        <text
          x={padding.left - 8}
          y={getY(max) + 4}
          textAnchor="end"
          className="fill-slate-900 dark:fill-slate-100 text-[10px] font-mono font-bold"
        >
          {formatCurrency(max, language, currency)}
        </text>
        <text
          x={padding.left - 8}
          y={getY(min) - 2}
          textAnchor="end"
          className="fill-slate-900 dark:fill-slate-100 text-[10px] font-mono font-bold"
        >
          {formatCurrency(min, language, currency)}
        </text>
        <text
          x={padding.left}
          y={height - 6}
          textAnchor="start"
          className="fill-slate-900 dark:fill-slate-100 text-[10px] font-bold"
        >
          {t ? t('dashboard.chartToday') : 'Today'}
        </text>
        <text
          x={width - padding.right}
          y={height - 6}
          textAnchor="end"
          className="fill-slate-900 dark:fill-slate-100 text-[10px] font-bold"
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

function KPICard({ title, value, trend, trendLabel, icon: IconProp, iconBg, color }) {
  return (
    <article className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-400/40 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-950 dark:text-slate-100">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center`}>
          {typeof IconProp === 'function' ? (
            <IconProp size={18} />
          ) : React.isValidElement(IconProp) ? (
            IconProp
          ) : (
            <Bot size={18} />
          )}
        </div>
      </div>
      <div>
        <div className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">
          {value}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-slate-950 dark:text-slate-100 font-extrabold">
          <TrendingUp size={12} className="text-emerald-500" /> {trend} {trendLabel}
        </span>
        <CompactSparkline data={[0, 0, 0, 0, 0, 0, 0]} color="#10b981" width={60} height={18} />
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

  const balance = Number(summary.data?.currentCashBalance ?? openingBalance.data?.amount ?? 0)
  const income = Number(summary.data?.totalIncome ?? 0)
  const expenses = Number(summary.data?.totalExpenses ?? 0)

  const forecastEnd = forecast.data?.days?.length
    ? Number(forecast.data.days[forecast.data.days.length - 1].projectedBalance)
    : balance + income - expenses

  const healthScore = balance === 0 && income === 0 && expenses === 0 ? 0 : Math.round(
    50 +
      (balance / 200000) * 20 +
      (income > 0 ? Math.min(10, Math.round(income / 5000)) : 0)
  )
  const healthColor = healthScore >= 80 ? 'emerald' : healthScore >= 60 ? 'indigo' : 'slate'

  useEffect(() => {
    const syncDemoMode = () => setDemoMode(isDemoModeEnabled())
    window.addEventListener(DEMO_MODE_CHANGED_EVENT, syncDemoMode)
    return () => window.removeEventListener(DEMO_MODE_CHANGED_EVENT, syncDemoMode)
  }, [])

  return (
    <div className="fintech-dashboard max-w-7xl mx-auto pb-12">
      <div className="fintech-ambient-mesh">
        <div className="mesh-glow-1" />
        <div className="mesh-glow-2" />
      </div>

      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-slate-300 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg bg-indigo-900 text-white border border-indigo-700 shadow-sm">
              {t('dashboard.executiveCommand')}
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: '#0f172a' }}>
            {t('dashboard.overviewTitle')}
          </h1>
          <p className="text-sm font-bold mt-1" style={{ color: '#334155' }}>
            {t('dashboard.overviewSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setOpeningBalanceDialogOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-950 dark:text-white border border-slate-400 dark:border-slate-700 shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            type="button"
          >
            <PencilLine size={15} className="text-slate-950 dark:text-white" />
            <span>{t('dashboard.baseCapital')}</span>
          </button>

          
        </div>
      </header>

      <section aria-label="Executive KPIs" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KPICard
          title={t('dashboard.currentBalance')}
          value={formatCurrency(balance, language, currency)}
          trend="0.0"
          trendLabel="%"
          icon={Wallet}
          iconBg="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
          color="#10b981"
        />
        <KPICard
          title={t('dashboard.totalIncome')}
          value={formatCurrency(income, language, currency)}
          trend="0.0"
          trendLabel="%"
          icon={ArrowDownLeft}
          iconBg="bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400"
          color="#0d9488"
        />
        <KPICard
          title={t('dashboard.totalExpenses')}
          value={formatCurrency(expenses, language, currency)}
          trend="0.0"
          trendLabel="%"
          icon={CreditCard}
          iconBg="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
          color="#f43f5e"
        />
        <KPICard
          title={t('dashboard.forecastedEndBalance')}
          value={formatCurrency(forecastEnd, language, currency)}
          trend="0.0"
          trendLabel="%"
          icon={Sparkles}
          iconBg="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
          color="#6366f1"
        />
        <KPICard
          title={t('dashboard.financialHealthScore')}
          value={`${healthScore}/100`}
          trend="Initial"
          trendLabel=""
          icon={Bot}
          iconBg={`bg-${healthColor}-50 dark:bg-${healthColor}-950/40 text-${healthColor}-600 dark:text-${healthColor}-400`}
          color={healthColor}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-400">
                {t('dashboard.outlook30dTitle')}
              </span>
              <h2 className="text-base font-bold text-slate-950 dark:text-white">
                {t('forecast.title')}
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              {t('dashboard.neutralTrajectory') || 'Stable'}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-3">
            {t('dashboard.forecastDescription')}
          </p>
          <CompactForecastChart
            days={forecast.data?.days || []}
            language={language}
            currency={currency}
            t={t}
          />
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-900 dark:text-slate-100 font-bold">
            <span>{t('dashboard.minBuffer')}</span>
            <strong className="text-slate-950 dark:text-white font-black">
              {formatCurrency(0, language, currency)}
            </strong>
          </div>
        </div>

        <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40 shadow-sm flex flex-col justify-between">
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-indigo-500 w-0" />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Bot size={17} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                  {t('dashboard.aiTitle')}
                </h2>
                <span className="text-[11px] text-indigo-950 dark:text-indigo-300 font-bold">
                  {t('dashboard.aiTier')}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-950 dark:text-white">{healthScore}</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-300">/100</span>
            </div>
          </div>

          <div className="space-y-3 my-3 text-sm">
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 shadow-sm">
              <CheckCircle2 size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
              

          <Link
            to="/ai-assistant"
            className="mt-4 w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
          >
            <span>{t('dashboard.askAiCopilotCta')}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {openingBalanceDialogOpen && (
        <OpeningBalanceModal
          amount={openingBalance.data?.amount ?? 0}
          onClose={() => setOpeningBalanceDialogOpen(false)}
        />
      )}

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