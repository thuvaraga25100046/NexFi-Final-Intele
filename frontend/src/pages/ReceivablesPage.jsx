import { useState } from 'react'
import { CalendarDays, CircleDollarSign, Plus } from 'lucide-react'
import CreateRecordForm from '../components/CreateRecordForm.jsx'
import PageHeading from '../components/PageHeading.jsx'
import ResourceState from '../components/ResourceState.jsx'
import useApiResource from '../hooks/useApiResource.js'
import { fetchReceivables } from '../services/api.js'
import useTranslation from '../i18n/useTranslation.js'
import { formatCurrency, formatDate } from '../i18n/formatters.js'

export default function ReceivablesPage() {
  const { t, language } = useTranslation()
  const { data, loading, error, retry } = useApiResource(fetchReceivables)
  const [filter, setFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const filtered = data.filter((item) => filter === 'all' || item.status === filter)

  return (
    <div className="workspace-page">
      <PageHeading
        actions={<button className="button button-dark add-record-button" onClick={() => { setCreateOpen(!createOpen); setSaved(false) }} type="button"><Plus size={16} /> {t('receivables.add')}</button>}
        description={t('receivables.description')}
        eyebrow={t('receivables.eyebrow')}
        title={t('receivables.title')}
      />
      {createOpen && <CreateRecordForm kind="receivable" onCancel={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); setSaved(true) }} />}
      {saved && <ResourceState success />}
      <section className="workspace-panel table-panel">
        <div className="panel-toolbar">
          <div className="segmented-control" role="group" aria-label={t('filters.receivables')}>
            {[
              ['all', t('transactions.all')],
              ['pending', t('statuses.pending')],
              ['paid', t('statuses.paid')],
              ['overdue', t('statuses.overdue')],
            ].map(([key, label]) => (
              <button aria-pressed={filter === key} className={filter === key ? 'selected' : ''} key={key} onClick={() => setFilter(key)} type="button">{label}</button>
            ))}
          </div>
          <span className="row-count"><CircleDollarSign size={14} /> {t(filtered.length === 1 ? 'receivables.countOne' : 'receivables.count', { count: filtered.length })}</span>
        </div>
        <ResourceState loading={loading} error={error} retry={retry} empty={!filtered.length} emptyTitle={t('receivables.empty')} />
        {!loading && !error && filtered.length > 0 && (
          <div className="table-wrap">
            <table className="data-table full-table">
              <thead><tr><th>{t('tables.customer')}</th><th>{t('tables.dueDate')}</th><th>{t('tables.paymentDate')}</th><th>{t('tables.status')}</th><th className="align-right">{t('tables.amount')}</th></tr></thead>
              <tbody>{filtered.map((item) => (
                <tr key={item.id}>
                  <td><span className="table-customer"><span className="customer-avatar">{item.customerName.slice(0, 1).toUpperCase()}</span><strong>{item.customerName}</strong></span></td>
                  <td><span className="date-cell"><CalendarDays size={14} />{formatDate(item.dueDate, language)}</span></td>
                  <td>{item.paymentDate ? formatDate(item.paymentDate, language) : t('tables.notRecorded')}</td>
                  <td><span className={`status-badge status-${item.status}`}>{t(`statuses.${item.status}`)}</span></td>
                  <td className="align-right">{formatCurrency(item.amount, language)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}