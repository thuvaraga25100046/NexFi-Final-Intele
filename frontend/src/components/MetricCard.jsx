export default function MetricCard({ icon: Icon, label, value, note, tone = 'green', detail, action, className = '' }) {
  return (
    <article className={`metric-card${className ? ` ${className}` : ''}`}>
      <div className="metric-card-top">
        <span className={`metric-icon metric-${tone}`}><Icon size={18} strokeWidth={1.8} /></span>
        <span className="metric-note">{note}</span>
      </div>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      {detail && <span className="metric-detail">{detail}</span>}
      {action && <div className="metric-card-action">{action}</div>}
    </article>
  )
}