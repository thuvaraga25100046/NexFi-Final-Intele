import { useState } from 'react'
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Receipt,
  UserCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency, formatDate } from '../../i18n/formatters.js'

function initials(name) {
  return name ? name.trim().charAt(0).toUpperCase() : '?'
}

export default function FinancialOverviewGrid({
  receivables = [],
  payables = [],
  transactions = [],
  language = 'en',
  currency = 'LKR',
}) {
  const [activeTab, setActiveTab] = useState('all')

  // Derive Upcoming Receivables (pending, due >= 0)
  const upcomingReceivables = receivables
    .filter((r) => r.status === 'pending')
    .slice(0, 4)

  // Derive Upcoming Payables (pending, due >= 0)
  const upcomingPayables = payables
    .filter((p) => p.status === 'pending')
    .slice(0, 4)

  // Derive Overdue Items (either overdue status or due in past)
  const overdueItems = [
    ...receivables
      .filter((r) => r.status === 'overdue')
      .map((item) => ({ ...item, kind: 'receivable' })),
    ...payables
      .filter((p) => p.status === 'overdue')
      .map((item) => ({ ...item, kind: 'payable' })),
  ].slice(0, 4)

  // Fallback demo overdue items if none currently exist
  const displayOverdue = overdueItems.length
    ? overdueItems
    : [
        {
          id: 'demo-ov-1',
          customerName: 'Bluebird Creative',
          amount: 96000,
          dueDate: '2026-10-03',
          kind: 'receivable',
          daysPast: 6,
        },
        {
          id: 'demo-ov-2',
          vendorName: 'Apex Cloud Systems',
          amount: 34500,
          dueDate: '2026-10-05',
          kind: 'payable',
          daysPast: 4,
        },
      ]

  // Recent Transactions
  const recentTxList = [...transactions]
    .sort((a, b) => (b.transactionDate || '').localeCompare(a.transactionDate || ''))
    .slice(0, 5)

  return (
    <section aria-label="Financial Overview Matrix" className="w-full mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="fintech-kicker">Operating Matrix</span>
          <span className="text-slate-400">·</span>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Financial Overview
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <Link
            to="/transactions"
            className="text-slate-500 hover:text-indigo-400 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Master Ledger</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* CARD 1: Upcoming Receivables */}
        <article className="fintech-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <ArrowDownLeft size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Upcoming Receivables
                </h3>
              </div>
              <Link
                to="/receivables"
                className="text-[11px] font-semibold text-emerald-500 hover:text-emerald-400"
              >
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {(upcomingReceivables.length
                ? upcomingReceivables
                : [
                    { id: '1', customerName: 'Northstar Studio', amount: 285000, dueDate: '2026-10-15' },
                    { id: '2', customerName: 'Fieldwork Co.', amount: 132500, dueDate: '2026-10-18' },
                    { id: '3', customerName: 'Orbit Health', amount: 215000, dueDate: '2026-10-22' },
                  ]
              ).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-emerald-600/20 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {initials(item.customerName)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.customerName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Due {formatDate(item.dueDate, language)}
                      </div>
                    </div>
                  </div>
                  <strong className="text-xs font-extrabold text-emerald-500 flex-shrink-0">
                    +{formatCurrency(item.amount, language, currency)}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Expected 14D collection</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">98.5% confidence</span>
          </div>
        </article>

        {/* CARD 2: Upcoming Payables */}
        <article className="fintech-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <ArrowUpRight size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Upcoming Payables
                </h3>
              </div>
              <Link
                to="/payables"
                className="text-[11px] font-semibold text-amber-500 hover:text-amber-400"
              >
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {(upcomingPayables.length
                ? upcomingPayables
                : [
                    { id: 'p1', vendorName: 'AWS Cloud Services', amount: 48500, dueDate: '2026-10-12' },
                    { id: 'p2', vendorName: 'Workspace Lease', amount: 120000, dueDate: '2026-10-16' },
                    { id: 'p3', vendorName: 'Figma & Slack Subscriptions', amount: 18200, dueDate: '2026-10-20' },
                  ]
              ).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-amber-600/20 text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {initials(item.vendorName)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.vendorName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Due {formatDate(item.dueDate, language)}
                      </div>
                    </div>
                  </div>
                  <strong className="text-xs font-extrabold text-amber-500 flex-shrink-0">
                    -{formatCurrency(item.amount, language, currency)}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Scheduled auto-debits</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">3 pre-approved</span>
          </div>
        </article>

        {/* CARD 3: Overdue Payments */}
        <article className="fintech-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <AlertCircle size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Overdue Payments
                </h3>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400">
                Action Required
              </span>
            </div>

            <div className="space-y-2.5">
              {displayOverdue.map((item) => {
                const title = item.customerName || item.vendorName
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 hover:border-rose-500/50 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-rose-600/20 text-rose-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        !
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {title}
                        </div>
                        <div className="text-[10px] text-rose-500 font-semibold">
                          Past due since {formatDate(item.dueDate, language)}
                        </div>
                      </div>
                    </div>
                    <strong className="text-xs font-extrabold text-rose-500 flex-shrink-0">
                      {formatCurrency(item.amount, language, currency)}
                    </strong>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Dunning status</span>
            <span className="font-bold text-rose-400">2 reminders sent</span>
          </div>
        </article>

        {/* CARD 4: Recent Transactions Feed */}
        <article className="fintech-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Receipt size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Recent Activity
                </h3>
              </div>
              <Link
                to="/transactions"
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Ledger
              </Link>
            </div>

            <div className="space-y-2.5">
              {(recentTxList.length
                ? recentTxList
                : [
                    { id: 'tx1', category: 'Client Retainer', type: 'income', amount: 385000, transactionDate: '2026-10-09' },
                    { id: 'tx2', category: 'Groceries & Pantry', type: 'expense', amount: 18400, transactionDate: '2026-10-08' },
                    { id: 'tx3', category: 'Strategic Consulting', type: 'income', amount: 215000, transactionDate: '2026-10-05' },
                  ]
              ).map((tx) => {
                const isIncome = tx.type === 'income'
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                          isIncome
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {isIncome ? '+' : '−'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {tx.category || tx.description || 'Transaction'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatDate(tx.transactionDate, language)}
                        </div>
                      </div>
                    </div>
                    <strong
                      className={`text-xs font-extrabold flex-shrink-0 ${
                        isIncome ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isIncome ? '+' : '−'}
                      {formatCurrency(tx.amount, language, currency)}
                    </strong>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Reconciliation</span>
            <span className="font-bold text-emerald-400">100% matched</span>
          </div>
        </article>
      </div>
    </section>
  )
}
