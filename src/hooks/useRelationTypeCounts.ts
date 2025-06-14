import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { logger } from '@/lib/logger'

interface RelationTypeCount {
  type: string
  total: number
}

interface RelationStats {
  total_relations: number
  avg_rating: number
  recent_relations: number
  type_romantic: number
  type_sexual: number
  type_friend: number
  type_friendzone: number
  type_other: number
  median_rating: number
  unique_locations: number
}

// Fonction fallback pour calculer les statistiques manuellement
async function calculateRelationStats(supabase: any, userId: string): Promise<RelationStats> {
  try {
    const { data: relations, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('user_id', userId)

    if (error || !relations) {
      logger.warn('Erreur récupération relations pour calcul stats', error, 'RELATION_STATS')
      return {
        total_relations: 0,
        avg_rating: 0,
        recent_relations: 0,
        type_romantic: 0,
        type_sexual: 0,
        type_friend: 0,
        type_friendzone: 0,
        type_other: 0,
        median_rating: 0,
        unique_locations: 0,
      }
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Debug: affichons les types de relations existants
    logger.debug('Relations trouvées pour stats', { count: relations.length, types: [...new Set(relations.map((r: any) => r.type))] }, 'RELATION_STATS')

    // Calcul de la note médiane
    const ratings = relations.map((r: any) => r.rating).filter(Boolean).sort((a: number, b: number) => a - b)
    let median_rating = 0
    if (ratings.length > 0) {
      const mid = Math.floor(ratings.length / 2)
      median_rating = ratings.length % 2 !== 0 ? ratings[mid] : (ratings[mid - 1] + ratings[mid]) / 2
    }

    // Calcul des lieux uniques
    const unique_locations = new Set(relations.map((r: any) => r.location).filter(Boolean)).size

    const stats = {
      total_relations: relations.length,
      avg_rating: relations.length > 0 
        ? Math.round((relations.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / relations.length) * 10) / 10
        : 0,
      recent_relations: relations.filter((r: any) => 
        new Date(r.created_at) >= thirtyDaysAgo
      ).length,
      type_romantic: relations.filter((r: any) => r.type === 'romantic' || r.type === 'Romantique').length,
      type_sexual: relations.filter((r: any) => r.type === 'sexual' || r.type === 'Sexuelle').length,
      type_friend: relations.filter((r: any) => r.type === 'friend' || r.type === 'Amitié').length,
      type_friendzone: relations.filter((r: any) => r.type === 'friendzone' || r.type === 'Friendzone').length,
      type_other: relations.filter((r: any) => r.type === 'other' || r.type === 'Autre').length,
      median_rating,
      unique_locations,
    }

    logger.debug('Stats calculées', stats, 'RELATION_STATS')

    return stats
  } catch (error) {
    logger.error('Erreur calcul stats relations', error, 'RELATION_STATS')
    return {
      total_relations: 0,
      avg_rating: 0,
      recent_relations: 0,
      type_romantic: 0,
      type_sexual: 0,
      type_friend: 0,
      type_friendzone: 0,
      type_other: 0,
      median_rating: 0,
      unique_locations: 0,
    }
  }
}

export function useRelationTypeCounts() {
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  return useQuery({
    queryKey: ['relation-type-counts', user?.id],
    queryFn: async (): Promise<RelationTypeCount[]> => {
      if (!user?.id) {
        return []
      }

      try {
        const { data, error } = await supabase
          .rpc('relation_type_counts')

        if (error) {
          logger.warn('Fonction RPC relation_type_counts non disponible, fallback', error, 'RELATION_STATS')
          
          // Fallback: calculer manuellement
          const stats = await calculateRelationStats(supabase, user.id)
          return [
            { type: 'romantic', total: stats.type_romantic },
            { type: 'sexual', total: stats.type_sexual },
            { type: 'friend', total: stats.type_friend },
            { type: 'friendzone', total: stats.type_friendzone },
            { type: 'other', total: stats.type_other }
          ]
        }

        return data || []
      } catch (error: any) {
        logger.warn('Echec appel RPC relation_type_counts, fallback', error, 'RELATION_STATS')
        
        // Fallback: calculer manuellement
        const stats = await calculateRelationStats(supabase, user.id)
        return [
          { type: 'romantic', total: stats.type_romantic },
          { type: 'sexual', total: stats.type_sexual },
          { type: 'friend', total: stats.type_friend },
          { type: 'friendzone', total: stats.type_friendzone },
          { type: 'other', total: stats.type_other }
        ]
      }
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: false, // Ne pas réessayer en cas d'erreur
  })
}

export function useRelationStats() {
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  return useQuery({
    queryKey: ['relation-stats', user?.id],
    queryFn: async (): Promise<RelationStats> => {
      if (!user?.id) {
        return {
          total_relations: 0,
          avg_rating: 0,
          recent_relations: 0,
          type_romantic: 0,
          type_sexual: 0,
          type_friend: 0,
          type_friendzone: 0,
          type_other: 0,
          median_rating: 0,
          unique_locations: 0,
        }
      }

      try {
        const { data, error } = await supabase
          .rpc('relation_stats')

        if (error) {
          logger.warn('Fonction RPC relation_stats non disponible, fallback', error, 'RELATION_STATS')
          return await calculateRelationStats(supabase, user.id)
        }

        const result = data?.[0] || {
          total_relations: 0,
          avg_rating: 0,
          recent_relations: 0,
          type_romantic: 0,
          type_sexual: 0,
          type_friend: 0,
          type_friendzone: 0,
          type_other: 0,
          median_rating: 0,
          unique_locations: 0,
        }

        return result
      } catch (error: any) {
        logger.warn('Echec appel RPC relation_stats, fallback', error, 'RELATION_STATS')
        return await calculateRelationStats(supabase, user.id)
      }
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: false, // Ne pas réessayer en cas d'erreur
  })
}

// Utility function to map relation type counts to an object
export function mapTypeCountsToObject(counts: RelationTypeCount[]) {
  return Object.fromEntries(counts.map(c => [c.type, c.total]))
}

// Utility function to get count for a specific type with fallback
export function getTypeCount(counts: RelationTypeCount[], type: string): number {
  const found = counts.find(c => c.type === type)
  return found?.total || 0
} 