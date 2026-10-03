import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, ListFilter, Plus } from 'lucide-react'
import CreateRecordForm from '../components/CreateRecordForm.jsx'
import PageHeading from '../components/PageHeading.jsx'
import ResourceState from '../components/ResourceState.jsx'
import useApiResource from '../hooks/useApiResource.js'
import { fetchTransactions } from '../services/api.js'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function TransactionsPage() {
  const { data, loading, error, retry } = useApiResource(fetchTransactions)
  const [filter, setFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const filtered = data.filter((item) => filter === 'all' || item.type === filter)

  return (
    <div className="workspace-page">
      <PageHeading
        actions={<button className="button button-dark add-record-button" onClick={() => setCreateOpen(!createOpen)} type="button"><Plus size={16} /> Add transaction</button>}
        description="A record of the money coming in and going out."
        eyebrow="YOUR MONEY, MOVING"
        title="Transactions"
      />
      {createOpen && <CreateRecordForm kind="transaction" onCancel={() => setCreateOpen(false)} onCreated={() => setCreateOpen(false)} />}
      <section className="workspace-panel table-panel">
        <div className="panel-toolbar">
          <div className="segmented-control" role="group" aria-label="Filter transactions">
            {[['all', 'All'], ['income', 'Income'], ['expense', 'Expenses']].map(([key, label]) => (
              <button aria-pressed={filter === key} className={filter === key ? 'selected' : ''} key={key} onClick={() => setFilter(key)} type="button">{label}</button>
            ))}
          </div>
          <span className="row-count"><ListFilter size={14} /> {filtered.length} {filtered.length === 1 ? 'record' : 'records'}</span>
        </div>
        <ResourceState loading={loading} error={error} retry={retry} empty={!filtered.length} emptyTitle="No transactions match this view." />
        {!loading && !error && filtered.length > 0 && (
          <div className="table-wrap">
            <table className="data-table full-table">
              <thead><tr><th>Category</th><th>Description</th><th>Date</th><th>Type</th><th className="align-right">Amount</th></tr></thead>
              <tbody>{filtered.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.category}</strong></td>
                  <td>{item.description || '—'}</td>
                  <td>{item.transactionDate}</td>
                  <td><span className={`type-badge type-${item.type}`}>{item.type === 'income' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}{item.type}</span></td>
                  <td className={`align-right amount-${item.type}`}>{currency.format(Number(item.amount) || 0)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}