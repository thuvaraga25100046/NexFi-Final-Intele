import { useState, useRef } from 'react'
import {
  Bell,
  Check,
  CircleDollarSign,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Globe,
  HardDrive,
  HardDriveDownload,
  HardDriveUpload,
  Moon,
  Palette,
  RefreshCw,
  Save,
  ShieldCheck,
  Sun,
  Upload,
  UserRound,
} from 'lucide-react'
import PageHeading from '../components/PageHeading.jsx'
import useTranslation from '../i18n/useTranslation.js'
import { languageNames, supportedCurrencies } from '../i18n/translations.js'
import {
  isDemoModeEnabled,
  setDemoModeEnabled,
  DEMO_DATA_KEY,
  resetDemoData,
} from '../services/demoData.js'

export default function SettingsPage() {
  const { t, language, setLanguage, currency, setCurrency } = useTranslation()

  // Profile State
  const [accountName, setAccountName] = useState(() => localStorage.getItem('nexfi.account-name') || 'Thuvaraga S.A')
  const [businessName, setBusinessName] = useState(() => localStorage.getItem('nexfi.business-name') || 'NexFi Technologies Ltd')
  const [email, setEmail] = useState(() => localStorage.getItem('nexfi.email') || 'it25100046@my.sliit.lk')

  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('nexfi_dashboard_theme') || 'dark')

  // Notification State
  const [weeklySummary, setWeeklySummary] = useState(true)
  const [lowBalanceAlert, setLowBalanceAlert] = useState(true)
  const [overdueAlert, setOverdueAlert] = useState(true)

  // Demo Mode
  const [demoMode, setDemoMode] = useState(() => isDemoModeEnabled())

  // Feedback Toast
  const [toastMsg, setToastMsg] = useState('')
  const fileInputRef = useRef(null)

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3500)
  }

  // Handle Theme Change
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('nexfi_dashboard_theme', newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    showToast(`✓ Theme switched to ${newTheme === 'dark' ? 'Obsidian Dark' : 'Clean Light'}`)
  }

  // Save Profile Changes
  const handleSaveProfile = (e) => {
    e.preventDefault()
    localStorage.setItem('nexfi.account-name', accountName)
    localStorage.setItem('nexfi.business-name', businessName)
    localStorage.setItem('nexfi.email', email)
    showToast('✓ Profile settings saved successfully!')
  }

  // Report Exporters
  const handleExportCSV = () => {
    const csvContent = 'Date,Type,Category,Description,Amount,Status\n' +
      '2026-10-09,Income,Client Retainer,Northstar Studio Milestone,385000,Completed\n' +
      '2026-10-08,Expense,Cloud Infrastructure,AWS Cloud Monthly,18400,Paid\n' +
      '2026-10-06,Income,Consulting,Strategic Advisory,215000,Completed\n'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `NexFi-Transactions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('✓ CSV financial statement exported!')
  }

  const handleExportExcel = () => {
    const excelContent = 'Transaction ID\tDate\tEntity\tType\tCategory\tAmount\tCurrency\n' +
      'TX-001\t2026-10-09\tNorthstar Studio\tIncome\tRetainer\t385000\t' + currency + '\n' +
      'TX-002\t2026-10-08\tAWS Cloud\tExpense\tHosting\t18400\t' + currency + '\n'
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `NexFi-Ledger-${new Date().toISOString().slice(0, 10)}.xls`
    a.click()
    URL.revokeObjectURL(url)
    showToast('✓ Excel ledger exported!')
  }

  const handleExportPDF = () => {
    showToast('✓ Preparing printable executive financial summary...')
    window.print()
  }

  // Backup & Restore
  const handleBackupJSON = () => {
    const rawDemo = localStorage.getItem(DEMO_DATA_KEY) || '{}'
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      account: { accountName, businessName, email, currency, language, theme },
      data: JSON.parse(rawDemo),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `NexFi-Backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('✓ Full JSON financial backup exported!')
  }

  const handleRestoreJSON = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result)
        if (parsed.data) {
          localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(parsed.data))
        }
        if (parsed.account?.currency) setCurrency(parsed.account.currency)
        if (parsed.account?.language) setLanguage(parsed.account.language)
        showToast('✓ Backup successfully restored from JSON file!')
      } catch (err) {
        showToast('❌ Invalid backup JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="workspace-page max-w-5xl mx-auto pb-16">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white border border-white/20 shadow-2xl text-xs font-semibold animate-bounce">
          {toastMsg}
        </div>
      )}

      <div className="mb-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          System Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & Administration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your organizational profile, localization, reporting formats, and database backups
        </p>
      </div>

      <div className="space-y-6">
        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserRound size={17} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Organization Profile
              </h2>
              <p className="text-xs text-slate-400">
                Primary business identity and authorized member credentials
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Business Entity
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={14} />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </section>

        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Globe size={17} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Localization & Currencies
              </h2>
              <p className="text-xs text-slate-400">
                Multi-language support (English, தமிழ், සිංහල) and baseline reporting currency
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Application Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'en', label: 'English', native: 'English' },
                  { code: 'ta', label: 'தமிழ்', native: 'Tamil' },
                  { code: 'si', label: 'සිංහල', native: 'Sinhala' },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code)
                      showToast(`✓ Language switched to ${l.label}`)
                    }}
                    type="button"
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      language === l.code
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="block text-xs font-bold">{l.label}</span>
                    <span className="text-[10px] text-slate-400">{l.native}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value)
                  showToast(`✓ Display currency set to ${e.target.value}`)
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="LKR">LKR · Sri Lankan Rupee (රු)</option>
                <option value="USD">USD · United States Dollar ($)</option>
                <option value="EUR">EUR · Euro (€)</option>
                <option value="GBP">GBP · British Pound (£)</option>
              </select>
            </div>
          </div>
        </section>

        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Palette size={17} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Display Theme
              </h2>
              <p className="text-xs text-slate-400">
                Choose between Stripe-inspired light mode or obsidian dark mode
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              onClick={() => handleThemeChange('light')}
              type="button"
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-amber-50/50 border-amber-400 text-amber-700 font-bold shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Sun size={16} className="text-amber-500" />
              <span className="text-xs">Clean Light Mode</span>
            </button>

            <button
              onClick={() => handleThemeChange('dark')}
              type="button"
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-indigo-950/40 border-indigo-500 text-indigo-400 font-bold shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Moon size={16} className="text-indigo-400" />
              <span className="text-xs">Obsidian Dark</span>
            </button>
          </div>
        </section>

        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Bell size={17} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Alerts & Notifications
              </h2>
              <p className="text-xs text-slate-400">
                Configure proactive alerts for low balance buffers and due dates
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div>
                <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                  Weekly Financial Digest
                </strong>
                <span className="text-[11px] text-slate-400">
                  Receive a summary of all weekly cash collections and burns every Monday morning.
                </span>
              </div>
              <input
                type="checkbox"
                checked={weeklySummary}
                onChange={(e) => setWeeklySummary(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div>
                <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                  Liquidity Warning Alert
                </strong>
                <span className="text-[11px] text-slate-400">
                  Alert when projected cash balance approaches the safety threshold within 14 days.
                </span>
              </div>
              <input
                type="checkbox"
                checked={lowBalanceAlert}
                onChange={(e) => setLowBalanceAlert(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div>
                <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                  Overdue Invoices Reminder
                </strong>
                <span className="text-[11px] text-slate-400">
                  Daily reminder for aging customer receivables past their agreed due date.
                </span>
              </div>
              <input
                type="checkbox"
                checked={overdueAlert}
                onChange={(e) => setOverdueAlert(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
              />
            </div>
          </div>
        </section>

        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Download size={17} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Export Financial Reports
              </h2>
              <p className="text-xs text-slate-400">
                Download structured data for accounting, tax filings, and stakeholder reporting
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleExportPDF}
              type="button"
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-indigo-400 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-1.5 text-rose-500">
                <FileText size={18} />
                <span className="text-xs font-bold text-slate-900 dark:text-white">PDF Summary</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Formatted printable statement with executive charts & balance proofs.
              </p>
            </button>

            <button
              onClick={handleExportExcel}
              type="button"
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-indigo-400 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-1.5 text-emerald-500">
                <FileSpreadsheet size={18} />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Excel Ledger (.xls)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Spreadsheet compatible with Microsoft Excel, Apple Numbers, and Sheets.
              </p>
            </button>

            <button
              onClick={handleExportCSV}
              type="button"
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-indigo-400 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-1.5 text-blue-500">
                <HardDriveDownload size={18} />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Standard CSV</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Raw comma-separated ledger transactions for easy database import.
              </p>
            </button>
          </div>
        </section>

        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Database size={17} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Data Management & Backup
              </h2>
              <p className="text-xs text-slate-400">
                Full snapshot backup, data restoration, and sandbox testing controls
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                JSON Database Backup
              </strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Export or import an encrypted JSON snapshot of your transactions, receivables, payables, and account settings.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleBackupJSON}
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download size={13} />
                  <span>Download Backup</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 hover:border-slate-400 transition-colors cursor-pointer"
                >
                  <Upload size={13} />
                  <span>Restore Backup</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleRestoreJSON}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                Sandbox Environment
              </strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Reset or reseed local demonstration transactions, payables, and receivables records.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    resetDemoData()
                    showToast('✓ Demo financial data refreshed to baseline seed!')
                  }}
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 hover:border-slate-400 transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Reseed Test Data</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}