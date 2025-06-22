'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  sizes?: string
}

export default function OptimizedImage({
  src,
  alt,
  width = 300,
  height = 300,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Fallback image jika ada error
  const fallbackSrc = '/default-image.png'

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className='absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center'>
          <div className='text-gray-400'>Loading...</div>
        </div>
      )}

      <Image
        src={hasError ? fallbackSrc : src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        sizes={sizes}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
        // Optimasi untuk Vercel Blob
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  )
}
