'use client'

import { useState, useEffect } from 'react'
import { X, Cookie } from 'lucide-react'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookie-consent')
    if (!hasConsented) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setIsVisible(false)
  }

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-4">
          <Cookie className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nous utilisons des cookies
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Nous utilisons des cookies essentiels pour faire fonctionner notre site. Nous aimerions également définir des cookies d'analyse optionnels pour nous aider à l'améliorer. 
              Nous ne définirons pas de cookies optionnels à moins que vous les activiez.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={acceptCookies}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                Accepter tous les cookies
              </button>
              <button
                onClick={declineCookies}
                className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cookies essentiels uniquement
              </button>
              <button
                onClick={declineCookies}
                className="text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Paramètres des cookies
              </button>
            </div>
          </div>
          
          <button
            onClick={declineCookies}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
            aria-label="Fermer la bannière de cookies"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}