import { WishlistCategory, PriorityLevel } from './wishlist'

export const getCategoryIcon = (category: WishlistCategory): string => {
  switch (category) {
    case 'experience': return '🌟'
    case 'person': return '👤'
    case 'place': return '📍'
    case 'goal': return '🎯'
    default: return '✨'
  }
}

export const getCategoryLabel = (category: WishlistCategory): string => {
  switch (category) {
    case 'experience': return 'Expérience'
    case 'person': return 'Personne'
    case 'place': return 'Lieu'
    case 'goal': return 'Objectif'
    default: return 'Inconnue'
  }
}

export const getPriorityColor = (priority: PriorityLevel): string => {
  switch (priority) {
    case 'low': return 'text-green-500'
    case 'medium': return 'text-yellow-500'
    case 'high': return 'text-red-500'
    default: return 'text-gray-500'
  }
}

export const getPriorityLabel = (priority: PriorityLevel): string => {
  switch (priority) {
    case 'low': return 'Faible'
    case 'medium': return 'Moyenne'
    case 'high': return 'Élevée'
    default: return 'Inconnue'
  }
}

export const formatDate = (dateString?: string, locale: string = 'fr-FR'): string => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export const isOverdue = (targetDate?: string): boolean => {
  if (!targetDate) return false
  return new Date(targetDate) < new Date() && !new Date(targetDate).toDateString().includes('0001')
} 