'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { logger } from '@/lib/logging/productionLogger';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  fill = false,
  sizes,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.jpg'
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
    
    logger.debug('Image loaded successfully', { src, alt });
  }, [src, alt, onLoad]);

  const handleError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
    
    logger.warn('Image failed to load', { src, alt, fallbackSrc });
  }, [src, alt, fallbackSrc, onError]);

  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || (
    fill 
      ? '100vw'
      : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  );

  // Generate blur placeholder for better UX
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, w, h);
    }
    return canvas.toDataURL();
  };

  const imageProps = {
    src: imageError ? fallbackSrc : src,
    alt,
    quality,
    onLoad: handleLoad,
    onError: handleError,
    priority,
    sizes: responsiveSizes,
    className: `${className} ${isLoading ? 'animate-pulse bg-gray-200' : ''} transition-opacity duration-300`,
    placeholder: placeholder === 'blur' ? 'blur' as const : 'empty' as const,
    ...(placeholder === 'blur' && {
      blurDataURL: blurDataURL || (width && height ? generateBlurDataURL(width, height) : undefined)
    })
  };

  if (fill) {
    return (
      <div className="relative overflow-hidden">
        <Image
          {...imageProps}
          fill
          style={{ objectFit: 'cover' }}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </div>
    );
  }

  if (!width || !height) {
    logger.warn('Width and height should be provided for non-fill images', { src, alt });
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`}>
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <Image
        {...imageProps}
        width={width}
        height={height}
      />
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
    </div>
  );
}

// Product Image Component with specific optimizations
interface ProductImageProps {
  product: {
    id: string | number;
    name: string;
    image?: string;
    images?: string[];
  };
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  variant?: 'thumbnail' | 'card' | 'gallery' | 'hero';
}

export function ProductImage({ 
  product, 
  width = 300, 
  height = 300, 
  priority = false,
  className = '',
  variant = 'card'
}: ProductImageProps) {
  const getImageSrc = () => {
    if (product.image) return product.image;
    if (product.images && product.images.length > 0) return product.images[0];
    return '/images/product-placeholder.jpg';
  };

  const getImageSizes = () => {
    switch (variant) {
      case 'thumbnail':
        return '(max-width: 768px) 150px, 100px';
      case 'card':
        return '(max-width: 768px) 300px, (max-width: 1200px) 250px, 200px';
      case 'gallery':
        return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px';
      case 'hero':
        return '(max-width: 768px) 100vw, 800px';
      default:
        return '(max-width: 768px) 100vw, 300px';
    }
  };

  const getQuality = () => {
    switch (variant) {
      case 'thumbnail':
        return 70;
      case 'hero':
        return 90;
      default:
        return 85;
    }
  };

  return (
    <OptimizedImage
      src={getImageSrc()}
      alt={product.name}
      width={width}
      height={height}
      priority={priority}
      className={className}
      sizes={getImageSizes()}
      quality={getQuality()}
      placeholder="blur"
      fallbackSrc="/images/product-placeholder.jpg"
    />
  );
}

// Avatar Image Component
interface AvatarImageProps {
  user: {
    name: string;
    avatar?: string;
  };
  size?: number;
  className?: string;
}

export function AvatarImage({ user, size = 40, className = '' }: AvatarImageProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user.avatar) {
    return (
      <div 
        className={`bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {getInitials(user.name)}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={user.avatar}
      alt={`${user.name} avatar`}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      quality={80}
      fallbackSrc=""
    />
  );
}