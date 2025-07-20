'use client';

import { logger } from '@/lib/logging/productionLogger';

import { useEffect } from 'react';

interface CriticalCSSProps {
  children?: React.ReactNode;
  enableInlining?: boolean;
  enablePreloading?: boolean;
}

export default function CriticalCSS({ 
  children, 
  enableInlining = true, 
  enablePreloading = true 
}: CriticalCSSProps) {
  
  useEffect(() => {
    if (enableInlining) {
      inlineCriticalCSS();
    }
    
    if (enablePreloading) {
      preloadNonCriticalCSS();
    }
    
    // Optimize font loading
    optimizeFontLoading();
    
    // Remove unused CSS in production
    if (process.env.NODE_ENV === 'production') {
      removeUnusedCSS();
    }
  }, [enableInlining, enablePreloading]);

  const inlineCriticalCSS = () => {
    // Critical CSS for above-the-fold content
    const criticalCSS = `
      /* Critical CSS for immediate rendering */
      
      /* Reset and base styles */
      *, *::before, *::after {
        box-sizing: border-box;
      }
      
      html {
        line-height: 1.15;
        -webkit-text-size-adjust: 100%;
      }
      
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background-color: #ffffff;
        color: #1a1a1a;
      }
      
      /* Header critical styles */
      header {
        position: sticky;
        top: 0;
        z-index: 50;
        background-color: #ffffff;
        border-bottom: 1px solid #e5e7eb;
      }
      
      /* Navigation critical styles */
      nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      /* Logo critical styles */
      .logo {
        font-size: 1.5rem;
        font-weight: 700;
        color: #059669;
        text-decoration: none;
      }
      
      /* Hero section critical styles */
      .hero {
        padding: 2rem 1rem;
        text-align: center;
        background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
      }
      
      .hero h1 {
        font-size: 2.5rem;
        font-weight: 800;
        margin: 0 0 1rem 0;
        color: #1a1a1a;
        line-height: 1.2;
      }
      
      .hero p {
        font-size: 1.125rem;
        color: #6b7280;
        margin: 0 0 2rem 0;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      }
      
      /* Button critical styles */
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        font-weight: 500;
        border-radius: 0.5rem;
        text-decoration: none;
        transition: all 0.2s ease-in-out;
        border: none;
        cursor: pointer;
      }
      
      .btn-primary {
        background-color: #059669;
        color: #ffffff;
      }
      
      .btn-primary:hover {
        background-color: #047857;
        transform: translateY(-1px);
      }
      
      /* Product grid critical styles */
      .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
        padding: 2rem 1rem;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .product-card {
        background: #ffffff;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      }
      
      .product-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      
      .product-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        background-color: #f3f4f6;
      }
      
      .product-info {
        padding: 1rem;
      }
      
      .product-title {
        font-size: 1.125rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
        color: #1a1a1a;
        line-height: 1.4;
      }
      
      .product-price {
        font-size: 1.25rem;
        font-weight: 700;
        color: #059669;
        margin: 0.5rem 0;
      }
      
      /* Loading states */
      .loading {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #059669;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* Mobile responsive critical styles */
      @media (max-width: 768px) {
        .hero h1 {
          font-size: 2rem;
        }
        
        .product-grid {
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
          padding: 1rem;
        }
        
        nav {
          padding: 0.75rem;
        }
        
        .btn {
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
        }
      }
      
      /* Dark mode critical styles */
      @media (prefers-color-scheme: dark) {
        body {
          background-color: #1a1a1a;
          color: #ffffff;
        }
        
        header {
          background-color: #1a1a1a;
          border-bottom-color: #374151;
        }
        
        .hero {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
        }
        
        .hero h1 {
          color: #ffffff;
        }
        
        .product-card {
          background-color: #1f2937;
          border: 1px solid #374151;
        }
        
        .product-title {
          color: #ffffff;
        }
      }
      
      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* High contrast mode */
      @media (prefers-contrast: high) {
        .btn-primary {
          background-color: #000000;
          color: #ffffff;
          border: 2px solid #ffffff;
        }
        
        .product-card {
          border: 2px solid #000000;
        }
      }
    `;

    // Create and inject critical CSS
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    style.setAttribute('data-critical', 'true');
    document.head.insertBefore(style, document.head.firstChild);
  };

  const preloadNonCriticalCSS = () => {
    // Preload non-critical CSS files
    const nonCriticalCSS = [
      '/_next/static/css/app.css',
      '/_next/static/css/components.css',
      '/_next/static/css/utilities.css'
    ];

    nonCriticalCSS.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.onload = () => {
        // Convert preload to stylesheet after load
        link.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    });
  };

  const optimizeFontLoading = () => {
    // Preload critical fonts
    const criticalFonts = [
      '/fonts/inter-var.woff2',
      '/fonts/inter-bold.woff2'
    ];

    criticalFonts.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = href;
      document.head.appendChild(link);
    });

    // Add font-display: swap to existing fonts
    const fontFaces = document.querySelectorAll('style[data-font]');
    fontFaces.forEach(style => {
      if (style.textContent && !style.textContent.includes('font-display')) {
        style.textContent = style.textContent.replace(
          /@font-face\s*{/g,
          '@font-face { font-display: swap;'
        );
      }
    });
  };

  const removeUnusedCSS = () => {
    // Remove unused CSS in production (simplified version)
    // In a real implementation, this would use tools like PurgeCSS
    
    setTimeout(() => {
      const allElements = document.querySelectorAll('*');
      const usedClasses = new Set<string>();
      
      allElements.forEach(element => {
        element.classList.forEach(className => {
          usedClasses.add(className);
        });
      });
      
      // Log unused classes for debugging
      if (process.env.NODE_ENV === 'development') {
        logger.info('Used CSS classes:', Array.from(usedClasses).sort());
      }
    }, 5000); // Wait for dynamic content to load
  };

  return <>{children}</>;
}
