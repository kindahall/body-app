'use client'

import { useState } from 'react'
import { Play, FileText, Trash2, Edit3, Calendar, Clock } from 'lucide-react'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { RelationMemory, getMemoryIcon, getRelativeTime, formatDate } from '@/lib/supabase/memories'

interface MemoriesGalleryProps {
  memories: RelationMemory[]
  viewMode: 'gallery' | 'timeline'
  onMemoryClick: (memory: RelationMemory) => void
  onMemoryDelete: (memoryId: string) => void
}

export default function MemoriesGallery({ 
  memories, 
  viewMode, 
  onMemoryClick, 
  onMemoryDelete 
}: MemoriesGalleryProps) {
  const [hoveredMemory, setHoveredMemory] = useState<string | null>(null)

  const renderGalleryView = () => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
      {memories.map((memory) => (
        <div
          key={memory.id}
          className="relative aspect-square bg-white/80 dark:bg-gray-900/50 backdrop-blur-lg rounded-xl border border-white/30 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden group"
          onMouseEnter={() => setHoveredMemory(memory.id)}
          onMouseLeave={() => setHoveredMemory(null)}
          onClick={() => onMemoryClick(memory)}
        >
          {/* Content */}
          {memory.kind === 'photo' && memory.file_url && (
            <OptimizedImage
              src={memory.file_url}
              alt={memory.title || 'Photo'}
              fill
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              quality={75}
            />
          )}

          {memory.kind === 'video' && (
            <div className="relative w-full h-full">
              {memory.thumbnail_url ? (
                <img
                  src={memory.thumbnail_url}
                  alt={memory.title || 'Vidéo'}
                  className="w-full h-full object-cover"
                />
              ) : memory.file_url ? (
                <video
                  src={memory.file_url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => e.currentTarget.pause()}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Play className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 dark:bg-gray-900/90 rounded-full p-2">
                  <Play className="h-6 w-6 text-gray-900 dark:text-white" />
                </div>
              </div>
            </div>
          )}

          {memory.kind === 'note' && (
            <div className="w-full h-full bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 flex flex-col items-center justify-center p-4">
              <FileText className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mb-2" />
              {memory.title && (
                <p className="text-xs text-center text-gray-700 dark:text-gray-300 line-clamp-3">
                  {memory.title}
                </p>
              )}
            </div>
          )}

          {/* Date badge */}
          <div className="absolute bottom-1 right-1 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm text-[10px] px-1 rounded text-gray-900 dark:text-white">
            {new Date(memory.created_at).toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: '2-digit' 
            })}
          </div>

          {/* Type icon */}
          <div className="absolute top-1 left-1 text-lg">
            {getMemoryIcon(memory.kind)}
          </div>

          {/* Actions overlay */}
          {hoveredMemory === memory.id && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onMemoryClick(memory)
                }}
                className="bg-white/90 dark:bg-gray-900/90 p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
                title="Voir"
              >
                <Edit3 className="h-4 w-4 text-gray-900 dark:text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onMemoryDelete(memory.id)
                }}
                className="bg-red-500/90 p-2 rounded-full hover:bg-red-600 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4 text-white" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const renderTimelineView = () => (
    <div className="space-y-6">
      {memories.map((memory, index) => (
        <div
          key={memory.id}
          className="flex items-start space-x-4 bg-white/80 dark:bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-white/10 shadow-sm p-6 hover:shadow-md transition-all duration-300 cursor-pointer"
          onClick={() => onMemoryClick(memory)}
        >
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className="bg-pink-500 w-3 h-3 rounded-full"></div>
            {index < memories.length - 1 && (
              <div className="w-px h-16 bg-gray-200 dark:bg-gray-700 mt-2"></div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getMemoryIcon(memory.kind)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {memory.title || `${memory.kind === 'photo' ? 'Photo' : memory.kind === 'video' ? 'Vidéo' : 'Note'} sans titre`}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(memory.created_at)}</span>
                    <span>•</span>
                    <span>{getRelativeTime(memory.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMemoryClick(memory)
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="Voir"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMemoryDelete(memory.id)
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Description */}
            {memory.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                {memory.description}
              </p>
            )}

                          {/* Preview */}
            <div className="flex items-start space-x-4">
              {memory.kind === 'photo' && memory.file_url && (
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <OptimizedImage
                    src={memory.file_url}
                    alt={memory.title || 'Photo'}
                    fill
                    sizes="96px"
                    className="object-cover"
                    quality={60}
                  />
                </div>
              )}

              {memory.kind === 'video' && (
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
                  {memory.thumbnail_url ? (
                    <OptimizedImage
                      src={memory.thumbnail_url}
                      alt={memory.title || 'Vidéo'}
                      fill
                      sizes="96px"
                      className="object-cover"
                      quality={60}
                    />
                  ) : memory.file_url ? (
                    <video
                      src={memory.file_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Play className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="bg-white/90 dark:bg-gray-900/90 rounded-full p-1">
                      <Play className="h-4 w-4 text-gray-900 dark:text-white" />
                    </div>
                  </div>
                </div>
              )}

              {memory.kind === 'note' && (
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {viewMode === 'gallery' ? renderGalleryView() : renderTimelineView()}
    </div>
  )
}
