import { ArrowDownLeft, ArrowUpRight, CalendarClock, ReceiptText, Wallet, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import MetricCard from '../components/MetricCard.jsx'
import CashFlowForecastPanel from '../components/CashFlowForecastPanel.jsx'
import PageHeading from '../components/PageHeading.jsx'
import ResourceState from '../components/ResourceState.jsx'
import useApiResource from '../hooks/useApiResource.js'
import { fetchDashboardSummary, fetchPayables, fetchReceivables, fetchTransactions } from '../services/api.js'
import useTranslation from '../i18n/useTranslation.js'
import { formatCurrency, formatDate } from '../i18n/formatters.js'

export default function DashboardPage() {
  const { t, language } = useTranslation()
  const summary = useApiResource(fetchDashboardSummary)
  const transactions = useApiResource(fetchTransactions)
  const receivables = useApiResource(fetchReceivables)
  const payables = useApiResource(fetchPayables)
  const openReceivables = receivables.data.filter((item) => item.status !== 'paid')
  const openPayables = payables.data.filter((item) => item.status !== 'paid')
  const recentTransactions = [...transactions.data].sort((a, b) => b.transactionDate.localeCompare(a.transactionDate)).slice(0, 5)
  const upcomingReceivables = [...openReceivables].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4)
  const upcomingPayables = [...openPayables].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4)
  const summaryValue = (field) => summary.loading ? '…' : summary.error ? '—' : formatCurrency(summary.data[field], language)
  const summaryNote = summary.error ? t('messages.unavailable') : summary.loading ? t('messages.loading') : t('messages.liveSummary')

  return (
    <div className="workspace-page">
      <PageHeading eyebrow={t('dashboard.eyebrow')} title={t('dashboard.title')} description={t('dashboard.description')} />

      <div className="metrics-grid dashboard-metrics-grid">
        <MetricCard icon={WalletCards} label={t('dashboard.cashBalance')} value={summaryValue('currentCashBalance')} note={summaryNote} tone="green" />
        <MetricCard icon={ArrowDownLeft} label={t('dashboard.totalIncome')} value={summaryValue('totalIncome')} note={summaryNote} tone="green" />
        <MetricCard icon={ArrowUpRight} label={t('dashboard.totalExpenses')} value={summaryValue('totalExpenses')} note={summaryNote} tone="coral" />
        <MetricCard icon={CalendarClock} label={t('dashboard.totalReceivables')} value={summaryValue('totalReceivables')} note={summaryNote} tone="lime" />
        <MetricCard icon={ReceiptText} label={t('dashboard.totalPayables')} value={summaryValue('totalPayables')} note={summaryNote} tone="coral" />
      </div>
      {summary.error && <ResourceState loading={false} error={summary.error} retry={summary.retry} empty={false} />}
      <CashFlowForecastPanel />

      <div className="dashboard-sections">
        <section className="workspace-panel">
          <div className="panel-heading">
            <div><span className="panel-eyebrow">{t('dashboard.keepingTrack')}</span><h2>{t('dashboard.recentTransactions')}</h2></div>
            <Link className="panel-link" to="/transactions">{t('dashboard.allTransactions')} <ArrowUpRight size={15} /></Link>
          </div>
            <ResourceState loading={transactions.loading} error={transactions.error} retry={transactions.retry} empty={!transactions.data.length} emptyTitle={t('dashboard.noTransactions')} />
          {!transactions.loading && !transactions.error && recentTransactions.length > 0 && (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>{t('tables.category')}</th><th>{t('tables.date')}</th><th>{t('tables.type')}</th><th className="align-right">{t('tables.amount')}</th></tr></thead>
                <tbody>{recentTransactions.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.category}</strong><small>{item.description || '—'}</small></td>
                    <td>{formatDate(item.transactionDate, language)}</td>
                    <td><span className={`type-badge type-${item.type}`}>{t(`types.${item.type}`)}</span></td>
                    <td className={`align-right amount-${item.type}`}>{formatCurrency(item.amount, language)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>

        <div className="dashboard-side-column">
          <section className="workspace-panel">
            <div className="panel-heading">
              <div><span className="panel-eyebrow">{t('dashboard.moneyOnItsWay')}</span><h2>{t('dashboard.upcomingReceivables')}</h2></div>
              <Link className="panel-link" to="/receivables">{t('dashboard.viewAll')} <ArrowUpRight size={15} /></Link>
            </div>
            <ResourceState loading={receivables.loading} error={receivables.error} retry={receivables.retry} empty={!openReceivables.length} emptyTitle={t('dashboard.noOpenReceivables')} />
            {!receivables.loading && !receivables.error && upcomingReceivables.length > 0 && (
              <div className="receivable-list">
                {upcomingReceivables.map((item) => (
                  <div className="receivable-row" key={item.id}>
                    <span className="customer-avatar">{item.customerName.slice(0, 1).toUpperCase()}</span>
                    <span className="receivable-customer"><strong>{item.customerName}</strong><small>{t('messages.due', { date: formatDate(item.dueDate, language) })}</small></span>
                    <strong className="receivable-amount">{formatCurrency(item.amount, language)}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="workspace-panel">
            <div className="panel-heading">
              <div><span className="panel-eyebrow">{t('dashboard.moneyToPlanFor')}</span><h2>{t('dashboard.upcomingPayables')}</h2></div>
              <Link className="panel-link" to="/payables">{t('navigation.payables')} <ArrowUpRight size={15} /></Link>
            </div>
            <ResourceState loading={payables.loading} error={payables.error} retry={payables.retry} empty={!openPayables.length} emptyTitle={t('dashboard.noOpenPayables')} />
            {!payables.loading && !payables.error && upcomingPayables.length > 0 && (
              <div className="receivable-list">
                {upcomingPayables.map((item) => (
                  <div className="receivable-row" key={item.id}>
                    <span className="customer-avatar">{item.vendorName.slice(0, 1).toUpperCase()}</span>
                    <span className="receivable-customer"><strong>{item.vendorName}</strong><small>{t('messages.due', { date: formatDate(item.dueDate, language) })}</small></span>
                    <strong className="receivable-amount">{formatCurrency(item.amount, language)}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="dashboard-footnote"><Wallet size={16} /><span>{t('dashboard.footnote')}</span></div>
    </div>
  )
}