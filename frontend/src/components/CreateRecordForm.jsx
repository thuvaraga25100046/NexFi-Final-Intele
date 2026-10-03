import { useState } from 'react'
import { createReceivable, createTransaction } from '../services/api.js'

const today = new Date().toISOString().slice(0, 10)

const formConfig = {
  transaction: {
    title: 'Add transaction',
    submitLabel: 'Save transaction',
    submit: createTransaction,
    fields: [
      { name: 'type', label: 'Type', type: 'select', options: [['income', 'Income'], ['expense', 'Expense']] },
      { name: 'amount', label: 'Amount', type: 'number', min: '0.01', step: '0.01', placeholder: '0.00' },
      { name: 'category', label: 'Category', type: 'text', maxLength: 100, placeholder: 'e.g. Salary' },
      { name: 'transactionDate', label: 'Date', type: 'date', defaultValue: today },
      { name: 'description', label: 'Description', type: 'text', maxLength: 500, required: false, placeholder: 'Add a note (optional)' },
    ],
  },
  receivable: {
    title: 'Add receivable',
    submitLabel: 'Save receivable',
    submit: createReceivable,
    fields: [
      { name: 'customerName', label: 'Customer name', type: 'text', maxLength: 150, placeholder: 'e.g. Northstar Studio' },
      { name: 'amount', label: 'Amount', type: 'number', min: '0.01', step: '0.01', placeholder: '0.00' },
      { name: 'dueDate', label: 'Due date', type: 'date', defaultValue: today },
      { name: 'status', label: 'Status', type: 'select', options: [['pending', 'Pending'], ['paid', 'Paid'], ['overdue', 'Overdue']] },
    ],
  },
}

export default function CreateRecordForm({ kind, onCancel, onCreated }) {
  const config = formConfig[kind]
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const formData = Object.fromEntries(new FormData(event.currentTarget))
    const payload = { ...formData, amount: Number(formData.amount) }

    try {
      await config.submit(payload)
      onCreated()
    } catch (requestError) {
      setError(requestError.message || 'Could not save this record. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="record-form workspace-panel" onSubmit={handleSubmit}>
      <div className="record-form-heading"><h2>{config.title}</h2><p>Required fields are marked by the browser.</p></div>
      <div className="record-form-fields">
        {config.fields.map((field) => (
          <label className={`record-field${field.name === 'description' ? ' record-field-wide' : ''}`} key={field.name}>
            <span>{field.label}</span>
            {field.type === 'select' ? (
              <select defaultValue={field.options[0][0]} name={field.name} required>
                {field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            ) : (
              <input
                defaultValue={field.defaultValue}
                maxLength={field.maxLength}
                min={field.min}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required !== false}
                step={field.step}
                type={field.type}
              />
            )}
          </label>
        ))}
      </div>
      {error && <p className="record-form-error" role="alert">{error}</p>}
      <div className="record-form-actions">
        <button className="record-cancel" onClick={onCancel} type="button">Cancel</button>
        <button className="button button-dark record-submit" disabled={submitting} type="submit">
          {submitting ? 'Saving…' : config.submitLabel}
        </button>
      </div>
    </form>
  )
}