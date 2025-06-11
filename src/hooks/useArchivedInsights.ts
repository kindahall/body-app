import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { createClientComponentClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

interface ArchivedInsight {
  id: string
  user_id: string
  title: string
  analysis: string
  data_snapshot: any
  tags: string[]
  folder_name: string
  generated_at: string
  archived_at: string
  created_at: string
  updated_at: string
}

interface ArchiveInsightParams {
  title: string
  analysis: string
  dataSnapshot: any
  generatedAt: string
  tags?: string[]
  folderName?: string
}

export const useArchivedInsights = () => {
  const { user } = useAuth()
  const [archivedInsights, setArchivedInsights] = useState<ArchivedInsight[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Charger toutes les analyses archivées
  const fetchArchivedInsights = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('archived_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('archived_at', { ascending: false })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setArchivedInsights(data || [])
      
      // Extraire les dossiers uniques
      const uniqueFolders = Array.from(new Set(data?.map(insight => insight.folder_name) || []))
      setFolders(uniqueFolders)
      
    } catch (err: any) {
      logger.error('Erreur lors du chargement des analyses archivées:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, supabase])

  // Archiver une nouvelle analyse
  const archiveInsight = useCallback(async (params: ArchiveInsightParams) => {
    if (!user?.id) {
      throw new Error('Utilisateur non connecté')
    }

    try {
      const { data, error: insertError } = await supabase
        .from('archived_insights')
        .insert({
          user_id: user.id,
          title: params.title,
          analysis: params.analysis,
          data_snapshot: params.dataSnapshot,
          tags: params.tags || [],
          folder_name: params.folderName || 'Non classé',
          generated_at: params.generatedAt
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      // Mettre à jour l'état local
      await fetchArchivedInsights()
      toast.success('Analyse archivée avec succès !')
      
      return data
    } catch (err: any) {
      logger.error('Erreur lors de l\'archivage:', err)
      toast.error('Erreur lors de l\'archivage: ' + err.message)
      throw err
    }
  }, [user?.id, supabase, fetchArchivedInsights])

  // Mettre à jour une analyse archivée
  const updateArchivedInsight = useCallback(async (
    id: string, 
    updates: Partial<Pick<ArchivedInsight, 'title' | 'tags' | 'folder_name'>>
  ) => {
    if (!user?.id) return

    try {
      const { error: updateError } = await supabase
        .from('archived_insights')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      // Mettre à jour l'état local
      setArchivedInsights(prev => 
        prev.map(insight => 
          insight.id === id ? { ...insight, ...updates } : insight
        )
      )

      toast.success('Analyse mise à jour !')
    } catch (err: any) {
      logger.error('Erreur lors de la mise à jour:', err)
      toast.error('Erreur lors de la mise à jour: ' + err.message)
    }
  }, [user?.id, supabase])

  // Supprimer une analyse archivée
  const deleteArchivedInsight = useCallback(async (id: string) => {
    if (!user?.id) return

    try {
      const { error: deleteError } = await supabase
        .from('archived_insights')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      // Mettre à jour l'état local
      setArchivedInsights(prev => prev.filter(insight => insight.id !== id))
      toast.success('Analyse supprimée !')
    } catch (err: any) {
      logger.error('Erreur lors de la suppression:', err)
      toast.error('Erreur lors de la suppression: ' + err.message)
    }
  }, [user?.id, supabase])

  // Obtenir les analyses d'un dossier spécifique
  const getInsightsByFolder = useCallback((folderName: string) => {
    return archivedInsights.filter(insight => insight.folder_name === folderName)
  }, [archivedInsights])

  // Rechercher dans les analyses
  const searchInsights = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase()
    return archivedInsights.filter(insight => 
      insight.title.toLowerCase().includes(lowerQuery) ||
      insight.analysis.toLowerCase().includes(lowerQuery) ||
      insight.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }, [archivedInsights])

  // Obtenir le contexte pour l'IA (analyses précédentes)
  const getContextForAI = useCallback((limit: number = 5) => {
    return archivedInsights
      .slice(0, limit)
      .map(insight => ({
        title: insight.title,
        date: insight.generated_at,
        analysis: insight.analysis.substring(0, 1000), // Limiter la taille
        tags: insight.tags
      }))
  }, [archivedInsights])

  // Charger au démarrage
  useEffect(() => {
    if (user?.id) {
      fetchArchivedInsights()
    }
  }, [user?.id, fetchArchivedInsights])

  return {
    archivedInsights,
    folders,
    isLoading,
    error,
    archiveInsight,
    updateArchivedInsight,
    deleteArchivedInsight,
    getInsightsByFolder,
    searchInsights,
    getContextForAI,
    refetch: fetchArchivedInsights
  }
} 