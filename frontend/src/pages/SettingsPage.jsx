import { useState } from 'react'
import { Bell, CircleDollarSign, UserRound } from 'lucide-react'
import PageHeading from '../components/PageHeading.jsx'

export default function SettingsPage() {
  const [currency, setCurrency] = useState('USD')
  const [weeklySummary, setWeeklySummary] = useState(true)

  return (
    <div className="workspace-page">
      <PageHeading eyebrow="YOUR NEXFI" title="Settings" description="Personalize the way your financial overview works for you." />
      <div className="settings-grid">
        <section className="workspace-panel settings-panel">
          <div className="settings-heading"><span className="settings-icon"><UserRound size={18} /></span><div><h2>Profile</h2><p>Your personal NexFi profile.</p></div></div>
          <div className="settings-row"><span><strong>Account name</strong><small>The name shown in your workspace</small></span><span className="settings-value">NexFi member</span></div>
          <div className="settings-row"><span><strong>Account type</strong><small>Your workspace access</small></span><span className="settings-value">Personal</span></div>
        </section>

        <section className="workspace-panel settings-panel">
          <div className="settings-heading"><span className="settings-icon settings-icon-lime"><CircleDollarSign size={18} /></span><div><h2>Preferences</h2><p>Choose how your information is displayed.</p></div></div>
          <label className="settings-row" htmlFor="currency-select"><span><strong>Display currency</strong><small>Used for amounts across NexFi</small></span>
            <select className="settings-select" id="currency-select" onChange={(event) => setCurrency(event.target.value)} value={currency}>
              <option value="USD">USD · US Dollar</option><option value="EUR">EUR · Euro</option><option value="GBP">GBP · British Pound</option>
            </select>
          </label>
          <div className="settings-row"><span className="settings-label-icon"><Bell size={16} /><span><strong>Weekly summary</strong><small>Show a weekly overview preference</small></span></span>
            <button aria-checked={weeklySummary} className={`switch${weeklySummary ? ' switch-on' : ''}`} onClick={() => setWeeklySummary(!weeklySummary)} role="switch" type="button"><span /></button>
          </div>
          <p className="settings-note">Preferences are currently stored for this session only.</p>
        </section>
      </div>
    </div>
  )
}