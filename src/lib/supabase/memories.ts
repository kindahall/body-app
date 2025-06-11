import { createClientComponentClient } from '@/lib/supabase'

export type MemoryKind = 'photo' | 'video' | 'note'

export interface RelationMemory {
  id: string
  relation_id: string
  user_id: string
  kind: MemoryKind
  title?: string
  description?: string
  file_url?: string
  thumbnail_url?: string
  created_at: string
}

export interface MemoryShare {
  id: string
  memory_id: string
  slug: string
  expires_at?: string
  created_at: string
}

export interface MemoryStats {
  total: number
  photos: number
  videos: number
  notes: number
  totalSize: number
}

export class MemoriesService {
  private supabase = createClientComponentClient()

  // Récupérer tous les souvenirs d'une relation
  async getRelationMemories(relationId: string): Promise<RelationMemory[]> {
    const { data, error } = await this.supabase
      .from('relation_memories')
      .select('*')
      .eq('relation_id', relationId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching relation memories:', error.message || error)
      throw error
    }

    return data || []
  }

  // Créer un nouveau souvenir
  async createMemory(memory: Omit<RelationMemory, 'id' | 'user_id' | 'created_at'>): Promise<RelationMemory> {
    // Récupérer l'utilisateur connecté
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Ajouter l'user_id automatiquement
    const memoryWithUser = {
      ...memory,
      user_id: user.id
    }

    const { data, error } = await this.supabase
      .from('relation_memories')
      .insert([memoryWithUser])
      .select()
      .single()

    if (error) {
      console.error('Error creating memory:', error.message || error)
      throw error
    }

    return data
  }

  // Mettre à jour un souvenir
  async updateMemory(id: string, updates: Partial<RelationMemory>): Promise<RelationMemory> {
    const { data, error } = await this.supabase
      .from('relation_memories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating memory:', error.message || error)
      throw error
    }

