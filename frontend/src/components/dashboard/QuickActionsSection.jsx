import { useRef, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Camera,
  Download,
  FilePlus2,
  FileSpreadsheet,
  Loader2,
  PlusCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

export default function QuickActionsSection({
  onAddTransaction,
  onAddReceivable,
  onAddPayable,
  onRunForecast,
  onScanReceipt,
}) {
  const [runningForecast, setRunningForecast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const fileInputRef = useRef(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage('') , 3000)
  }

  const handleRunForecast = () => {
    setRunningForecast(true)
    setTimeout(() => {
      setRunningForecast(false)
      if (onRunForecast) onRunForecast()
      showToast('✓ AI 30-day Monte Carlo simulation successfully recalculated!')
    }, 900)
  }

  const handleExportReport = () => {
    showToast('✓ Generating executive CSV financial ledger & audit report...')
    setTimeout(() => {
      // Create and trigger mock CSV download
      const headers = 'Date,Type,Category,Description,Amount,Currency\n'
      const rows = [
        '2026-10-09,Income,Client Retainer,Northstar Studio,385000,LKR\n',
        '2026-10-08,Expense,Cloud Infrastructure,AWS Auto-Debit,18400,LKR\n',
        '2026-10-06,Income,Consulting,Strategic Workshop,215000,LKR\n',
      ].join('')
      const blob = new Blob([headers + rows], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `NexFi-Financial-Report-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }, 700)
  }

  const actions = [
    {
      id: 'transaction',
      title: 'Add Transaction',
      subtitle: 'Record instant inflow or outflow',
      icon: PlusCircle,
      gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
      shadow: 'shadow-emerald-500/20 hover:shadow-emerald-500/30',
      onClick: onAddTransaction,
    },
    {
      id: 'receivable',
      title: 'Add Receivable',
      subtitle: 'Create client invoice tracker',
      icon: ArrowDownLeft,
      gradient: 'from-blue-600 via-indigo-600 to-blue-700',
      shadow: 'shadow-blue-500/20 hover:shadow-blue-500/30',
      onClick: onAddReceivable,
    },
    {
      id: 'payable',
      title: 'Add Payable',
      subtitle: 'Schedule upcoming vendor bill',
      icon: ArrowUpRight,
      gradient: 'from-amber-600 via-orange-600 to-amber-700',
      shadow: 'shadow-orange-500/20 hover:shadow-orange-500/30',
      onClick: onAddPayable,
    },
    {
      id: 'forecast',
      title: 'Run Forecast',
      subtitle: 'Refresh predictive cash model',
      icon: runningForecast ? Loader2 : Sparkles,
      iconClass: runningForecast ? 'animate-spin' : '',
      gradient: 'from-purple-600 via-violet-600 to-fuchsia-700',
      shadow: 'shadow-purple-500/20 hover:shadow-purple-500/30',
      onClick: handleRunForecast,
    },
    {
      id: 'export',
      title: 'Export Report',
      subtitle: 'Download audit CSV / PDF ledger',
      icon: Download,
      gradient: 'from-slate-700 via-slate-800 to-slate-900',
      shadow: 'shadow-slate-500/20 hover:shadow-slate-500/30',
      onClick: handleExportReport,
    },
  ]

  return (
    <section aria-label="Quick Financial Actions" className="w-full mb-6">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white border border-white/20 shadow-2xl flex items-center gap-2.5 animate-bounce text-xs font-semibold">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="fintech-kicker">High Velocity Tools</span>
          <span className="text-slate-400">·</span>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Quick Actions
          </h2>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-bold text-slate-500 hover:text-indigo-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          type="button"
        >
          <Camera size={14} />
          <span>Quick OCR Scanner</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file && onScanReceipt) {
              onScanReceipt(file)
            }
            e.target.value = ''
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {actions.map((act) => {
          const Icon = act.icon
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              className={`fintech-action-tile bg-gradient-to-r ${act.gradient} ${act.shadow} shadow-lg cursor-pointer group`}
              type="button"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Icon size={18} className={`text-white ${act.iconClass || ''}`} />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold text-white tracking-tight truncate">
                    {act.title}
                  </div>
                  <div className="text-[10px] text-white/80 truncate">
                    {act.subtitle}
                  </div>
                </div>
              </div>
              <ArrowRight
                size={14}
                className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0"
              />
            </button>
          )
        })}
      </div>
    </section>
  )
}
