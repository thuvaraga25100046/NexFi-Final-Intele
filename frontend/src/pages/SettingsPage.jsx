import { useState } from 'react'
import { Bell, CircleDollarSign, UserRound } from 'lucide-react'
import PageHeading from '../components/PageHeading.jsx'
import useTranslation from '../i18n/useTranslation.js'
import { languageNames } from '../i18n/translations.js'

export default function SettingsPage() {
  const { t, language, setLanguage } = useTranslation()
  const [currency, setCurrency] = useState('USD')
  const [weeklySummary, setWeeklySummary] = useState(true)

  return (
    <div className="workspace-page">
      <PageHeading eyebrow={t('settings.eyebrow')} title={t('settings.title')} description={t('settings.description')} />
      <div className="settings-grid">
        <section className="workspace-panel settings-panel">
          <div className="settings-heading"><span className="settings-icon"><UserRound size={18} /></span><div><h2>{t('settings.profile')}</h2><p>{t('settings.profileDescription')}</p></div></div>
          <div className="settings-row"><span><strong>{t('settings.accountName')}</strong><small>{t('settings.accountNameDescription')}</small></span><span className="settings-value">{t('settings.member')}</span></div>
          <div className="settings-row"><span><strong>{t('settings.accountType')}</strong><small>{t('settings.accountTypeDescription')}</small></span><span className="settings-value">{t('settings.personal')}</span></div>
        </section>

        <section className="workspace-panel settings-panel">
          <div className="settings-heading"><span className="settings-icon settings-icon-lime"><CircleDollarSign size={18} /></span><div><h2>{t('settings.preferences')}</h2><p>{t('settings.preferencesDescription')}</p></div></div>
          <label className="settings-row" htmlFor="language-select"><span><strong>{t('language.label')}</strong><small>{t('settings.languageDescription')}</small></span>
            <select className="settings-select" id="language-select" onChange={(event) => setLanguage(event.target.value)} value={language}>
              {Object.entries(languageNames).map(([code, name]) => <option key={code} value={code}>{t(`language.${code === 'en' ? 'english' : code === 'ta' ? 'tamil' : 'sinhala'}`)} · {name}</option>)}
            </select>
          </label>
          <label className="settings-row" htmlFor="currency-select"><span><strong>{t('settings.currency')}</strong><small>{t('settings.currencyDescription')}</small></span>
            <select className="settings-select" id="currency-select" onChange={(event) => setCurrency(event.target.value)} value={currency}>
              <option value="USD">USD · {t('currency.usd')}</option><option value="EUR">EUR · {t('currency.eur')}</option><option value="GBP">GBP · {t('currency.gbp')}</option>
            </select>
          </label>
          <div className="settings-row"><span className="settings-label-icon"><Bell size={16} /><span><strong>{t('settings.weeklySummary')}</strong><small>{t('settings.weeklySummaryDescription')}</small></span></span>
            <button aria-checked={weeklySummary} className={`switch${weeklySummary ? ' switch-on' : ''}`} onClick={() => setWeeklySummary(!weeklySummary)} role="switch" type="button"><span /></button>
          </div>
          <p className="settings-note">{t('settings.sessionNote')}</p>
        </section>
      </div>
    </div>
  )
}