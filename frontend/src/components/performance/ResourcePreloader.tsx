'use client';

import { logger } from '@/lib/logging/productionLogger';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface ResourcePreloaderProps {
  children?: React.ReactNode;
  enableRoutePreloading?: boolean;
  enableImagePreloading?: boolean;
  enableAPIPreloading?: boolean;
  preloadDelay?: number;
}

interface PreloadResource {
  href: string;
  as: 'script' | 'style' | 'image' | 'font' | 'fetch';
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  priority?: 'high' | 'low';
}

export default function ResourcePreloader({
  children,
  enableRoutePreloading = true,
  enableImagePreloading = true,
  enableAPIPreloading = true,
  preloadDelay = 2000
}: ResourcePreloaderProps) {
  const pathname = usePathname();
  const preloadedResources = useRef(new Set<string>());
  const intersectionObserver = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Initialize preloading after component mount
    const timer = setTimeout(() => {
      if (enableRoutePreloading) {
        preloadRoutes();
      }
      
      if (enableImagePreloading) {
        setupImagePreloading();
      }
      
      if (enableAPIPreloading) {
        preloadAPIEndpoints();
      }
      
      // Preload critical resources
      preloadCriticalResources();
      
      // Setup hover preloading
      setupHoverPreloading();
      
    }, preloadDelay);

    return () => {
      clearTimeout(timer);
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect();
      }
    };
  }, [pathname, enableRoutePreloading, enableImagePreloading, enableAPIPreloading, preloadDelay]);

  const preloadResource = (resource: PreloadResource) => {
    if (preloadedResources.current.has(resource.href)) {
      return; // Already preloaded
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    
    if (resource.type) {
      link.type = resource.type;
    }
    
    if (resource.crossOrigin) {
      link.crossOrigin = resource.crossOrigin;
    }
    
    if (resource.priority === 'high') {
      link.setAttribute('importance', 'high');
    }

    // Add error handling
    link.onerror = () => {
      logger.warn(`Failed to preload resource: ${resource.href}`);
    };

    document.head.appendChild(link);
    preloadedResources.current.add(resource.href);
  };

  const preloadRoutes = () => {
    // Define routes to preload based on current page
    const routePreloadMap: Record<string, string[]> = {
      '/': ['/products', '/categories', '/producers'],
      '/products': ['/cart', '/checkout'],
      '/cart': ['/checkout', '/login'],
      '/login': ['/dashboard', '/'],
      '/dashboard': ['/products/create', '/orders'],
      '/producers': ['/products', '/producer/[id]'],
      '/categories': ['/products', '/category/[id]']
    };

    const routesToPreload = routePreloadMap[pathname] || [];
    
    routesToPreload.forEach(route => {
      // Preload route chunks
      preloadResource({
        href: `/_next/static/chunks/pages${route}.js`,
        as: 'script',
        priority: 'low'
      });
    });
  };

  const setupImagePreloading = () => {
    // Setup intersection observer for lazy image preloading
    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src || img.src;
            
            if (src && !preloadedResources.current.has(src)) {
              preloadResource({
                href: src,
                as: 'image',
                priority: 'high'
              });
            }
          }
        });
      },
      {
        rootMargin: '100px' // Preload images 100px before they come into view
      }
    );

    // Observe all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      intersectionObserver?.current?.observe(img);
    });

    // Preload hero/above-fold images immediately
    const heroImages = document.querySelectorAll('.hero img, .banner img, [data-priority="high"] img');
    heroImages.forEach(img => {
      const src = (img as HTMLImageElement).src;
      if (src) {
        preloadResource({
          href: src,
          as: 'image',
          priority: 'high'
        });
      }
    });
  };

  const preloadAPIEndpoints = () => {
    // Preload common API endpoints based on current route
    const apiPreloadMap: Record<string, string[]> = {
      '/': [
        'http://localhost:8000/api/products/featured',
        'http://localhost:8000/api/categories',
        'http://localhost:8000/api/producers/featured'
      ],
      '/products': [
        'http://localhost:8000/api/products',
        'http://localhost:8000/api/categories',
        'http://localhost:8000/api/filters'
      ],
      '/dashboard': [
        'http://localhost:8000/api/user/profile',
        'http://localhost:8000/api/orders',
        'http://localhost:8000/api/analytics/summary'
      ],
      '/cart': [
        '/api/shipping/rates',
        '/api/payment/methods'
      ]
    };

    const endpointsToPreload = apiPreloadMap[pathname] || [];
    
    endpointsToPreload.forEach(endpoint => {
      // Use fetch with cache to preload API data
      fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        if (response.ok) {
          // Data is now cached by the browser
          logger.info(`Preloaded API endpoint: ${endpoint}`);
        }
      }).catch(error => {
        logger.warn(`Failed to preload API endpoint ${endpoint}:`, error);
      });
    });
  };

  const preloadCriticalResources = () => {
    const criticalResources: PreloadResource[] = [
      // Critical fonts
      {
        href: '/fonts/inter-var.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
        priority: 'high'
      },
      
      // Critical CSS
      {
        href: '/_next/static/css/app.css',
        as: 'style',
        priority: 'high'
      },
      
      // Critical JavaScript
      {
        href: '/_next/static/chunks/main.js',
        as: 'script',
        priority: 'high'
      },
      
      // Logo and critical images
      {
        href: '/images/logo.svg',
        as: 'image',
        priority: 'high'
      },
      
      // Service worker
      {
        href: '/sw.js',
        as: 'script',
        priority: 'low'
      }
    ];

    criticalResources.forEach(resource => {
      preloadResource(resource);
    });
  };

  const setupHoverPreloading = () => {
    // Preload resources on hover for instant navigation
    const setupHoverListener = () => {
      const links = document.querySelectorAll('a[href^="/"]');
      
      links.forEach(link => {
        const href = (link as HTMLAnchorElement).href;
        
        const handleMouseEnter = () => {
          // Preload the page chunk
          const pathname = new URL(href).pathname;
          preloadResource({
            href: `/_next/static/chunks/pages${pathname}.js`,
            as: 'script',
            priority: 'high'
          });
          
          // Preload associated API endpoints
          if (pathname.includes('/product/')) {
            const productId = pathname.split('/').pop();
            if (productId) {
              fetch(`http://localhost:8000/api/products/${productId}`).catch(() => {});
            }
          }
        };

        link.addEventListener('mouseenter', handleMouseEnter, { once: true });
      });
    };

    // Setup hover listeners after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupHoverListener);
    } else {
      setupHoverListener();
    }

    // Re-setup listeners when new content is added
    const observer = new MutationObserver(() => {
      setupHoverListener();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

  // Preload resources based on user behavior patterns
  const preloadBasedOnBehavior = () => {
    // Track user scroll behavior
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        
        // If user scrolled past 50%, they're engaged - preload more content
        if (scrollPercentage > 50) {
          preloadResource({
            href: 'http://localhost:8000/api/products/recommended',
            as: 'fetch'
          });
        }
        
        // If user scrolled to bottom, preload next page
        if (scrollPercentage > 90) {
          preloadResource({
            href: 'http://localhost:8000/api/products?page=2',
            as: 'fetch'
          });
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Track time on page
    const startTime = Date.now();
    setTimeout(() => {
      const timeOnPage = Date.now() - startTime;
      
      // If user spent more than 30 seconds, they're engaged
      if (timeOnPage > 30000) {
        // Preload related content
        preloadResource({
          href: 'http://localhost:8000/api/products/related',
          as: 'fetch'
        });
      }
    }, 30000);
  };

  // Initialize behavior-based preloading
  useEffect(() => {
    preloadBasedOnBehavior();
  }, []);

  return <>{children}</>;
}
