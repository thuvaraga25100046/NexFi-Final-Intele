import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Wallet, X } from 'lucide-react'
import { saveOpeningBalance } from '../services/api.js'
import { translateApiError } from '../i18n/translations.js'
import useTranslation from '../i18n/useTranslation.js'

export default function OpeningBalanceModal({ amount, onClose }) {
  const { t } = useTranslation()
  const [value, setValue] = useState(String(amount ?? 0))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape' && !saving) onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose, saving])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      await saveOpeningBalance({ amount: Number(value) })
      onClose()
    } catch (requestError) {
      setError(translateApiError(requestError.message || '', t))
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
      <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) onClose()
          }}
      >
        <section
            aria-labelledby="opening-balance-title"
            aria-modal="true"
            role="dialog"
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6"
        >
          <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {t('dashboard.cashBalance')}
              </span>
                <h2 id="opening-balance-title" className="text-base font-bold text-slate-900 dark:text-white">
                  {t('openingBalance.title')}
                </h2>
              </div>
            </div>

            <button
                aria-label={t('actions.close')}
                disabled={saving}
                onClick={onClose}
                type="button"
                className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:cursor-wait"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 mb-5">
            {t('openingBalance.description')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block" htmlFor="opening-balance-amount">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('openingBalance.amount')}
            </span>
              <input
                  autoFocus
                  id="opening-balance-amount"
                  max="99999999999999999.99"
                  min="0"
                  onChange={(event) => setValue(event.target.value)}
                  required
                  step="0.01"
                  type="number"
                  value={value}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </label>

            {error && (
                <p
                    role="alert"
                    className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold"
                >
                  {error}
                </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                  disabled={saving}
                  onClick={onClose}
                  type="button"
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {t('actions.cancel')}
              </button>
              <button
                  disabled={saving}
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm shadow-indigo-600/30 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                {saving ? t('actions.saving') : t('actions.save')}
              </button>
            </div>
          </form>
        </section>
      </div>,
      document.body,
  )
}