import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, ListFilter, Plus } from 'lucide-react'
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
  const [formOpen, setFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [mutationError, setMutationError] = useState('')
  const [saved, setSaved] = useState(false)
  const filtered = data.filter((item) => filter === 'all' || item.type === filter)

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
    <div className="workspace-page">
      <PageHeading
        actions={<button className="button button-dark add-record-button" onClick={openCreateForm} type="button"><Plus size={16} /> {t('transactions.add')}</button>}
        description={t('transactions.description')}
        eyebrow={t('transactions.eyebrow')}
        title={t('transactions.title')}
      />
      {formOpen && <CreateRecordForm key={`transaction-${editingRecord?.id ?? 'new'}`} kind="transaction" record={editingRecord} onCancel={() => setFormOpen(false)} onCreated={() => { setFormOpen(false); setEditingRecord(null); setSaved(true) }} />}
      {saved && <ResourceState success />}
      {mutationError && <p className="record-form-error" role="alert">{t('messages.error')}: {mutationError}</p>}
      <section className="workspace-panel table-panel">
        <div className="panel-toolbar">
          <div className="segmented-control" role="group" aria-label={t('filters.transactions')}>
            {[
              ['all', t('transactions.all')],
              ['income', t('transactions.income')],
              ['expense', t('transactions.expenses')],
            ].map(([key, label]) => (
              <button aria-pressed={filter === key} className={filter === key ? 'selected' : ''} key={key} onClick={() => setFilter(key)} type="button">{label}</button>
            ))}
          </div>
          <span className="row-count"><ListFilter size={14} /> {t(filtered.length === 1 ? 'transactions.countOne' : 'transactions.count', { count: filtered.length })}</span>
        </div>
        <ResourceState loading={loading} error={error} retry={retry} empty={!filtered.length} emptyTitle={t('transactions.empty')} />
        {!loading && !error && filtered.length > 0 && (
          <div className="table-wrap">
            <table className="data-table full-table">
              <thead><tr><th>{t('tables.category')}</th><th>{t('tables.description')}</th><th>{t('tables.date')}</th><th>{t('tables.type')}</th><th className="align-right">{t('tables.amount')}</th><th className="align-right">{t('tables.actions')}</th></tr></thead>
              <tbody>{filtered.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.category}</strong></td>
                  <td>{item.description || '—'}</td>
                  <td>{formatDate(item.transactionDate, language)}</td>
                  <td><span className={`type-badge type-${item.type}`}>{item.type === 'income' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}{t(`types.${item.type}`)}</span></td>
                  <td className={`align-right amount-${item.type}`}>{formatCurrency(item.amount, language, currency)}</td>
                  <td><RecordActions deleting={deletingId === item.id} onDelete={() => removeRecord(item)} onEdit={() => openEditForm(item)} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}