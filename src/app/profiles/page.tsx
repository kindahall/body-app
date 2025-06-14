'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { useRouter } from 'next/navigation'
import { Heart, ArrowLeft, Users, Calendar, MapPin, Star, Edit, Trash2, Plus, Sparkles, Eye, TrendingUp, Award, Clock, Search, Filter } from 'lucide-react'
import { createClientComponentClient } from '@/lib/supabase'
import { useRelationTypeCounts, useRelationStats, getTypeCount } from '@/hooks/useRelationTypeCounts'
import { logger } from '@/lib/logger'
import { FormattedMessage, useIntl } from 'react-intl'

interface Relationship {
  id: string
  type: 'Romantique' | 'Sexuelle' | 'Amitié' | 'Friendzone' | 'Autre'
  name: string
  start_date: string | null
  location: string | null
  duration: string | null
  feelings: string | null
  rating: number | null
  private_note: string | null
  created_at: string
}

export default function ProfilesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const intl = useIntl()
  const supabase = createClientComponentClient()
  const queryClient = useQueryClient()
  
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'Romantique' | 'Sexuelle' | 'Amitié' | 'Friendzone' | 'Autre'>('all')
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Vérifier si c'est un utilisateur de test
  const isTestUser = typeof document !== 'undefined' && 
    document.cookie.includes('test-user=true')
  
  // Debug logs supprimés pour la production

  // Définir les types de relation avec internationalisation
  const relationshipTypes = [
    { value: 'Romantique', labelKey: 'profiles.types.romantic', emoji: '💕' },
    { value: 'Sexuelle', labelKey: 'profiles.types.sexual', emoji: '🔥' },
    { value: 'Amitié', labelKey: 'profiles.types.friendship', emoji: '👫' },
    { value: 'Friendzone', labelKey: 'profiles.types.friendzone', emoji: '🙃' },
    { value: 'Autre', labelKey: 'profiles.types.other', emoji: '🤝' }
  ]

  // Définir les filtres avec internationalisation
  const filterOptions = [
    { value: 'all', labelKey: 'profiles.filters.all', emoji: '✨' },
    { value: 'Romantique', labelKey: 'profiles.filters.romantic', emoji: '💕' },
    { value: 'Sexuelle', labelKey: 'profiles.filters.sexual', emoji: '🔥' },
    { value: 'Amitié', labelKey: 'profiles.filters.friendship', emoji: '👫' },
    { value: 'Friendzone', labelKey: 'profiles.filters.friendzone', emoji: '🙃' },
    { value: 'Autre', labelKey: 'profiles.filters.other', emoji: '🤝' }
  ]

  useEffect(() => {
    fetchRelationships()
  }, [user, isTestUser])

  useEffect(() => {
    // Actualiser les données toutes les 30 secondes si l'utilisateur est actif
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchRelationships()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchRelationships = async () => {
    if (!user && !isTestUser) return

    setIsLoading(true)
    try {
      if (isTestUser) {
        // Pour les utilisateurs de test, récupérer depuis localStorage
        const testRelations = JSON.parse(localStorage.getItem('test-relations') || '[]')
        logger.debug('Loaded test relations:', testRelations.length)
        setRelationships(testRelations)
      } else {
        const userId = user?.id
        if (!userId) {
          logger.debug('No user ID available')
          setIsLoading(false)
          return
        }
        
        logger.db('Fetching relationships for user:', userId)
        // Variables d'environnement supprimées des logs pour la sécurité
        
        const { data, error } = await supabase
          .from('relationships')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching relationships:', error)
          console.error('Error details:', {
            message: error.message,
            code: error.code,
            hint: error.hint,
            details: error.details
          })
          
          // Si erreur de réseau, essayer de charger des données de test comme fallback
          if (error.message?.includes('Failed to fetch') || error.code === 'PGRST301') {
            console.log('Network error detected, trying test data fallback')
            const testRelations = JSON.parse(localStorage.getItem('test-relations') || '[]')
            if (testRelations.length > 0) {
              console.log('Using test data as fallback:', testRelations.length, 'relations')
              setRelationships(testRelations)
              return
            }
          }
          
          setRelationships([])
        } else {
          console.log('Successfully fetched relationships:', data?.length || 0)
          setRelationships(data || [])
        }
      }
    } catch (error: any) {
      console.error('Unexpected error fetching relationships:', error)
      console.error('Error stack:', error.stack)
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      
      // En cas d'erreur inattendue, essayer le fallback test data
      console.log('Trying test data fallback due to unexpected error')
      const testRelations = JSON.parse(localStorage.getItem('test-relations') || '[]')
      if (testRelations.length > 0) {
        console.log('Using test data as fallback:', testRelations.length, 'relations')
        setRelationships(testRelations)
      } else {
        setRelationships([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const deleteRelationship = async (id: string) => {
    if (!confirm(intl.formatMessage({ id: 'profiles.confirmDelete' }))) return

    try {
      if (isTestUser) {
        // Pour les utilisateurs de test, supprimer du localStorage
        const testRelations = JSON.parse(localStorage.getItem('test-relations') || '[]')
        const updatedRelations = testRelations.filter((r: any) => r.id !== id)
        localStorage.setItem('test-relations', JSON.stringify(updatedRelations))
        setRelationships(updatedRelations)
      } else {
        const { error } = await supabase
          .from('relationships')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting relationship:', error.message || error)
          alert(intl.formatMessage({ id: 'profiles.errors.deleteError' }))
        } else {
          setRelationships(relationships.filter(r => r.id !== id))
        }
      }
    } catch (error: any) {
      console.error('Unexpected error deleting relationship:', error.message || error)
      alert(intl.formatMessage({ id: 'profiles.errors.unexpected' }))
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Romantique': return 'pink'
      case 'Sexuelle': return 'purple'
      case 'Amitié': return 'blue'
      case 'Friendzone': return 'orange'
      case 'Autre': return 'gray'
      default: return 'gray'
    }
  }

  const getTypeLabel = (type: string) => {
    const relationshipType = relationshipTypes.find(t => t.value === type)
    if (relationshipType) {
      return intl.formatMessage({ id: relationshipType.labelKey })
    }
    return intl.formatMessage({ id: 'profiles.types.other' })
  }

  const getTypeEmoji = (type: string) => {
    const relationshipType = relationshipTypes.find(t => t.value === type)
    return relationshipType?.emoji || '🤝'
  }

  // Utiliser les hooks pour obtenir les données en temps réel
  const { data: typeCounts = [], isLoading: typeCountsLoading, error: typeCountsError } = useRelationTypeCounts()
  const { data: relationStats, isLoading: statsLoading, error: statsError } = useRelationStats()
  
  logger.debug('Type counts from server:', typeCounts)
  logger.debug('Relation stats from server:', relationStats)
  logger.debug('Type counts error:', typeCountsError)
  logger.debug('Stats error:', statsError)
  
  // Pour l'instant, toujours utiliser le calcul local car c'est plus fiable
  // Le calcul serveur RPC a des problèmes de types (anglais vs français)
  const stats = {
    // Calcul local avec les vraies valeurs françaises
    total: relationships.length,
    romantic: relationships.filter(r => r.type === 'Romantique').length,
    sexual: relationships.filter(r => r.type === 'Sexuelle').length,
    friend: relationships.filter(r => r.type === 'Amitié').length,
    friendzone: relationships.filter(r => r.type === 'Friendzone').length,
    other: relationships.filter(r => r.type === 'Autre').length,
    avgRating: relationships.filter(r => r.rating).length > 0 
      ? Math.round(relationships.filter(r => r.rating).reduce((sum, r) => sum + r.rating!, 0) / relationships.filter(r => r.rating).length * 10) / 10
      : 0,
    withRating: relationships.filter(r => r.rating).length,
    recent: relationships.filter(r => new Date(r.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length
  }
  
  logger.debug('Final stats used in UI:', stats)
  logger.debug('Using local calculation: true (forced for reliability)')

  // Mise à jour en temps réel des données
  useEffect(() => {
    if (!user?.id) return

    logger.debug('Setting up real-time updates for user:', user.id)
    
    const channel = supabase
      .channel('relation_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'relationships',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Real-time update received:', payload)
          
          // Invalider et rafraîchir les données React Query
          queryClient.invalidateQueries({ queryKey: ['relation-type-counts', user.id] })
          queryClient.invalidateQueries({ queryKey: ['relation-stats', user.id] })
          
          // Rafraîchir aussi les données locales pour les cartes
          fetchRelationships()
        }
      )
      .subscribe()

    return () => {
      console.log('🔄 Cleaning up real-time subscription')
      supabase.removeChannel(channel)
    }
  }, [user?.id, queryClient, supabase])

  // Debug: Afficher les données pour comprendre le problème
  console.log('🔍 Debug filtrage:')
  console.log('Filter actuel:', filter)
  console.log('Relationships total:', relationships.length)
  console.log('Types disponibles:', relationships.map(r => ({ id: r.id, name: r.name, type: r.type })))
  console.log('Stats utilisées:', stats)

  // Filtrage et recherche
  let filteredRelationships = filter === 'all' 
    ? relationships 
    : relationships.filter(r => r.type === filter)

  console.log('Filtered relationships après filtrage:', filteredRelationships.length)
  console.log('Relations filtrées:', filteredRelationships.map(r => ({ name: r.name, type: r.type })))

  if (searchTerm) {
    filteredRelationships = filteredRelationships.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.feelings?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 relative">
      {/* Fond décoratif animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-pink-300/20 to-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-rose-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header amélioré */}
      <header className="relative bg-gradient-to-r from-white/90 via-white/85 to-white/90 backdrop-blur-xl shadow-xl border-b border-white/40 sticky top-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-rose-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/home')}
                className="group flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-white/60 px-4 py-2 rounded-xl transition-all duration-300 mr-8 backdrop-blur-sm border border-white/30"
              >
                <ArrowLeft className="h-5 w-5 group-hover:transform group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">
                  <FormattedMessage id="profiles.navigation.back" />
                </span>
              </button>
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-pink-400 to-purple-600 p-4 rounded-2xl shadow-lg relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Users className="h-8 w-8 text-white relative z-10" />
                </div>
                <div>
                                <div className="flex items-center space-x-3">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      <FormattedMessage id="profiles.title" />
                    </h1>
                    <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    {stats.total > 0 ? (
                      <FormattedMessage 
                        id="profiles.subtitle.withCount" 
                        values={{ 
                          count: stats.total,
                          plural: stats.total > 1 ? 's' : ''
                        }} 
                      />
                    ) : (
                      <FormattedMessage id="profiles.subtitle.empty" />
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stats rapides dans le header */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="group text-center bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/40 hover:bg-white/80 transition-all duration-300 hover:scale-105">
                <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  {stats.total}
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  <FormattedMessage id="profiles.stats.totalRelationships" />
                </div>
              </div>
              {stats.avgRating > 0 && (
                <div className="group text-center bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/40 hover:bg-white/80 transition-all duration-300 hover:scale-105">
                  <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                    {stats.avgRating}
                  </div>
                  <div className="text-yellow-700 font-semibold">
                    <FormattedMessage id="profiles.stats.averageRatingFull" />
                  </div>
                  <div className="text-xs text-yellow-600 mt-2">
                    <FormattedMessage 
                      id="profiles.stats.ratedRelationships"
                      values={{ 
                        count: stats.withRating,
                        plural: stats.withRating > 1 ? 's' : ''
                      }}
                    />
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  console.log('🔄 Forçage du rechargement des données')
                  console.log('Current relationships:', relationships)
                  console.log('Current stats:', stats)
                  fetchRelationships()
                }}
                className="group flex items-center space-x-3 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-all duration-300 font-medium text-sm"
              >
                <FormattedMessage id="profiles.buttons.reload" />
              </button>
              
              <button
                onClick={async () => {
                  try {
                    console.log('🔧 Tentative de création des fonctions RPC...')
                    
                    // Note: Les fonctions RPC sont désactivées pour l'instant
                    // car le calcul local est plus fiable avec les types français
                    console.log('ℹ️ Utilisation du calcul local pour une meilleure compatibilité')
                    
                    // Rafraîchir les données
                    queryClient.invalidateQueries({ queryKey: ['relation-type-counts'] })
                    queryClient.invalidateQueries({ queryKey: ['relation-stats'] })
                    
                  } catch (error) {
                    console.error('❌ Erreur lors de la création des fonctions:', error)
                      alert('Erreur: Vous devez exécuter la migration SQL dans votre tableau de bord Supabase.')
                    }
                  }}
                  className="group flex items-center space-x-3 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-all duration-300 font-medium text-sm"
                >
                  <FormattedMessage id="profiles.buttons.enableRPC" />
                </button>
              
              <button
                onClick={() => {
                  // Force test mode temporairement
                  document.cookie = 'test-user=true; path=/';
                  localStorage.setItem('test-relations', JSON.stringify([
                    {
                      id: '1',
                      type: 'Romantique',
                      name: 'adeline',
                      start_date: '2023-06-17',
                      location: 'rennes',
                      duration: null,
                      feelings: 'pas terrible, femme possessive.',
                      rating: 4,
                      private_note: 'Expérience compliquée',
                      created_at: '2023-06-17T10:00:00Z'
                    },
                    {
                      id: '2', 
                      type: 'Autre',
                      name: 'celine',
                      start_date: '2025-05-31',
                      location: 'paris',
                      duration: null,
                      feelings: 'c etait vraiment geniale comme histoire',
                      rating: 6,
                      private_note: 'Très bonne expérience',
                      created_at: '2025-05-31T14:30:00Z'
                    }
                  ]));
                  window.location.reload();
                }}
                className="group flex items-center space-x-3 bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition-all duration-300 font-medium text-sm"
              >
                <FormattedMessage id="profiles.buttons.testMode" />
              </button>
              
              <button
                onClick={() => {
                  console.log('🐛 DEBUG MANUEL:')
                  console.log('Relationships actuelles:', relationships)
                  console.log('Filter actuel:', filter)
                  console.log('Stats actuelles:', stats)
                  
                  // Test de filtrage manuel
                  const testFilter = 'Romantique'
                  const manualFiltered = relationships.filter(r => r.type === testFilter)
                  console.log(`Filtrage manuel pour ${testFilter}:`, manualFiltered)
                  
                  // Test des types exacts
                  relationships.forEach(r => {
                    console.log(`Relation "${r.name}": type="${r.type}" (typeof: ${typeof r.type})`)
                  })
                }}
                className="group flex items-center space-x-3 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-all duration-300 font-medium text-sm"
              >
                <FormattedMessage id="profiles.buttons.debug" />
              </button>
              
            <button
              onClick={() => router.push('/add-relationship')}
                className="group flex items-center space-x-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              <span><FormattedMessage id="profiles.buttons.add" /></span>
            </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Contrôles de filtrage et recherche */}
        <div className="mb-10">
          {/* Barre de recherche */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={intl.formatMessage({ id: 'profiles.search.placeholder' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-white/40 rounded-2xl bg-white/70 backdrop-blur-lg shadow-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            {searchTerm && (
              <p className="mt-2 text-sm text-gray-600">
                <FormattedMessage 
                  id="profiles.search.results"
                  values={{ 
                    count: filteredRelationships.length,
                    plural: filteredRelationships.length > 1 ? 's' : ''
                  }}
                />
              </p>
            )}
          </div>

          {/* Filtres améliorés */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                <FormattedMessage id="profiles.filters.title" />
              </span>
            </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value as any)}
                  className={`group flex items-center space-x-2 px-4 py-2 rounded-2xl font-semibold transition-all duration-300 ${
                  filter === filterOption.value
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-white/80 text-gray-700 border border-white/40 hover:bg-white hover:scale-105 hover:shadow-md'
                  }`}
                >
                  <span className="text-lg">{filterOption.emoji}</span>
                  <span>{intl.formatMessage({ id: filterOption.labelKey })}</span>
                                     {(() => {
                     const count = filterOption.value === 'all' ? stats.total : 
                                   filterOption.value === 'Romantique' ? stats.romantic :
                                   filterOption.value === 'Sexuelle' ? stats.sexual :
                                   filterOption.value === 'Amitié' ? stats.friend :
                                   filterOption.value === 'Friendzone' ? stats.friendzone :
                                   filterOption.value === 'Autre' ? stats.other : 0
                     return count > 0 && (
                       <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                         filter === filterOption.value 
                           ? 'bg-white/25 text-white' 
                           : 'bg-gray-100 text-gray-600'
                       }`}>
                         {count}
                       </span>
                     )
                   })()}
              </button>
            ))}
            </div>
          </div>
        </div>

        {/* Statistiques détaillées */}
        {!isLoading && relationships.length > 0 && (
          <div className="mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total des relations */}
              <div className="group relative bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 border-2 border-pink-200/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 to-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-pink-200 to-rose-300 p-3 rounded-2xl">
                      <Heart className="h-6 w-6 text-pink-800" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-pink-400" />
                  </div>
                  <div className="text-3xl font-black bg-gradient-to-br from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
                    {stats.total}
                  </div>
                  <div className="text-pink-700 font-semibold">
                    <FormattedMessage id="profiles.stats.totalRelationships" />
                  </div>
                  <div className="text-xs text-pink-600 mt-2">
                    {stats.recent > 0 && (
                      <FormattedMessage 
                        id="profiles.stats.addedThisMonth"
                        values={{ 
                          count: stats.recent,
                          plural: stats.recent > 1 ? 's' : ''
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Note moyenne */}
              {stats.avgRating > 0 && (
                <div className="group relative bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-200/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-gradient-to-br from-yellow-200 to-amber-300 p-3 rounded-2xl">
                        <Star className="h-6 w-6 text-yellow-800" />
                      </div>
                      <Award className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="text-3xl font-black bg-gradient-to-br from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                      {stats.avgRating}
                    </div>
                    <div className="text-yellow-700 font-semibold">
                      <FormattedMessage id="profiles.stats.averageRatingFull" />
                    </div>
                    <div className="text-xs text-yellow-600 mt-2">
                      <FormattedMessage 
                        id="profiles.stats.ratedRelationships"
                        values={{ 
                          count: stats.withRating,
                          plural: stats.withRating > 1 ? 's' : ''
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Type le plus fréquent */}
              <div className="group relative bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-200/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-purple-200 to-indigo-300 p-3 rounded-2xl">
                      <Users className="h-6 w-6 text-purple-800" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    {(() => {
                      const types = [
                        { type: 'Romantique', count: stats.romantic, emoji: '💕' },
                        { type: 'Amitié', count: stats.friend, emoji: '👫' },
                        { type: 'Sexuelle', count: stats.sexual, emoji: '🔥' },
                        { type: 'Friendzone', count: stats.friendzone, emoji: '🙃' },
                        { type: 'Autre', count: stats.other, emoji: '🤝' }
                      ]
                      const mostFrequent = types.reduce((max, current) => current.count > max.count ? current : max)
                      return mostFrequent.emoji
                    })()}
                  </div>
                  <div className="text-purple-700 font-semibold">
                    <FormattedMessage id="profiles.stats.dominantType" />
                  </div>
                  <div className="text-xs text-purple-600 mt-2">
                    {(() => {
                      const types = [
                        { type: 'Romantique', count: stats.romantic, labelKey: 'profiles.filters.romantic' },
                        { type: 'Amitié', count: stats.friend, labelKey: 'profiles.filters.friendship' },
                        { type: 'Sexuelle', count: stats.sexual, labelKey: 'profiles.filters.sexual' },
                        { type: 'Friendzone', count: stats.friendzone, labelKey: 'profiles.filters.friendzone' },
                        { type: 'Autre', count: stats.other, labelKey: 'profiles.filters.other' }
                      ]
                      const mostFrequent = types.reduce((max, current) => current.count > max.count ? current : max)
                      return mostFrequent.count > 0 ? intl.formatMessage({ id: mostFrequent.labelKey }) : intl.formatMessage({ id: 'profiles.emptyState.noRelations' })
                    })()}
                  </div>
                </div>
              </div>

              {/* Évolution récente */}
              <div className="group relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-green-200 to-emerald-300 p-3 rounded-2xl">
                      <Clock className="h-6 w-6 text-green-800" />
                    </div>
                    <Sparkles className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="text-3xl font-black bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    {stats.recent}
                  </div>
                  <div className="text-green-700 font-semibold">
                    <FormattedMessage id="profiles.stats.thisMonth" />
                  </div>
                  <div className="text-xs text-green-600 mt-2">
                    <FormattedMessage 
                      id="profiles.stats.newRelations" 
                      values={{ 
                        count: stats.recent,
                        plural: stats.recent > 1 ? 's' : ''
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debug Panel - Diagnostic visible pour l'utilisateur */}
        <div className="mb-10 bg-white/80 backdrop-blur-lg p-6 rounded-2xl border border-white/40 shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-gray-900">
            🔍 <FormattedMessage id="profiles.debug.title" />
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-blue-900">
                <FormattedMessage id="profiles.debug.totalRelations" />
              </div>
              <div className="text-xl font-bold text-blue-600">{relationships.length}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-green-900">
                <FormattedMessage id="profiles.debug.currentFilter" />
              </div>
              <div className="text-xl font-bold text-green-600">{filter}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-purple-900">
                <FormattedMessage id="profiles.debug.filteredRelations" />
              </div>
              <div className="text-xl font-bold text-purple-600">{filteredRelationships.length}</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="text-sm font-medium text-gray-900 mb-2">
              <FormattedMessage id="profiles.debug.existingTypes" />:
            </div>
            <div className="text-sm text-gray-700">
              {relationships.map(r => `${r.name}: ${r.type}`).join(', ') || 
                intl.formatMessage({ id: 'profiles.debug.noRelations' })
              }
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <div className="text-sm font-medium text-yellow-900 mb-2">
              <FormattedMessage id="profiles.debug.calculatedStats" />:
            </div>
            <div className="text-sm text-yellow-700">
              <FormattedMessage 
                id="profiles.debug.statsBreakdown"
                values={{
                  romantic: stats.romantic,
                  sexual: stats.sexual, 
                  friend: stats.friend,
                  friendzone: stats.friendzone,
                  other: stats.other
                }}
              />
            </div>
          </div>
          
          <button
            onClick={async () => {
              alert(`DIAGNOSTIC:
Relations totales: ${relationships.length}
Filtre actuel: ${filter}
Relations après filtrage: ${filteredRelationships.length}

Types existants:
${relationships.map(r => `• ${r.name}: ${r.type}`).join('\n')}

Stats:
• Romantiques: ${stats.romantic}
• Sexuelles: ${stats.sexual}  
• Amitiés: ${stats.friend}
• Friendzone: ${stats.friendzone}
• Autres: ${stats.other}`)

              console.log('🐛 DIAGNOSTIC COMPLET:')
              console.log('User ID:', user?.id)
              console.log('isTestUser:', isTestUser)
              console.log('Relationships array:', relationships)
              console.log('Filter actuel:', filter)
              console.log('Stats:', stats)
              console.log('useLocalCalculation: true (forced)')
              
              // Test direct Supabase
              if (user?.id && !isTestUser) {
                try {
                  const { data, error } = await supabase
                    .from('relationships')
                    .select('*')
                    .eq('user_id', user.id)
                  
                  console.log('🔍 Données Supabase directes:', data)
                  console.log('🔍 Erreur Supabase:', error)
                  
                  if (data) {
                    data.forEach((rel, index) => {
                      console.log(`Relation ${index + 1}: "${rel.name}" - type: "${rel.type}" (${typeof rel.type})`)
                    })
                  }
                } catch (err) {
                  console.error('🔍 Erreur test Supabase:', err)
                }
              }
              
              // Test localStorage pour utilisateurs test
              if (isTestUser) {
                const testData = localStorage.getItem('test-relations')
                console.log('🔍 Test data localStorage:', testData)
                if (testData) {
                  const parsed = JSON.parse(testData)
                  console.log('🔍 Test data parsed:', parsed)
                }
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mr-4"
          >
            <FormattedMessage id="profiles.debug.fullDiagnostic" />
          </button>

          <button
            onClick={() => {
              const testTypes = ['Romantique', 'Sexuelle', 'Amitié', 'Friendzone', 'Autre']
              testTypes.forEach(testType => {
                const filtered = relationships.filter(r => r.type === testType)
                console.log(`🔍 Filtrage "${testType}": ${filtered.length} résultat(s)`)
                filtered.forEach(r => console.log(`  - ${r.name} (type: "${r.type}")`))
              })
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            <FormattedMessage id="profiles.debug.testFiltering" />
          </button>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              <FormattedMessage 
                id="profiles.debug.totalRelations" 
              />: {relationships.length}
            </p>
            <p>
              <FormattedMessage 
                id="profiles.debug.currentFilter" 
              />: {filter}
            </p>
            <p>
              <FormattedMessage 
                id="profiles.debug.filteredRelations" 
              />: {filteredRelationships.length}
            </p>
            <p>
              <FormattedMessage 
                id="profiles.debug.detectedTypes" 
              />: {[...new Set(relationships.map(r => r.type))].join(', ')}
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-500 absolute inset-0"></div>
            </div>
          </div>
        )}

        {/* Empty State amélioré */}
        {!isLoading && filteredRelationships.length === 0 && (
          <div className="text-center py-16">
            <div className="relative mb-8">
              <div className="bg-gradient-to-br from-pink-100 to-purple-200 p-6 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto shadow-lg">
                <Heart className="h-12 w-12 text-pink-600" />
              </div>
              <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {filter === 'all' 
                ? (searchTerm ? (
                    <FormattedMessage id="profiles.emptyState.noResults" />
                  ) : (
                    <FormattedMessage id="profiles.emptyState.noRelations" />
                  )) 
                : (
                  <FormattedMessage 
                    id="profiles.emptyState.noRelationsOfType"
                    values={{ type: getTypeLabel(filter).toLowerCase() }}
                  />
                )}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              {searchTerm 
                ? <FormattedMessage id="profiles.emptyState.tryModifyingSearch" />
                : <FormattedMessage id="profiles.emptyState.startDocumenting" />
              }
            </p>
            {!searchTerm && (
              <div className="space-y-4">
            <button
              onClick={() => router.push('/add-relationship')}
                  className="group bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center space-x-3"
                >
                  <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span><FormattedMessage id="profiles.emptyState.addFirstRelation" /></span>
                  <Sparkles className="h-4 w-4" />
                </button>
                <p className="text-sm text-gray-500">
                  <FormattedMessage id="profiles.emptyState.createJournal" />
                </p>
              </div>
            )}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="bg-white text-gray-700 px-6 py-3 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-all duration-300"
              >
                <FormattedMessage id="profiles.search.clearSearch" />
            </button>
            )}
          </div>
        )}

        {/* Relations Grid modernisé */}
        {!isLoading && filteredRelationships.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRelationships.map((relationship) => {
              const color = getTypeColor(relationship.type)
              return (
                <div key={relationship.id} className="group relative bg-white/80 backdrop-blur-xl border-2 border-white/60 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] overflow-hidden cursor-pointer"
                     onClick={() => router.push(`/profiles/${relationship.id}`)}>
                  {/* Fond gradient au hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Header */}
                  <div className="relative z-10 flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      {/* Avatar avec initiales */}
                      <div className={`bg-gradient-to-br from-${color}-400 to-${color}-600 p-3 rounded-2xl shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-300`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="text-xl font-bold text-white relative z-10">
                          {relationship.name.substring(0, 2).toUpperCase()}
                        </span>
                        <div className="absolute -bottom-1 -right-1 text-lg">
                          {getTypeEmoji(relationship.type)}
                        </div>
                      </div>
                      
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                        {relationship.name}
                      </h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-${color}-100 to-${color}-200 text-${color}-800 border border-${color}-300/50`}>
                          {getTypeEmoji(relationship.type)} {getTypeLabel(relationship.type)}
                      </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRelationship(relationship)
                          setShowModal(true)
                        }}
                        className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-100 rounded-xl transition-all duration-200"
                        title="Aperçu rapide"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteRelationship(relationship.id)
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200"
                        title="Supprimer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Details modernisés */}
                  <div className="relative z-10 space-y-4">
                    {/* Informations principales */}
                    <div className="grid grid-cols-1 gap-3">
                    {relationship.start_date && (
                        <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-xl border border-blue-200/50">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-blue-900">
                              <FormattedMessage id="profiles.fields.startDate" />
                            </div>
                            <div className="text-blue-700 font-semibold">
                              {new Date(relationship.start_date).toLocaleDateString(intl.locale)}
                            </div>
                          </div>
                      </div>
                    )}
                    
                    {relationship.location && (
                        <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-xl border border-green-200/50">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <MapPin className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-green-900">
                              <FormattedMessage id="profiles.fields.location" />
                            </div>
                            <div className="text-green-700 font-semibold">{relationship.location}</div>
                          </div>
                        </div>
                      )}
                      
                      {relationship.rating && (
                        <div className="flex items-center space-x-3 bg-yellow-50 p-3 rounded-xl border border-yellow-200/50">
                          <div className="bg-yellow-100 p-2 rounded-lg">
                            <Star className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-yellow-900">
                              <FormattedMessage id="profiles.fields.rating" />
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < relationship.rating! / 2
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-yellow-700 font-bold">{relationship.rating}/10</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Durée si disponible */}
                    {relationship.duration && (
                      <div className="bg-purple-50 p-3 rounded-xl border border-purple-200/50">
                      <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">Durée:</span>
                        </div>
                        <p className="text-purple-700 font-semibold mt-1">{relationship.duration}</p>
                      </div>
                    )}
                    
                    {/* Sentiments en aperçu */}
                    {relationship.feelings && (
                      <div className="bg-pink-50 p-3 rounded-xl border border-pink-200/50">
                        <div className="flex items-center space-x-2 mb-2">
                          <Heart className="h-4 w-4 text-pink-600" />
                          <span className="text-sm font-medium text-pink-900">
                            <FormattedMessage id="profiles.fields.feelings" />
                          </span>
                        </div>
                        <p className="text-pink-700 text-sm leading-relaxed line-clamp-2">
                          {relationship.feelings}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="relative z-10 mt-6 pt-4 border-t border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          <FormattedMessage 
                            id="profiles.fields.addedOn"
                            values={{
                              date: new Date(relationship.created_at).toLocaleDateString(intl.locale)
                            }}
                          />
                        </span>
                      </div>
                      <div className="text-xs bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 px-3 py-1 rounded-full font-medium">
                        <FormattedMessage id="profiles.fields.viewDetails" />
                    </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Résumé des statistiques par type - Version moderne */}
        {!isLoading && (
          <div className="mt-12">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-rose-500/5"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-indigo-200 to-purple-300 p-3 rounded-2xl">
                    <Award className="h-6 w-6 text-indigo-800" />
                  </div>
                  <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                  <FormattedMessage id="profiles.breakdown.title" />
                </h3>
                <p className="text-gray-600">
                  <FormattedMessage id="profiles.breakdown.subtitle" />
                </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <div className="group text-center bg-gradient-to-br from-pink-50 to-rose-100 p-4 rounded-2xl border-2 border-pink-200/50 hover:scale-105 transition-all duration-300">
                    <div className="text-4xl mb-2">💕</div>
                    <div className="text-3xl font-black text-pink-600 mb-1">{stats.romantic}</div>
                    <div className="text-sm font-medium text-pink-700">
                      <FormattedMessage id="profiles.types.romantic" />
                    </div>
                  </div>
                  <div className="group text-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4 rounded-2xl border-2 border-purple-200/50 hover:scale-105 transition-all duration-300">
                    <div className="text-4xl mb-2">🔥</div>
                    <div className="text-3xl font-black text-purple-600 mb-1">{stats.sexual}</div>
                    <div className="text-sm font-medium text-purple-700">
                      <FormattedMessage id="profiles.types.sexual" />
                    </div>
                  </div>
                  <div className="group text-center bg-gradient-to-br from-blue-50 to-cyan-100 p-4 rounded-2xl border-2 border-blue-200/50 hover:scale-105 transition-all duration-300">
                    <div className="text-4xl mb-2">👫</div>
                    <div className="text-3xl font-black text-blue-600 mb-1">{stats.friend}</div>
                    <div className="text-sm font-medium text-blue-700">
                      <FormattedMessage id="profiles.types.friendship" />
                    </div>
                  </div>
                  <div className="group text-center bg-gradient-to-br from-orange-50 to-amber-100 p-4 rounded-2xl border-2 border-orange-200/50 hover:scale-105 transition-all duration-300">
                    <div className="text-4xl mb-2">🙃</div>
                    <div className="text-3xl font-black text-orange-600 mb-1">{stats.friendzone}</div>
                    <div className="text-sm font-medium text-orange-700">
                      <FormattedMessage id="profiles.types.friendzone" />
                    </div>
                  </div>
                  <div className="group text-center bg-gradient-to-br from-gray-50 to-slate-100 p-4 rounded-2xl border-2 border-gray-200/50 hover:scale-105 transition-all duration-300">
                    <div className="text-4xl mb-2">🤝</div>
                    <div className="text-3xl font-black text-gray-600 mb-1">{stats.other}</div>
                    <div className="text-sm font-medium text-gray-700">
                      <FormattedMessage id="profiles.types.other" />
                    </div>
                  </div>
                </div>
                
                {/* Insights supplémentaires */}
                <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50">
                  <div className="flex items-center justify-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      <span className="font-medium text-indigo-700">
                        <FormattedMessage 
                          id="profiles.breakdown.totalSummary"
                          values={{ 
                            count: stats.total,
                            plural: stats.total > 1 ? 's' : ''
                          }}
                        />
                      </span>
                    </div>
                    {stats.avgRating > 0 && (
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium text-yellow-700">
                          <FormattedMessage 
                            id="profiles.breakdown.averageRating"
                            values={{ rating: stats.avgRating }}
                          />
                        </span>
                      </div>
                    )}
                    {stats.recent > 0 && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-700">
                          <FormattedMessage 
                            id="profiles.breakdown.recentCount"
                            values={{ 
                              count: stats.recent,
                              plural: stats.recent > 1 ? 's' : ''
                            }}
                          />
                        </span>
              </div>
                    )}
              </div>
              </div>

                {/* Message si aucune relation */}
                {relationships.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📝</div>
                    <h4 className="text-xl font-semibold text-gray-600 mb-2">
                      <FormattedMessage id="profiles.emptyState.noRelations" />
                    </h4>
                    <p className="text-gray-500 mb-6">
                      <FormattedMessage id="profiles.emptyState.startDocumenting" />
                    </p>
                    <button
                      onClick={() => router.push('/add-relationship')}
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Plus className="h-5 w-5" />
                      <span>
                        <FormattedMessage id="profiles.emptyState.addFirstRelation" />
                      </span>
                    </button>
              </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal des détails */}
      {showModal && selectedRelationship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header de la modal */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-full">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedRelationship.name}</h2>
                    <p className="text-pink-100">{getTypeLabel(selectedRelationship.type)}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedRelationship(null)
                  }}
                  className="text-white hover:text-pink-200 transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu de la modal */}
            <div className="p-6 space-y-6">
              {/* Note */}
              {selectedRelationship.rating && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <Star className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        <FormattedMessage id="profiles.modal.ratingGiven" />
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {Array.from({ length: 10 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < selectedRelationship.rating!
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-yellow-600">{selectedRelationship.rating}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRelationship.start_date && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          <FormattedMessage id="profiles.modal.startDate" />
                        </h3>
                        <p className="text-blue-700">
                          {new Date(selectedRelationship.start_date).toLocaleDateString(intl.locale, { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedRelationship.location && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          <FormattedMessage id="profiles.modal.meetingPlace" />
                        </h3>
                        <p className="text-green-700">{selectedRelationship.location}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Durée */}
              {selectedRelationship.duration && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <FormattedMessage id="profiles.modal.relationshipDuration" />
                  </h3>
                  <p className="text-purple-700">{selectedRelationship.duration}</p>
                </div>
              )}

              {/* Sentiments */}
              {selectedRelationship.feelings && (
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <FormattedMessage id="profiles.modal.feelingsEmotions" />
                  </h3>
                  <p className="text-pink-700 leading-relaxed">{selectedRelationship.feelings}</p>
                </div>
              )}

              {/* Note privée */}
              {selectedRelationship.private_note && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <FormattedMessage id="profiles.modal.privateNote" />
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{selectedRelationship.private_note}</p>
                </div>
              )}

              {/* Date d'ajout */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  <FormattedMessage id="profiles.modal.information" />
                </h3>
                <p className="text-indigo-700">
                  <FormattedMessage 
                    id="profiles.modal.relationshipAdded"
                    values={{
                      date: new Date(selectedRelationship.created_at).toLocaleDateString(intl.locale, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    }}
                  />
                </p>
              </div>
            </div>

            {/* Footer de la modal */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedRelationship(null)
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <FormattedMessage id="profiles.modal.close" />
                </button>
                <button
                  onClick={() => {
                    if (selectedRelationship) {
                      deleteRelationship(selectedRelationship.id)
                      setShowModal(false)
                      setSelectedRelationship(null)
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FormattedMessage id="profiles.modal.delete" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Style CSS personnalisé pour les animations */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation: slideInUp 0.5s ease-out;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
