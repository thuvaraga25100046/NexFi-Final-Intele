import { useState } from 'react'
import { supportedLanguages, translate } from './translations.js'
import LanguageContext from './languageContext.js'

const STORAGE_KEY = 'nexfi-language'

function getSavedLanguage() {
  try {
    const language = localStorage.getItem(STORAGE_KEY)
    return supportedLanguages.includes(language) ? language : 'en'
  } catch {
    return 'en'
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getSavedLanguage)
  const setLanguage = (nextLanguage) => {
    if (!supportedLanguages.includes(nextLanguage)) return
    setLanguageState(nextLanguage)
    try {
      localStorage.setItem(STORAGE_KEY, nextLanguage)
    } catch {
      return
    }
  }
  const t = (key, values) => translate(language, key, values)

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}