/**
 * Image optimization utilities for performance
 */

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Custom image loader for optimized loading
 */
export function imageLoader({ src, width, quality = 75 }: ImageLoaderProps): string {
  // For external images, return as-is
  if (src.startsWith('http')) {
    return src;
  }
  
  // For local images, use Next.js optimization
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

/**
 * Generate responsive image sizes based on device type
 */
export function generateImageSizes(type: 'product' | 'producer' | 'hero' | 'thumbnail'): string {
  const sizes = {
    product: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
    producer: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw',
    hero: '100vw',
    thumbnail: '(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw'
  };
  
  return sizes[type] || '100vw';
}

/**
 * Generate blur data URL for placeholder
 */
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  const blurSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="20"/>
      </filter>
      <rect width="100%" height="100%" fill="#f3f4f6" filter="url(#b)"/>
    </svg>
  `;
  
  const base64 = Buffer.from(blurSvg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Preload critical images for LCP optimization
 */
export function preloadCriticalImages(images: string[]): void {
  if (typeof window === 'undefined') return;
  
  images.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  });
}

/**
 * Lazy load images with intersection observer
 */
export function setupLazyLoading(): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });
  
  // Observe all images with data-src
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

/**
 * Calculate optimal image dimensions based on container
 */
export function calculateOptimalImageSize(
  containerWidth: number,
  aspectRatio: number = 1,
  devicePixelRatio: number = 1
): { width: number; height: number } {
  const width = Math.ceil(containerWidth * devicePixelRatio);
  const height = Math.ceil(width / aspectRatio);
  
  return { width, height };
}

/**
 * Get image format based on browser support
 */
export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpeg' {
  if (typeof window === 'undefined') return 'jpeg';
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  // Check AVIF support
  if (canvas.toDataURL('image/avif').indexOf('image/avif') === 5) {
    return 'avif';
  }
  
  // Check WebP support
  if (canvas.toDataURL('image/webp').indexOf('image/webp') === 5) {
    return 'webp';
  }
  
  return 'jpeg';
}