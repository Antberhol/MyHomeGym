import { useEffect, useMemo, useState } from 'react'
import i18n, { LANGUAGE_STORAGE_KEY } from '../i18n'
import { LanguageContext } from './language-context'

function getInitialLanguage() {
  const value = (window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? i18n.language).toLowerCase()
  return value.startsWith('en') ? 'en' : 'es'
}

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage)

  // El idioma del documento sigue al de la app: lo usan los lectores de pantalla y el corrector.
  useEffect(() => {
    document.documentElement.lang = currentLanguage
  }, [currentLanguage])

  const changeLanguage = async (lang) => {
    await i18n.changeLanguage(lang)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    setCurrentLanguage(lang)
  }

  const value = useMemo(
    () => ({
      currentLanguage,
      changeLanguage,
    }),
    [currentLanguage],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
