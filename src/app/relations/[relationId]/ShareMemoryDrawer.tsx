'use client'

import { useState } from 'react'
import { X, Share2, Copy, Clock, Globe, Link, Check } from 'lucide-react'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { RelationMemory, memoriesService } from '@/lib/supabase/memories'

interface ShareMemoryDrawerProps {
  memory: RelationMemory
  onClose: () => void
}

export default function ShareMemoryDrawer({ memory, onClose }: ShareMemoryDrawerProps) {
  const [selectedDuration, setSelectedDuration] = useState<'24h' | '7d' | 'permanent'>('7d')
  const [shareUrl, setShareUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const durations = [
    {
      value: '24h' as const,
      label: '24 heures',
      description: 'Le lien expirera dans 24h',
      icon: Clock
    },
    {
      value: '7d' as const,
      label: '7 jours',
      description: 'Le lien expirera dans 7 jours',
      icon: Clock
    },
    {
      value: 'permanent' as const,
      label: 'Permanent',
      description: 'Le lien ne expire jamais',
      icon: Globe
    }
  ]

  const generateShareLink = async () => {
    setIsGenerating(true)
    try {
      const url = await memoriesService.createShareLink(memory.id, selectedDuration)
      setShareUrl(url)
    } catch (error) {
      console.error('Error generating share link:', error)
      alert('Erreur lors de la génération du lien')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      alert('Erreur lors de la copie')
    }
  }

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Souvenir: ${memory.title}`,
          text: 'Découvrez ce souvenir partagé',
          url: shareUrl
        })
      } catch (error) {
        console.log('Partage annulé')
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-t-2xl border-t border-white/30 dark:border-white/10 max-h-[80vh] flex flex-col animate-[slideInUp_300ms_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-pink-100 dark:bg-pink-900/30 p-2 rounded-full">
              <Share2 className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Partager ce souvenir
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {memory.title || 'Souvenir sans titre'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!shareUrl ? (
            <>
              {/* Avertissement */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
                    <Globe className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                      Partage public
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Ce souvenir sera visible par toute personne ayant le lien. 
                      Assurez-vous de ne partager que ce que vous êtes à l'aise de rendre public.
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview du souvenir */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Aperçu du souvenir à partager
                </h4>
                <div className="flex items-start space-x-4">
                  {memory.kind === 'photo' && memory.file_url && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <OptimizedImage 
                        src={memory.file_url}
                        alt={memory.title || 'Photo'}
                        className="w-full h-full object-cover"
                        width={400} 
                        height={300} 
                        quality={80}
                      />
                    </div>
                  )}
                  
                  {memory.kind === 'video' && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-2xl">🎥</span>
                    </div>
                  )}
                  
                  {memory.kind === 'note' && (
                    <div className="w-16 h-16 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📝</span>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {memory.title || `${memory.kind === 'photo' ? 'Photo' : memory.kind === 'video' ? 'Vidéo' : 'Note'} sans titre`}
                    </h5>
                    {memory.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                        {memory.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(memory.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sélection de durée */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Durée de validité du lien
                </label>
                <div className="space-y-3">
                  {durations.map((duration) => {
                    const Icon = duration.icon
                    return (
                      <button
                        key={duration.value}
                        onClick={() => setSelectedDuration(duration.value)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          selectedDuration === duration.value
                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            selectedDuration === duration.value
                              ? 'bg-pink-100 dark:bg-pink-900/30'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              selectedDuration === duration.value
                                ? 'text-pink-600 dark:text-pink-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {duration.label}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {duration.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Bouton de génération */}
              <button
                onClick={generateShareLink}
                disabled={isGenerating}
                className="w-full bg-pink-500 text-white py-4 px-6 rounded-xl hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Génération du lien...</span>
                  </>
                ) : (
                  <>
                    <Link className="h-5 w-5" />
                    <span>Générer le lien de partage</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Lien généré */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">
                      Lien créé avec succès !
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Votre souvenir est maintenant partageable
                    </p>
                  </div>
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lien de partage
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={`px-4 py-3 rounded-xl transition-colors flex items-center space-x-2 ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span className="hidden sm:inline">Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span className="hidden sm:inline">Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Actions de partage */}
              <div className="space-y-3">
                <button
                  onClick={shareViaWebAPI}
                  className="w-full bg-blue-500 text-white py-3 px-6 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 className="h-5 w-5" />
                  <span>Partager via...</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=Découvrez ce souvenir !&url=${encodeURIComponent(shareUrl)}`, '_blank')}
                    className="bg-sky-500 text-white py-3 px-4 rounded-xl hover:bg-sky-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>🐦</span>
                    <span>Twitter</span>
                  </button>
                  
                  <button
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
                    className="bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>📘</span>
                    <span>Facebook</span>
                  </button>
                </div>
              </div>

              {/* Informations sur l'expiration */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>
                    {selectedDuration === 'permanent' 
                      ? 'Ce lien ne expire jamais'
                      : `Ce lien expirera ${selectedDuration === '24h' ? 'dans 24 heures' : 'dans 7 jours'}`
                    }
                  </span>
                </div>
              </div>

              {/* Bouton pour créer un nouveau lien */}
              <button
                onClick={() => setShareUrl('')}
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 py-2 transition-colors"
              >
                Créer un nouveau lien
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Les liens partagés sont publics et accessibles à tous
            </p>
            <button
              onClick={onClose}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
