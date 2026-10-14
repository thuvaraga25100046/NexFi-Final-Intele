import { useCallback } from 'react'
import { AlertCircle, ArrowRight, Bot, LoaderCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import AiChatCard from '../components/dashboard/AiChatCard.jsx'
import useApiResource from '../hooks/useApiResource.js'
import { fetchCashFlowForecast, fetchDashboardSummary } from '../services/api.js'

export default function AiCopilotPage() {
  const loadSummary = useCallback((signal) => fetchDashboardSummary({ signal }), [])
  const loadForecast = useCallback((signal) => fetchCashFlowForecast({ signal }), [])
  const summary = useApiResource(loadSummary)
  const forecast = useApiResource(loadForecast)

  if (summary.loading || forecast.loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-28 text-sm text-slate-500" role="status">
        <LoaderCircle className="animate-spin text-indigo-500" size={20} />
        Loading your financial context…
      </div>
    )
  }

  if (summary.error || forecast.error) {
    return (
      <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200" role="alert">
        <AlertCircle className="mt-0.5 shrink-0" size={18} />
        <div>
          <h1 className="font-bold">Could not load the financial context</h1>
          <p className="mt-1">{summary.error || forecast.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-10">
      <header className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-white via-indigo-50 to-violet-100 p-6 dark:border-indigo-900/60 dark:from-slate-900 dark:via-indigo-950/50 dark:to-violet-950/40 sm:p-8">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-indigo-600 dark:text-indigo-300">
          <Bot size={15} /> NexFi Financial Copilot
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Ask about your finances</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Answers use your recorded balance, cash-flow forecast, transactions, receivables, and payables. Add records to make the guidance more useful.
        </p>
      </header>

      <AiChatCard
        healthScore={0}
        balance={Number(summary.data?.currentCashBalance ?? 0)}
        income={Number(summary.data?.totalIncome ?? 0)}
        expenses={Number(summary.data?.totalExpenses ?? 0)}
        forecast={forecast.data}
        showAssistantLink={false}
      />
      <Link
        to="/what-if"
        className="flex items-center justify-between gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-sm font-bold text-indigo-800 transition-colors hover:border-indigo-400 dark:border-indigo-900/60 dark:bg-indigo-950/30 dark:text-indigo-200"
      >
        <span>Want to test a delayed payment or a new expense?</span>
        <span className="inline-flex shrink-0 items-center gap-2">Open What-If <ArrowRight size={16} /></span>
      </Link>
    </div>
  )
}
