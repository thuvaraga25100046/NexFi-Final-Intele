import { useState, useMemo } from 'react'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Filter,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
} from 'lucide-react'
import CreateRecordForm from '../components/CreateRecordForm.jsx'
import PageHeading from '../components/PageHeading.jsx'
import RecordActions from '../components/RecordActions.jsx'
import ResourceState from '../components/ResourceState.jsx'
import useApiResource from '../hooks/useApiResource.js'
import { deletePayable, fetchPayables } from '../services/api.js'
import useTranslation from '../i18n/useTranslation.js'
import { formatCurrency, formatDate } from '../i18n/formatters.js'
import { translateApiError } from '../i18n/translations.js'

function initials(name) {
  return name ? name.trim().charAt(0).toUpperCase() : '?'
}

export default function PayablesPage() {
  const { t, language, currency } = useTranslation()
  const { data, loading, error, retry } = useApiResource(fetchPayables)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [mutationError, setMutationError] = useState('')
  const [payToast, setPayToast] = useState('')

  // Compute Metrics
  const metrics = useMemo(() => {
    let pendingSum = 0
    let overdueSum = 0
    let paidSum = 0
    let pendingCount = 0
    let overdueCount = 0

    for (const item of data) {
      const amt = Number(item.amount) || 0
      if (item.status === 'pending') {
        pendingSum += amt
        pendingCount++
      } else if (item.status === 'overdue') {
        overdueSum += amt
        overdueCount++
      } else if (item.status === 'paid') {
        paidSum += amt
      }
    }

    return {
      totalOutflow: pendingSum + overdueSum,
      pendingCount,
      overdueCount,
      overdueSum,
      paidSum,
    }
  }, [data])

  // Filtered List
  const filtered = useMemo(() => {
    return data.filter((item) => {
      if (filter !== 'all' && item.status !== filter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const vendor = (item.vendorName || '').toLowerCase()
        if (!vendor.includes(q)) return false
      }
      return true
    })
  }, [data, filter, searchQuery])

  function openCreateForm() {
    setEditingRecord(null)
    setFormOpen(true)
    setMutationError('')
  }

  function openEditForm(record) {
    setEditingRecord(record)
    setFormOpen(true)
    setMutationError('')
  }

  async function removeRecord(record) {
    if (!window.confirm(t('messages.confirmDelete'))) return
    setDeletingId(record.id)
    setMutationError('')
    try {
      await deletePayable(record.id)
    } catch (requestError) {
      setMutationError(translateApiError(requestError.message || '', t))
    } finally {
      setDeletingId(null)
    }
  }

  const handleSimulatePayment = (vendorName, amount) => {
    setPayToast(`✓ Wire transfer initiated to ${vendorName} for ${formatCurrency(amount, language, currency)}`)
    setTimeout(() => setPayToast(''), 3000)
  }

  return (
    <div className="workspace-page max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {payToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white border border-white/20 shadow-2xl text-xs font-semibold animate-bounce">
          {payToast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Accounts Payable
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Payables & Vendor Bills
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage upcoming supplier obligations, auto-debits, and scheduled outflows
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          type="button"
        >
          <Plus size={16} />
          <span>Add Payable</span>
        </button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Scheduled Outflows
            </span>
            <strong className="text-xl font-black text-slate-900 dark:text-white">
              {formatCurrency(metrics.totalOutflow, language, currency)}
            </strong>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <CreditCard size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Pending Bills
            </span>
            <strong className="text-xl font-black text-amber-600 dark:text-amber-400">
              {metrics.pendingCount} invoices
            </strong>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Clock size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Past Due Bills
            </span>
            <strong className="text-xl font-black text-rose-500">
              {formatCurrency(metrics.overdueSum, language, currency)}
            </strong>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <AlertCircle size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Payment Compliance
            </span>
            <strong className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              98.4% · 0 Penalties
            </strong>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck size={18} />
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="mb-6">
          <CreateRecordForm
            key={`payable-${editingRecord?.id ?? 'new'}`}
            kind="payable"
            record={editingRecord}
            onCancel={() => setFormOpen(false)}
            onCreated={() => {
              setFormOpen(false)
              setEditingRecord(null)
              retry()
            }}
          />
        </div>
      )}

      {/* Main Table Deck with Tabs & Search */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendor or supplier..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'paid', label: 'Paid' },
              { id: 'overdue', label: 'Overdue' },
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
        </div>

        {/* Table */}
        <ResourceState loading={loading} error={error} retry={retry} empty={!filtered.length} emptyTitle="No payables found." />

        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="py-3 px-4">Supplier / Vendor</th>
                  <th className="py-3 px-4">Payment Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Bill Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map((item) => {
                  const isOverdue = item.status === 'overdue'
                  const isPaid = item.status === 'paid'
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {initials(item.vendorName)}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.vendorName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                        {formatDate(item.dueDate, language)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : isOverdue
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900 dark:text-white">
                        {formatCurrency(item.amount, language, currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isPaid && (
                            <button
                              onClick={() => handleSimulatePayment(item.vendorName, item.amount)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors cursor-pointer"
                              type="button"
                            >
                              Settle Bill
                            </button>
                          )}
                          <RecordActions
                            deleting={deletingId === item.id}
                            onDelete={() => removeRecord(item)}
                            onEdit={() => openEditForm(item)}
                          />
                        </div>
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