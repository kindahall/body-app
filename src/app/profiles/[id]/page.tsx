'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, MapPin, Star, Heart, Camera, Video, FileText, Clock, TrendingUp, Award, Plus, Sparkles, Eye, Share2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { createClientComponentClient } from '@/lib/supabase'
import { memoriesService, RelationMemory, MemoryStats } from '@/lib/supabase/memories'
import MemoriesSection from './MemoriesSection'
import UploadMemoryModal from './UploadMemoryModal'

interface Relationship {
  id: string
  type: 'romantic' | 'sexual' | 'friend' | 'friendzone' | 'other'
  name: string
  start_date: string | null
  location: string | null
  duration: string | null
  feelings: string | null
  rating: number | null
  private_note: string | null
  created_at: string
}

export default function ProfileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const relationId = params.id as string

  const [relationship, setRelationship] = useState<Relationship | null>(null)
  const [memories, setMemories] = useState<RelationMemory[]>([])
  const [memoryStats, setMemoryStats] = useState<MemoryStats>({
    total: 0,
    photos: 0,
    videos: 0,
    notes: 0,
    totalSize: 0
  })
  const [activeTab, setActiveTab] = useState<'overview' | 'memories'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Vérifier si c'est un utilisateur de test
  const isTestUser = typeof document !== 'undefined' && 
    document.cookie.includes('test-user=true')

  // Handler pour l'upload réussi
  const handleMemoryUploaded = () => {
    setShowUploadModal(false)
    loadData() // Recharger les données
  }

  const loadData = useCallback(async () => {
    if (!relationId) return
    setIsLoading(true)

    try {
      // Fetch relationship details
      const { data: relationData, error: relationError } = await supabase
        .from('relationships')
        .select('*')
        .eq('id', relationId)
        .single()

      if (relationError) {
        console.error('Error fetching relationship:', relationError.message || relationError)
        setRelationship(null)
      } else {
        setRelationship(relationData)
      }

      // Fetch memories for the relationship
      if (user && relationData) {
        const [memoriesData, statsData] = await Promise.all([
          memoriesService.getRelationMemories(relationId),
          memoriesService.getMemoryStats(relationId)
        ])
        setMemories(memoriesData)
        setMemoryStats(statsData)
      }
    } catch (error: any) {
      console.error('Unexpected error loading profile data:', error.message || error)
    } finally {
      setIsLoading(false)
    }
  }, [relationId, supabase, user])

  // Initial data load
  useEffect(() => {
    loadData()
  }, [loadData])

  // Setup realtime subscription for memory changes
  useEffect(() => {
    if (!user || !relationId) return

    const channel = memoriesService.subscribeToMemoryChanges(relationId, (payload) => {
      loadData() // Reload all data on memory change
    })

    return () => {
      channel.unsubscribe()
    }
  }, [user, relationId, loadData])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'romantic': return 'pink'
      case 'sexual': return 'purple'
      case 'friend': return 'blue'
      case 'friendzone': return 'orange'
      case 'other': return 'gray'
      default: return 'gray'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'romantic': return 'Romantique'
      case 'sexual': return 'Sexuelle'
      case 'friend': return 'Amitié'
      case 'friendzone': return 'Friendzone'
      case 'other': return 'Autre'
      default: return 'Autre'
    }
  }

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'romantic': return '💕'
      case 'sexual': return '🔥'
      case 'friend': return '👫'
      case 'friendzone': return '🙃'
      case 'other': return '🤝'
      default: return '🤝'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center relative overflow-hidden">
        {/* Particules animées en arrière-plan */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-pulse opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Heart className="h-4 w-4 text-white" />
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center space-y-6 z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-400 absolute inset-0"></div>
          </div>
          <div className="text-center">
            <p className="text-white/80 text-lg font-medium">Chargement du profil...</p>
            <p className="text-white/60 text-sm mt-2">Préparation de votre histoire ✨</p>
          </div>
        </div>
      </div>
    )
  }

  if (!relationship) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center relative overflow-hidden">
        {/* Fond étoilé */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            >
              <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
            </div>
          ))}
        </div>

        <div className="text-center max-w-md mx-auto p-8 z-10">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30">
            <Heart className="h-12 w-12 text-white/80" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Relation introuvable
          </h2>
          <p className="text-white/70 mb-8 leading-relaxed">
            Cette relation n'existe pas ou a été supprimée.<br />
            <span className="text-pink-300">Peut-être est-elle partie vers d'autres cieux... 💫</span>
          </p>
          <button
            onClick={() => router.push('/profiles')}
            className="group bg-white/20 backdrop-blur-lg text-white px-8 py-4 rounded-2xl hover:bg-white/30 transition-all duration-300 font-medium border border-white/30 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20"
          >
            <span className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 group-hover:transform group-hover:-translate-x-1 transition-transform" />
              <span>Retour aux profils</span>
            </span>
          </button>
        </div>
      </div>
    )
  }

  const color = getTypeColor(relationship.type)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 relative">
      {/* Fond décoratif animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-pink-300/20 to-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-rose-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-200/10 to-pink-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header immersif amélioré */}
      <header className="relative bg-gradient-to-r from-white/90 via-white/85 to-white/90 backdrop-blur-xl shadow-xl border-b border-white/40 sticky top-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-rose-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/profiles')}
                className="group flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-white/60 px-4 py-2 rounded-xl transition-all duration-300 mr-8 backdrop-blur-sm border border-white/30"
              >
                <ArrowLeft className="h-5 w-5 group-hover:transform group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Profils</span>
              </button>
              
              <div className="flex items-center space-x-6">
                {/* Avatar avec initiales */}
                <div className="relative">
                  <div className={`bg-gradient-to-br from-${color}-400 to-${color}-600 p-4 rounded-2xl shadow-lg relative overflow-hidden group hover:scale-105 transition-transform duration-300`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {relationship.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 text-xl">
                    {getTypeEmoji(relationship.type)}
                  </div>
                </div>

                {/* Informations principales */}
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {relationship.name}
                    </h1>
                    <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-${color}-100 to-${color}-200 text-${color}-800 border border-${color}-300/50`}>
                      {getTypeEmoji(relationship.type)} {getTypeLabel(relationship.type)}
                    </span>
                    {relationship.rating && (
                      <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-100 to-amber-100 px-3 py-1 rounded-full border border-yellow-300/50">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-bold text-yellow-700">{relationship.rating}/10</span>
                      </div>
                    )}
                    {relationship.start_date && (
                      <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 rounded-full border border-blue-300/50">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700">
                          {Math.floor((Date.now() - new Date(relationship.start_date).getTime()) / (1000 * 60 * 60 * 24))}j
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats rapides améliorées */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="group text-center bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/40 hover:bg-white/80 transition-all duration-300 hover:scale-105">
                <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  {memoryStats.total}
                </div>
                <div className="text-xs text-gray-600 font-medium">Souvenirs</div>
              </div>
              <div className="group text-center bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/40 hover:bg-white/80 transition-all duration-300 hover:scale-105">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {memoryStats.photos}
                </div>
                <div className="text-xs text-gray-600 font-medium">Photos</div>
              </div>
              <div className="group text-center bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/40 hover:bg-white/80 transition-all duration-300 hover:scale-105">
                <div className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  {memoryStats.videos}
                </div>
                <div className="text-xs text-gray-600 font-medium">Vidéos</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Tabs super améliorés */}
        <div className="mb-10">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-transparent to-purple-500/5"></div>
            <nav className="flex space-x-2 relative z-10">
              <button
                onClick={() => setActiveTab('overview')}
                className={`group flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 relative overflow-hidden ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-2xl transform scale-[1.02] shadow-pink-500/25'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:scale-[1.01]'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${activeTab === 'overview' ? 'opacity-100' : ''}`}></div>
                <Heart className={`h-5 w-5 relative z-10 ${activeTab === 'overview' ? 'animate-pulse' : ''}`} />
                <span className="relative z-10">Vue d'ensemble</span>
                {activeTab === 'overview' && <Sparkles className="h-4 w-4 text-white/80 animate-pulse relative z-10" />}
              </button>
              <button
                onClick={() => setActiveTab('memories')}
                className={`group flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 relative overflow-hidden ${
                  activeTab === 'memories'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-2xl transform scale-[1.02] shadow-pink-500/25'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:scale-[1.01]'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${activeTab === 'memories' ? 'opacity-100' : ''}`}></div>
                <Camera className={`h-5 w-5 relative z-10 ${activeTab === 'memories' ? 'animate-pulse' : ''}`} />
                <span className="relative z-10">Souvenirs</span>
                {memoryStats.total > 0 && (
                  <span className={`relative z-10 text-xs px-3 py-1 rounded-full font-bold ${
                    activeTab === 'memories' 
                      ? 'bg-white/25 text-white border border-white/30' 
                      : 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border border-pink-200'
                  }`}>
                    {memoryStats.total}
                  </span>
                )}
                {activeTab === 'memories' && <Sparkles className="h-4 w-4 text-white/80 animate-pulse relative z-10" />}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* Statistiques en haut - Version améliorée */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Note */}
            {relationship.rating && (
                <div className="group relative bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-200/60 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-gradient-to-br from-yellow-200 to-amber-300 p-4 rounded-2xl shadow-lg">
                        <Award className="h-8 w-8 text-yellow-800" />
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-black bg-gradient-to-br from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                          {relationship.rating}
                        </div>
                        <div className="text-sm text-amber-600 font-semibold">/10</div>
                      </div>
                  </div>
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">Note attribuée</h3>
                    <div className="flex space-x-1 mb-2">
                        {Array.from({ length: 10 }, (_, i) => (
                          <Star
                            key={i}
                          className={`h-5 w-5 transition-all duration-300 ${
                              i < relationship.rating!
                              ? 'text-yellow-500 fill-current transform scale-110'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    <p className="text-amber-700 text-sm font-medium">
                      {relationship.rating >= 8 ? '💫 Excellent' : 
                       relationship.rating >= 6 ? '✨ Très bien' : 
                       relationship.rating >= 4 ? '👍 Correct' : '🤔 À améliorer'}
                    </p>
                  </div>
                </div>
              )}

              {/* Durée */}
              {relationship.duration && (
                <div className="group relative bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-200/60 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-gradient-to-br from-purple-200 to-indigo-300 p-4 rounded-2xl shadow-lg">
                        <Clock className="h-8 w-8 text-purple-800" />
                      </div>
                      <TrendingUp className="h-6 w-6 text-purple-400 animate-pulse" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">Durée de la relation</h3>
                    <p className="text-2xl font-black bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      {relationship.duration}
                    </p>
                    <p className="text-purple-700 text-sm font-medium">⏰ Temps partagé ensemble</p>
                </div>
              </div>
            )}

              {/* Souvenirs */}
              <div className="group relative bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 border-2 border-pink-200/60 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 to-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-gradient-to-br from-pink-200 to-rose-300 p-4 rounded-2xl shadow-lg">
                      <Camera className="h-8 w-8 text-pink-800" />
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black bg-gradient-to-br from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        {memoryStats.total}
                      </div>
                      <div className="text-sm text-rose-600 font-semibold">souvenirs</div>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Mémoires partagées</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-rose-700 font-medium">
                      <span className="flex items-center space-x-1">
                        <span>📸</span>
                        <span>{memoryStats.photos}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>🎥</span>
                        <span>{memoryStats.videos}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>📝</span>
                        <span>{memoryStats.notes}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        console.log('Ouverture du modal depuis vue d\'ensemble')
                        setShowUploadModal(true)
                      }}
                      className="group flex items-center space-x-2 text-sm text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 font-bold px-4 py-2 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                      <span>Ajouter</span>
                    </button>
                    <button
                      onClick={() => {
                        console.log('Passage à l\'onglet souvenirs')
                        setActiveTab('memories')
                      }}
                      className="group flex items-center space-x-2 text-sm text-pink-700 hover:text-pink-800 font-bold bg-pink-100 hover:bg-pink-200 px-4 py-2 rounded-2xl transition-all duration-300 border-2 border-pink-200 hover:border-pink-300 hover:scale-105"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Voir tout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations détaillées - Version complètement repensée */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Colonne de gauche - Informations temporelles */}
              <div className="space-y-8">
                {relationship.start_date && (
                  <div className="group relative bg-white/80 backdrop-blur-xl border-2 border-white/60 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-start space-x-6">
                        <div className="bg-gradient-to-br from-blue-200 to-indigo-300 p-4 rounded-2xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <Calendar className="h-8 w-8 text-blue-800" />
                    </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-3 text-xl flex items-center">
                            Date de début
                            <Sparkles className="h-5 w-5 text-blue-500 ml-2 animate-pulse" />
                          </h3>
                          <p className="text-2xl font-black bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
                        {new Date(relationship.start_date).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-xl border border-blue-200">
                            <p className="text-blue-700 font-semibold">
                              🗓️ Il y a {Math.floor((Date.now() - new Date(relationship.start_date).getTime()) / (1000 * 60 * 60 * 24))} jours
                            </p>
                          </div>
                        </div>
                      </div>
                  </div>
                </div>
              )}

              {relationship.location && (
                  <div className="group relative bg-white/80 backdrop-blur-xl border-2 border-white/60 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-start space-x-6">
                        <div className="bg-gradient-to-br from-green-200 to-emerald-300 p-4 rounded-2xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <MapPin className="h-8 w-8 text-green-800" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-3 text-xl flex items-center">
                            Lieu de rencontre
                            <Sparkles className="h-5 w-5 text-green-500 ml-2 animate-pulse" />
                          </h3>
                          <p className="text-2xl font-black bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-2">
                            {relationship.location}
                          </p>
                          <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-xl border border-green-200">
                            <p className="text-green-700 font-semibold">📍 Lieu magique de votre première rencontre</p>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

              {/* Colonne de droite - Informations émotionnelles */}
              <div className="space-y-8">
                {relationship.feelings && (
                  <div className="group relative bg-white/80 backdrop-blur-xl border-2 border-white/60 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <h3 className="font-bold text-gray-900 mb-4 text-xl flex items-center">
                        <div className="bg-gradient-to-br from-pink-200 to-rose-300 p-3 rounded-xl mr-3 group-hover:scale-110 transition-transform duration-300">
                          <Heart className="h-6 w-6 text-pink-800" />
                        </div>
                        Sentiments & Émotions
                        <Sparkles className="h-5 w-5 text-pink-500 ml-2 animate-pulse" />
                      </h3>
                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-pink-100">
                        <p className="text-gray-800 leading-relaxed font-medium text-lg">{relationship.feelings}</p>
                      </div>
                    </div>
              </div>
            )}

                {relationship.private_note && (
                  <div className="group relative bg-white/80 backdrop-blur-xl border-2 border-white/60 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <h3 className="font-bold text-gray-900 mb-4 text-xl flex items-center">
                        <div className="bg-gradient-to-br from-gray-200 to-slate-300 p-3 rounded-xl mr-3 group-hover:scale-110 transition-transform duration-300">
                          <FileText className="h-6 w-6 text-gray-800" />
                        </div>
                        Note privée
                        <Sparkles className="h-5 w-5 text-gray-500 ml-2 animate-pulse" />
                      </h3>
                      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border-2 border-gray-100">
                        <p className="text-gray-800 leading-relaxed font-medium text-lg">{relationship.private_note}</p>
                      </div>
                    </div>
              </div>
            )}
              </div>
            </div>

            {/* Information d'ajout - Version finale */}
            <div className="group relative bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 border-2 border-indigo-200/60 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-indigo-200 to-blue-300 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-8 w-8 text-indigo-800" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-xl mb-1 flex items-center">
                      Relation ajoutée
                      <Sparkles className="h-5 w-5 text-indigo-500 ml-2 animate-pulse" />
                    </h3>
                    <p className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-blue-700 bg-clip-text text-transparent">
                      Le {new Date(relationship.created_at).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
                  </div>
                  <div className="text-4xl animate-pulse">💫</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'memories' && (
          <div className="animate-in fade-in duration-500">
          <MemoriesSection 
            relationId={relationId}
            memories={memories}
            stats={memoryStats}
            onMemoriesUpdate={loadData}
              externalModalState={{
                showUploadModal,
                setShowUploadModal
              }}
          />
          </div>
        )}
      </main>

      {/* Modal d'upload */}
      {showUploadModal && (
        <UploadMemoryModal
          relationId={relationId}
          onClose={() => setShowUploadModal(false)}
          onUploaded={handleMemoryUploaded}
        />
      )}

      {/* Style CSS personnalisé pour les animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        .animate-in {
          animation: slideInUp 0.5s ease-out;
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
      `}</style>
    </div>
  )
}
