import { useState } from 'react'
import { supportedCurrencies, supportedLanguages, translate } from './translations.js'
import LanguageContext from './languageContext.js'

const STORAGE_KEY = 'nexfi-language'
const CURRENCY_STORAGE_KEY = 'nexfi-currency'

function getSavedLanguage() {
  try {
    const language = localStorage.getItem(STORAGE_KEY)
    return supportedLanguages.includes(language) ? language : 'en'
  } catch {
    return 'en'
  }
}

function getSavedCurrency() {
  try {
    const currency = localStorage.getItem(CURRENCY_STORAGE_KEY)
    return supportedCurrencies.includes(currency) ? currency : 'LKR'
  } catch {
    return 'LKR'
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getSavedLanguage)
  const [currency, setCurrencyState] = useState(getSavedCurrency)
  const setLanguage = (nextLanguage) => {
    if (!supportedLanguages.includes(nextLanguage)) return
    setLanguageState(nextLanguage)
    try {
      localStorage.setItem(STORAGE_KEY, nextLanguage)
    } catch {
      return
    }
  }
  const setCurrency = (nextCurrency) => {
    if (!supportedCurrencies.includes(nextCurrency)) return
    setCurrencyState(nextCurrency)
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, nextCurrency)
    } catch {
      return
    }
  }
  const t = (key, values) => translate(language, key, values)

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currency, setCurrency, t }}>
      {children}
    </LanguageContext.Provider>
  )
}