import { useMemo } from 'react'
import { ArrowDownLeft, ArrowUpRight, CalendarClock, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import MetricCard from '../components/MetricCard.jsx'
import PageHeading from '../components/PageHeading.jsx'
import ResourceState from '../components/ResourceState.jsx'
import useApiResource from '../hooks/useApiResource.js'
import { fetchReceivables, fetchTransactions } from '../services/api.js'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const formatAmount = (amount) => currency.format(Number(amount) || 0)

export default function DashboardPage() {
  const transactions = useApiResource(fetchTransactions)
  const receivables = useApiResource(fetchReceivables)
  const totals = useMemo(() => {
    const income = transactions.data.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0)
    const expenses = transactions.data.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0)
    const outstanding = receivables.data.filter((item) => item.status !== 'paid').reduce((sum, item) => sum + Number(item.amount), 0)
    return { income, expenses, outstanding }
  }, [transactions.data, receivables.data])
  const recentTransactions = [...transactions.data].sort((a, b) => b.transactionDate.localeCompare(a.transactionDate)).slice(0, 5)
  const recentReceivables = [...receivables.data].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4)

  return (
    <div className="workspace-page">
      <PageHeading eyebrow="YOUR MONEY, AT A GLANCE" title="Dashboard" description="A clear view of what's coming in, going out, and still on its way." />

      <div className="metrics-grid">
        <MetricCard icon={ArrowDownLeft} label="Income recorded" value={transactions.error ? '—' : formatAmount(totals.income)} note="All time" tone="green" />
        <MetricCard icon={ArrowUpRight} label="Expenses recorded" value={transactions.error ? '—' : formatAmount(totals.expenses)} note="All time" tone="coral" />
        <MetricCard icon={CalendarClock} label="Receivables due" value={receivables.error ? '—' : formatAmount(totals.outstanding)} note={`${receivables.data.filter((item) => item.status !== 'paid').length} open`} tone="lime" />
      </div>

      <div className="workspace-columns">
        <section className="workspace-panel">
          <div className="panel-heading">
            <div><span className="panel-eyebrow">KEEPING TRACK</span><h2>Recent transactions</h2></div>
            <Link className="panel-link" to="/transactions">All transactions <ArrowUpRight size={15} /></Link>
          </div>
          <ResourceState loading={transactions.loading} error={transactions.error} retry={transactions.retry} empty={!transactions.data.length} emptyTitle="Your transactions will show up here." />
          {!transactions.loading && !transactions.error && recentTransactions.length > 0 && (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Category</th><th>Date</th><th>Type</th><th className="align-right">Amount</th></tr></thead>
                <tbody>{recentTransactions.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.category}</strong><small>{item.description || '—'}</small></td>
                    <td>{item.transactionDate}</td>
                    <td><span className={`type-badge type-${item.type}`}>{item.type}</span></td>
                    <td className={`align-right amount-${item.type}`}>{formatAmount(item.amount)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>

        <section className="workspace-panel">
          <div className="panel-heading">
            <div><span className="panel-eyebrow">MONEY ON ITS WAY</span><h2>Upcoming receivables</h2></div>
            <Link className="panel-link" to="/receivables">View all <ArrowUpRight size={15} /></Link>
          </div>
          <ResourceState loading={receivables.loading} error={receivables.error} retry={receivables.retry} empty={!receivables.data.some((item) => item.status !== 'paid')} emptyTitle="No open receivables right now." />
          {!receivables.loading && !receivables.error && recentReceivables.filter((item) => item.status !== 'paid').length > 0 && (
            <div className="receivable-list">
              {recentReceivables.filter((item) => item.status !== 'paid').map((item) => (
                <div className="receivable-row" key={item.id}>
                  <span className="customer-avatar">{item.customerName.slice(0, 1).toUpperCase()}</span>
                  <span className="receivable-customer"><strong>{item.customerName}</strong><small>Due {item.dueDate}</small></span>
                  <strong className="receivable-amount">{formatAmount(item.amount)}</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="dashboard-footnote"><Wallet size={16} /><span>Your NexFi overview updates as transactions and receivables are recorded.</span></div>
    </div>
  )
}