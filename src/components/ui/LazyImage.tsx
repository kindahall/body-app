'use client'

import { useState, useRef, useEffect } from 'react'
import OptimizedImage from './OptimizedImage'
import { cn } from '@/lib/utils'
import { ImageIcon } from 'lucide-react'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  quality?: number
  fill?: boolean
  sizes?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  placeholder?: 'blur' | 'empty' | 'skeleton'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  threshold?: number
  rootMargin?: string
  fallbackSrc?: string
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  quality = 75,
  fill = false,
  sizes,
  objectFit = 'cover',
  placeholder = 'skeleton',
  blurDataURL,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  fallbackSrc,
  ...props
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer pour détecter quand l'image entre dans le viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // Placeholder skeleton
  const renderSkeleton = () => (
    <div 
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        fill ? 'absolute inset-0' : '',
        className
      )}
      style={!fill ? { width, height } : undefined}
    >
      <div className="flex items-center justify-center h-full">
        <ImageIcon className="w-8 h-8 text-gray-400" />
      </div>
    </div>
  )

  // Placeholder vide
  const renderEmpty = () => (
    <div 
      className={cn(
        'bg-gray-100 dark:bg-gray-800 flex items-center justify-center',
        fill ? 'absolute inset-0' : '',
        className
      )}
      style={!fill ? { width, height } : undefined}
    >
      <ImageIcon className="w-8 h-8 text-gray-400" />
    </div>
  )

  return (
    <div 
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        fill ? 'w-full h-full' : '',
        className
      )}
      style={!fill ? { width, height } : undefined}
    >
      {/* Afficher le placeholder tant que l'image n'est pas en vue ou chargée */}
      {(!isInView || !isLoaded) && !hasError && (
        <>
          {placeholder === 'skeleton' && renderSkeleton()}
          {placeholder === 'empty' && renderEmpty()}
          {placeholder === 'blur' && blurDataURL && (
            <OptimizedImage
              src={blurDataURL}
              alt=""
              fill={fill}
              width={width}
              height={height}
              className={cn('blur-sm scale-110', className)}
              quality={10}
            />
          )}
        </>
      )}

      {/* Image principale - ne se charge que quand elle est en vue */}
      {isInView && !hasError && (
        <OptimizedImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          sizes={sizes}
          quality={quality}
          objectFit={objectFit}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          fallbackSrc={fallbackSrc}
          {...props}
        />
      )}

      {/* Fallback en cas d'erreur */}
      {hasError && renderEmpty()}
    </div>
  )
}

// Hook pour précharger les images critiques
export function useImagePreloader(imageSrcs: string[]) {
  useEffect(() => {
    imageSrcs.forEach(src => {
      const img = new Image()
      img.src = src
    })
  }, [imageSrcs])
}

// Composant pour les images critiques (hero, above the fold)
export function CriticalImage(props: Omit<LazyImageProps, 'threshold' | 'rootMargin' | 'placeholder'>) {
  return (
    <OptimizedImage
      {...props}
      priority
      quality={props.quality || 90}
      placeholder={props.blurDataURL ? 'blur' : 'empty'}
    />
  )
} 