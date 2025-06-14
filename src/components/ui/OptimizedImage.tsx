'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ImageIcon } from 'lucide-react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  fill?: boolean
  sizes?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  showPlaceholder?: boolean
  fallbackSrc?: string
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 80,
  fill = false,
  sizes,
  objectFit = 'cover',
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  showPlaceholder = true,
  fallbackSrc,
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Générer un placeholder blur simple si non fourni
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7+H9v4cXFZLHGlUhVbBV2l8nOA0kDNXo5JHOX7wK+P9HjUCfI92z9vW1XVVGz8mBKqJwrJ99I/UjTjWsZRShSg5SOgW0KbKZUJHmv7ClKBrOUJUJHmv7ClKCF2C4Kkk8k8cAGLTSA0kDKGU9xCFMlJzHFKjVJpKLmzGOYYgaJzxfAw+PGPx5/fSLJgdIiNJ+tqyRzZGfKWt5B2fxpI/lYYd+ksEZaZW9YCeKxr+XgQxOPq4rH9/M8Zl9JCZVv8iJEYmTxDFFzuxN+Q0fdgK5+xMwO+A/fLAVrYCefPe2NxuCyJmLDbD0oC9xJL12Q0bWCAyxRH5GQmXTKqMvhPk+n4sHQFaXzFIyhlr0nEoIpKAq8xKkrKJ4r4R4pYFQCOKZwEOOCaG8YGTQ0FJR+g8gOA+ATSI4pnAQ44JobxgZNDQUlH6DyA4D4BNIjimcBDjgmhvGBk0NBSUfoPIDgPgE0iOKZwEOOCaG8YGTQ0FJR+g8gOA+ATSI4pnAQ44JobxgZNDQUlH6DyA4D4BNIjimcBDjgmhvGBk0NBSUfoPIDgPgE0iOKZwEOOCaG8YGTQ0FJR+g8gOA+ATSI4pnAQ44JobxgZNDQUlH6DyA4D4BNIjimcBDjgmhvGBk0NBSUfoPIDgPgE0iOKZwEOOCaG8YGTQ0FJR+g8gOA+ATSI4pnAQ44JobxgZNDQUlH6DyA4D4BNIjimcBDjgmhvGBk0NBSUfoPIDgPgE0iOKZwEOOCaG8YGTQ0FJR+g8gOA+ATSI4pnAQ44JobxgZNDQUlH6DyA4D4BNIjimcBDjgmhvGBk0NBSUfoPIDgPgE0iOKZwEOOCaG8YGTQ0FJR+g8gOA+ATSI4pnAQ44JobxgZNDQUlH6DyA4D4BNIjimcBDjgmhvGBk0NBSUfoPIDgPgE0g=='

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setImageError(true)
    setIsLoading(false)
    onError?.()
  }

  // Si erreur et fallback disponible
  if (imageError && fallbackSrc) {
    return (
      <OptimizedImage
        {...props}
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        quality={quality}
        fill={fill}
        sizes={sizes}
        objectFit={objectFit}
        onLoad={handleLoad}
        onError={() => setImageError(true)}
        showPlaceholder={showPlaceholder}
        fallbackSrc={undefined} // Éviter la récursion infinie
      />
    )
  }

  // Si erreur sans fallback, afficher placeholder
  if (imageError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400',
          className
        )}
        style={{ width, height }}
      >
        <ImageIcon className="w-8 h-8" />
      </div>
    )
  }

  const imageProps = {
    src,
    alt,
    onLoad: handleLoad,
    onError: handleError,
    priority,
    quality,
    placeholder,
    blurDataURL: blurDataURL || defaultBlurDataURL,
    className: cn(
      objectFit === 'cover' && 'object-cover',
      objectFit === 'contain' && 'object-contain',
      objectFit === 'fill' && 'object-fill',
      objectFit === 'none' && 'object-none',
      objectFit === 'scale-down' && 'object-scale-down',
      'transition-opacity duration-300',
      isLoading && 'opacity-0',
      !isLoading && 'opacity-100',
      className
    ),
    sizes: sizes || (fill ? '100vw' : `${width}px`),
    ...props
  }

  if (fill) {
    return <Image {...imageProps} fill />
  }

  return (
    <Image 
      {...imageProps} 
      width={width || 0} 
      height={height || 0}
    />
  )
}

// Hook pour détecter la taille d'écran et adapter les images
export function useResponsiveImageSizes() {
  const [screenSize, setScreenSize] = useState('md')

  // Cette logique pourrait être améliorée avec useEffect et window.matchMedia
  const getImageSizes = (breakpoints?: { sm?: number, md?: number, lg?: number, xl?: number }) => {
    const defaults = { sm: 640, md: 768, lg: 1024, xl: 1280 }
    const bp = { ...defaults, ...breakpoints }
    
    return `(max-width: ${bp.sm}px) 100vw, (max-width: ${bp.md}px) 50vw, (max-width: ${bp.lg}px) 33vw, 25vw`
  }

  return { screenSize, getImageSizes }
} 