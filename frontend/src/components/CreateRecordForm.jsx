import { useState } from 'react'

import {
  createPayable,
  createReceivable,
  createTransaction,
  updatePayable,
  updateReceivable,
  updateTransaction,
} from '../services/api.js'
import useTranslation from '../i18n/useTranslation.js'
import { translateApiError } from '../i18n/translations.js'

const today = new Date().toISOString().slice(0, 10)

const formConfig = {
  transaction: {
    titleKey: 'forms.addTransaction',
    editTitleKey: 'forms.editTransaction',
    submitLabelKey: 'actions.saveTransaction',
    submit: createTransaction,
    update: updateTransaction,
    fields: [
      { name: 'type', labelKey: 'forms.type', type: 'select', options: [['income', 'types.income'], ['expense', 'types.expense']] },
      { name: 'amount', labelKey: 'forms.amount', type: 'number', min: '0.01', step: '0.01', placeholderKey: 'forms.amountPlaceholder' },
      { name: 'category', labelKey: 'forms.category', type: 'text', maxLength: 100, placeholderKey: 'forms.salaryPlaceholder' },
      { name: 'transactionDate', labelKey: 'forms.date', type: 'date', defaultValue: today },
      { name: 'description', labelKey: 'forms.description', type: 'text', maxLength: 500, required: false, placeholderKey: 'forms.notePlaceholder' },
    ],
  },
  receivable: {
    titleKey: 'forms.addReceivable',
    editTitleKey: 'forms.editReceivable',
    submitLabelKey: 'actions.saveReceivable',
    submit: createReceivable,
    update: updateReceivable,
    fields: [
      { name: 'customerName', labelKey: 'forms.customerName', type: 'text', maxLength: 150, placeholderKey: 'forms.customerPlaceholder' },
      { name: 'amount', labelKey: 'forms.amount', type: 'number', min: '0.01', step: '0.01', placeholderKey: 'forms.amountPlaceholder' },
      { name: 'dueDate', labelKey: 'forms.dueDate', type: 'date', defaultValue: today },
      { name: 'status', labelKey: 'forms.status', type: 'select', options: [['pending', 'statuses.pending'], ['paid', 'statuses.paid'], ['overdue', 'statuses.overdue']] },
      { name: 'paymentDate', labelKey: 'forms.paymentDate', type: 'date', defaultValue: today, max: today, paidOnly: true },
    ],
  },
  payable: {
    titleKey: 'forms.addPayable',
    editTitleKey: 'forms.editPayable',
    submitLabelKey: 'actions.savePayable',
    submit: createPayable,
    update: updatePayable,
    fields: [
      { name: 'vendorName', labelKey: 'forms.vendorName', type: 'text', maxLength: 150, placeholderKey: 'forms.vendorPlaceholder' },
      { name: 'amount', labelKey: 'forms.amount', type: 'number', min: '0.01', step: '0.01', placeholderKey: 'forms.amountPlaceholder' },
      { name: 'dueDate', labelKey: 'forms.dueDate', type: 'date', defaultValue: today },
      { name: 'status', labelKey: 'forms.status', type: 'select', options: [['pending', 'statuses.pending'], ['paid', 'statuses.paid'], ['overdue', 'statuses.overdue']] },
      { name: 'paymentDate', labelKey: 'forms.paymentDate', type: 'date', defaultValue: today, max: today, paidOnly: true },
    ],
  },
}

