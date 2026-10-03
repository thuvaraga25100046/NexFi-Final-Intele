import { ArrowUpRight, ReceiptText } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeading from '../components/PageHeading.jsx'

export default function PayablesPage() {
  return (
    <div className="workspace-page">
      <PageHeading eyebrow="MONEY YOU PLAN TO SEND" title="Payables" description="Keep future bills and outgoing payments in one place." />
      <section className="workspace-panel module-empty">
        <span className="empty-illustration"><ReceiptText size={25} strokeWidth={1.7} /></span>
        <span className="panel-eyebrow">PAYABLES OVERVIEW</span>
        <h2>Your payables workspace is ready</h2>
        <p>Once payables are connected, you'll be able to see upcoming bills, due dates, and payment status here.</p>
        <Link className="module-link" to="/">Back to NexFi home <ArrowUpRight size={15} /></Link>
      </section>
    </div>
  )
}