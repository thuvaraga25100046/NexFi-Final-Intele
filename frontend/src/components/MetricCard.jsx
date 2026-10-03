export default function MetricCard({ icon: Icon, label, value, note, tone = 'green' }) {
  return (
    <article className="metric-card">
      <div className="metric-card-top">
        <span className={`metric-icon metric-${tone}`}><Icon size={18} strokeWidth={1.8} /></span>
        <span className="metric-note">{note}</span>
      </div>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
    </article>
  )
}