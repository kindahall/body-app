'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Check, Clock, AlertCircle, Star, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNotifications, NotificationItem } from '@/hooks/useNotifications'
import { FormattedMessage, useIntl } from 'react-intl'

interface NotificationButtonProps {
  className?: string
}

export default function NotificationButton({ className = '' }: NotificationButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const intl = useIntl()
  
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsCompleted,
    markAllAsRead,
    getPendingNotifications
  } = useNotifications()

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (notification: NotificationItem) => {
    markAsCompleted(notification.id)
    router.push(notification.route)
    setIsOpen(false)
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <Star className="h-4 w-4 text-blue-500" />
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-400 bg-red-50 hover:bg-red-100'
      case 'medium':
        return 'border-l-yellow-400 bg-yellow-50 hover:bg-yellow-100'
      case 'low':
        return 'border-l-blue-400 bg-blue-50 hover:bg-blue-100'
      default:
        return 'border-l-gray-400 bg-gray-50 hover:bg-gray-100'
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'daily':
        return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
          <FormattedMessage id="notifications.categories.daily" />
        </span>
      case 'weekly':
        return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          <FormattedMessage id="notifications.categories.weekly" />
        </span>
      case 'reminder':
        return <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
          <FormattedMessage id="notifications.categories.reminder" />
        </span>
      default:
        return null
    }
  }

  const pendingNotifications = getPendingNotifications()
  const highPriorityPending = pendingNotifications.filter(n => n.priority === 'high')
  const otherPending = pendingNotifications.filter(n => n.priority !== 'high')

  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className="p-2 rounded-full bg-gray-100 animate-pulse">
          <Bell className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-all duration-200 ${
          unreadCount > 0 
            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
        
        {/* Badge de notification */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">
                  <FormattedMessage id="notifications.button.dailyReminders" />
                </h3>
                <p className="text-sm text-gray-600">
                  {unreadCount > 0 ? (
                    <FormattedMessage 
                      id={unreadCount > 1 ? "notifications.button.actionsWaitingPlural" : "notifications.button.actionsWaiting"}
                      values={{ count: unreadCount }}
                    />
                  ) : (
                    <FormattedMessage id="notifications.button.allUpToDate" />
                  )}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
                >
                  <FormattedMessage id="notifications.button.markAll" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="max-h-96 overflow-y-auto">
            {pendingNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-3">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  <FormattedMessage id="notifications.empty.title" />
                </h4>
                <p className="text-sm text-gray-600">
                  <FormattedMessage id="notifications.empty.description" />
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {/* Notifications haute priorité */}
                {highPriorityPending.length > 0 && (
                  <div className="p-2">
                    <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wide px-2 mb-2">
                      <FormattedMessage id="notifications.priorities.high" />
                    </h4>
                    {highPriorityPending.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full p-3 rounded-lg border-l-4 transition-all duration-200 mb-2 text-left ${getPriorityColor(notification.priority)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {getPriorityIcon(notification.priority)}
                              <h5 className="font-semibold text-gray-900 text-sm">{notification.title}</h5>
                              {getCategoryBadge(notification.category)}
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{notification.description}</p>
                            <p className="text-xs font-medium text-gray-800">{notification.action}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Autres notifications */}
                {otherPending.length > 0 && (
                  <div className="p-2">
                    {highPriorityPending.length > 0 && (
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 mb-2">
                        <FormattedMessage id="notifications.priorities.others" />
                      </h4>
                    )}
                    {otherPending.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full p-3 rounded-lg border-l-4 transition-all duration-200 mb-2 text-left ${getPriorityColor(notification.priority)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {getPriorityIcon(notification.priority)}
                              <h5 className="font-semibold text-gray-900 text-sm">{notification.title}</h5>
                              {getCategoryBadge(notification.category)}
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{notification.description}</p>
                            <p className="text-xs font-medium text-gray-800">{notification.action}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              <FormattedMessage id="notifications.footer" />
            </p>
          </div>
        </div>
      )}
    </div>
  )
}