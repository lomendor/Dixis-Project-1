'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { generateBlurDataURL, generateImageSizes, imageLoader } from '@/lib/performance/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  type?: 'product' | 'producer' | 'hero' | 'thumbnail';
  quality?: number;
  lazy?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  objectFit = 'cover',
  type = 'product',
  quality = 75,
  lazy = true
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Default dimensions based on type
  const defaultDimensions = {
    product: { width: 500, height: 500 },
    producer: { width: 400, height: 400 },
    hero: { width: 1920, height: 800 },
    thumbnail: { width: 200, height: 200 }
  };
  
  const finalWidth = width || defaultDimensions[type].width;
  const finalHeight = height || defaultDimensions[type].height;
  
  // Placeholder for loading state
  const blurDataURL = generateBlurDataURL(10, 10);
  
  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  // Handle image error
  const handleError = () => {
    setError(true);
  };
  
  // Fallback image
  const fallbackSrc = '/placeholder-product.svg';
  
  if (error) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width: finalWidth, height: finalHeight }}
      >
        <Image
          src={fallbackSrc}
          alt={alt}
          width={100}
          height={100}
          className="opacity-50"
        />
      </div>
    );
  }
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={finalWidth}
        height={finalHeight}
        loader={imageLoader}
        quality={quality}
        priority={priority}
        loading={lazy && !priority ? 'lazy' : undefined}
        placeholder="blur"
        blurDataURL={blurDataURL}
        sizes={generateImageSizes(type)}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${objectFit === 'contain' ? 'object-contain' : ''}
          ${objectFit === 'cover' ? 'object-cover' : ''}
          ${objectFit === 'fill' ? 'object-fill' : ''}
          ${objectFit === 'none' ? 'object-none' : ''}
          ${objectFit === 'scale-down' ? 'object-scale-down' : ''}
        `}
      />
      
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}