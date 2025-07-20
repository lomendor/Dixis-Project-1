'use client';

import React, { useState, useRef, useEffect } from 'react';
import { imageCache } from '@/lib/performance/cache';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  fallback?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  quality?: number;
  sizes?: string;
}

export function LazyImage({
  src,
  alt,
  className = '',
  placeholder = '/placeholder-product.svg',
  fallback = '/placeholder-product.svg',
  width,
  height,
  priority = false,
  onLoad,
  onError,
  quality = 75,
  sizes
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef?.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef?.current?.disconnect();
    };
  }, [priority, isInView]);

  // Load image when in view
  useEffect(() => {
    if (!isInView || isLoaded || isError) return;

    const loadImage = async () => {
      try {
        // Check cache first
        const cachedSrc = imageCache.get<string>(`img_${src}`);
        if (cachedSrc) {
          setCurrentSrc(cachedSrc);
          setIsLoaded(true);
          onLoad?.();
          return;
        }

        // Create optimized image URL
        const optimizedSrc = getOptimizedImageUrl(src, { width, height, quality });

        // Preload image
        const img = new Image();
        img.onload = () => {
          setCurrentSrc(optimizedSrc);
          setIsLoaded(true);
          imageCache.set(`img_${src}`, optimizedSrc);
          onLoad?.();
        };
        img.onerror = () => {
          setIsError(true);
          setCurrentSrc(fallback);
          onError?.();
        };
        img.src = optimizedSrc;
      } catch (error) {
        setIsError(true);
        setCurrentSrc(fallback);
        onError?.();
      }
    };

    loadImage();
  }, [isInView, src, width, height, quality, fallback, isLoaded, isError, onLoad, onError]);

  const handleImageLoad = () => {
    if (!isLoaded) {
      setIsLoaded(true);
      onLoad?.();
    }
  };

  const handleImageError = () => {
    if (!isError) {
      setIsError(true);
      setCurrentSrc(fallback);
      onError?.();
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder/Loading state */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        width={width}
        height={height}
        sizes={sizes}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />

      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-8 h-8 mx-auto mb-2">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs">Σφάλμα φόρτωσης</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Generate optimized image URL
 */
function getOptimizedImageUrl(
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  }
): string {
  // If it's already an optimized URL or external URL, return as is
  if (src.includes('?') || src.startsWith('http') || src.startsWith('//')) {
    return src;
  }

  const params = new URLSearchParams();
  
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());

  const queryString = params.toString();
  return queryString ? `${src}?${queryString}` : src;
}

/**
 * Hook for preloading images
 */
export function useImagePreloader() {
  const preloadImage = (src: string, options?: { width?: number; height?: number; quality?: number }) => {
    return new Promise<void>((resolve, reject) => {
      const optimizedSrc = getOptimizedImageUrl(src, options || {});
      
      // Check cache first
      const cached = imageCache.get<string>(`img_${src}`);
      if (cached) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        imageCache.set(`img_${src}`, optimizedSrc);
        resolve();
      };
      img.onerror = reject;
      img.src = optimizedSrc;
    });
  };

  const preloadImages = async (sources: string[], options?: { width?: number; height?: number; quality?: number }) => {
    const promises = sources.map(src => preloadImage(src, options));
    return Promise.allSettled(promises);
  };

  return { preloadImage, preloadImages };
}

/**
 * Progressive image component with multiple quality levels
 */
export function ProgressiveImage({
  src,
  alt,
  className = '',
  lowQualitySrc,
  ...props
}: LazyImageProps & { lowQualitySrc?: string }) {
  const [currentQuality, setCurrentQuality] = useState<'low' | 'high'>('low');
  
  const handleLowQualityLoad = () => {
    // Start loading high quality image
    const img = new Image();
    img.onload = () => {
      setCurrentQuality('high');
    };
    img.src = src;
  };

  const displaySrc = currentQuality === 'low' && lowQualitySrc ? lowQualitySrc : src;

  return (
    <LazyImage
      {...props}
      src={displaySrc}
      alt={alt}
      className={className}
      onLoad={currentQuality === 'low' ? handleLowQualityLoad : props.onLoad}
    />
  );
}

export default LazyImage;
