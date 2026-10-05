import { useState } from 'react'
import { CalendarDays, CircleDollarSign, Plus } from 'lucide-react'
import CreateRecordForm from '../components/CreateRecordForm.jsx'
import PageHeading from '../components/PageHeading.jsx'
import ResourceState from '../components/ResourceState.jsx'
import useApiResource from '../hooks/useApiResource.js'
import { fetchPayables } from '../services/api.js'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function PayablesPage() {
  const { data, loading, error, retry } = useApiResource(fetchPayables)
  const [filter, setFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const filtered = data.filter((item) => filter === 'all' || item.status === filter)

  return (
    <div className="workspace-page">
      <PageHeading
        actions={<button className="button button-dark add-record-button" onClick={() => setCreateOpen(!createOpen)} type="button"><Plus size={16} /> Add payable</button>}
        description="Keep track of upcoming bills and outgoing payments."
        eyebrow="MONEY YOU PLAN TO SEND"
        title="Payables"
      />
      {createOpen && <CreateRecordForm kind="payable" onCancel={() => setCreateOpen(false)} onCreated={() => setCreateOpen(false)} />}
      <section className="workspace-panel table-panel">
        <div className="panel-toolbar">
          <div className="segmented-control" role="group" aria-label="Filter payables">
            {[['all', 'All'], ['pending', 'Pending'], ['paid', 'Paid'], ['overdue', 'Overdue']].map(([key, label]) => (
              <button aria-pressed={filter === key} className={filter === key ? 'selected' : ''} key={key} onClick={() => setFilter(key)} type="button">{label}</button>
            ))}
          </div>
          <span className="row-count"><CircleDollarSign size={14} /> {filtered.length} {filtered.length === 1 ? 'payable' : 'payables'}</span>
        </div>
        <ResourceState loading={loading} error={error} retry={retry} empty={!filtered.length} emptyTitle="No payables match this view." />
        {!loading && !error && filtered.length > 0 && (
          <div className="table-wrap">
            <table className="data-table full-table">
              <thead><tr><th>Vendor</th><th>Due date</th><th>Status</th><th className="align-right">Amount</th></tr></thead>
              <tbody>{filtered.map((item) => (
                <tr key={item.id}>
                  <td><span className="table-customer"><span className="customer-avatar">{item.vendorName.slice(0, 1).toUpperCase()}</span><strong>{item.vendorName}</strong></span></td>
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