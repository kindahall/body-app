'use client'

import { useState, useEffect, useCallback } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { useRouter } from 'next/navigation'
import { BarChart3, ArrowLeft, TrendingUp, Heart, Users, MapPin, Brain, Sparkles, RefreshCw, Clock, ChevronDown, ChevronUp, Archive, Folder, Search, Plus, Tag, Trash2, Edit3, X, Coins, ShoppingCart } from 'lucide-react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAIInsights } from '@/hooks/useAIInsights'
import { useWishlistItems } from '@/hooks/useWishlist'
import { useMirror } from '@/hooks/useMirror'
import { useArchivedInsights } from '@/hooks/useArchivedInsights'

interface Relationship {
  id: string
  type: 'romantic' | 'sexual' | 'friend' | 'other'
  name: string
  start_date: string | null
  location: string | null
  duration: string | null
  feelings: string | null
  rating: number | null
  created_at: string
}

export default function InsightsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const intl = useIntl()
  const supabase = createClientComponentClient()
  
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [showFullAnalysis, setShowFullAnalysis] = useState(false)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const [credits, setCredits] = useState(0)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [userAge, setUserAge] = useState<number | null>(null)
  
  // États pour l'archivage
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [showArchivesList, setShowArchivesList] = useState(false)
  const [archiveTitle, setArchiveTitle] = useState('')
  const [archiveFolder, setArchiveFolder] = useState('Non classé')
  const [archiveTags, setArchiveTags] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // État pour afficher une analyse archivée complète
  const [selectedArchive, setSelectedArchive] = useState<any>(null)
  const [showArchiveDetail, setShowArchiveDetail] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  
  // Hooks pour récupérer les données
  const { items: wishlistItems } = useWishlistItems()
  const { mirrorData } = useMirror()
  const { isLoading: isAILoading, insight, error: aiError, generateInsights, loadCachedInsights, clearInsights } = useAIInsights()
  const { 
    archivedInsights, 
    folders, 
    archiveInsight, 
    deleteArchivedInsight, 
    getInsightsByFolder, 
    searchInsights,
    getContextForAI 
  } = useArchivedInsights()

  // Vérifier si c'est un utilisateur de test
  const isTestUser = typeof document !== 'undefined' && 
    document.cookie.includes('test-user=true')

  useEffect(() => {
    fetchRelationships()
    if (user && !isTestUser) {
      fetchCredits()
      fetchUserAge()
    }
  }, [user, isTestUser])

  useEffect(() => {
    // Charger les insights en cache si disponibles
    if (!insight && (relationships.length > 0 || (wishlistItems && wishlistItems.length > 0) || mirrorData)) {
      const currentDataHash = hashAnalysisData({
        relationships,
        wishlistItems: wishlistItems || [],
        mirrorData,
      })
      loadCachedInsights(currentDataHash)
    }
  }, [relationships, wishlistItems, mirrorData, loadCachedInsights, insight])

  const fetchRelationships = async () => {
    if (!user && !isTestUser) return

    setIsLoadingData(true)
    try {
      if (isTestUser) {
        // Pour les utilisateurs de test, récupérer depuis localStorage
        const testRelations = JSON.parse(localStorage.getItem('test-relations') || '[]')
        setRelationships(testRelations)
      } else {
        const userId = user?.id
        if (!userId) {
          setIsLoadingData(false)
          return
        }
        
        const { data, error } = await supabase
          .from('relationships')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching relationships:', error.message || error)
          setRelationships([])
        } else {
          setRelationships(data || [])
        }
      }
    } catch (error: any) {
      console.error('Unexpected error fetching relationships:', error.message || error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const fetchCredits = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching credits:', error)
        return
      }

      setCredits(data?.credits || 0)
    } catch (error: any) {
      console.error('Unexpected error fetching credits:', error)
    }
  }

  const fetchUserAge = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('age')
        .eq('id', user.id)
        .single()

      if (error) {
        console.warn('Could not fetch user age:', error.message)
        return
      }

      setUserAge(data?.age || null)
    } catch (error: any) {
      console.warn('Error fetching user age:', error?.message || 'Unknown error')
    }
  }

  // Fonction pour lancer l'analyse IA
  const handleGenerateAIInsights = useCallback(async () => {
    if (isDebouncing) return;

    // Vérifier les crédits pour les utilisateurs authentifiés
    if (!isTestUser && credits < 10) {
      setShowCreditModal(true);
      return;
    }

    setIsDebouncing(true);
    setTimeout(() => setIsDebouncing(false), 3000);

    // Consommer les crédits avant l'analyse (sauf pour les utilisateurs de test)
    if (!isTestUser) {
      try {
        const { error } = await supabase.rpc('consume_credits', {
          user_id: user?.id,
          amount: 10
        });

        if (error) {
          console.error('Erreur lors de la consommation des crédits:', error);
          setIsDebouncing(false);
          return;
        }

        // Mettre à jour le nombre de crédits localement
        setCredits(prev => Math.max(0, prev - 10));
      } catch (error) {
        console.error('Erreur lors de la consommation des crédits:', error);
        setIsDebouncing(false);
        return;
      }
    }

    const analysisData = {
      relationships,
      wishlistItems: wishlistItems || [],
      mirrorData,
      userAge: userAge || undefined,
      previousAnalyses: getContextForAI(5) // Inclure les 5 dernières analyses
    }
    
    await generateInsights(analysisData)
  }, [isDebouncing, relationships, wishlistItems, mirrorData, generateInsights, getContextForAI, credits, isTestUser, user, supabase])

  // Fonction pour archiver l'analyse actuelle
  const handleArchiveInsight = useCallback(async () => {
    if (!insight || !archiveTitle.trim()) return

    try {
      await archiveInsight({
        title: archiveTitle.trim(),
        analysis: insight.analysis,
        dataSnapshot: {
          relationships,
          wishlistItems: wishlistItems || [],
          mirrorData
        },
        generatedAt: insight.generatedAt,
        tags: archiveTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        folderName: archiveFolder
      })
      
      // Réinitialiser le modal
      setShowArchiveModal(false)
      setArchiveTitle('')
      setArchiveTags('')
      setArchiveFolder('Non classé')
    } catch (error) {
      console.error('Erreur lors de l\'archivage:', error)
    }
  }, [insight, archiveTitle, archiveTags, archiveFolder, relationships, wishlistItems, mirrorData, archiveInsight])

  // Filtrer les analyses archivées
  const filteredArchives = searchQuery 
    ? searchInsights(searchQuery)
    : selectedFolder 
    ? getInsightsByFolder(selectedFolder)
    : archivedInsights

  // Calculs des insights basiques
  const totalRelationships = relationships.length
  const averageRating = relationships.length > 0 
    ? relationships.filter(r => r.rating).reduce((sum, r) => sum + (r.rating || 0), 0) / relationships.filter(r => r.rating).length
    : 0

  const typeStats = {
    romantic: relationships.filter(r => r.type === 'romantic').length,
    sexual: relationships.filter(r => r.type === 'sexual').length,
    friend: relationships.filter(r => r.type === 'friend').length,
    other: relationships.filter(r => r.type === 'other').length
  }

  const topLocations = relationships
    .filter(r => r.location)
    .reduce((acc, r) => {
      const location = r.location!
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const hasData = totalRelationships > 0 || (wishlistItems && wishlistItems.length > 0) || (mirrorData && Object.keys(mirrorData).length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mr-6"
            >
              <ArrowLeft className="h-5 w-5" />
              <span><FormattedMessage id="insights.back" /></span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
                              <h1 className="text-xl font-bold text-gray-900"><FormattedMessage id="insights.title" /></h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading */}
        {isLoadingData && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        )}

        {!isLoadingData && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      <FormattedMessage id="insights.stats.totalRelations" />
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{totalRelationships}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      <FormattedMessage id="insights.stats.wishes" />
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{wishlistItems?.length || 0}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Heart className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      <FormattedMessage id="insights.stats.averageRating" />
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {averageRating > 0 ? `${averageRating.toFixed(1)}/10` : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      <FormattedMessage id="insights.stats.selfReflection" />
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mirrorData?.confidenceLevel || 'N/A'}
                      {mirrorData?.confidenceLevel && '/10'}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      <FormattedMessage id="insights.analysis.title" />
                    </h2>
                    <p className="text-gray-600">
                      <FormattedMessage id="insights.analysis.description" />
                      {!isTestUser && (
                        <span className="ml-2 text-yellow-600 font-medium">
                          • <FormattedMessage id="insights.analysis.creditsPerAnalysis" />
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {!isTestUser && (
                    <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-200">
                      <Coins className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-700">
                        <FormattedMessage 
                          id="insights.credits.balance" 
                          values={{ count: credits }} 
                        />
                      </span>
                      {credits < 10 && (
                        <button
                          onClick={() => router.push('/credits')}
                          className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition-colors"
                        >
                          <FormattedMessage id="insights.credits.buy" />
                        </button>
                      )}
                    </div>
                  )}
                  
                  {insight && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(insight.generatedAt).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                  
                  <button
                    onClick={handleGenerateAIInsights}
                    disabled={isAILoading || !hasData || isDebouncing || (!isTestUser && credits < 10)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-wait ${
                      hasData && (isTestUser || credits >= 10)
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isAILoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span><FormattedMessage id="insights.analysis.analyzing" /></span>
                      </>
                    ) : isDebouncing ? (
                      <>
                        <Clock className="h-4 w-4" />
                        <span><FormattedMessage id="insights.analysis.pleaseWait" /></span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>
                          <FormattedMessage 
                            id={insight ? "insights.analysis.renew" : "insights.analysis.generate"} 
                          />
                        </span>
                      </>
                    )}
                  </button>
                  
                  {insight && (
                    <>
                      <button
                        onClick={() => setShowArchiveModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <Archive className="h-4 w-4" />
                        <span><FormattedMessage id="insights.analysis.archive" /></span>
                      </button>
                      <button
                        onClick={clearInsights}
                        className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <FormattedMessage id="insights.analysis.clear" />
                      </button>
                    </>
                  )}
                  
                                      <button
                      onClick={() => setShowArchivesList(!showArchivesList)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Folder className="h-4 w-4" />
                      <span>
                        <FormattedMessage 
                          id="insights.archives.title" 
                          values={{ count: archivedInsights.length }} 
                        />
                      </span>
                    </button>
                </div>
              </div>

              {!hasData && (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée à analyser</h3>
                  <p className="text-gray-600 mb-6">
                    Pour obtenir une analyse IA personnalisée, ajoutez d'abord des données :
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => router.push('/relations')}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Ajouter des relations
                    </button>
                    <button
                      onClick={() => router.push('/wishlist')}
                      className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                    >
                      Ajouter des souhaits
                    </button>
                    <button
                      onClick={() => router.push('/mirror')}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      Compléter le miroir
                    </button>
                  </div>
                </div>
              )}

              {!isTestUser && credits > 0 && credits < 10 && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <Coins className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-yellow-800 font-medium mb-1">Crédits insuffisants</h3>
                      <p className="text-yellow-700 text-sm mb-3">
                        Il vous faut 10 crédits pour générer une analyse. Vous avez actuellement {credits} crédits.
                      </p>
                      <button
                        onClick={() => router.push('/credits')}
                        className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
                      >
                        Acheter des crédits
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {aiError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h3 className="text-red-800 font-medium mb-2">Erreur d'analyse</h3>
                  <p className="text-red-600">{aiError}</p>
                </div>
              )}

              {insight && (
                <div className="space-y-6">
                  <div className="prose max-w-none">
                    <div className={`transition-all duration-300 ${showFullAnalysis ? '' : 'max-h-96 overflow-hidden'}`}>
                      <div 
                        className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ 
                          __html: formatMarkdownAnalysis(insight.analysis)
                        }}
                      />
                    </div>
                    
                    {insight.analysis.length > 800 && (
                      <button
                        onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                        className="flex items-center space-x-2 mt-4 text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        {showFullAnalysis ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            <span>Voir moins</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            <span>Voir l'analyse complète</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Section Archives */}
            {showArchivesList && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Archives des Analyses</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={selectedFolder || ''}
                      onChange={(e) => setSelectedFolder(e.target.value || null)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Tous les dossiers</option>
                      {folders.map(folder => (
                        <option key={folder} value={folder}>{folder}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArchives.map(archive => (
                    <div key={archive.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{archive.title}</h3>
                        <button
                          onClick={() => deleteArchivedInsight(archive.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {archive.analysis.substring(0, 150)}...
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{new Date(archive.generated_at).toLocaleDateString('fr-FR')}</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{archive.folder_name}</span>
                      </div>
                      
                      {archive.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {archive.tags.map(tag => (
                            <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedArchive(archive)
                          setShowArchiveDetail(true)
                        }}
                        className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                      >
                        Voir l'analyse complète
                      </button>
                    </div>
                  ))}
                </div>

                {filteredArchives.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery || selectedFolder ? 'Aucune analyse trouvée.' : 'Aucune analyse archivée.'}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal d'archivage */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Archiver l'analyse</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
                <input
                  type="text"
                  value={archiveTitle}
                  onChange={(e) => setArchiveTitle(e.target.value)}
                  placeholder="Ex: Analyse de janvier 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dossier</label>
                <input
                  type="text"
                  value={archiveFolder}
                  onChange={(e) => setArchiveFolder(e.target.value)}
                  placeholder="Non classé"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  value={archiveTags}
                  onChange={(e) => setArchiveTags(e.target.value)}
                  placeholder="relations, amélioration, objectifs"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowArchiveModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleArchiveInsight}
                disabled={!archiveTitle.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Archiver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour afficher une analyse archivée complète */}
      {showArchiveDetail && selectedArchive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header du modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedArchive.title}</h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-500">
                    {new Date(selectedArchive.generated_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    {selectedArchive.folder_name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowArchiveDetail(false)
                  setSelectedArchive(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Tags */}
            {selectedArchive.tags.length > 0 && (
              <div className="px-6 py-3 border-b border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {selectedArchive.tags.map((tag: string) => (
                    <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contenu de l'analyse */}
            <div className="flex-1 overflow-auto p-6">
              <div className="prose max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: formatMarkdownAnalysis(selectedArchive.analysis)
                  }}
                />
              </div>
            </div>

            {/* Footer du modal */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowArchiveDetail(false)
                  setSelectedArchive(null)
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de crédits insuffisants */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Coins className="h-8 w-8 text-yellow-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Crédits insuffisants</h3>
              <p className="text-gray-600 mb-2">
                Il vous faut <strong>10 crédits</strong> pour générer une analyse IA.
              </p>
              <p className="text-gray-600 mb-6">
                Vous avez actuellement <strong>{credits} crédits</strong>.
              </p>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <Sparkles className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800">Bonus quotidien</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Recevez automatiquement <strong>+1 crédit gratuit</strong> chaque jour !
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreditModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setShowCreditModal(false)
                  router.push('/credits')
                }}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Acheter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Fonction utilitaire pour créer un hash simple des données d'analyse
function hashAnalysisData(data: any): string {
  const str = JSON.stringify({
    relationshipsCount: data.relationships?.length || 0,
    wishlistCount: data.wishlistItems?.length || 0,
    mirrorDataExists: !!data.mirrorData,
  })
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  return hash.toString()
}

// Fonction pour formater le markdown en HTML simple
function formatMarkdownAnalysis(markdown: string): string {
  return markdown
    // Titres niveau 2
    .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3 flex items-center"><span class="mr-2">$1</span></h2>')
    // Gras
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    // Listes
    .replace(/^- (.*$)/gim, '<li class="ml-4 mb-2">• $1</li>')
    // Paragraphes
    .replace(/\n\n/g, '</p><p class="mb-4">')
    // Wrapper pour les paragraphes
    .replace(/^(?!<[hl]|<li)(.+)/gim, '<p class="mb-4">$1</p>')
    // Nettoyer les paragraphes vides
    .replace(/<p class="mb-4"><\/p>/g, '')
}
