import { useState } from 'react'
import { CalendarDays, CircleDollarSign } from 'lucide-react'
import PageHeading from '../components/PageHeading.jsx'
import ResourceState from '../components/ResourceState.jsx'
import useApiResource from '../hooks/useApiResource.js'
import { fetchReceivables } from '../services/api.js'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function ReceivablesPage() {
  const { data, loading, error, retry } = useApiResource(fetchReceivables)
  const [filter, setFilter] = useState('all')
  const filtered = data.filter((item) => filter === 'all' || item.status === filter)

  return (
    <div className="workspace-page">
      <PageHeading eyebrow="MONEY ON ITS WAY" title="Receivables" description="Keep track of what customers owe and when it's due." />
      <section className="workspace-panel table-panel">
        <div className="panel-toolbar">
          <div className="segmented-control" role="group" aria-label="Filter receivables">
            {[['all', 'All'], ['pending', 'Pending'], ['paid', 'Paid'], ['overdue', 'Overdue']].map(([key, label]) => (
              <button aria-pressed={filter === key} className={filter === key ? 'selected' : ''} key={key} onClick={() => setFilter(key)} type="button">{label}</button>
            ))}
          </div>
          <span className="row-count"><CircleDollarSign size={14} /> {filtered.length} {filtered.length === 1 ? 'receivable' : 'receivables'}</span>
        </div>
        <ResourceState loading={loading} error={error} retry={retry} empty={!filtered.length} emptyTitle="No receivables match this view." />
        {!loading && !error && filtered.length > 0 && (
          <div className="table-wrap">
            <table className="data-table full-table">
              <thead><tr><th>Customer</th><th>Due date</th><th>Status</th><th className="align-right">Amount</th></tr></thead>
              <tbody>{filtered.map((item) => (
                <tr key={item.id}>
                  <td><span className="table-customer"><span className="customer-avatar">{item.customerName.slice(0, 1).toUpperCase()}</span><strong>{item.customerName}</strong></span></td>
                  <td><span className="date-cell"><CalendarDays size={14} />{item.dueDate}</span></td>
                  <td><span className={`status-badge status-${item.status}`}>{item.status}</span></td>
                  <td className="align-right">{currency.format(Number(item.amount) || 0)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}