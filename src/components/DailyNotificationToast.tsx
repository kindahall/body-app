'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Sun } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

interface DailyNotificationToastProps {
  onDismiss?: () => void
}

export default function DailyNotificationToast({ onDismiss }: DailyNotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasShownToday, setHasShownToday] = useState(false)

  // Fonction pour obtenir la date du jour en format YYYY-MM-DD
  const getTodayString = () => {
    const now = new Date()
    const parisTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Paris"}))
    return parisTime.toISOString().split('T')[0]
  }

  // Fonction pour vérifier si c'est le matin (entre 6h et 10h, heure française)
  const isMorningTime = () => {
    const now = new Date()
    const parisTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Paris"}))
    const hour = parisTime.getHours()
    return hour >= 6 && hour <= 10
  }

  useEffect(() => {
    const checkAndShowNotification = () => {
      const today = getTodayString()
      const lastShown = localStorage.getItem('bodycount-toast-shown')
      
      // Afficher la notification si :
      // 1. C'est le matin (6h-10h)
      // 2. On n'a pas encore montré la notification aujourd'hui
      // 3. On n'a pas encore montré la notification dans cette session
      if (isMorningTime() && lastShown !== today && !hasShownToday) {
        setIsVisible(true)
        setHasShownToday(true)
        localStorage.setItem('bodycount-toast-shown', today)
      }
    }

    // Vérifier immédiatement
    checkAndShowNotification()

    // Vérifier toutes les minutes
    const interval = setInterval(checkAndShowNotification, 60000)

    return () => clearInterval(interval)
  }, [hasShownToday])

  const handleDismiss = () => {
    setIsVisible(false)
    if (onDismiss) {
      onDismiss()
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-[slideInRight_500ms_ease-out]">
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl shadow-xl p-4 max-w-sm border border-white/20 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Sun className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm mb-1">
                <FormattedMessage id="dailyToast.title" />
              </h4>
              <p className="text-xs opacity-90 mb-2">
                <FormattedMessage id="dailyToast.description" />
              </p>
              <div className="flex items-center space-x-1 text-xs opacity-80">
                <Bell className="h-3 w-3" />
                <span>
                  <FormattedMessage id="dailyToast.instruction" />
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition-colors ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Styles CSS pour l'animation
const styles = `
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
`

// Injecter les styles dans le document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = styles
  document.head.appendChild(styleElement)
}