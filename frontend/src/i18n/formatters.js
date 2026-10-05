import { localeForLanguage } from './translations.js'

export function formatCurrency(amount, language) {
  return new Intl.NumberFormat(localeForLanguage[language] ?? localeForLanguage.en, {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount) || 0)
}

export function formatDate(date, language, options = { year: 'numeric', month: 'short', day: 'numeric' }) {
  return new Intl.DateTimeFormat(localeForLanguage[language] ?? localeForLanguage.en, options)
    .format(new Date(`${date}T00:00:00`))
}
