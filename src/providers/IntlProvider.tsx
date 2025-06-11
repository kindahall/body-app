'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { IntlProvider as ReactIntlProvider } from 'react-intl'
import frMessages from '@/locales/fr.json'
import enMessages from '@/locales/en.json'

type Locale = 'fr' | 'en'

interface IntlContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  messages: any
}

const IntlContext = createContext<IntlContextType | null>(null)

// Flatten nested JSON messages for react-intl
function flattenMessages(nestedMessages: any, prefix = ''): Record<string, string> {
  const messages: Record<string, string> = {}
  
  for (const key in nestedMessages) {
    const value = nestedMessages[key]
    const newKey = prefix ? `${prefix}.${key}` : key
    
    if (typeof value === 'string') {
      messages[newKey] = value
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(messages, flattenMessages(value, newKey))
    }
  }
  
  return messages
}

const messages = {
  fr: flattenMessages(frMessages),
  en: flattenMessages(enMessages)
}

interface IntlProviderProps {
  children: ReactNode
}

export function IntlProvider({ children }: IntlProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('fr')

  // Load saved locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('bodycount-locale') as Locale
    if (savedLocale && (savedLocale === 'fr' || savedLocale === 'en')) {
      setLocaleState(savedLocale)
    }
  }, [])

  // Save locale to localStorage when it changes
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('bodycount-locale', newLocale)
    
    // Update document language attribute
    document.documentElement.lang = newLocale
  }

  const contextValue: IntlContextType = {
    locale,
    setLocale,
    messages: messages[locale]
  }

  return (
    <IntlContext.Provider value={contextValue}>
      <ReactIntlProvider 
        locale={locale} 
        messages={messages[locale]}
        defaultLocale="fr"
      >
        {children}
      </ReactIntlProvider>
    </IntlContext.Provider>
  )
}

// Custom hook to use the Intl context
export function useIntl() {
  const context = useContext(IntlContext)
  if (!context) {
    throw new Error('useIntl must be used within an IntlProvider')
  }
  return context
}

export default IntlProvider 