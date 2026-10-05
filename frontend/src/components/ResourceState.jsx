import { AlertCircle, RefreshCw } from 'lucide-react'
import useTranslation from '../i18n/useTranslation.js'
import { translateApiError } from '../i18n/translations.js'

export default function ResourceState({ loading, error, retry, empty, emptyTitle, emptyKey = 'messages.noRecords', success = false }) {
  const { t } = useTranslation()
  if (loading) {
    return <div className="resource-state" role="status"><span className="loading-dot" /> {t('messages.loading')}</div>
  }

  if (error) {
    return (
      <div className="resource-state resource-error" role="alert">
        <AlertCircle size={19} />
        <span>{t('messages.error')}: {translateApiError(error, t)}</span>
        <button className="icon-action" onClick={retry} type="button" title={t('actions.retry')} aria-label={t('actions.retry')}>
          <RefreshCw size={16} />
        </button>
      </div>
    )
  }

  if (success) {
    return <div className="resource-state resource-success" role="status">{t('messages.success')}: {t('messages.saved')}</div>
  }

  if (empty) {
    return <div className="resource-state resource-empty">{emptyTitle ?? t(emptyKey)}</div>
  }

  return null
}