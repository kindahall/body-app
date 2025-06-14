'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FormattedMessage, useIntl } from 'react-intl'
import { ArrowLeft, MessageCircle, Plus, Heart, Share2, Flag, Send, X, Image, Video, Download, Play } from 'lucide-react'

interface MediaFile {
  id: string
  url: string
  type: 'image' | 'video' | 'gif'
  filename: string
}

interface Comment {
  id: string
  text: string
  createdAt: string
  author: string
  likes: number
  isLiked: boolean
}

interface Confession {
  id: string
  text: string
  createdAt: string
  author: string
  hue: number
  stats: {
    likes: number
    shares: number
    comments: number
  }
  isLiked: boolean
  isShared: boolean
  media: MediaFile[]
  comments: Comment[]
}

export default function ConfessionsPage() {
  const router = useRouter()
  const intl = useIntl()
  const [confessions, setConfessions] = useState<Confession[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const [showComments, setShowComments] = useState<string | null>(null)
  const [showVideoModal, setShowVideoModal] = useState<string | null>(null)

  useEffect(() => {
    loadConfessions()
  }, [])

  const loadConfessions = () => {
    const saved = localStorage.getItem('bodycount-confessions-v5')
    if (saved) {
      setConfessions(JSON.parse(saved))
    } else {
      const examples: Confession[] = [
        {
          id: '1',
          text: intl.formatMessage({ id: 'confessions.examples.firstTime' }),
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          author: intl.formatMessage({ id: 'confessions.commentsDrawer.anonymous' }),
          hue: 0, // Rouge
          stats: { likes: 124, shares: 23, comments: 18 },
          isLiked: true,
          isShared: false,
          media: [],
          comments: [
            {
              id: 'c1',
              text: intl.formatMessage({ id: 'confessions.comments.example' }),
              createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              author: intl.formatMessage({ id: 'confessions.commentsDrawer.anonymous' }),
              likes: 45,
              isLiked: false
            }
          ]
        },
        {
          id: '2',
          text: intl.formatMessage({ id: 'confessions.examples.education' }),
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          author: intl.formatMessage({ id: 'confessions.commentsDrawer.anonymous' }),
          hue: 120, // Vert
          stats: { likes: 231, shares: 78, comments: 45 },
          isLiked: true,
          isShared: false,
          media: [
            {
              id: 'm1',
              url: 'https://via.placeholder.com/400x200/6366f1/white?text=Media+partagé',
              type: 'image',
              filename: 'media.jpg'
            }
          ],
          comments: []
        },
        {
          id: '3',
          text: intl.formatMessage({ id: 'confessions.examples.loveAtFirstSight' }),
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          author: intl.formatMessage({ id: 'confessions.commentsDrawer.anonymous' }),
          hue: 280, // Violet
          stats: { likes: 89, shares: 34, comments: 20 },
          isLiked: true,
          isShared: false,
          media: [],
          comments: []
        }
      ]
      setConfessions(examples)
      localStorage.setItem('bodycount-confessions-v5', JSON.stringify(examples))
    }
  }

  const saveConfessions = (updated: Confession[]) => {
    setConfessions(updated)
    localStorage.setItem('bodycount-confessions-v5', JSON.stringify(updated))
  }

  const handleLike = async (confessionId: string) => {
    const updated = confessions.map(confession => {
      if (confession.id === confessionId) {
        const newIsLiked = !confession.isLiked
        return {
          ...confession,
          isLiked: newIsLiked,
          stats: {
            ...confession.stats,
            likes: newIsLiked ? confession.stats.likes + 1 : confession.stats.likes - 1
          }
        }
      }
      return confession
    })
    saveConfessions(updated)
  }

  const handleShare = async (confession: Confession) => {
    const shareData = {
      title: intl.formatMessage({ id: 'confessions.share.title' }),
      text: confession.text.substring(0, 100) + '...',
      url: `${window.location.origin}/confessions/${confession.id}`
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        const toast = document.createElement('div')
        toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm z-50'
        toast.textContent = intl.formatMessage({ id: 'confessions.share.linkCopied' })
        document.body.appendChild(toast)
        setTimeout(() => document.body.removeChild(toast), 2000)
      }
      
      const updated = confessions.map(c => {
        if (c.id === confession.id) {
          return {
            ...c,
            isShared: true,
            stats: { ...c.stats, shares: c.stats.shares + 1 }
          }
        }
        return c
      })
      saveConfessions(updated)
    } catch (error) {
      console.log('Partage annulé')
    }
  }

  const handleDownload = (media: MediaFile) => {
    const link = document.createElement('a')
    link.href = media.url
    link.download = media.filename
    link.click()
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return intl.formatMessage({ id: 'confessions.timeAgo.now' })
    if (diffInHours < 24) return intl.formatMessage({ id: 'confessions.timeAgo.hoursAgo' }, { hours: diffInHours })
    return intl.formatMessage({ id: 'confessions.timeAgo.daysAgo' }, { days: Math.floor(diffInHours / 24) })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200">
      {/* Header avec glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/20 backdrop-blur-xl border-b border-white/30">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/home')}
              className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-700" />
            </button>
            
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">
                <FormattedMessage id="confessions.title" />
              </h1>
              <p className="text-sm text-gray-700">
                <FormattedMessage id="confessions.subtitle" />
              </p>
            </div>

            <button
              onClick={() => setIsPosting(true)}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg"
            >
              <Plus className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-md mx-auto space-y-6 pt-24 pb-32 px-6">
        {confessions.map((confession, index) => (
          <ConfessionCard
            key={confession.id}
            confession={confession}
            index={index}
            onLike={() => handleLike(confession.id)}
            onShare={() => handleShare(confession)}
            onOpenComments={() => setShowComments(confession.id)}
            onDownload={handleDownload}
            onPlayVideo={(url) => setShowVideoModal(url)}
            formatTimeAgo={formatTimeAgo}
            intl={intl}
          />
        ))}
      </main>

      {/* Bouton flottant en bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/20 backdrop-blur-xl border-t border-white/30 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors">
            <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
              <span className="text-lg">👍</span>
            </div>
          </button>
          
          <button className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors">
            <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
              <span className="text-lg">👎</span>
            </div>
          </button>
          
          <button className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors">
            <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
              <Download className="h-4 w-4" />
            </div>
          </button>
          
          <button 
            onClick={() => setIsPosting(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:scale-105 transition-transform shadow-lg"
          >
            <Share2 className="h-4 w-4" />
            <span className="font-medium">
              <FormattedMessage id="confessions.shareButton" />
            </span>
          </button>
        </div>
      </div>

      {/* Modal de création */}
      {isPosting && (
        <NewConfessionModal
          onClose={() => setIsPosting(false)}
          onSubmit={(newConfession) => {
            const updated = [newConfession, ...confessions]
            saveConfessions(updated)
            setIsPosting(false)
          }}
          intl={intl}
        />
      )}

      {/* Drawer des commentaires */}
      {showComments && (
        <CommentsDrawer
          confession={confessions.find(c => c.id === showComments)!}
          onClose={() => setShowComments(null)}
          onAddComment={(comment) => {
            const updated = confessions.map(c => {
              if (c.id === showComments) {
                return {
                  ...c,
                  comments: [...c.comments, comment],
                  stats: { ...c.stats, comments: c.stats.comments + 1 }
                }
              }
              return c
            })
            saveConfessions(updated)
          }}
          intl={intl}
        />
      )}

      {/* Modal vidéo */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[scaleIn_250ms_ease-out]">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowVideoModal(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            <video
              src={showVideoModal}
              controls
              autoPlay
              className="w-full rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Composant ConfessionCard
function ConfessionCard({ 
  confession, 
  index, 
  onLike, 
  onShare, 
  onOpenComments,
  onDownload,
  onPlayVideo,
  formatTimeAgo,
  intl
}: {
  confession: Confession
  index: number
  onLike: () => void
  onShare: () => void
  onOpenComments: () => void
  onDownload: (media: MediaFile) => void
  onPlayVideo: (url: string) => void
  formatTimeAgo: (timestamp: string) => string
  intl: any
}) {
  const [showReport, setShowReport] = useState(false)
  const accentColor = `hsl(${confession.hue} 80% 60%)`

  return (
    <div 
      className="rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-lg p-6 animate-[fadeInUp_350ms_ease-out] hover:bg-white/50 transition-all duration-300"
      style={{ 
        animationDelay: `${index * 100}ms`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
            style={{ backgroundColor: accentColor }}
          >
            A
          </div>
          <div>
            <p className="font-semibold text-gray-900">{confession.author}</p>
            <p className="text-xs text-gray-600">{formatTimeAgo(confession.createdAt)}</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowReport(!showReport)}
          className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-lg"
          aria-label={intl.formatMessage({ id: 'confessions.actions.report' })}
        >
          <Flag className="h-4 w-4" />
        </button>
      </div>

      {/* Contenu */}
      <p className="text-gray-800 leading-relaxed mb-4 text-base">
        {confession.text}
      </p>

      {/* Médias */}
      {confession.media.length > 0 && (
        <div className="mb-4 space-y-3">
          {confession.media.map((media) => (
            <div key={media.id} className="relative group">
              {media.type === 'image' || media.type === 'gif' ? (
                <img 
                  src={media.url}
                  alt="Media partagé"
                  className="w-full rounded-2xl max-h-60 object-cover"
                  width={400} 
                  height={300}
                />
              ) : (
                <div className="relative">
                  <video
                    src={media.url}
                    className="w-full rounded-2xl max-h-60 object-cover"
                    preload="metadata"
                  />
                  <button
                    onClick={() => onPlayVideo(media.url)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl hover:bg-black/40 transition-colors"
                  >
                    <div className="bg-white/90 rounded-full p-3">
                      <Play className="h-6 w-6 text-gray-900 ml-1" />
                    </div>
                  </button>
                </div>
              )}
              <button
                onClick={() => onDownload(media)}
                className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={intl.formatMessage({ id: 'confessions.actions.downloadMedia' })}
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-6 text-gray-600">
        <button
          onClick={onLike}
          className={`flex items-center space-x-2 hover:text-red-500 transition-colors ${
            confession.isLiked ? 'text-red-500' : ''
          }`}
        >
          <Heart className={`h-5 w-5 ${confession.isLiked ? 'fill-current animate-[heartBeat_0.6s_ease-in-out]' : ''}`} />
          <span className="text-sm font-medium">{confession.stats.likes}</span>
        </button>

        <button
          onClick={onOpenComments}
          className="flex items-center space-x-2 hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{confession.stats.comments}</span>
        </button>

        <button
          onClick={onShare}
          className={`flex items-center space-x-2 hover:text-purple-500 transition-colors ${
            confession.isShared ? 'text-purple-500' : ''
          }`}
        >
          <Share2 className="h-5 w-5" />
          <span className="text-sm font-medium">{confession.stats.shares}</span>
        </button>
      </div>

      {/* Menu signalement */}
      {showReport && (
        <div className="mt-4 p-4 bg-red-50/80 rounded-xl border border-red-200/50">
          <p className="text-sm text-red-700 mb-3 font-medium">
            <FormattedMessage id="confessions.reportModal.title" />
          </p>
          <div className="space-y-2">
            {[
              { key: 'inappropriate', id: 'confessions.reportModal.reasons.inappropriate' },
              { key: 'harassment', id: 'confessions.reportModal.reasons.harassment' },
              { key: 'spam', id: 'confessions.reportModal.reasons.spam' },
              { key: 'misinformation', id: 'confessions.reportModal.reasons.misinformation' },
              { key: 'other', id: 'confessions.reportModal.reasons.other' }
            ].map(reason => (
              <button
                key={reason.key}
                onClick={() => {
                  const reasonText = intl.formatMessage({ id: reason.id })
                  alert(intl.formatMessage({ id: 'confessions.reportModal.reported' }, { reason: reasonText }))
                  setShowReport(false)
                }}
                className="block w-full text-left text-sm text-red-600 hover:text-red-800 py-2 px-3 rounded-lg hover:bg-red-100/50 transition"
              >
                <FormattedMessage id={reason.id} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Composant NewConfessionModal
function NewConfessionModal({ 
  onClose, 
  onSubmit,
  intl
}: { 
  onClose: () => void
  onSubmit: (confession: Confession) => void
  intl: any
}) {
  const [text, setText] = useState('')
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'video/mp4' || file.type === 'image/gif'
      const isValidSize = file.size <= 50 * 1024 * 1024
      return isValidType && isValidSize
    }).slice(0, 3 - mediaFiles.length)

    if (validFiles.length === 0) return

    setMediaFiles(prev => [...prev, ...validFiles])
    
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file)
      setMediaPreviews(prev => [...prev, url])
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index])
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
    setMediaPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!text.trim() && mediaFiles.length === 0) return

    const mediaData: MediaFile[] = mediaFiles.map((file, index) => ({
      id: `media_${Date.now()}_${index}`,
      url: mediaPreviews[index],
      type: file.type.startsWith('image/') ? (file.type === 'image/gif' ? 'gif' : 'image') : 'video',
      filename: file.name
    }))

    const newConfession: Confession = {
      id: Date.now().toString(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
      author: 'Anonyme',
      hue: Math.floor(Math.random() * 360),
      stats: { likes: 0, shares: 0, comments: 0 },
      isLiked: false,
      isShared: false,
      media: mediaData,
      comments: []
    }

    onSubmit(newConfession)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[scaleIn_250ms_ease-out]">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl max-w-lg w-full p-6 border border-white/50 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            <FormattedMessage id="confessions.newConfession.title" />
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={intl.formatMessage({ id: 'confessions.newConfession.placeholder' })}
          rows={6}
          maxLength={1000}
          className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
        />
        
        <div className="flex justify-between items-center mt-2 mb-4">
          <span className="text-sm text-gray-500">
            <FormattedMessage id="confessions.newConfession.characterCount" values={{ count: text.length }} />
          </span>
        </div>

        {/* Zone de drag & drop */}
        <div
          className={`border-2 border-dashed rounded-xl p-6 mb-4 transition-colors ${
            isDragging 
              ? 'border-purple-500 bg-purple-50/50' 
              : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
        >
          <div className="text-center">
            <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              <FormattedMessage id="confessions.newConfession.dragDrop.dragHere" />
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/mp4,image/gif"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={mediaFiles.length >= 3}
              className="text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FormattedMessage id="confessions.newConfession.dragDrop.clickToSelect" />
            </button>
            <p className="text-xs text-gray-500 mt-1">
              <FormattedMessage id="confessions.newConfession.dragDrop.fileTypes" />
            </p>
          </div>
        </div>

        {/* Aperçu des médias */}
        {mediaPreviews.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            {mediaPreviews.map((preview, index) => (
              <div key={index} className="relative group">
                {mediaFiles[index].type.startsWith('image/') ? (
                  <img 
                    src={preview}
                    alt={intl.formatMessage({ id: 'confessions.newConfession.preview' })}
                    className="w-full h-32 object-cover rounded-xl"
                    width={400} 
                    height={300}
                  />
                ) : (
                  <video
                    src={preview}
                    className="w-full h-32 object-cover rounded-xl"
                    muted
                  />
                )}
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-xl"
          >
            <FormattedMessage id="confessions.newConfession.buttons.cancel" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!text.trim() && mediaFiles.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>
              <FormattedMessage id="confessions.newConfession.buttons.publish" />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Composant CommentsDrawer
function CommentsDrawer({ 
  confession, 
  onClose, 
  onAddComment,
  intl
}: { 
  confession: Confession
  onClose: () => void
  onAddComment: (comment: Comment) => void
  intl: any
}) {
  const [newComment, setNewComment] = useState('')

  const handleSubmit = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
      author: intl.formatMessage({ id: 'confessions.commentsDrawer.anonymous' }),
      likes: 0,
      isLiked: false
    }

    onAddComment(comment)
    setNewComment('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-white/90 backdrop-blur-xl rounded-t-3xl border-t border-white/50 max-h-[80vh] flex flex-col animate-[slideInUp_300ms_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900">
            <FormattedMessage id="confessions.commentsDrawer.title" values={{ count: confession.stats.comments }} />
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Liste des commentaires */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {confession.comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
              <div className="flex-1">
                <div className="bg-gray-100/80 rounded-xl p-3">
                  <p className="text-sm text-gray-800">{comment.text}</p>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <button className="text-xs text-gray-500 hover:text-purple-600 transition-colors">
                    <Heart className="h-3 w-3 inline mr-1" />
                    {comment.likes}
                  </button>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Champ de saisie */}
        <div className="p-6 border-t border-gray-200/50">
          <div className="flex space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={intl.formatMessage({ id: 'confessions.commentsDrawer.placeholder' })}
                className="flex-1 px-4 py-2 bg-gray-100/80 border border-gray-200/50 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button
                onClick={handleSubmit}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
