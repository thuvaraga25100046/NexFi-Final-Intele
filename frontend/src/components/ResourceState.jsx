import { AlertCircle, CheckCircle2, Inbox, LoaderCircle, RefreshCw } from 'lucide-react'
import useTranslation from '../i18n/useTranslation.js'
import { translateApiError } from '../i18n/translations.js'

export default function ResourceState({ loading, error, retry, empty, emptyTitle, emptyKey = 'messages.noRecords', success = false }) {
  const { t } = useTranslation()

  if (loading) {
    return (
        <div className="flex items-center justify-center gap-2.5 py-14 text-xs font-semibold text-slate-500 dark:text-slate-400" role="status">
          <LoaderCircle size={18} className="animate-spin text-indigo-500" />
          <span>{t('messages.loading')}</span>
        </div>
    )
  }

  if (error) {
    return (
        <div className="flex items-center justify-center gap-3 py-12 px-4 text-xs font-semibold text-rose-500" role="alert">
          <AlertCircle size={18} />
          <span>{t('messages.error')}: {translateApiError(error, t)}</span>
          <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              onClick={retry}
              type="button"
              title={t('actions.retry')}
              aria-label={t('actions.retry')}
          >
            <RefreshCw size={16} />
          </button>
        </div>
    )
  }

  if (success) {
    return (
        <div className="flex items-center justify-center gap-2 py-6 text-xs font-semibold text-emerald-600 dark:text-emerald-400" role="status">
          <CheckCircle2 size={16} />
          <span>{t('messages.success')}: {t('messages.saved')}</span>
        </div>
    )
  }

  if (empty) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400 dark:text-slate-500">
          <Inbox size={30} strokeWidth={1.5} />
          <span className="text-sm font-semibold">{emptyTitle ?? t(emptyKey)}</span>
        </div>
    )
  }

  return null
}