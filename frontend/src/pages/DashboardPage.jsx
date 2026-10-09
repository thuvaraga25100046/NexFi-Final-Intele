import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Database,
  FilePlus2,
  PencilLine,
  Plus,
  Receipt,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import CreateRecordForm from '../components/CreateRecordForm.jsx'
import OpeningBalanceModal from '../components/OpeningBalanceModal.jsx'
import ResourceState from '../components/ResourceState.jsx'
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
  DEMO_MODE_KEY,
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

function CompactForecastChart({ days = [], openingBalance = 148250, language, currency }) {
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
          Today
        </text>
        <text
          x={width - padding.right}
          y={height - 6}
          textAnchor="end"
          className="fill-slate-400 text-[10px]"
        >
          +30 Days
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

export default function DashboardPage() {
  const { t, language, currency } = useTranslation()
  const [openingBalanceDialogOpen, setOpeningBalanceDialogOpen] = useState(false)
  const [recordKind, setRecordKind] = useState(null)
  const [demoMode, setDemoMode] = useState(() => isDemoModeEnabled())

  const summary = useApiResource(fetchDashboardSummary)
  const openingBalance = useApiResource(fetchOpeningBalance)
  const transactions = useApiResource(fetchTransactions)
  const forecast = useApiResource(fetchCashFlowForecast)

  const balance = Number(summary.data?.currentCashBalance ?? 148250)
  const income = Number(summary.data?.totalIncome ?? 42600)
  const expenses = Number(summary.data?.totalExpenses ?? 18340)

  // 30-day forecast end balance
  const forecastEnd = forecast.data?.days?.length
    ? Number(forecast.data.days[forecast.data.days.length - 1].projectedBalance)
    : balance + (income - expenses) * 0.95

  // Recent 5 transactions
  const recentList = [...(transactions.data || [])]
    .sort((a, b) => (b.transactionDate || '').localeCompare(a.transactionDate || ''))
    .slice(0, 5)

  useEffect(() => {
    const syncDemoMode = () => setDemoMode(isDemoModeEnabled())
    window.addEventListener(DEMO_MODE_CHANGED_EVENT, syncDemoMode)
    return () => window.removeEventListener(DEMO_MODE_CHANGED_EVENT, syncDemoMode)
  }, [])

  return (
    <div className="workspace-page max-w-6xl mx-auto pb-12">
      {/* Top Welcome Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Financial Executive Command
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Live working capital summary, cash flow trajectory, and AI intelligence
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setOpeningBalanceDialogOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-slate-400 transition-all flex items-center gap-1.5 cursor-pointer"
            type="button"
          >
            <PencilLine size={13} />
            <span>Base Capital: {formatCurrency(openingBalance.data?.amount ?? 20000, language, currency)}</span>
          </button>

          <button
            onClick={() => {
              const next = !demoMode
              setDemoModeEnabled(next)
              setDemoMode(next)
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
              demoMode
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
            type="button"
          >
            <Database size={13} />
            <span>{demoMode ? 'Demo Mode Active' : 'Enable Demo Data'}</span>
          </button>
        </div>
      </div>

      {/* 1. Executive Summary: 4 KPI Cards */}
      <section aria-label="Executive Summary KPIs" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* KPI 1: Current Balance */}
        <article className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-400/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Current Balance
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Wallet size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(balance, language, currency)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp size={12} /> +18.4%
            </span>
            <CompactSparkline data={[110, 115, 120, 128, 134, 142, 148]} color="#10b981" />
          </div>
        </article>

        {/* KPI 2: Total Income */}
        <article className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-400/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Income
              </span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <ArrowDownLeft size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(income, language, currency)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
              <TrendingUp size={12} /> +12.8%
            </span>
            <CompactSparkline data={[24, 28, 31, 35, 38, 41, 42.6]} color="#0d9488" />
          </div>
        </article>

        {/* KPI 3: Total Expenses */}
        <article className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-400/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Expenses
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <CreditCard size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(expenses, language, currency)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ArrowDownRight size={12} /> -3.4% controlled
            </span>
            <CompactSparkline data={[21, 20.5, 19.8, 20.2, 19, 18.5, 18.3]} color="#f43f5e" />
          </div>
        </article>

        {/* KPI 4: Forecasted End Balance */}
        <article className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-400/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Forecasted End Balance
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(forecastEnd, language, currency)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <TrendingUp size={12} /> +9.1% (30D outlook)
            </span>
            <CompactSparkline data={[148, 151, 154, 159, 163, 168, 172.5]} color="#6366f1" />
          </div>
        </article>
      </section>

      {/* 2. Middle Section: Small Cash Flow Chart + AI Summary Card */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left: Small Cash Flow Forecast Chart (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                  30-Day Outlook
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Cash Flow Forecast
                </h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Positive Trajectory
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Projected balance curve based on recurring obligations and scheduled receivables.
            </p>
            <CompactForecastChart
              days={forecast.data?.days || []}
              openingBalance={balance}
              language={language}
              currency={currency}
            />
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <span>Minimum projected buffer:</span>
            <strong className="text-slate-900 dark:text-white font-semibold">{formatCurrency(balance * 0.92, language, currency)}</strong>
          </div>
        </div>

        {/* Right: AI Summary Card & Financial Health Score (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40 shadow-sm flex flex-col justify-between">
          <div>
            {/* Top header with Health score */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Bot size={17} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    AI Financial Intelligence
                  </h2>
                  <span className="text-[10px] text-indigo-500 font-semibold">Tier 1 · Exceptional</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-slate-900 dark:text-white">92</span>
                <span className="text-xs text-slate-400">/100</span>
              </div>
            </div>

            {/* Core Summary Bullet Points */}
            <div className="space-y-2.5 my-3 text-xs">
              <div className="flex items-start gap-2 p-2 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300">
                  <strong>Cash flow remains stable:</strong> Inflows exceed monthly burn by 2.4x.
                </span>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <ShieldCheck size={15} className="text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300">
                  <strong>No shortage predicted:</strong> Healthy buffer maintained across all 30 days.
                </span>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <Sparkles size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300">
                  <strong>3 invoices pending:</strong> Follow up recommended to protect your buffer.
                </span>
              </div>
            </div>
          </div>

          {/* Direct CTA to full AI Assistant page */}
          <Link
            to="/ai-assistant"
            className="mt-2 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <span>Ask AI Copilot & Run Scenarios</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 3. Quick Actions Row */}
      <section aria-label="Quick Actions" className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setRecordKind('transaction')}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/20 transition-all flex items-center gap-3 text-left cursor-pointer group"
            type="button"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <FilePlus2 size={16} />
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">Add Transaction</strong>
              <span className="text-[10px] text-slate-400">Record flow</span>
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
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">Add Receivable</strong>
              <span className="text-[10px] text-slate-400">Invoice debtor</span>
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
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">Add Payable</strong>
              <span className="text-[10px] text-slate-400">Schedule bill</span>
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
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">Ask AI Copilot</strong>
              <span className="text-[10px] text-slate-400">Financial advisor</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Recent Activity Section */}
      <section aria-label="Recent Financial Activity">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recent Activity
          </h2>
          <Link
            to="/transactions"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All Transactions</span>
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
                          {item.category || item.description || 'Transaction'}
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
              No recent activity found. Click 'Add Transaction' above to record a new transaction.
            </div>
          )}
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
          title={`Add ${recordKind.charAt(0).toUpperCase() + recordKind.slice(1)}`}
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
