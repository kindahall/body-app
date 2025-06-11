'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Camera, Video, FileText, Calendar, Clock, Share2, Download } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { memoriesService, RelationMemory, MemoryStats } from '@/lib/supabase/memories'
import MemoriesGallery from './MemoriesGallery'
import UploadMemoryModal from './UploadMemoryModal'
import MemoryViewer from './MemoryViewer'
import ShareMemoryDrawer from './ShareMemoryDrawer'

interface Relationship {
  id: string
  name: string
  type: string
  start_date?: string
  location?: string
  feelings?: string
  rating?: number
}

export default function RelationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const relationId = params.relationId as string

  const [relation, setRelation] = useState<Relationship | null>(null)
  const [memories, setMemories] = useState<RelationMemory[]>([])
  const [stats, setStats] = useState<MemoryStats>({
    total: 0,
    photos: 0,
    videos: 0,
    notes: 0,
    totalSize: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedMemory, setSelectedMemory] = useState<RelationMemory | null>(null)
  const [showShareDrawer, setShowShareDrawer] = useState(false)
  const [viewMode, setViewMode] = useState<'gallery' | 'timeline'>('gallery')
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (user && relationId) {
      loadData()
      setupRealtimeSubscription()
    }
  }, [user, relationId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Charger les données de la relation (simulation)
      // En production, récupérer depuis la table relationships
      setRelation({
        id: relationId,
        name: 'Sarah',
        type: 'romantic',
        start_date: '2024-01-15',
        location: 'Paris',
        feelings: 'Relation passionnée et enrichissante',
        rating: 8
      })

      // Charger les souvenirs
      const [memoriesData, statsData] = await Promise.all([
        memoriesService.getRelationMemories(relationId),
        memoriesService.getMemoryStats(relationId)
      ])

      setMemories(memoriesData)
      setStats(statsData)

      // Animation confetti si premier souvenir
      if (memoriesData.length === 1 && memories.length === 0) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }
    } catch (error) {
      console.error('Error loading relation data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    if (!user) return

    const subscription = memoriesService.subscribeToMemoryChanges(relationId, (payload) => {
      console.log('Memory update:', payload)
      loadData() // Recharger les données
    })

    return () => {
      subscription.unsubscribe()
    }
  }

  const handleMemoryUploaded = () => {
    setShowUploadModal(false)
    loadData()
  }

  const handleMemoryDeleted = async (memoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce souvenir ?')) return

    try {
      await memoriesService.deleteMemory(memoryId)
      loadData()
    } catch (error) {
      console.error('Error deleting memory:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleMemoryClick = (memory: RelationMemory) => {
    setSelectedMemory(memory)
  }

  const getRelationTypeLabel = (type: string): string => {
    switch (type) {
      case 'romantic':
        return 'Romantique'
      case 'sexual':
        return 'Sexuelle'
      case 'friend':
        return 'Amitié'
      case 'friendzone':
        return 'Friendzone'
      default:
        return 'Autre'
    }
  }

  const getRelationTypeColor = (type: string): string => {
    switch (type) {
      case 'romantic':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'sexual':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'friend':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'friendzone':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!relation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Relation introuvable
          </h2>
          <button
            onClick={() => router.push('/relations')}
            className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
          >
            Retour aux relations
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-lg shadow-sm border-b border-white/30 dark:border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/relations')}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mr-6"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Relations</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-2 rounded-lg">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Souvenirs avec {relation.name}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRelationTypeColor(relation.type)}`}>
                      {getRelationTypeLabel(relation.type)}
                    </span>
                    {relation.start_date && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Depuis {new Date(relation.start_date).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Stats */}
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Camera className="h-4 w-4" />
                  <span>{stats.photos}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Video className="h-4 w-4" />
                  <span>{stats.videos}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>{stats.notes}</span>
                </div>
              </div>

              {/* Toggle View */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('gallery')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'gallery'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Galerie
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'timeline'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Timeline
                </button>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Ajouter</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Relation Info */}
        {relation.feelings && (
          <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-white/10 shadow-sm p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="bg-pink-100 dark:bg-pink-900/30 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  À propos de cette relation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {relation.feelings}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {relation.location && (
                    <span>📍 {relation.location}</span>
                  )}
                  {relation.rating && (
                    <span>⭐ {relation.rating}/10</span>
                  )}
                  <span>📸 {stats.total} souvenirs</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Memories Gallery */}
        <MemoriesGallery
          memories={memories}
          viewMode={viewMode}
          onMemoryClick={handleMemoryClick}
          onMemoryDelete={handleMemoryDeleted}
        />

        {/* Empty State */}
        {memories.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun souvenir pour le moment
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Commencez à créer des souvenirs de cette relation
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Ajouter votre premier souvenir
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      {showUploadModal && (
        <UploadMemoryModal
          relationId={relationId}
          onClose={() => setShowUploadModal(false)}
          onUploaded={handleMemoryUploaded}
        />
      )}

      {selectedMemory && (
        <MemoryViewer
          memory={selectedMemory}
          memories={memories}
          onClose={() => setSelectedMemory(null)}
          onShare={() => setShowShareDrawer(true)}
          onDelete={() => handleMemoryDeleted(selectedMemory.id)}
        />
      )}

      {showShareDrawer && selectedMemory && (
        <ShareMemoryDrawer
          memory={selectedMemory}
          onClose={() => setShowShareDrawer(false)}
        />
      )}
    </div>
  )
}
