/**
 * Bundle optimization utilities
 */

/**
 * Dynamic import with loading state
 */
export async function dynamicImport<T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: T
): Promise<T> {
  try {
    const module = await importFn();
    return module.default;
  } catch (error) {
    console.error('Dynamic import failed:', error);
    if (fallback) return fallback;
    throw error;
  }
}

/**
 * Preload critical components
 */
export function preloadComponents(components: string[]): void {
  if (typeof window === 'undefined') return;
  
  components.forEach(component => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = `/_next/static/chunks/${component}`;
    document.head.appendChild(link);
  });
}

/**
 * Prefetch routes for faster navigation
 */
export function prefetchRoutes(routes: string[]): void {
  if (typeof window === 'undefined') return;

  // Note: In App Router, prefetching is handled automatically by Link components
  // Manual prefetching can be done using router.prefetch() from useRouter hook
  // For now, we just log the routes to avoid router instance errors
  console.log('Routes to prefetch:', routes);

  // TODO: Implement proper App Router prefetching when needed
  // This would require using useRouter hook in a React component context
}

/**
 * Load external scripts with performance optimization
 */
export function loadExternalScript(
  src: string,
  options: {
    async?: boolean;
    defer?: boolean;
    onLoad?: () => void;
    onError?: () => void;
  } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    
    if (options.async) script.async = true;
    if (options.defer) script.defer = true;
    
    script.onload = () => {
      options.onLoad?.();
      resolve();
    };
    
    script.onerror = () => {
      options.onError?.();
      reject(new Error(`Failed to load script: ${src}`));
    };
    
    document.head.appendChild(script);
  });
}

/**
 * Lazy load CSS for non-critical styles
 */
export function lazyLoadCSS(href: string): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  
  link.onload = function() {
    this.rel = 'stylesheet';
  };
  
  document.head.appendChild(link);
}

/**
 * Resource hints for performance
 */
export function addResourceHints(): void {
  if (typeof window === 'undefined') return;
  
  const hints = [
    { rel: 'dns-prefetch', href: '//localhost:8080' },
    { rel: 'preconnect', href: '//localhost:8080' },
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'preconnect', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//images.unsplash.com' },
    { rel: 'preconnect', href: '//images.unsplash.com' },
  ];
  
  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    document.head.appendChild(link);
  });
}

/**
 * Optimize third-party scripts loading
 */
export function optimizeThirdPartyScripts(): void {
  if (typeof window === 'undefined') return;
  
  // Delay non-critical third-party scripts
  const delayTime = 3000; // 3 seconds
  
  setTimeout(() => {
    // Load analytics
    if (window.gtag) {
      loadExternalScript('https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID', {
        async: true
      });
    }
    
    // Load other third-party scripts as needed
  }, delayTime);
}

/**
 * Monitor bundle size in development
 */
export function monitorBundleSize(): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  // Log performance metrics
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      console.log('Page Performance Metrics:', {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        domInteractive: perfData.domInteractive,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      });
    });
  }
}

/**
 * Code splitting boundaries for optimization
 */
export const codeSplitBoundaries = {
  // Heavy components that should be lazy loaded
  heavyComponents: [
    'react-chartjs-2',
    'react-pdf',
    'react-excel-renderer',
    'react-map-gl'
  ],
  
  // Routes that can be prefetched
  prefetchRoutes: [
    '/products',
    '/producers',
    '/b2b/products',
    '/b2b/dashboard'
  ],
  
  // Critical components that should be preloaded
  criticalComponents: [
    'Navbar',
    'Footer',
    'ProductCard',
    'CartButton'
  ]
};