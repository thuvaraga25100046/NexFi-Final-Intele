import React from 'react'

export default function ChequeDetailsFields({ chequeType, setChequeType, chequeData, setChequeData }) {
  const handleChange = (e) => {
    const { name, value } = e.target
    setChequeData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
          Cheque Type (চেক வகை / Cheque Direction)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setChequeType('received')}
            className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
              chequeType === 'received'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            Naanga Vaangina Cheque (Received)
          </button>
          <button
            type="button"
            onClick={() => setChequeType('issued')}
            className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
              chequeType === 'issued'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            Naanga Kodutha Cheque (Issued)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Cheque Number
          </label>
          <input
            type="text"
            name="chequeNumber"
            value={chequeData.chequeNumber || ''}
            onChange={handleChange}
            placeholder="e.g. 123456"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Bank Name
          </label>
          <input
            type="text"
            name="bankName"
            value={chequeData.bankName || ''}
            onChange={handleChange}
            placeholder="e.g. Commercial Bank / BOC"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Cheque Date
          </label>
          <input
            type="date"
            name="chequeDate"
            value={chequeData.chequeDate || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Amount
          </label>
          <input
            type="number"
            name="amount"
            value={chequeData.amount || ''}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  )
}