export default function CreateRecordForm({ kind, record, onCancel, onCreated }) {
  const { t, language } = useTranslation()
  const config = formConfig[kind]
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState(record?.status ?? 'pending')
  
  const [chequeType, setChequeType] = useState(record?.chequeType ?? 'received')
  const [chequeNumber, setChequeNumber] = useState(record?.chequeNumber ?? '')
  const [bankName, setBankName] = useState(record?.bankName ?? '')
  const [chequeDate, setChequeDate] = useState(record?.chequeDate ?? today)

  // Language-ku etha maathiri text-galai switch seiyum helper
  const getChequeText = () => {
    if (language === 'ta') {
      return {
        direction: 'செக் வகை (Cheque Type)',
        received: 'நாங்கள் வாங்கிய செக் (Received)',
        issued: 'நாங்கள் கொடுத்த செக் (Issued)',
        number: 'செக் எண் (Cheque Number)',
        bank: 'வங்கியின் பெயர் (Bank Name)',
        date: 'செக் தேதி (Cheque Date)',
      }
    } else if (language === 'si') {
      return {
        direction: 'චෙක්පත් වර්ගය (Cheque Type)',
        received: 'ලැබුණු චෙක්පත (Received)',
        issued: 'දුන් චෙක්පත (Issued)',
        number: 'චෙක්පත් අංකය (Cheque Number)',
        bank: 'බැංකුවේ නම (Bank Name)',
        date: 'චෙක්පත් දිනය (Cheque Date)',
      }
    } else {
      return {
        direction: 'Cheque Type (Cheque Direction)',
        received: 'Received Cheque',
        issued: 'Issued Cheque',
        number: 'Cheque Number',
        bank: 'Bank Name',
        date: 'Cheque Date',
      }
    }
  }

  const cText = getChequeText()

  function handleInvalid(event) {
    const field = event.target
    const label = t(field.dataset.labelKey)
    const validity = field.validity

    if (validity.valueMissing) {
      field.setCustomValidity(t('validation.requiredField', { field: label }))
    } else if (validity.rangeUnderflow) {
      field.setCustomValidity(t('validation.amountPositive'))
    } else if (validity.stepMismatch) {
      field.setCustomValidity(t('validation.amountPrecision'))
    } else if (validity.tooLong) {
      field.setCustomValidity(t('validation.maxLength', { count: field.maxLength }))
    } else {
      field.setCustomValidity(t('messages.validationFailed'))
    }
  }

  function clearValidation(event) {
    event.target.setCustomValidity('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const formData = Object.fromEntries(new FormData(event.currentTarget))
    let payload = { ...formData, amount: Number(formData.amount) }

    if (kind === 'receivable' || kind === 'cheque') {
      payload = { ...payload, chequeType, chequeNumber, bankName, chequeDate }
    }

    try {
      if (record) {
        await config.update(record.id, payload)
      } else {
        await config.submit(payload)
      }
      onCreated()
    } catch (requestError) {
      setError(requestError.message || t('messages.saveFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="record-form workspace-panel" onInput={clearValidation} onInvalid={handleInvalid} onSubmit={handleSubmit}>
      <div className="record-form-heading"><h2>{t(record ? config.editTitleKey : config.titleKey)}</h2><p>{t('forms.requiredHelp')}</p></div>
      
      {(kind === 'receivable' || kind === 'cheque') && (
        <div className="mb-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            {cText.direction}
          </label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              type="button"
              onClick={() => setChequeType('received')}
              className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                chequeType === 'received'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {cText.received}
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
              {cText.issued}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{cText.number}</label>
              <input
                type="text"
                value={chequeNumber}
                onChange={(e) => setChequeNumber(e.target.value)}
                placeholder="e.g. 123456"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{cText.bank}</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Commercial Bank"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{cText.date}</label>
              <input
                type="date"
                value={chequeDate}
                onChange={(e) => setChequeDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      <div className="record-form-fields">
        {config.fields.map((field) => (
          field.paidOnly && status !== 'paid' ? null : (
          <label className={`record-field${field.name === 'description' ? ' record-field-wide' : ''}`} key={field.name}>
            <span>{t(field.labelKey)}</span>
            {field.type === 'select' ? (
              <select
                data-label-key={field.labelKey}
                defaultValue={record?.[field.name] ?? field.options[0][0]}
                name={field.name}
                onChange={field.name === 'status' ? (event) => setStatus(event.target.value) : undefined}
                required
              >
                {field.options.map(([value, labelKey]) => <option key={value} value={value}>{t(labelKey)}</option>)}
              </select>
            ) : (
              <input
                defaultValue={record?.[field.name] ?? field.defaultValue}
                data-label-key={field.labelKey}
                maxLength={field.maxLength}
                max={field.max}
                min={field.min}
                name={field.name}
                placeholder={field.placeholderKey ? t(field.placeholderKey) : undefined}
                required={field.required !== false}
                step={field.step}
                type={field.type}
              />
            )}
          </label>
          )
        ))}
      </div>
      {error && <p className="record-form-error" role="alert">{t('messages.error')}: {translateApiError(error, t)}</p>}
      <div className="record-form-actions">
        <button className="record-cancel" onClick={onCancel} type="button">{t('actions.cancel')}</button>
        <button className="button button-dark record-submit" disabled={submitting} type="submit">
          {submitting ? t('actions.saving') : t(config.submitLabelKey)}
        </button>
      </div>
    </form>
  )
}