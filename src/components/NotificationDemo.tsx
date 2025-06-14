'use client'

import { useState } from 'react'
import { Bell, RotateCcw, TestTube } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationDemo() {
  const [showDemo, setShowDemo] = useState(false)
  const { resetNotifications, unreadCount } = useNotifications()

  const simulateMorning = () => {
    // Simuler l'heure du matin et réinitialiser les notifications
    const today = new Date().toISOString().split('T')[0]
    localStorage.removeItem('bodycount-notifications-reset')
    localStorage.removeItem('bodycount-toast-shown')
    resetNotifications()
    
    // Force refresh de la page pour réinitialiser les composants
    window.location.reload()
  }

  const resetDemo = () => {
    // Remettre les notifications comme complétées
    const stored = localStorage.getItem('bodycount-notifications')
    if (stored) {
      const notifications = JSON.parse(stored)
      const completedNotifications = notifications.map((notif: any) => ({
        ...notif,
        completed: true,
        lastCompleted: new Date().toISOString().split('T')[0]
      }))
      localStorage.setItem('bodycount-notifications', JSON.stringify(completedNotifications))
    }
    
    // Marquer le toast comme déjà montré
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem('bodycount-toast-shown', today)
    localStorage.setItem('bodycount-notifications-reset', today)
    
    window.location.reload()
  }

  if (!showDemo) {
    return (
      <button
        onClick={() => setShowDemo(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-40"
        title="Demo notifications"
      >
        <TestTube className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-xl border border-gray-200 p-4 max-w-sm z-40">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gray-900 text-sm">
          <FormattedMessage id="notificationDemo.title" />
        </h4>
        <button
          onClick={() => setShowDemo(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm text-gray-600">
            <FormattedMessage id="notificationDemo.pendingNotifications" />
          </span>
          <span className="font-bold text-pink-600">{unreadCount}</span>
        </div>
        
        <button
          onClick={simulateMorning}
          className="w-full bg-pink-500 text-white p-2 rounded-lg hover:bg-pink-600 transition-colors text-sm flex items-center justify-center space-x-2"
        >
          <Bell className="h-4 w-4" />
          <span>
            <FormattedMessage id="notificationDemo.simulateMorning" />
          </span>
        </button>
        
        <button
          onClick={resetDemo}
          className="w-full bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center justify-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>
            <FormattedMessage id="notificationDemo.markAllDone" />
          </span>
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-3">
        <FormattedMessage id="notificationDemo.instructions" />
      </p>
    </div>
  )
}