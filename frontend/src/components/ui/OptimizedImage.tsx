'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fallbackSrc?: string;
  onError?: () => void;
  quality?: number;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  sizes,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  fallbackSrc = '/placeholder-product.svg',
  onError,
  quality = 80,
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
      if (onError) {
        onError();
      }
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Generate blur placeholder for better loading experience
  const generateBlurDataURL = (w: number, h: number) => {
    const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <rect x="20%" y="20%" width="60%" height="60%" fill="#d1d5db" rx="4" opacity="0.5"/>
    </svg>`;

    // Use btoa for client-side base64 encoding
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const imageProps = {
    src: imgSrc,
    alt,
    onError: handleError,
    onLoad: handleLoad,
    quality,
    className: `
      transition-all duration-300 ease-in-out
      ${isLoading ? 'blur-sm' : 'blur-0'}
      ${hasError ? 'opacity-75' : 'opacity-100'}
      ${className}
    `,
    ...(fill
      ? {
          fill: true,
          sizes: sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
        }
      : {
          width: width || 400,
          height: height || 400,
          sizes: sizes,
        }),
    ...(priority && { priority: true }),
    ...(placeholder === 'blur' && {
      placeholder: 'blur' as const,
      blurDataURL: blurDataURL || generateBlurDataURL(width || 400, height || 400),
    }),
  };

  return <Image {...imageProps} />;
}

// Specialized components for common use cases
export function ProductImage({
  src,
  alt,
  className = '',
  priority = false,
  onLoad,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      placeholder="blur"
      priority={priority}
      fallbackSrc="/placeholder-product.svg"
    />
  );
}

export function ProducerImage({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      placeholder="blur"
      fallbackSrc="/placeholder-producer.svg"
    />
  );
}

export function AvatarImage({
  src,
  alt,
  size = 32,
  className = '',
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      sizes={`${size}px`}
      fallbackSrc="/placeholder-avatar.svg"
    />
  );
}

export function ThumbnailImage({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      sizes="(max-width: 768px) 25vw, 12vw"
      placeholder="blur"
      fallbackSrc="/placeholder-product.svg"
    />
  );
}
