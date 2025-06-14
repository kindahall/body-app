'use client'

import { useState, useEffect } from 'react'
import { useIntl } from 'react-intl'

export interface NotificationItem {
  id: string
  title: string
  description: string
  action: string
  route: string
  completed: boolean
  lastCompleted?: string
  priority: 'high' | 'medium' | 'low'
  category: 'daily' | 'weekly' | 'reminder'
}

export const useNotifications = () => {
  const intl = useIntl()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Définir les notifications par défaut avec internationalisation
  const getDefaultNotifications = (): Omit<NotificationItem, 'id' | 'completed' | 'lastCompleted'>[] => [
    {
      title: intl.formatMessage({ id: 'notifications.items.confession.title' }),
      description: intl.formatMessage({ id: 'notifications.items.confession.description' }),
      action: intl.formatMessage({ id: 'notifications.items.confession.action' }),
      route: '/confessions',
      priority: 'high',
      category: 'daily'
    },
    {
      title: intl.formatMessage({ id: 'notifications.items.journal.title' }),
      description: intl.formatMessage({ id: 'notifications.items.journal.description' }),
      action: intl.formatMessage({ id: 'notifications.items.journal.action' }),
      route: '/journal',
      priority: 'high',
      category: 'daily'
    },
    {
      title: intl.formatMessage({ id: 'notifications.items.mirror.title' }),
      description: intl.formatMessage({ id: 'notifications.items.mirror.description' }),
      action: intl.formatMessage({ id: 'notifications.items.mirror.action' }),
      route: '/mirror',
      priority: 'medium',
      category: 'weekly'
    },
    {
      title: intl.formatMessage({ id: 'notifications.items.wishlist.title' }),
      description: intl.formatMessage({ id: 'notifications.items.wishlist.description' }),
      action: intl.formatMessage({ id: 'notifications.items.wishlist.action' }),
      route: '/wishlist',
      priority: 'medium',
      category: 'weekly'
    },
    {
      title: intl.formatMessage({ id: 'notifications.items.insights.title' }),
      description: intl.formatMessage({ id: 'notifications.items.insights.description' }),
      action: intl.formatMessage({ id: 'notifications.items.insights.action' }),
      route: '/insights',
      priority: 'medium',
      category: 'weekly'
    },
    {
      title: intl.formatMessage({ id: 'notifications.items.charts.title' }),
      description: intl.formatMessage({ id: 'notifications.items.charts.description' }),
      action: intl.formatMessage({ id: 'notifications.items.charts.action' }),
      route: '/charts',
      priority: 'low',
      category: 'weekly'
    },
    {
      title: intl.formatMessage({ id: 'notifications.items.addRelation.title' }),
      description: intl.formatMessage({ id: 'notifications.items.addRelation.description' }),
      action: intl.formatMessage({ id: 'notifications.items.addRelation.action' }),
      route: '/add-relationship',
      priority: 'medium',
      category: 'reminder'
    }
  ]

  // Fonction pour vérifier si c'est 6h du matin (heure française)
  const isMorningTime = () => {
    const now = new Date()
    const parisTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Paris"}))
    return parisTime.getHours() === 6
  }

  // Fonction pour obtenir la date du jour en format YYYY-MM-DD
  const getTodayString = () => {
    const now = new Date()
    const parisTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Paris"}))
    return parisTime.toISOString().split('T')[0]
  }

  // Fonction pour charger les notifications depuis le localStorage
  const loadNotificationsFromStorage = () => {
    try {
      const stored = localStorage.getItem('bodycount-notifications')
      const lastReset = localStorage.getItem('bodycount-notifications-reset')
      const today = getTodayString()

      // Réinitialiser les notifications quotidiennes si c'est un nouveau jour
      if (lastReset !== today) {
        const freshNotifications = getDefaultNotifications().map((notif, index) => ({
          ...notif,
          id: `notif-${index}`,
          completed: false,
          lastCompleted: undefined
        }))
        
        localStorage.setItem('bodycount-notifications', JSON.stringify(freshNotifications))
        localStorage.setItem('bodycount-notifications-reset', today)
        return freshNotifications
      }

      if (stored) {
        const storedNotifications = JSON.parse(stored) as NotificationItem[]
        // Mettre à jour les textes avec les traductions actuelles
        const updatedNotifications = storedNotifications.map((storedNotif, index) => {
          const defaultNotif = getDefaultNotifications()[index]
          return defaultNotif ? {
            ...storedNotif,
            title: defaultNotif.title,
            description: defaultNotif.description,
            action: defaultNotif.action
          } : storedNotif
        })
        return updatedNotifications
      }
      
      // Première fois, créer les notifications
      const freshNotifications = getDefaultNotifications().map((notif, index) => ({
        ...notif,
        id: `notif-${index}`,
        completed: false,
        lastCompleted: undefined
      }))
      
      localStorage.setItem('bodycount-notifications', JSON.stringify(freshNotifications))
      localStorage.setItem('bodycount-notifications-reset', today)
      return freshNotifications
    } catch (error) {
      console.error('Error loading notifications:', error)
      return []
    }
  }

  // Fonction pour sauvegarder les notifications
  const saveNotificationsToStorage = (notifs: NotificationItem[]) => {
    try {
      localStorage.setItem('bodycount-notifications', JSON.stringify(notifs))
    } catch (error) {
      console.error('Error saving notifications:', error)
    }
  }

  // Recharger les notifications quand la langue change
  useEffect(() => {
    const storedNotifications = localStorage.getItem('bodycount-notifications')
    if (storedNotifications) {
      try {
        const parsed = JSON.parse(storedNotifications) as NotificationItem[]
        // Mettre à jour avec les nouvelles traductions
        const updatedNotifications = parsed.map((storedNotif, index) => {
          const defaultNotif = getDefaultNotifications()[index]
          return defaultNotif ? {
            ...storedNotif,
            title: defaultNotif.title,
            description: defaultNotif.description,
            action: defaultNotif.action
          } : storedNotif
        })
        setNotifications(updatedNotifications)
        saveNotificationsToStorage(updatedNotifications)
      } catch (error) {
        console.error('Error updating notification translations:', error)
      }
    }
  }, [intl.locale])

  // Initialiser les notifications
  useEffect(() => {
    setIsLoading(true)
    const loadedNotifications = loadNotificationsFromStorage()
    setNotifications(loadedNotifications)
    
    // Calculer le nombre de notifications non lues
    const unread = loadedNotifications.filter(n => !n.completed).length
    setUnreadCount(unread)
    
    setIsLoading(false)
  }, [])

  // Vérifier chaque minute si c'est l'heure de réinitialiser (6h du matin)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMorningTime()) {
        const today = getTodayString()
        const lastReset = localStorage.getItem('bodycount-notifications-reset')
        
        if (lastReset !== today) {
          // Réinitialiser les notifications
          const resetNotifications = notifications.map(notif => ({
            ...notif,
            completed: notif.category === 'reminder' ? notif.completed : false,
            lastCompleted: notif.completed ? getTodayString() : notif.lastCompleted
          }))
          
          setNotifications(resetNotifications)
          saveNotificationsToStorage(resetNotifications)
          localStorage.setItem('bodycount-notifications-reset', today)
          
          // Recalculer le nombre non lu
          const unread = resetNotifications.filter(n => !n.completed).length
          setUnreadCount(unread)
        }
      }
    }, 60000) // Vérifier chaque minute

    return () => clearInterval(interval)
  }, [notifications])

  // Marquer une notification comme complétée
  const markAsCompleted = (notificationId: string) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId 
        ? { ...notif, completed: true, lastCompleted: getTodayString() }
        : notif
    )
    
    setNotifications(updatedNotifications)
    saveNotificationsToStorage(updatedNotifications)
    
    // Recalculer le nombre non lu
    const unread = updatedNotifications.filter(n => !n.completed).length
    setUnreadCount(unread)
  }

  // Marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({
      ...notif,
      completed: true,
      lastCompleted: getTodayString()
    }))
    
    setNotifications(updatedNotifications)
    saveNotificationsToStorage(updatedNotifications)
    setUnreadCount(0)
  }

  // Réinitialiser toutes les notifications (pour la démo)
  const resetNotifications = () => {
    const resetNotifications = getDefaultNotifications().map((notif, index) => ({
      ...notif,
      id: `notif-${index}`,
      completed: false,
      lastCompleted: undefined
    }))
    
    setNotifications(resetNotifications)
    saveNotificationsToStorage(resetNotifications)
    setUnreadCount(resetNotifications.length)
  }

  // Obtenir les notifications par priorité
  const getNotificationsByPriority = (priority: 'high' | 'medium' | 'low') => {
    return notifications.filter(n => n.priority === priority && !n.completed)
  }

  // Obtenir toutes les notifications en attente
  const getPendingNotifications = () => {
    return notifications.filter(n => !n.completed)
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsCompleted,
    markAllAsRead,
    resetNotifications,
    getNotificationsByPriority,
    getPendingNotifications
  }
}