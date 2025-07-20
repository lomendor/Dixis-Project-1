'use client';

import { useState, useEffect, useRef } from 'react';
import { logger } from '@/lib/logging/productionLogger';

// Skeleton Components
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
      <div className="space-y-2">
        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
        <div className="bg-gray-200 h-3 rounded w-1/2"></div>
        <div className="bg-gray-200 h-3 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function SkeletonText({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string; 
}) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="bg-gray-200 h-4 rounded"
          style={{
            width: `${Math.random() * 40 + 60}%`,
            animationDelay: `${i * 100}ms`
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonGrid({ 
  items = 6, 
  className = '' 
}: { 
  items?: number; 
  className?: string; 
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: items }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// Progressive Image Component
interface ProgressiveImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: 'low' | 'medium' | 'high';
  onLoad?: () => void;
}

export function ProgressiveImage({
  src,
  alt,
  placeholder,
  className = '',
  width,
  height,
  quality = 'medium',
  onLoad
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate low quality placeholder
  const generatePlaceholder = (src: string, quality: 'low' | 'medium' | 'high') => {
    if (placeholder) return placeholder;
    
    // Generate a blurred/low-res version URL
    const qualityMap = { low: 10, medium: 30, high: 50 };
    const q = qualityMap[quality];
    
    // For real implementation, you'd use a service like Cloudinary or generate thumbnails
    return src.replace(/\.(jpg|jpeg|png|webp)$/i, `_q${q}.$1`);
  };

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
      onLoad?.();
      logger.debug('Progressive image loaded', { src, quality });
    };

    img.onerror = () => {
      setError(true);
      setIsLoading(false);
      logger.warn('Progressive image failed to load', { src });
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, quality]); // Removed onLoad from dependencies

  if (error) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Σφάλμα φόρτωσης</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Placeholder/Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Low quality placeholder */}
      {!isLoaded && placeholder && (
        <img
          src={generatePlaceholder(src, 'low')}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
        />
      )}
      
      {/* High quality image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
      />
    </div>
  );
}

// Network-aware loading component
interface NetworkAwareLoadingProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  slowConnectionFallback?: React.ReactNode;
}

export function NetworkAwareLoading({
  children,
  fallback,
  slowConnectionFallback
}: NetworkAwareLoadingProps) {
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType: string;
    downlink: number;
    rtt: number;
  } | null>(null);

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        });
        
        logger.debug('Network info updated', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        });
      };

      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);

      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, []);

  // Determine if connection is slow
  const isSlowConnection = networkInfo && (
    networkInfo.effectiveType === 'slow-2g' ||
    networkInfo.effectiveType === '2g' ||
    (networkInfo.effectiveType === '3g' && networkInfo.downlink < 1)
  );

  if (isSlowConnection && slowConnectionFallback) {
    return <>{slowConnectionFallback}</>;
  }

  if (!networkInfo && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Lazy loading component with intersection observer
interface LazyLoadProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

export function LazyLoad({
  children,
  placeholder = <SkeletonCard />,
  className = '',
  threshold = 0.1,
  rootMargin = '50px'
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          logger.debug('Lazy load triggered');
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin, hasLoaded]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : placeholder}
    </div>
  );
}

// Incremental loading component
interface IncrementalLoadingProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  initialCount?: number;
  incrementCount?: number;
  loadMoreText?: string;
  className?: string;
  loadingComponent?: React.ReactNode;
}

export function IncrementalLoading<T>({
  items,
  renderItem,
  initialCount = 10,
  incrementCount = 10,
  loadMoreText = 'Φόρτωση περισσότερων',
  className = '',
  loadingComponent = <SkeletonCard />
}: IncrementalLoadingProps<T>) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setVisibleCount(prev => Math.min(prev + incrementCount, items.length));
    setIsLoading(false);
    
    logger.debug('Incremental loading', { 
      visibleCount: visibleCount + incrementCount, 
      total: items.length 
    });
  };

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return (
    <div className={className}>
      {/* Render visible items */}
      {visibleItems.map((item, index) => renderItem(item, index))}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-6">
          {loadingComponent}
        </div>
      )}
      
      {/* Load more button */}
      {hasMore && !isLoading && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium"
          >
            {loadMoreText} ({items.length - visibleCount} ακόμα)
          </button>
        </div>
      )}
      
      {/* End message */}
      {!hasMore && visibleCount > 0 && (
        <div className="mt-8 text-center text-gray-500">
          Έχετε δει όλα τα στοιχεία ({items.length} συνολικά)
        </div>
      )}
    </div>
  );
}

// Adaptive loading based on device capabilities
interface AdaptiveLoadingProps {
  children: React.ReactNode;
  lowEndFallback?: React.ReactNode;
  className?: string;
}

export function AdaptiveLoading({
  children,
  lowEndFallback,
  className = ''
}: AdaptiveLoadingProps) {
  const [deviceCapabilities, setDeviceCapabilities] = useState<{
    isLowEnd: boolean;
    memory: number;
    cores: number;
  } | null>(null);

  useEffect(() => {
    const checkDeviceCapabilities = () => {
      const memory = (navigator as any).deviceMemory || 4; // Default to 4GB
      const cores = navigator.hardwareConcurrency || 4; // Default to 4 cores
      
      // Consider device low-end if memory < 4GB or cores < 4
      const isLowEnd = memory < 4 || cores < 4;
      
      setDeviceCapabilities({ isLowEnd, memory, cores });
      
      logger.debug('Device capabilities assessed', { 
        isLowEnd, 
        memory: `${memory}GB`, 
        cores 
      });
    };

    checkDeviceCapabilities();
  }, []);

  if (!deviceCapabilities) {
    return <div className={className}>{children}</div>;
  }

  if (deviceCapabilities.isLowEnd && lowEndFallback) {
    return <div className={className}>{lowEndFallback}</div>;
  }

  return <div className={className}>{children}</div>;
}