import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Database,
  Moon,
  PencilLine,
  Plus,
  RefreshCw,
  Sparkles,
  Sun,
  TriangleAlert,
  Wallet,
  X,
} from 'lucide-react'
import ExecutiveKPISection from '../components/dashboard/ExecutiveKPISection.jsx'
import AiInsightsPanel from '../components/dashboard/AiInsightsPanel.jsx'
import AdvancedForecastSection from '../components/dashboard/AdvancedForecastSection.jsx'
import QuickActionsSection from '../components/dashboard/QuickActionsSection.jsx'
import FinancialOverviewGrid from '../components/dashboard/FinancialOverviewGrid.jsx'
import RiskMonitoringPanel from '../components/dashboard/RiskMonitoringPanel.jsx'
import SmartAnalyticsSection from '../components/dashboard/SmartAnalyticsSection.jsx'
import ActivityTimeline from '../components/dashboard/ActivityTimeline.jsx'
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
import {
  DEMO_MODE_CHANGED_EVENT,
  DEMO_MODE_KEY,
  isDemoModeEnabled,
  setDemoModeEnabled,
} from '../services/demoData.js'
import '../components/dashboard/dashboard.css'

function localDate(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function ModalFrame({ title, onClose, children }) {
  const { t } = useTranslation()
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        aria-label={title}
        aria-modal="true"
        role="dialog"
        className="w-full max-w-lg rounded-2xl bg-slate-900 text-white border border-white/10 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <h2 className="text-base font-extrabold text-white tracking-tight">{title}</h2>
          <button
            aria-label={t('actions.close')}
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
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
  const [smartTool, setSmartTool] = useState(null)
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [invoiceName, setInvoiceName] = useState('')
  const [demoMode, setDemoMode] = useState(() => isDemoModeEnabled())
  const [demoModeError, setDemoModeError] = useState('')

  // Dark Mode State - Default to sleek dark fintech theme
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('nexfi_dashboard_theme')
    return saved !== null ? saved === 'dark' : true
  })

  const toggleTheme = () => {
    const next = !isDarkMode
    setIsDarkMode(next)
    localStorage.setItem('nexfi_dashboard_theme', next ? 'dark' : 'light')
  }

  // Load backend / demo resources
  const summary = useApiResource(fetchDashboardSummary)
  const openingBalance = useApiResource(fetchOpeningBalance)
  const transactions = useApiResource(fetchTransactions)
  const receivables = useApiResource(fetchReceivables)
  const payables = useApiResource(fetchPayables)
  const forecast = useApiResource(fetchCashFlowForecast)

  // Demo mode synchronization
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

  // Sync html element dark class for complete consistency
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const lowestPostPurchase = (forecast.data?.days ?? []).reduce(
    (lowest, day) =>
      Math.min(
        lowest,
        Number(day.projectedBalance || 0) - (Number(purchaseAmount) || 0),
      ),
    Number(forecast.data?.openingBalance || 0) - (Number(purchaseAmount) || 0),
  )
  const purchaseIsSafe = lowestPostPurchase >= 0

  return (
    <div
      className={`fintech-dashboard ${
        isDarkMode ? 'fintech-dark' : 'fintech-light'
      } relative overflow-hidden`}
    >
      {/* Ambient Radial Lights */}
      <div className="fintech-ambient-mesh" aria-hidden="true">
        <div className="mesh-glow-1" />
        <div className="mesh-glow-2" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Top Control & Greeting Bar */}
        <header className="fintech-header-bar">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="fintech-kicker">NexFi Intelligence Suite</span>
              <span className="fintech-status-dot emerald" />
              <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
                Production Connected
              </span>
            </div>
            <h1 className="fintech-title">
              Executive Financial Command Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live multi-currency treasury analytics, liquidity forecasts & AI risk sentinel
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={toggleTheme}
              className="fintech-btn-pill cursor-pointer"
              type="button"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <>
                  <Sun size={14} className="text-amber-400" />
                  <span>Light View</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-indigo-400" />
                  <span>Obsidian Dark</span>
                </>
              )}
            </button>

            {/* Opening Balance Modal Trigger */}
            <button
              onClick={() => setOpeningBalanceDialogOpen(true)}
              className="fintech-btn-pill cursor-pointer"
              type="button"
            >
              <PencilLine size={13} />
              <span>Base Capital</span>
            </button>

            {/* Demo Mode Toggle */}
            <button
              onClick={() => {
                const nextState = !demoMode
                try {
                  setDemoModeEnabled(nextState)
                  setDemoMode(nextState)
                  setDemoModeError('')
                } catch (err) {
                  setDemoModeError(err.message || 'Demo mode error')
                }
              }}
              className={`fintech-btn-pill cursor-pointer ${
                demoMode ? 'active' : ''
              }`}
              type="button"
            >
              <Database size={13} />
              <span>{demoMode ? 'Demo Sandbox Active' : 'Enable Demo Sandbox'}</span>
            </button>
          </div>
        </header>

        {demoModeError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{demoModeError}</span>
          </div>
        )}

        {/* 1. Executive Summary Section (4 KPI cards with sparklines & trends) */}
        <ExecutiveKPISection
          summary={summary.data}
          forecast={forecast.data}
          language={language}
          currency={currency}
        />

        {/* 2. AI Insights Panel (Health Score 92/100, Futuristic styling, 4 AI Insights) */}
        <AiInsightsPanel
          onOpenSimulator={() => setSmartTool('simulator')}
          onOpenGuidance={() => setSmartTool('guidance')}
        />

        {/* 3. Advanced Forecast Section (Interactive Cash Flow Line Chart) */}
        <AdvancedForecastSection
          forecastData={forecast.data}
          language={language}
          currency={currency}
        />

        {/* 4. Quick Actions Section (Colorful gradient action cards) */}
        <QuickActionsSection
          onAddTransaction={() => setRecordKind('transaction')}
          onAddReceivable={() => setRecordKind('receivable')}
          onAddPayable={() => setRecordKind('payable')}
          onRunForecast={() => forecast.retry()}
          onScanReceipt={(file) => {
            setInvoiceName(file.name)
            setRecordKind('transaction')
          }}
        />

        {/* 5. Financial Overview Grid (Upcoming Receivables, Payables, Overdue, Recent Transactions) */}
        <FinancialOverviewGrid
          receivables={receivables.data}
          payables={payables.data}
          transactions={transactions.data}
          language={language}
          currency={currency}
        />

        {/* 6. Risk Monitoring Panel (Low, Medium, High Risk cards + shortages & actions) */}
        <RiskMonitoringPanel
          onRunSimulation={() => setSmartTool('simulator')}
          language={language}
          currency={currency}
        />

        {/* 7. Smart Analytics (Income vs Expense, Spending Donut, Collection Rate, Payment Performance) */}
        <SmartAnalyticsSection language={language} currency={currency} />

        {/* 8. Activity Timeline (Audit trail with illuminated nodes) */}
        <ActivityTimeline />
      </div>

      {/* Floating Quick Action Button for Mobile */}
      <button
        aria-label="Add Transaction"
        onClick={() => setRecordKind('transaction')}
        className="fixed bottom-6 right-6 lg:hidden z-40 w-13 h-13 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
        type="button"
      >
        <Plus size={24} />
      </button>

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
          title={t(`forms.add${recordKind[0].toUpperCase()}${recordKind.slice(1)}`)}
          onClose={() => {
            setRecordKind(null)
            setInvoiceName('')
          }}
        >
          {invoiceName && (
            <p className="mb-3 text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
              Receipt OCR scanned: <strong>{invoiceName}</strong>
            </p>
          )}
          <CreateRecordForm
            kind={recordKind}
            onCancel={() => {
              setRecordKind(null)
              setInvoiceName('')
            }}
            onCreated={() => {
              setRecordKind(null)
              setInvoiceName('')
              summary.retry()
              transactions.retry()
              receivables.retry()
              payables.retry()
              forecast.retry()
            }}
          />
        </ModalFrame>
      )}

      {/* What-If Simulator Modal */}
      {smartTool === 'simulator' && (
        <ModalFrame
          title="What-If Scenario Simulator"
          onClose={() => setSmartTool(null)}
        >
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Test how a major capital expenditure, equipment acquisition, or emergency outflow affects your 30-day working capital buffer.
          </p>
          <label className="block mb-4">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Simulated Purchase / Outflow Amount
            </span>
            <input
              type="number"
              min="0"
              step="100"
              placeholder="e.g. 50000"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </label>
          {purchaseAmount && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                purchaseIsSafe
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              {purchaseIsSafe ? <CheckCircle2 size={18} /> : <TriangleAlert size={18} />}
              <div className="text-xs">
                <strong className="block font-bold">
                  {purchaseIsSafe ? 'Safe to Execute' : 'Liquidity Deficit Warning'}
                </strong>
                <span>
                  Lowest projected balance after simulated expense:{' '}
                  {formatCurrency(lowestPostPurchase, language, currency)}
                </span>
              </div>
            </div>
          )}
        </ModalFrame>
      )}

      {/* AI Financial Guidance Modal */}
      {smartTool === 'guidance' && (
        <ModalFrame
          title="NexFi AI Financial Copilot"
          onClose={() => setSmartTool(null)}
        >
          <div className="space-y-3.5 text-xs">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              <div className="flex items-center gap-2 font-bold mb-1">
                <Sparkles size={15} />
                <span>Executive Strategy Summary</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Operating cash reserves are optimal at 2.4x coverage. Recommended action is to capture early supplier discounts while preserving a $15,000 baseline reserve.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-white uppercase text-[10px] tracking-wider">
                Automated Directives
              </h3>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Maintain scheduled receivables collection timeline.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Sweep $25,000 into overnight yield facility.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Dunning sequence primed for overdue invoice #INV-2026-088.</span>
                </li>
              </ul>
            </div>
          </div>
        </ModalFrame>
      )}
    </div>
  )
}
