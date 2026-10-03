import { useMemo } from 'react'
import { ArrowDownLeft, ArrowUpRight, CalendarClock, CircleHelp, ReceiptText, Wallet, WalletCards } from 'lucide-react'
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
    const openReceivables = receivables.data.filter((item) => item.status !== 'paid')
    const outstanding = openReceivables.reduce((sum, item) => sum + Number(item.amount), 0)
    return { income, expenses, cashBalance: income - expenses, outstanding, openReceivables }
  }, [transactions.data, receivables.data])
  const recentTransactions = [...transactions.data].sort((a, b) => b.transactionDate.localeCompare(a.transactionDate)).slice(0, 5)
  const upcomingReceivables = [...totals.openReceivables].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4)
  const transactionValue = (value) => transactions.loading ? '…' : transactions.error ? '—' : formatAmount(value)
  const receivableValue = (value) => receivables.loading ? '…' : receivables.error ? '—' : formatAmount(value)

  return (
    <div className="workspace-page">
      <PageHeading eyebrow="YOUR MONEY, AT A GLANCE" title="Dashboard" description="A clear view of what's coming in, going out, and still on its way." />

      <div className="metrics-grid dashboard-metrics-grid">
        <MetricCard icon={WalletCards} label="Current cash balance" value={transactionValue(totals.cashBalance)} note={transactions.error ? 'Unavailable' : 'Net recorded'} tone="green" />
        <MetricCard icon={ArrowDownLeft} label="Total income" value={transactionValue(totals.income)} note={transactions.error ? 'Unavailable' : 'All time'} tone="green" />
        <MetricCard icon={ArrowUpRight} label="Total expenses" value={transactionValue(totals.expenses)} note={transactions.error ? 'Unavailable' : 'All time'} tone="coral" />
        <MetricCard icon={CalendarClock} label="Total receivables" value={receivableValue(totals.outstanding)} note={receivables.error ? 'Unavailable' : `${totals.openReceivables.length} open`} tone="lime" />
        <MetricCard icon={ReceiptText} label="Total payables" value="—" note="API unavailable" tone="coral" />
      </div>

      <div className="dashboard-sections">
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

        <div className="dashboard-side-column">
          <section className="workspace-panel">
            <div className="panel-heading">
              <div><span className="panel-eyebrow">MONEY ON ITS WAY</span><h2>Upcoming receivables</h2></div>
              <Link className="panel-link" to="/receivables">View all <ArrowUpRight size={15} /></Link>
            </div>
            <ResourceState loading={receivables.loading} error={receivables.error} retry={receivables.retry} empty={!totals.openReceivables.length} emptyTitle="No open receivables right now." />
            {!receivables.loading && !receivables.error && upcomingReceivables.length > 0 && (
              <div className="receivable-list">
                {upcomingReceivables.map((item) => (
                  <div className="receivable-row" key={item.id}>
                    <span className="customer-avatar">{item.customerName.slice(0, 1).toUpperCase()}</span>
                    <span className="receivable-customer"><strong>{item.customerName}</strong><small>Due {item.dueDate}</small></span>
                    <strong className="receivable-amount">{formatAmount(item.amount)}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="workspace-panel">
            <div className="panel-heading">
              <div><span className="panel-eyebrow">MONEY TO PLAN FOR</span><h2>Upcoming payables</h2></div>
              <Link className="panel-link" to="/payables">Payables <ArrowUpRight size={15} /></Link>
            </div>
            <div className="payables-unavailable">
              <CircleHelp size={18} />
              <span>Payables data will appear when a Payables API is available.</span>
            </div>
          </section>
        </div>
      </div>

      <div className="dashboard-footnote"><Wallet size={16} /><span>Your NexFi overview updates as transactions and receivables are recorded.</span></div>
    </div>
  )
}