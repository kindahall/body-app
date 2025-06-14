'use client'

import { useState } from 'react'
import { X, Share2, Copy, Clock, Globe, Link, Check } from 'lucide-react'
import { WishlistService } from '@/lib/supabase/wishlist'
import { FormattedMessage, useIntl } from 'react-intl'

interface ShareDrawerProps {
  onClose: () => void
}

export default function ShareDrawer({ onClose }: ShareDrawerProps) {
  const intl = useIntl()
  const [selectedDuration, setSelectedDuration] = useState<'24h' | '7d' | 'permanent'>('7d')
  const [shareUrl, setShareUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const durations = [
    {
      value: '24h' as const,
      labelKey: 'wishlist.shareModal.duration.24h',
      descriptionKey: 'wishlist.shareModal.duration.24hDesc',
      icon: Clock
    },
    {
      value: '7d' as const,
      labelKey: 'wishlist.shareModal.duration.7d',
      descriptionKey: 'wishlist.shareModal.duration.7dDesc',
      icon: Clock
    },
    {
      value: 'permanent' as const,
      labelKey: 'wishlist.shareModal.duration.permanent',
      descriptionKey: 'wishlist.shareModal.duration.permanentDesc',
      icon: Globe
    }
  ]

  const generateShareLink = async () => {
    setIsGenerating(true)
    try {
      const url = await WishlistService.createShareLink(selectedDuration)
      setShareUrl(url)
    } catch (error) {
      console.error('Error generating share link:', error)
      alert(intl.formatMessage({ id: 'wishlist.shareModal.error.generation' }))
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error: any) {
      console.error('Error copying to clipboard:', error.message || error)
      alert(intl.formatMessage({ id: 'wishlist.shareModal.error.copy' }))
    }
  }

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: intl.formatMessage({ id: 'wishlist.shareModal.webapi.title' }),
          text: intl.formatMessage({ id: 'wishlist.shareModal.webapi.text' }),
          url: shareUrl
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-t-2xl border-t border-white/30 dark:border-white/10 max-h-[80vh] flex flex-col animate-[slideInUp_300ms_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
              <Share2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                <FormattedMessage id="wishlist.shareModal.title" />
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <FormattedMessage id="wishlist.shareModal.subtitle" />
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
                      <FormattedMessage id="wishlist.shareModal.warning.title" />
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      <FormattedMessage id="wishlist.shareModal.warning.message" />
                    </p>
                  </div>
                </div>
              </div>

              {/* Sélection de durée */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  <FormattedMessage id="wishlist.shareModal.durationLabel" />
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
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            selectedDuration === duration.value
                              ? 'bg-orange-100 dark:bg-orange-900/30'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              selectedDuration === duration.value
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              <FormattedMessage id={duration.labelKey} />
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <FormattedMessage id={duration.descriptionKey} />
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
                className="w-full bg-orange-500 text-white py-4 px-6 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>
                      <FormattedMessage id="wishlist.shareModal.generating" />
                    </span>
                  </>
                ) : (
                  <>
                    <Link className="h-5 w-5" />
                    <span>
                      <FormattedMessage id="wishlist.shareModal.generateButton" />
                    </span>
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
                      <FormattedMessage id="wishlist.shareModal.success.title" />
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <FormattedMessage id="wishlist.shareModal.success.message" />
                    </p>
                  </div>
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FormattedMessage id="wishlist.shareModal.linkLabel" />
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
                        <span className="hidden sm:inline">
                          <FormattedMessage id="wishlist.shareModal.copied" />
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          <FormattedMessage id="wishlist.shareModal.copy" />
                        </span>
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
                  <span>
                    <FormattedMessage id="wishlist.shareModal.shareVia" />
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(intl.formatMessage({ id: 'wishlist.shareModal.twitterText' }))}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
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
                    {selectedDuration === 'permanent' ? (
                      <FormattedMessage id="wishlist.shareModal.expiration.never" />
                    ) : (
                      <FormattedMessage 
                        id="wishlist.shareModal.expiration.willExpire" 
                        values={{ 
                          duration: selectedDuration === '24h' 
                            ? intl.formatMessage({ id: 'wishlist.shareModal.expiration.in24h' })
                            : intl.formatMessage({ id: 'wishlist.shareModal.expiration.in7d' })
                        }}
                      />
                    )}
                  </span>
                </div>
              </div>

              {/* Bouton pour créer un nouveau lien */}
              <button
                onClick={() => setShareUrl('')}
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 py-2 transition-colors"
              >
                <FormattedMessage id="wishlist.shareModal.createNew" />
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <FormattedMessage id="wishlist.shareModal.footerNote" />
            </p>
            <button
              onClick={onClose}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <FormattedMessage id="wishlist.shareModal.close" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
