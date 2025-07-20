'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import { useEffect, useRef, useState } from 'react';

interface MobileUXEnhancerProps {
  children?: React.ReactNode;
  enableGestures?: boolean;
  enableHapticFeedback?: boolean;
  enablePullToRefresh?: boolean;
  enableSwipeNavigation?: boolean;
}

export default function MobileUXEnhancer({
  children,
  enableGestures = true,
  enableHapticFeedback = true,
  enablePullToRefresh = true,
  enableSwipeNavigation = true
}: MobileUXEnhancerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pullToRefreshRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                           window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (isMobile) {
      setupMobileEnhancements();
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      cleanupMobileEnhancements();
    };
  }, [isMobile, enableGestures, enablePullToRefresh, enableSwipeNavigation]);

  const setupMobileEnhancements = () => {
    // Optimize touch interactions
    optimizeTouchInteractions();
    
    // Setup gesture handling
    if (enableGestures) {
      setupGestureHandling();
    }
    
    // Setup pull-to-refresh
    if (enablePullToRefresh) {
      setupPullToRefresh();
    }
    
    // Setup swipe navigation
    if (enableSwipeNavigation) {
      setupSwipeNavigation();
    }
    
    // Optimize viewport
    optimizeViewport();
    
    // Prevent zoom on input focus
    preventZoomOnInputFocus();
  };

  const optimizeTouchInteractions = () => {
    // Add touch-action CSS for better touch handling
    const style = document.createElement('style');
    style.textContent = `
      /* Optimize touch interactions */
      .touch-optimized {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
      
      /* Minimum touch target size (44px) */
      button, a, input, select, textarea {
        min-height: 44px;
        min-width: 44px;
      }
      
      /* Touch feedback */
      .touch-feedback {
        position: relative;
        overflow: hidden;
      }
      
      .touch-feedback::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.3s ease, height 0.3s ease;
        pointer-events: none;
      }
      
      .touch-feedback.active::before {
        width: 200px;
        height: 200px;
      }
      
      /* Smooth scrolling */
      * {
        -webkit-overflow-scrolling: touch;
      }
      
      /* Prevent text selection on touch */
      .no-select {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);

    // Add touch feedback to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, [role="button"]');
    interactiveElements.forEach(element => {
      element.classList.add('touch-optimized', 'touch-feedback');
      
      element.addEventListener('touchstart', (e) => {
        element.classList.add('active');
        
        // Haptic feedback
        if (enableHapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate(10); // Short vibration
        }
      });
      
      element.addEventListener('touchend', () => {
        setTimeout(() => {
          element.classList.remove('active');
        }, 300);
      });
    });
  };

  const setupGestureHandling = () => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
      
      touchStartRef.current = {
        x: startX,
        y: startY,
        time: startTime
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();

      const deltaX = endX - touchStartRef.current.x;
      const deltaY = endY - touchStartRef.current.y;
      const deltaTime = endTime - touchStartRef.current.time;

      // Detect swipe gestures
      const minSwipeDistance = 50;
      const maxSwipeTime = 300;

      if (Math.abs(deltaX) > minSwipeDistance && deltaTime < maxSwipeTime) {
        if (deltaX > 0) {
          handleSwipeRight();
        } else {
          handleSwipeLeft();
        }
      }

      // Detect tap gestures
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 200) {
        handleTap(e);
      }

      touchStartRef.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
  };

  const handleSwipeRight = () => {
    // Navigate back
    if (window.history.length > 1) {
      window.history.back();
    }
    
    // Haptic feedback
    if (enableHapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate([20, 10, 20]);
    }
  };

  const handleSwipeLeft = () => {
    // Could implement forward navigation or other actions
    logger.info('Swipe left detected');
  };

  const handleTap = (e: TouchEvent) => {
    // Add ripple effect
    const target = e.target as HTMLElement;
    if (target.classList.contains('touch-feedback')) {
      const rect = target.getBoundingClientRect();
      const touch = e.changedTouches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: translate(-50%, -50%);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1000;
      `;

      target.style.position = 'relative';
      target.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  };

  const setupPullToRefresh = () => {
    let startY = 0;
    let currentY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;

      currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;

      if (pullDistance > 0 && window.scrollY === 0) {
        e.preventDefault();
        
        const maxPull = 100;
        const normalizedPull = Math.min(pullDistance, maxPull);
        const pullPercentage = normalizedPull / maxPull;

        // Update pull-to-refresh indicator
        if (pullToRefreshRef.current) {
          pullToRefreshRef.current.style.transform = `translateY(${normalizedPull}px)`;
          pullToRefreshRef.current.style.opacity = pullPercentage.toString();
        }

        // Haptic feedback at threshold
        if (pullDistance > 60 && enableHapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate(15);
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling) return;

      const pullDistance = currentY - startY;
      
      if (pullDistance > 60) {
        // Trigger refresh
        triggerRefresh();
      }

      // Reset pull indicator
      if (pullToRefreshRef.current) {
        pullToRefreshRef.current.style.transform = 'translateY(0)';
        pullToRefreshRef.current.style.opacity = '0';
      }

      isPulling = false;
      startY = 0;
      currentY = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    
    // Haptic feedback
    if (enableHapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate([30, 10, 30]);
    }

    try {
      // Reload the page or refresh data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate refresh
      window.location.reload();
    } catch (error) {
      logger.error('Refresh failed:', toError(error), errorToContext(error));
    } finally {
      setIsRefreshing(false);
    }
  };

  const setupSwipeNavigation = () => {
    // Already handled in gesture handling
  };

  const optimizeViewport = () => {
    // Set optimal viewport meta tag
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    
    viewportMeta.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
    );

    // Add safe area insets for notched devices
    const style = document.createElement('style');
    style.textContent = `
      @supports (padding: max(0px)) {
        .safe-area-inset-top { padding-top: max(1rem, env(safe-area-inset-top)); }
        .safe-area-inset-bottom { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
        .safe-area-inset-left { padding-left: max(1rem, env(safe-area-inset-left)); }
        .safe-area-inset-right { padding-right: max(1rem, env(safe-area-inset-right)); }
      }
    `;
    document.head.appendChild(style);
  };

  const preventZoomOnInputFocus = () => {
    // Prevent zoom on input focus for iOS
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        if (input.getAttribute('type') !== 'range') {
          const fontSize = window.getComputedStyle(input).fontSize;
          if (parseFloat(fontSize) < 16) {
            input.style.fontSize = '16px';
          }
        }
      });
    });
  };

  const cleanupMobileEnhancements = () => {
    // Remove event listeners and styles if needed
  };

  // Add CSS animation for ripple effect
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        0% {
          width: 0;
          height: 0;
          opacity: 1;
        }
        100% {
          width: 200px;
          height: 200px;
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Pull-to-refresh indicator */}
      {enablePullToRefresh && (
        <div
          ref={pullToRefreshRef}
          className="fixed top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-50 opacity-0 transition-all duration-300"
          style={{ transform: 'translateY(-100%)' }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
            {isRefreshing ? (
              <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
            ) : (
              <div className="w-6 h-6 text-green-500">↓</div>
            )}
          </div>
        </div>
      )}
      
      {children}
    </>
  );
}
