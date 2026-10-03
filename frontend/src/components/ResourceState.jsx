import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ResourceState({ loading, error, retry, empty, emptyTitle = 'Nothing here yet' }) {
  if (loading) {
    return <div className="resource-state" role="status"><span className="loading-dot" /> Loading your data…</div>
  }

  if (error) {
    return (
      <div className="resource-state resource-error" role="alert">
        <AlertCircle size={19} />
        <span>{error}</span>
        <button className="icon-action" onClick={retry} type="button" title="Retry" aria-label="Retry">
          <RefreshCw size={16} />
        </button>
      </div>
    )
  }

  if (empty) {
    return <div className="resource-state resource-empty">{emptyTitle}</div>
  }

  return null
}