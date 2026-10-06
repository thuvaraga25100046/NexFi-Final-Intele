import { localeForLanguage } from './translations.js'

export function formatCurrency(amount, language, currency = 'LKR') {
  const numericAmount = Number(amount) || 0
  if (currency === 'LKR') {
    return `Rs. ${new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
    }).format(numericAmount)}`
  }

  return new Intl.NumberFormat(localeForLanguage[language] ?? localeForLanguage.en, {
    style: 'currency',
    currency,
  }).format(numericAmount)
}

export function formatDate(date, language, options = { year: 'numeric', month: 'short', day: 'numeric' }) {
  return new Intl.DateTimeFormat(localeForLanguage[language] ?? localeForLanguage.en, options)
    .format(new Date(`${date}T00:00:00`))
}
