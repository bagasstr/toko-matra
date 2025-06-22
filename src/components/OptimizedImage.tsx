'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback, memo } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  sizes?: string
  fallback?: string
  lazy?: boolean
  preload?: boolean
  aspectRatio?: string
  onLoad?: () => void
  onError?: () => void
}

export type { OptimizedImageProps }

// Intersection Observer for lazy loading
const useIntersectionObserver = (threshold = 0.1) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [element, setElement] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [element, threshold])

  return [setElement, isIntersecting] as const
}

// Image preloader hook
const useImagePreloader = (src: string, preload: boolean) => {
  useEffect(() => {
    if (!preload || !src || typeof window === 'undefined') return

    const img = document.createElement('img')
    img.src = src
  }, [src, preload])
}

// Memoized optimized image component
export const OptimizedImage = memo(
  ({
    src,
    alt,
    width,
    height,
    className = '',
    fill,
    priority = false,
    quality = 75,
    placeholder = 'empty',
    sizes = '(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw',
    fallback = '/default-image.png',
    lazy = true,
    preload = false,
    aspectRatio,
    onLoad,
    onError,
  }: OptimizedImageProps) => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [imageSrc, setImageSrc] = useState(src)
    const [setRef, isIntersecting] = useIntersectionObserver(0.1)

    // Preload image if specified
    useImagePreloader(src, preload)

    const shouldLoad = !lazy || isIntersecting || priority

    const handleLoad = useCallback(() => {
      setIsLoading(false)
      onLoad?.()
    }, [onLoad])

    const handleError = useCallback(() => {
      setHasError(true)
      setIsLoading(false)
      setImageSrc(fallback)
      onError?.()
    }, [fallback, onError])

    const containerStyle = aspectRatio ? { aspectRatio } : {}

    return (
      <div
        ref={setRef}
        className={`relative overflow-hidden ${className}`}
        style={containerStyle}>
        {/* Loading skeleton */}
        {isLoading && (
          <div className='absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center'>
            <div className='text-gray-400 text-xs'>Loading...</div>
          </div>
        )}

        {/* Actual image */}
        {shouldLoad && (
          <Image
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            fill={fill}
            quality={quality}
            placeholder={placeholder}
            sizes={sizes}
            className={`transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            // Add decoding optimization
            decoding='async'
            // Add fetchPriority for critical images
            fetchPriority={priority ? 'high' : 'auto'}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
          />
        )}

        {/* Error state */}
        {hasError && !isLoading && (
          <div className='absolute inset-0 bg-gray-100 flex items-center justify-center'>
            <div className='text-gray-500 text-xs text-center p-2'>
              Failed to load image
            </div>
          </div>
        )}
      </div>
    )
  }
)

OptimizedImage.displayName = 'OptimizedImage'

export default OptimizedImage
