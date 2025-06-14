'use client'

import { useState, useEffect } from 'react'
import { Plus, Camera, Video, FileText, Grid3X3, List, Search, Sparkles, Heart } from 'lucide-react'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { RelationMemory, MemoryStats, memoriesService } from '@/lib/supabase/memories'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import UploadMemoryModal from './UploadMemoryModal'
import MemoryViewer from './MemoryViewer'
import ShareMemoryDrawer from './ShareMemoryDrawer'
import { toast } from 'react-hot-toast'
import Confetti from 'react-confetti'

interface MemoriesSectionProps {
  relationId: string
  memories: RelationMemory[]
  stats: MemoryStats
  onMemoriesUpdate: () => void
  externalModalState?: {
    showUploadModal: boolean
    setShowUploadModal: (show: boolean) => void
  }
}

export default function MemoriesSection({ 
  relationId, 
  memories: initialMemories, 
  stats: initialStats, 
  onMemoriesUpdate,
  externalModalState
}: MemoriesSectionProps) {
  const { user } = useAuth()
  const [memories, setMemories] = useState<RelationMemory[]>(initialMemories)
  const [stats, setStats] = useState<MemoryStats>(initialStats)
  const [viewMode, setViewMode] = useState<'gallery' | 'timeline'>('gallery')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'photo' | 'video' | 'note'>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedMemory, setSelectedMemory] = useState<RelationMemory | null>(null)
  const [showShareDrawer, setShowShareDrawer] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  const modalState = externalModalState || { showUploadModal, setShowUploadModal }

  useEffect(() => {
    // Set window size on client to avoid SSR issues
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setMemories(initialMemories)
    setStats(initialStats)
  }, [initialMemories, initialStats])

  const handleMemoryUploaded = () => {
    modalState.setShowUploadModal(false)
    if (memories.length === 0) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
    toast.success('🎉 Souvenir ajouté avec succès !')
    onMemoriesUpdate()
  }

  const handleMemoryDeleted = async (memoryId: string) => {
    toast.promise(
      memoriesService.deleteMemory(memoryId),
      {
        loading: 'Suppression en cours...',
        success: 'Souvenir supprimé.',
        error: 'Erreur lors de la suppression.',
      }
    );
  }

  const handleMemoryClick = (memory: RelationMemory) => {
    setSelectedMemory(memory)
  }

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memory.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || memory.kind === filterType
    return matchesSearch && matchesType
  })

  const renderGalleryView = () => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
      {filteredMemories.map((memory) => (
        <div
          key={memory.id}
          className="relative aspect-square bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden group"
          onClick={() => handleMemoryClick(memory)}
        >
          {memory.kind === 'photo' && memory.file_url && (
            <OptimizedImage 
              src={memory.file_url} 
              alt={memory.title || 'Photo'} 
              fill
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              quality={75}
            />
          )}
          {memory.kind === 'video' && (
            <div className="relative w-full h-full">
              {memory.thumbnail_url ? (
                <OptimizedImage 
                  src={memory.thumbnail_url} 
                  alt={memory.title || 'Vidéo'} 
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-cover"
                  quality={75}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Video className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 rounded-full p-2"><Video className="h-6 w-6 text-gray-900" /></div>
              </div>
            </div>
          )}
          {memory.kind === 'note' && (
            <div className="w-full h-full bg-gradient-to-br from-yellow-50 to-orange-50 flex flex-col items-center justify-center p-4">
              <FileText className="h-8 w-8 text-yellow-600 mb-2" />
              <p className="text-xs text-center text-gray-700 line-clamp-3">{memory.title}</p>
            </div>
          )}
          <div className="absolute top-1 left-1 text-lg">
             {memory.kind === 'photo' && '📸'}
             {memory.kind === 'video' && '🎥'}
             {memory.kind === 'note' && '📝'}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-8">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-2xl shadow-lg"><Sparkles className="h-6 w-6 text-pink-600 mb-3" /><div className="text-3xl font-bold text-pink-600">{stats.total}</div><div className="text-sm text-gray-600 font-medium">Total souvenirs</div></div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg"><Camera className="h-6 w-6 text-blue-600 mb-3" /><div className="text-3xl font-bold text-blue-600">{stats.photos}</div><div className="text-sm text-gray-600 font-medium">Photos</div></div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl shadow-lg"><Video className="h-6 w-6 text-purple-600 mb-3" /><div className="text-3xl font-bold text-purple-600">{stats.videos}</div><div className="text-sm text-gray-600 font-medium">Vidéos</div></div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl shadow-lg"><FileText className="h-6 w-6 text-yellow-600 mb-3" /><div className="text-3xl font-bold text-yellow-600">{stats.notes}</div><div className="text-sm text-gray-600 font-medium">Notes</div></div>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center">
            <div className="relative flex-grow mr-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un souvenir..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl w-full"
              />
            </div>
            <button
              onClick={() => modalState.setShowUploadModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium"
            >
              <Plus className="h-5 w-5" />
              <span>Nouveau</span>
            </button>
        </div>
      </div>

      {/* Content */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-xl font-medium text-gray-900">Aucun souvenir trouvé</h3>
          <p className="mt-1 text-gray-500">Commencez à ajouter des photos, vidéos ou notes.</p>
        </div>
      ) : (
        renderGalleryView()
      )}

      {/* Modals */}
      {modalState.showUploadModal && (
        <UploadMemoryModal
          relationId={relationId}
          onClose={() => modalState.setShowUploadModal(false)}
          onUploaded={handleMemoryUploaded}
        />
      )}

      {selectedMemory && (
        <MemoryViewer
          memory={selectedMemory}
          memories={filteredMemories}
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
