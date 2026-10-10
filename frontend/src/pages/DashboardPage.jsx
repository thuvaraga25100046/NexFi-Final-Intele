import React from 'react'
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
import useTranslation from '../i18n/useTranslation.js'
import { formatCurrency, formatDate } from '../i18n/formatters.js'
import {
  DEMO_MODE_CHANGED_EVENT,
  isDemoModeEnabled,
  setDemoModeEnabled,
} from '../services/demoData.js'

function DashboardPage () {
  const { t, language, setLanguage, currency, setCurrency } = useTranslation()

  const [summary, summaryError, summaryRetry] = useApiResource ('/dashboard/summary')
  const [transactions, transactionsError, transactionsRetry] = useApiResource ('/dashboard/transactions')
  const [receivables, receivablesError, receivablesRetry] = useApiResource ('/dashboard/receivables')
  const [payables, payablesError, payablesRetry] = useApiResource ('/dashboard/payables')
  const [forecast, forecastError, forecastRetry] = useApiResource ('/dashboard/forecast')
  const [openingBalance, openingBalanceError, openingBalanceRetry] = useApiResource ('/dashboard/opening-balance')

  const [openingBalanceDialogOpen, setOpeningBalanceDialogOpen] = React.useState (false)
  const [recordKind, setRecordKind] = React.useState (null)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <SiteHeader variant="application" />

      <main className="flex-1 px-4 sm:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <section className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-400">
                  {t('dashboard.outlook30dTitle')}
                </span>
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                  {t('forecast.title')}
                </h2>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-200/70 shadow-sm flex flex-col justify-between">
            <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-4" />
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
                <span className="text-2xl font-black text-slate-950 dark:text-white">0</span>
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
            </div>
          </div>
        </div>

        {openingBalanceDialogOpen && (
          <OpeningBalanceModal
            amount={0}
            onClose={() => setOpeningBalanceDialogOpen (false)}
          />
        )}

        <section className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-sm bg-slate-900/80">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-4">
                Add Transaction
              </h3>
              <CreateRecordForm
                kind="transaction"
                onCancel={() => setRecordKind (null)}
                onCreated={() => {
                  setRecordKind (null)
                }}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default DashboardPage