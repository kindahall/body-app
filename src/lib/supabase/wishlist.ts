import { createClientComponentClient } from '@/lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export type WishlistCategory = 'experience' | 'person' | 'place' | 'goal'
export type PriorityLevel = 'low' | 'medium' | 'high'

export interface WishlistItem {
  id: string
  user_id: string
  category: WishlistCategory
  title: string
  description?: string
  priority: PriorityLevel
  target_date?: string
  tags: string[]
  created_at: string
  completed_at?: string
  is_completed: boolean
  image_url?: string
}

export interface WishlistShare {
  id: string
  user_id: string
  slug: string
  expires_at?: string
  created_at: string
}

export interface WishlistStats {
  total: number
  completed: number
  byCategory: {
    experience: { total: number; completed: number }
    person: { total: number; completed: number }
    place: { total: number; completed: number }
    goal: { total: number; completed: number }
  }
  completionRate: number
  streak: number
}

export interface WishlistFilters {
  status: 'all' | 'todo' | 'completed'
  priority?: PriorityLevel
  category?: WishlistCategory
  dateRange?: {
    start: string
    end: string
  }
}

export class WishlistService {
  private static supabase = createClientComponentClient()

  // Récupérer tous les items de la wishlist
  static async getWishlistItems(filters?: WishlistFilters): Promise<WishlistItem[]> {
    let query = this.supabase
      .from('wishlist')
      .select('*')
      .order('created_at', { ascending: false })

    // Appliquer les filtres
    if (filters?.status === 'todo') {
      query = query.eq('is_completed', false)
    } else if (filters?.status === 'completed') {
      query = query.eq('is_completed', true)
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.dateRange) {
      query = query
        .gte('target_date', filters.dateRange.start)
        .lte('target_date', filters.dateRange.end)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching wishlist items:', error.message || error)
      throw error
    }

    return data || []
  }

  // Créer un nouvel item
  static async createWishlistItem(item: Partial<WishlistItem>): Promise<WishlistItem> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) {
      throw new Error('Utilisateur non authentifié.')
    }

    if (!item.title || !item.category) {
      throw new Error('Le titre et la catégorie sont obligatoires.')
    }

    const newItemData = {
      user_id: user.id,
      category: item.category,
      title: item.title,
      description: item.description || null,
      priority: item.priority || 'medium',
      target_date: item.target_date || null,
      tags: item.tags || [],
      image_url: item.image_url || null,
      is_completed: false,
    }

    const { data, error } = await this.supabase
      .from('wishlist')
      .insert(newItemData)
      .select()
      .single()

    if (error) {
      console.error('Error creating wishlist item:', error.message || error)
      throw error
    }

    return data
  }

  // Mettre à jour un item
  static async updateWishlistItem(id: string, updates: Partial<WishlistItem>): Promise<WishlistItem> {
    const { data, error } = await this.supabase
      .from('wishlist')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating wishlist item:', error.message || error)
      throw error
    }

    return data
  }

  // Marquer comme réalisé/non réalisé
  static async toggleCompleted(id: string): Promise<WishlistItem> {
    // D'abord récupérer l'item actuel
    const { data: currentItem, error: fetchError } = await this.supabase
      .from('wishlist')
      .select('is_completed')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching current item:', fetchError.message || fetchError)
      throw fetchError
    }

    const newCompletedStatus = !currentItem.is_completed
    const updates: Partial<WishlistItem> = {
      is_completed: newCompletedStatus,
      completed_at: newCompletedStatus ? new Date().toISOString() : undefined
    }

    return this.updateWishlistItem(id, updates)
  }

  // Supprimer un item
  static async deleteWishlistItem(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('wishlist')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting wishlist item:', error.message || error)
      throw error
    }
  }

  // Obtenir les statistiques
  static async getWishlistStats(): Promise<WishlistStats> {
    const { data, error } = await this.supabase
      .from('wishlist')
      .select('category, is_completed, completed_at')

    if (error) {
      console.error('Error fetching wishlist stats:', error.message || error)
      throw error
    }

    const items = data || []
    const total = items.length
    const completed = items.filter(item => item.is_completed).length

    // Statistiques par catégorie
    const byCategory = {
      experience: { total: 0, completed: 0 },
      person: { total: 0, completed: 0 },
      place: { total: 0, completed: 0 },
      goal: { total: 0, completed: 0 }
    }

    items.forEach((item: any) => {
      if (item.category in byCategory) {
        byCategory[item.category as WishlistCategory].total++
        if (item.is_completed) {
          byCategory[item.category as WishlistCategory].completed++
        }
      }
    })

    // Calculer le streak (nombre d'items complétés consécutivement récemment)
    const completedItems = items
      .filter((item: any) => item.is_completed && item.completed_at)
      .sort((a: any, b: any) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())

    let streak = 0
    const now = new Date()
    for (const item of completedItems as any[]) {
      const completedDate = new Date(item.completed_at!)
      const daysDiff = Math.floor((now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff <= 7) { // Complété dans les 7 derniers jours
        streak++
      } else {
        break
      }
    }

    return {
      total,
      completed,
      byCategory,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      streak
    }
  }

  // Créer un lien de partage
  static async createShareLink(duration: '24h' | '7d' | 'permanent'): Promise<string> {
    const slug = Math.random().toString(36).substring(2, 15)
    
    let expiresAt: string | undefined
    if (duration === '24h') {
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    } else if (duration === '7d') {
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    const { error } = await this.supabase
      .from('wishlist_shares')
      .insert([{
        slug,
        expires_at: expiresAt
      }])

    if (error) {
      console.error('Error creating share link:', error.message || error)
      throw error
    }

    return `${window.location.origin}/wishlist/shared/${slug}`
  }

  // Récupérer une wishlist partagée
  static async getSharedWishlist(slug: string): Promise<WishlistItem[]> {
    // Vérifier que le lien est valide
    const { data: shareData, error: shareError } = await this.supabase
      .from('wishlist_shares')
      .select('user_id, expires_at')
      .eq('slug', slug)
      .single()

    if (shareError || !shareData) {
      throw new Error('Lien de partage invalide')
    }

    // Vérifier l'expiration
    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
      throw new Error('Lien de partage expiré')
    }

    // Récupérer les items de la wishlist
    const { data, error } = await this.supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', shareData.user_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching shared wishlist:', error.message || error)
      throw error
    }

    return data || []
  }

  // Uploader une image
  static async uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `wishlist-images/${fileName}`

    const { error: uploadError } = await this.supabase.storage
      .from('wishlist-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError.message || uploadError)
      throw uploadError
    }

    const { data } = this.supabase.storage
      .from('wishlist-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  // Supprimer une image
  static async deleteImage(imageUrl: string): Promise<void> {
    const path = imageUrl.split('/').pop()
    if (!path) return

    const { error } = await this.supabase.storage
      .from('wishlist-images')
      .remove([`wishlist-images/${path}`])

    if (error) {
      console.error('Error deleting image:', error.message || error)
    }
  }

  // S'abonner aux changements (Realtime)
  static subscribeToChanges(userId: string, callback: (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => void) {
    return this.supabase
      .channel(`wishlist_updates:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlist',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }
}

export const wishlistService = new WishlistService()