    return data
  }

  // Supprimer un souvenir
  async deleteMemory(id: string): Promise<void> {
    // 1. Récupérer les détails du souvenir pour obtenir le file_url
    const { data: memory, error: fetchError } = await this.supabase
      .from('relation_memories')
      .select('file_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching memory for deletion:', fetchError)
      throw new Error('Could not find memory to delete.')
    }

    const fileUrl = memory?.file_url

    // 2. Supprimer l'entrée dans la table relation_memories
    const { error: deleteError } = await this.supabase
      .from('relation_memories')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting memory record:', deleteError)
      throw new Error('Failed to delete memory record.')
    }

    // 3. Si un fichier était associé, le supprimer du Storage
    if (fileUrl) {
      try {
        await this.deleteFile(fileUrl)
      } catch (storageError) {
        console.warn('Failed to delete storage file, but memory record was removed:', storageError)
        // On ne relance pas l'erreur, la suppression de la DB est le plus important
      }
    }
  }

  // Upload d'un fichier (photo ou vidéo)
  async uploadFile(file: File, relationId: string, kind: MemoryKind): Promise<{ fileUrl: string, thumbnailUrl?: string }> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated for file upload.')

    const fileExt = file.name.split('.').pop()
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    
    // NOUVEAU CHEMIN: Commence par l'ID de l'utilisateur pour correspondre aux policies
    const filePath = `${user.id}/${relationId}/${kind}/${uniqueId}.${fileExt}`

    console.log(`Uploading to path: ${filePath}`) // Log pour le débogage

    const { error: uploadError } = await this.supabase.storage
      .from('memories')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError.message)
      throw new Error(`Error uploading file: "${uploadError.message}"`)
    }

    const { data: fileData } = this.supabase.storage
      .from('memories')
      .getPublicUrl(filePath)

    let thumbnailUrl: string | undefined

    // Générer une miniature pour les vidéos
    if (kind === 'video') {
      try {
        const thumbnail = await this.generateVideoThumbnail(file)
        if (thumbnail) {
          const thumbPath = `${user.id}/${relationId}/thumb_${filePath.replace(/\.[^/.]+$/, '.jpg')}`
          
          const { error: thumbError } = await this.supabase.storage
            .from('memories')
            .upload(thumbPath, thumbnail, {
              cacheControl: '3600',
              upsert: false
            })

          if (thumbError) {
            console.warn('Could not upload video thumbnail:', thumbError.message || thumbError)
          } else {
            const { data: thumbData } = this.supabase.storage
              .from('memories')
              .getPublicUrl(thumbPath)
            thumbnailUrl = thumbData.publicUrl
          }
        }
      } catch (error: any) {
        console.warn('Could not generate video thumbnail:', error.message || error)
      }
    }

    return {
      fileUrl: fileData.publicUrl,
      thumbnailUrl
    }
  }

  // Générer une miniature pour une vidéo
  private async generateVideoThumbnail(videoFile: File): Promise<Blob | null> {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        video.currentTime = Math.min(1, video.duration / 2) // Prendre une frame au milieu
      })

      video.addEventListener('seeked', () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          canvas.toBlob((blob) => {
            resolve(blob)
          }, 'image/jpeg', 0.8)
        } else {
          resolve(null)
        }
      })

      video.addEventListener('error', () => {
        resolve(null)
      })

      video.src = URL.createObjectURL(videoFile)
      video.load()
    })
  }

  // Supprimer un fichier du storage
  async deleteFile(fileUrl: string): Promise<void> {
    // Extrait le chemin du fichier depuis l'URL publique
    const urlParts = fileUrl.split('/memories/')
    if (urlParts.length < 2) {
      console.error('Invalid file URL for deletion:', fileUrl)
      return
    }
    const filePath = urlParts[1]
    
    console.log(`Deleting from path: ${filePath}`) // Log pour le débogage

    const { error } = await this.supabase.storage
      .from('memories')
      .remove([filePath])

    if (error) {
      console.error('Storage deletion error:', error.message)
      throw new Error(`Failed to delete file from storage: ${error.message}`)
    }
  }

  // Créer un lien de partage
  async createShareLink(memoryId: string, duration: '24h' | '7d' | 'permanent'): Promise<string> {
    const slug = Math.random().toString(36).substring(2, 15)
    
    let expiresAt: string | undefined
    if (duration === '24h') {
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    } else if (duration === '7d') {
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    const { error } = await this.supabase
      .from('memory_shares')
      .insert([{
        memory_id: memoryId,
        slug,
        expires_at: expiresAt
      }])

    if (error) {
      console.error('Error creating share link:', error.message || error)
      throw error
    }

    return `${window.location.origin}/memories/shared/${slug}`
  }

  // Récupérer un souvenir partagé
  async getSharedMemory(slug: string): Promise<RelationMemory | null> {
    // Vérifier que le lien est valide
    const { data: shareData, error: shareError } = await this.supabase
      .from('memory_shares')
      .select('memory_id, expires_at')
      .eq('slug', slug)
      .single()

    if (shareError || !shareData) {
      throw new Error('Lien de partage invalide ou expiré')
    }

    // Vérifier l'expiration
    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
      throw new Error('Lien de partage expiré')
    }

    // Récupérer le souvenir
    const { data: memory, error: memoryError } = await this.supabase
      .from('relation_memories')
      .select('*')
      .eq('id', shareData.memory_id)
      .single()

    if (memoryError) {
      console.error('Error fetching shared memory:', memoryError.message || memoryError)
      throw memoryError
    }

    return memory
  }

  // Obtenir les statistiques des souvenirs d'une relation
  async getMemoryStats(relationId: string): Promise<MemoryStats> {
    const { data, error } = await this.supabase
      .from('relation_memories')
      .select('kind')
      .eq('relation_id', relationId)

    if (error) {
      console.error('Error fetching memory stats:', error.message || error)
      return { total: 0, photos: 0, videos: 0, notes: 0, totalSize: 0 }
    }

    const memories = data || []
    const stats = {
      total: memories.length,
      photos: memories.filter(m => m.kind === 'photo').length,
      videos: memories.filter(m => m.kind === 'video').length,
      notes: memories.filter(m => m.kind === 'note').length,
      totalSize: 0 // TODO: Calculer la taille totale si nécessaire
    }

    return stats
  }

  // S'abonner aux changements temps réel
  subscribeToMemoryChanges(relationId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`memories_updates:${relationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'relation_memories',
          filter: `relation_id=eq.${relationId}`
        },
        callback
      )
      .subscribe()
  }

  // Compresser une image
  async compressImage(file: File, maxSizeMB: number = 2): Promise<File> {
    // Implémentation simple de compression
    // En production, utiliser une librairie comme browser-image-compression
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculer les nouvelles dimensions
        let { width, height } = img
        const maxDimension = 1920

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width
            width = maxDimension
          } else {
            width = (width * maxDimension) / height
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height

        // Dessiner l'image redimensionnée
        ctx?.drawImage(img, 0, 0, width, height)

        // Convertir en blob avec compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          0.8
        )
      }

      img.onerror = () => resolve(file)
      img.src = URL.createObjectURL(file)
    })
  }

  // Valider un fichier
  validateFile(file: File, kind: MemoryKind): { valid: boolean; error?: string } {
    const maxSizes = {
      photo: 5 * 1024 * 1024, // 5MB
      video: 100 * 1024 * 1024, // 100MB
      note: 0 // Pas de fichier pour les notes
    }

    const allowedTypes = {
      photo: ['image/jpeg', 'image/png', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/quicktime'],
      note: []
    }

    if (kind !== 'note') {
      if (file.size > maxSizes[kind]) {
        const maxSizeMB = maxSizes[kind] / (1024 * 1024)
        return {
          valid: false,
          error: `Le fichier ne doit pas dépasser ${maxSizeMB}MB`
        }
      }

      if (!allowedTypes[kind].includes(file.type)) {
        return {
          valid: false,
          error: `Type de fichier non supporté pour ${kind}`
        }
      }

      // Vérifier la durée des vidéos (approximatif)
      if (kind === 'video') {
        // Cette vérification sera faite côté client avec l'élément video
        // Pour l'instant, on fait confiance à la taille du fichier
      }
    }

    return { valid: true }
  }
}

// Instance singleton
export const memoriesService = new MemoriesService()

// Utilitaires
export const getMemoryIcon = (kind: MemoryKind): string => {
  switch (kind) {
    case 'photo':
      return '📸'
    case 'video':
      return '🎥'
    case 'note':
      return '📝'
    default:
      return '📄'
  }
}

export const getMemoryLabel = (kind: MemoryKind): string => {
  switch (kind) {
    case 'photo':
      return 'Photo'
    case 'video':
      return 'Vidéo'
    case 'note':
      return 'Note'
    default:
      return 'Fichier'
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getRelativeTime = (dateString: string): string => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'À l\'instant'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  } else {
    return formatDate(dateString)
  }
}
