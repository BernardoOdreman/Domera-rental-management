"use client"

import { useState, useEffect } from "react"

interface UseOptimizedImageProps {
  src: string
  fallbackSrc?: string
  lowQualitySrc?: string
  sizes?: string
  preload?: boolean
  lazyLoad?: boolean
}

export function useOptimizedImage({
  src,
  fallbackSrc = "/placeholder.svg",
  lowQualitySrc,
  sizes = "100vw",
  preload = false,
  lazyLoad = true,
}: UseOptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(lowQualitySrc || src)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Reset states when src changes
    setImgSrc(lowQualitySrc || src)
    setIsLoaded(false)
    setHasError(false)

    if (!src) {
      setHasError(true)
      return
    }

    // Preload the full image
    const img = new Image()
    img.src = src
    img.sizes = sizes

    if (preload) {
      // Add preload link to head
      const linkElement = document.createElement("link")
      linkElement.rel = "preload"
      linkElement.as = "image"
      linkElement.href = src
      document.head.appendChild(linkElement)

      // Clean up
      return () => {
        document.head.removeChild(linkElement)
      }
    }

    const handleLoad = () => {
      setImgSrc(src)
      setIsLoaded(true)
    }

    const handleError = () => {
      setHasError(true)
      setImgSrc(fallbackSrc)
    }

    img.addEventListener("load", handleLoad)
    img.addEventListener("error", handleError)

    return () => {
      img.removeEventListener("load", handleLoad)
      img.removeEventListener("error", handleError)
    }
  }, [src, lowQualitySrc, fallbackSrc, sizes, preload])

  return {
    imgSrc: hasError ? fallbackSrc : imgSrc,
    isLoaded,
    hasError,
    loading: lazyLoad ? "lazy" : undefined,
    onError: () => {
      setHasError(true)
      setImgSrc(fallbackSrc)
    },
  }
}
