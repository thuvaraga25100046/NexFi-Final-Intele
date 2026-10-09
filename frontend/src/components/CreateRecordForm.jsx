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
  const { t } = useTranslation()
  const config = formConfig[kind]
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState(record?.status ?? 'pending')

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
    const payload = { ...formData, amount: Number(formData.amount) }

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