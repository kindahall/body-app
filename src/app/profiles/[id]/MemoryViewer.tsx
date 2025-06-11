'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Share2, Download, Trash2, Play, Pause } from 'lucide-react'
import { RelationMemory, getMemoryIcon, formatDate } from '@/lib/supabase/memories'
import OptimizedImage from '@/components/ui/OptimizedImage'

interface MemoryViewerProps {
  memory: RelationMemory
  memories: RelationMemory[]
  onClose: () => void
  onShare: () => void
  onDelete: () => void
}

export default function MemoryViewer({ memory, memories, onClose, onShare, onDelete }: MemoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(memories.findIndex(m => m.id === memory.id))
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null)

  const currentMemory = memories[currentIndex] || memory

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsVideoPlaying(false)
    }
  }

  const goToNext = () => {
    if (currentIndex < memories.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsVideoPlaying(false)
    }
  }

  const handleVideoPlay = () => {
    if (videoRef) {
      if (isVideoPlaying) {
        videoRef.pause()
      } else {
        videoRef.play()
      }
      setIsVideoPlaying(!isVideoPlaying)
    }
  }

  const handleDownload = () => {
    if (currentMemory.file_url) {
      const link = document.createElement('a')
      link.href = currentMemory.file_url
      link.download = `${currentMemory.title || 'souvenir'}.${currentMemory.kind === 'photo' ? 'jpg' : 'mp4'}`
      link.click()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrevious()
    } else if (e.key === 'ArrowRight') {
      goToNext()
    } else if (e.key === 'Escape') {
      onClose()
    } else if (e.key === ' ' && currentMemory.kind === 'video') {
      e.preventDefault()
      handleVideoPlay()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-6 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getMemoryIcon(currentMemory.kind)}</span>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {currentMemory.title || `${currentMemory.kind === 'photo' ? 'Photo' : currentMemory.kind === 'video' ? 'Vidéo' : 'Note'} sans titre`}
              </h2>
              <p className="text-gray-300 text-sm">
                {formatDate(currentMemory.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onShare}
              className="p-2 text-white hover:text-gray-300 transition-colors rounded-lg hover:bg-white/10"
              title="Partager"
            >
              <Share2 className="h-5 w-5" />
            </button>
            
            {currentMemory.file_url && (
              <button
                onClick={handleDownload}
                className="p-2 text-white hover:text-gray-300 transition-colors rounded-lg hover:bg-white/10"
                title="Télécharger"
              >
                <Download className="h-5 w-5" />
              </button>
            )}
            
            <button
              onClick={onDelete}
              className="p-2 text-white hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/20"
              title="Supprimer"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-white hover:text-gray-300 transition-colors rounded-lg hover:bg-white/10"
              title="Fermer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {memories.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 text-white hover:text-gray-300 transition-colors rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed z-10"
            title="Précédent"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          
          <button
            onClick={goToNext}
            disabled={currentIndex === memories.length - 1}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 text-white hover:text-gray-300 transition-colors rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed z-10"
            title="Suivant"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="max-w-4xl max-h-[80vh] w-full mx-4">
        {currentMemory.kind === 'photo' && currentMemory.file_url && (
          <div className="relative w-full h-full">
            <OptimizedImage
              src={currentMemory.file_url}
              alt={currentMemory.title || 'Photo'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              className="object-contain rounded-lg"
              quality={95}
              priority
            />
          </div>
        )}

        {currentMemory.kind === 'video' && currentMemory.file_url && (
          <div className="relative">
            <video
              ref={setVideoRef}
              src={currentMemory.file_url}
              className="w-full h-full object-contain rounded-lg"
              controls
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
            />
            
            {/* Custom play button overlay */}
            <button
              onClick={handleVideoPlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity rounded-lg"
            >
              <div className="bg-white/90 rounded-full p-4">
                {isVideoPlaying ? (
                  <Pause className="h-8 w-8 text-gray-900" />
                ) : (
                  <Play className="h-8 w-8 text-gray-900" />
                )}
              </div>
            </button>
          </div>
        )}

        {currentMemory.kind === 'note' && (
          <div className="bg-white rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentMemory.title}
              </h2>
            </div>
            
            {currentMemory.description && (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {currentMemory.description}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6">
        <div className="max-w-4xl mx-auto">
          {currentMemory.description && currentMemory.kind !== 'note' && (
            <p className="text-white text-center mb-4">
              {currentMemory.description}
            </p>
          )}
          
          {memories.length > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-white text-sm">
                {currentIndex + 1} / {memories.length}
              </span>
              <div className="flex space-x-1">
                {memories.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex 
                        ? 'bg-white' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-4 left-4 text-white/60 text-xs">
        <div>← → Navigation</div>
        <div>Espace Lecture/Pause</div>
        <div>Échap Fermer</div>
      </div>
    </div>
  )
}
