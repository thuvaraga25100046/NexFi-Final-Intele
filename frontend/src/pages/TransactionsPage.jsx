import { useState, useMemo } from 'react'
import {
  ArrowDownLeft,
  ArrowUpDown,
  ArrowUpRight,
  Filter,
  ListFilter,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react'
import CreateRecordForm from '../components/CreateRecordForm.jsx'
import PageHeading from '../components/PageHeading.jsx'
import RecordActions from '../components/RecordActions.jsx'
import ResourceState from '../components/ResourceState.jsx'
import useApiResource from '../hooks/useApiResource.js'
import { deleteTransaction, fetchTransactions } from '../services/api.js'
import useTranslation from '../i18n/useTranslation.js'
import { formatCurrency, formatDate } from '../i18n/formatters.js'
import { translateApiError } from '../i18n/translations.js'

export default function TransactionsPage() {
  const { t, language, currency } = useTranslation()
  const { data, loading, error, retry } = useApiResource(fetchTransactions)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [mutationError, setMutationError] = useState('')
  const [saved, setSaved] = useState(false)

  // Compute Total Metrics
  const metrics = useMemo(() => {
    let incomeTotal = 0
    let expenseTotal = 0
    for (const item of data) {
      const amt = Number(item.amount) || 0
      if (item.type === 'income') incomeTotal += amt
      else expenseTotal += amt
    }
    return {
      incomeTotal,
      expenseTotal,
      netTotal: incomeTotal - expenseTotal,
      count: data.length,
    }
  }, [data])

  // Filter & Search & Sort
  const filteredAndSorted = useMemo(() => {
    let result = data.filter((item) => {
      if (filter !== 'all' && item.type !== filter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const cat = (item.category || '').toLowerCase()
        const desc = (item.description || '').toLowerCase()
        if (!cat.includes(q) && !desc.includes(q)) return false
      }
      return true
    })

    result.sort((a, b) => {
      if (sortBy === 'date-desc') return (b.transactionDate || '').localeCompare(a.transactionDate || '')
      if (sortBy === 'date-asc') return (a.transactionDate || '').localeCompare(b.transactionDate || '')
      if (sortBy === 'amount-desc') return (Number(b.amount) || 0) - (Number(a.amount) || 0)
      if (sortBy === 'amount-asc') return (Number(a.amount) || 0) - (Number(b.amount) || 0)
      return 0
    })

    return result
  }, [data, filter, searchQuery, sortBy])

  function openCreateForm() {
    setEditingRecord(null)
    setFormOpen(true)
    setMutationError('')
    setSaved(false)
  }

  function openEditForm(record) {
    setEditingRecord(record)
    setFormOpen(true)
    setMutationError('')
    setSaved(false)
  }

  async function removeRecord(record) {
    if (!window.confirm(t('messages.confirmDelete'))) return
    setDeletingId(record.id)
    setMutationError('')
    try {
      await deleteTransaction(record.id)
    } catch (requestError) {
      setMutationError(translateApiError(requestError.message || '', t))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="workspace-page max-w-6xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            General Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>
            Transactions
          </h1>
          <p className="text-xs font-semibold mt-1" style={{ color: '#334155' }}>
            Manage, monitor, and analyze all income and expenses efficiently
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          type="button"
        >
          <Plus size={16} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Top 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Inflows
            </span>
            <strong className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(metrics.incomeTotal, language, currency)}
            </strong>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ArrowDownLeft size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Outflows
            </span>
            <strong className="text-xl font-black text-rose-600 dark:text-rose-400">
              -{formatCurrency(metrics.expenseTotal, language, currency)}
            </strong>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ArrowUpRight size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Net Working Cash Flow
            </span>
            <strong className={`text-xl font-black ${metrics.netTotal >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`}>
              {metrics.netTotal >= 0 ? '+' : ''}{formatCurrency(metrics.netTotal, language, currency)}
            </strong>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ArrowUpDown size={18} />
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="mb-6">
          <CreateRecordForm
            key={`transaction-${editingRecord?.id ?? 'new'}`}
            kind="transaction"
            record={editingRecord}
            onCancel={() => setFormOpen(false)}
            onCreated={() => {
              setFormOpen(false)
              setEditingRecord(null)
              setSaved(true)
            }}
          />
        </div>
      )}

      {mutationError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-semibold">
          {mutationError}
        </div>
      )}

      {/* Main Table Deck with Filters & Search */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category, merchant, note..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter Pills & Sort */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              {[
                { id: 'all', label: 'All' },
                { id: 'income', label: 'Inflows' },
                { id: 'expense', label: 'Outflows' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filter === tab.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <ResourceState loading={loading} error={error} retry={retry} empty={!filteredAndSorted.length} emptyTitle="No transactions found." />

        {!loading && !error && filteredAndSorted.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredAndSorted.map((item) => {
                  const isIncome = item.type === 'income'
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {item.category || 'General'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {item.description || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                        {formatDate(item.transactionDate, language)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isIncome
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {isIncome ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                          {isIncome ? 'Inflow' : 'Outflow'}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-bold font-mono ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isIncome ? '+' : '−'}
                        {formatCurrency(item.amount, language, currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <RecordActions
                          deleting={deletingId === item.id}
                          onDelete={() => removeRecord(item)}
                          onEdit={() => openEditForm(item)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}