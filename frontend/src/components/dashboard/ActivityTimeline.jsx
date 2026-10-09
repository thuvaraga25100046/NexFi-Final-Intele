import { useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock,
  Filter,
  Receipt,
  Sparkles,
  Zap,
} from 'lucide-react'

export default function ActivityTimeline() {
  const [filter, setFilter] = useState('all')

  const activities = [
    {
      id: 'act-1',
      type: 'transaction',
      title: 'Invoice Received',
      description: 'Acme Global settled Invoice #INV-2026-088 via automated Stripe wire transfer.',
      amount: '+$12,450.00',
      time: '14 minutes ago',
      icon: ArrowDownLeft,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      badge: 'Settled',
      badgeClass: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      id: 'act-2',
      type: 'transaction',
      title: 'Payment Completed',
      description: 'AWS Cloud Infrastructure auto-debit processed for primary cluster hosting.',
      amount: '-$2,840.00',
      time: '2 hours ago',
      icon: ArrowUpRight,
      color: '#f43f5e',
      bg: 'rgba(244, 63, 94, 0.12)',
      badge: 'Auto-Paid',
      badgeClass: 'text-rose-400 bg-rose-500/10',
    },
    {
      id: 'act-3',
      type: 'ai',
      title: 'Forecast Generated',
      description: 'NexFi AI Engine completed 30-day Monte Carlo simulation (99.4% confidence score).',
      amount: '30D Horizon',
      time: '5 hours ago',
      icon: Sparkles,
      color: '#818cf8',
      bg: 'rgba(129, 140, 248, 0.14)',
      badge: 'Model v4.2',
      badgeClass: 'text-indigo-400 bg-indigo-500/10',
    },
    {
      id: 'act-4',
      type: 'ai',
      title: 'AI Recommendation Added',
      description: 'Identified 2% early-pay supplier discount opportunity on Vertex bill ($240 savings).',
      amount: '+$240 Optimization',
      time: 'Today at 09:15 AM',
      icon: Bot,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      badge: 'Optimization',
      badgeClass: 'text-amber-400 bg-amber-500/10',
    },
    {
      id: 'act-5',
      type: 'system',
      title: 'Receivable Dispatched',
      description: 'Issued statement of work milestone invoice to Orion Labs with automated follow-ups.',
      amount: '+$8,900.00',
      time: 'Yesterday at 04:30 PM',
      icon: Receipt,
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.12)',
      badge: 'Sent',
      badgeClass: 'text-cyan-400 bg-cyan-500/10',
    },
  ]

  const filtered = activities.filter((a) => {
    if (filter === 'all') return true
    return a.type === filter
  })

  return (
    <section aria-label="Activity Audit Timeline" className="w-full mb-6">
      <div className="fintech-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <span className="fintech-kicker">Live Ledger Stream</span>
              <span className="text-slate-400">·</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400">
                Audited
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
              Activity Timeline
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/80 dark:border-white/5">
            {[
              { id: 'all', label: 'All Stream' },
              { id: 'transaction', label: 'Transactions' },
              { id: 'ai', label: 'AI Events' },
              { id: 'system', label: 'Invoices' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === f.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                type="button"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Items */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[17px] sm:before:left-[21px] before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
          {filtered.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.id} className="relative group">
                {/* Node Dot */}
                <div
                  className="absolute -left-[25px] sm:-left-[29px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md group-hover:scale-125 transition-transform"
                  style={{ backgroundColor: item.color }}
                >
                  <Icon size={12} className="text-white" strokeWidth={3} />
                </div>

                {/* Content Card */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeClass}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 flex-shrink-0">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {item.amount}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock size={11} />
                      {item.time}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
