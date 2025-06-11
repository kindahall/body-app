'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useIntl, FormattedMessage } from 'react-intl'

export default function ScreenshotsCarousel() {
  const intl = useIntl()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({})

  const screenshots = [
    {
      id: 1,
      titleKey: 'screenshots.wishlist.title',
      descriptionKey: 'screenshots.wishlist.description',
      image: '/screenshots/wishlist.png'
    },
    {
      id: 2,
      titleKey: 'screenshots.mirror.title',
      descriptionKey: 'screenshots.mirror.description',
      image: '/screenshots/mirror.png'
    },
    {
      id: 3,
      titleKey: 'screenshots.journal.title',
      descriptionKey: 'screenshots.journal.description',
      image: '/screenshots/journal.png'
    },
    {
      id: 4,
      titleKey: 'screenshots.confessions.title',
      descriptionKey: 'screenshots.confessions.description',
      image: '/screenshots/confessions.png'
    }
  ]

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === screenshots.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? screenshots.length - 1 : prevIndex - 1
    )
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const handleImageError = (id: number) => {
    setImageErrors(prev => ({ ...prev, [id]: true }))
  }

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Main carousel */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {screenshots.map((screenshot) => (
            <div key={screenshot.id} className="w-full flex-shrink-0">
              <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                {!imageErrors[screenshot.id] ? (
                  /* Real screenshot */
                  <img 
                    src={screenshot.image} 
                    alt={`${intl.formatMessage({ id: screenshot.titleKey })} - ${intl.formatMessage({ id: screenshot.descriptionKey })}`}
                    className="w-full h-full object-contain"
                    onError={() => handleImageError(screenshot.id)}
                    loading="lazy"
                  />
                ) : (
                  /* Fallback placeholder */
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <span className="text-4xl">📱</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                        <FormattedMessage id={screenshot.titleKey} />
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        <FormattedMessage id={screenshot.descriptionKey} />
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Overlay with title and description - only when image loads */}
                {!imageErrors[screenshot.id] && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      <FormattedMessage id={screenshot.titleKey} />
                    </h3>
                    <p className="text-gray-200 text-lg">
                      <FormattedMessage id={screenshot.descriptionKey} />
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors backdrop-blur-sm"
          aria-label={intl.formatMessage({ id: 'screenshots.prevButton' })}
        >
          <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors backdrop-blur-sm"
          aria-label={intl.formatMessage({ id: 'screenshots.nextButton' })}
        >
          <ChevronRight className="w-6 h-6 text-gray-900 dark:text-white" />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        {screenshots.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex
                ? 'bg-gradient-to-r from-pink-500 to-purple-600'
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
            aria-label={intl.formatMessage({ id: 'screenshots.goToSlide' }, { index: index + 1 })}
          />
        ))}
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
        {screenshots.map((screenshot, index) => (
          <button
            key={screenshot.id}
            onClick={() => goToSlide(index)}
            className={`group p-4 rounded-xl transition-all ${
              index === currentIndex
                ? 'bg-gradient-to-r from-pink-500/10 to-purple-600/10 border-2 border-pink-500/30'
                : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
            }`}
          >
            <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-gray-200 dark:bg-gray-700">
              {!imageErrors[screenshot.id] ? (
                <img 
                  src={screenshot.image} 
                  alt={intl.formatMessage({ id: screenshot.titleKey })}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={() => handleImageError(screenshot.id)}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
              )}
            </div>
            <h4 className={`font-semibold text-sm mb-1 ${
              index === currentIndex 
                ? 'text-pink-600 dark:text-pink-400' 
                : 'text-gray-900 dark:text-white'
            }`}>
              <FormattedMessage id={screenshot.titleKey} />
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              <FormattedMessage id={screenshot.descriptionKey} />
            </p>
          </button>
        ))}
      </div>

      {/* Helper message for missing images */}
      {Object.keys(imageErrors).length > 0 && (
        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
            <FormattedMessage id="screenshots.helpMessage" />
          </p>
        </div>
      )}
    </div>
  )
}