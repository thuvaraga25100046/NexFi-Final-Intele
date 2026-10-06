import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
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

  return (
    <div
      className="opening-balance-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose()
      }}
    >
      <section aria-labelledby="opening-balance-title" aria-modal="true" className="opening-balance-dialog" role="dialog">
        <div className="opening-balance-dialog-heading">
          <div>
            <span className="panel-eyebrow">{t('dashboard.cashBalance')}</span>
            <h2 id="opening-balance-title">{t('openingBalance.title')}</h2>
          </div>
          <button aria-label={t('actions.close')} className="opening-balance-close" disabled={saving} onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        <p className="opening-balance-description">{t('openingBalance.description')}</p>
        <form onSubmit={handleSubmit}>
          <label className="record-field" htmlFor="opening-balance-amount">
            <span>{t('openingBalance.amount')}</span>
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
            />
          </label>
          {error && <p className="record-form-error" role="alert">{error}</p>}
          <div className="record-form-actions">
            <button className="record-cancel" disabled={saving} onClick={onClose} type="button">{t('actions.cancel')}</button>
            <button className="button button-dark" disabled={saving} type="submit">
              {saving ? t('actions.saving') : t('actions.save')}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
