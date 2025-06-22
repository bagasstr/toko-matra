'use client'

import { useEffect, useState } from 'react'

interface UseImagePreloadOptions {
  priority?: boolean
  quality?: number
}

export function useImagePreload(
  src: string,
  options: UseImagePreloadOptions = {}
) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!src) return

    const img = new Image()

    img.onload = () => {
      setIsLoaded(true)
      setHasError(false)
    }

    img.onerror = () => {
      setHasError(true)
      setIsLoaded(false)
    }

    // Add query parameters for optimization
    const optimizedSrc = options.quality
      ? `${src}?q=${options.quality}&auto=format&fit=max&w=800`
      : src

    img.src = optimizedSrc

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, options.quality])

  return { isLoaded, hasError }
}

export function useImageBatch(
  srcs: string[],
  options: UseImagePreloadOptions = {}
) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!srcs.length) return

    const promises = srcs.map((src) => {
      return new Promise<{ src: string; success: boolean }>((resolve) => {
        const img = new Image()

        img.onload = () => resolve({ src, success: true })
        img.onerror = () => resolve({ src, success: false })

        const optimizedSrc = options.quality
          ? `${src}?q=${options.quality}&auto=format&fit=max&w=800`
          : src

        img.src = optimizedSrc
      })
    })

    Promise.all(promises).then((results) => {
      const loaded = new Set<string>()
      const errors = new Set<string>()

      results.forEach(({ src, success }) => {
        if (success) {
          loaded.add(src)
        } else {
          errors.add(src)
        }
      })

      setLoadedImages(loaded)
      setErrorImages(errors)
    })
  }, [srcs, options.quality])

  return {
    loadedImages,
    errorImages,
    allLoaded: loadedImages.size === srcs.length,
    loadProgress: srcs.length > 0 ? (loadedImages.size / srcs.length) * 100 : 0,
  }
}
