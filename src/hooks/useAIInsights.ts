import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

interface AnalysisData {
  relationships: any[]
  wishlistItems: any[]
  mirrorData: any
  userAge?: number
}

interface AIInsight {
  analysis: string
  generatedAt: string
}

export const useAIInsights = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [insight, setInsight] = useState<AIInsight | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateInsights = useCallback(async (data: AnalysisData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Validation des données
      if (!data.relationships && !data.wishlistItems && !data.mirrorData) {
        throw new Error('Aucune donnée à analyser. Ajoutez d\'abord des relations, souhaits ou réflexions.')
      }

      logger.info('API call: POST /api/insights', { relationshipsCount: data.relationships?.length, wishlistCount: data.wishlistItems?.length })

      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      logger.info('Réponse API insights', { status: response.status, ok: response.ok })

      const result = await response.json()
      logger.info('Résultat API insights', { hasAnalysis: !!result.analysis })

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Erreur lors de l\'analyse')
      }

      const newInsight: AIInsight = {
        analysis: result.analysis,
        generatedAt: new Date().toISOString()
      }

      setInsight(newInsight)
      
      // Sauvegarder en cache (localStorage) pour éviter de refaire l'analyse trop souvent
      localStorage.setItem('ai-insights-cache', JSON.stringify({
        ...newInsight,
        dataHash: hashAnalysisData(data)
      }))

      toast.success('Analyse IA générée avec succès !')
      
    } catch (err: any) {
      logger.error('Erreur génération insights IA', err)
      setError(err.message)
      toast.error(err.message || 'Erreur lors de l\'analyse IA')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadCachedInsights = useCallback((currentDataHash: string) => {
    try {
      const cached = localStorage.getItem('ai-insights-cache')
      if (cached) {
        const parsedCache = JSON.parse(cached)
        
        // Vérifier si les données ont changé (simple comparaison de hash)
        if (parsedCache.dataHash === currentDataHash) {
          // Cache encore valide
          const cacheAge = Date.now() - new Date(parsedCache.generatedAt).getTime()
          const maxAge = 24 * 60 * 60 * 1000 // 24 heures
          
          if (cacheAge < maxAge) {
            setInsight({
              analysis: parsedCache.analysis,
              generatedAt: parsedCache.generatedAt
            })
            return true
          }
        }
      }
    } catch (error) {
      logger.error('Erreur chargement cache insights', error)
    }
    return false
  }, [])

  const clearInsights = useCallback(() => {
    setInsight(null)
    setError(null)
    localStorage.removeItem('ai-insights-cache')
  }, [])

  return {
    isLoading,
    insight,
    error,
    generateInsights,
    loadCachedInsights,
    clearInsights
  }
}

// Fonction utilitaire pour créer un hash simple des données d'analyse
function hashAnalysisData(data: AnalysisData): string {
  const str = JSON.stringify({
    relationshipsCount: data.relationships?.length || 0,
    wishlistCount: data.wishlistItems?.length || 0,
    mirrorDataExists: !!data.mirrorData,
    userAge: data.userAge,
    // On peut ajouter d'autres critères de hashage selon les besoins
  })
  
  // Hash simple (pour éviter d'ajouter des dépendances crypto)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  return hash.toString()
} 