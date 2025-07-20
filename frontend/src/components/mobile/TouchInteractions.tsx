'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { useState, useRef, useCallback, useEffect } from 'react';
import { logger } from '@/lib/logging/productionLogger';

interface TouchGestureProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  className?: string;
  swipeThreshold?: number;
  longPressDelay?: number;
  enableHaptic?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export default function TouchGestures({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onLongPress,
  onDoubleTap,
  className = '',
  swipeThreshold = 50,
  longPressDelay = 800,
  enableHaptic = true
}: TouchGestureProps) {
  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  // Haptic feedback
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHaptic || typeof window === 'undefined') return;
    
    try {
      if ('vibrate' in navigator) {
        switch (type) {
          case 'light':
            navigator.vibrate(10);
            break;
          case 'medium':
            navigator.vibrate(25);
            break;
          case 'heavy':
            navigator.vibrate([50, 25, 50]);
            break;
        }
      }
      
      // iOS haptic feedback (if available)
      if ('hapticEngine' in window && (window as any).hapticEngine) {
        (window as any).hapticEngine.impact(type);
      }
    } catch (error) {
      // Ignore haptic errors
    }
  }, [enableHaptic]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    });

    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        triggerHaptic('medium');
        onLongPress();
        logger.debug('Long press detected');
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay, triggerHaptic]);

  const handleTouchMove = useCallback(() => {
    // Cancel long press on movement
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.timestamp;

    // Double tap detection
    if (onDoubleTap && deltaTime < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      const now = Date.now();
      if (now - lastTap < 500) {
        triggerHaptic('light');
        onDoubleTap();
        logger.debug('Double tap detected');
        setLastTap(0);
        return;
      }
      setLastTap(now);
    }

    // Swipe detection
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          triggerHaptic('light');
          onSwipeRight();
          logger.debug('Swipe right detected', { deltaX });
        } else if (deltaX < 0 && onSwipeLeft) {
          triggerHaptic('light');
          onSwipeLeft();
          logger.debug('Swipe left detected', { deltaX });
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          triggerHaptic('light');
          onSwipeDown();
          logger.debug('Swipe down detected', { deltaY });
        } else if (deltaY < 0 && onSwipeUp) {
          triggerHaptic('light');
          onSwipeUp();
          logger.debug('Swipe up detected', { deltaY });
        }
      }
    }

    setTouchStart(null);
  }, [touchStart, lastTap, swipeThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onDoubleTap, triggerHaptic]);

  return (
    <div
      ref={elementRef}
      className={`${className} touch-manipulation`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {children}
    </div>
  );
}

// Swipeable Card Component
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  className?: string;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className = ''
}: SwipeableCardProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    const maxOffset = 120;
    
    // Limit offset to prevent over-dragging
    const newOffset = Math.max(-maxOffset, Math.min(maxOffset, diff));
    setOffset(newOffset);
  }, [isDragging, startX]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    
    if (Math.abs(offset) > 80) {
      if (offset > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    setOffset(0);
  }, [offset, onSwipeLeft, onSwipeRight]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Left Action */}
      {leftAction && (
        <div
          className={`absolute inset-y-0 left-0 flex items-center justify-center w-24 ${leftAction.color} transition-opacity duration-200`}
          style={{ opacity: offset > 0 ? Math.min(offset / 80, 1) : 0 }}
        >
          <div className="flex flex-col items-center text-white text-xs">
            {leftAction.icon}
            <span className="mt-1">{leftAction.label}</span>
          </div>
        </div>
      )}

      {/* Right Action */}
      {rightAction && (
        <div
          className={`absolute inset-y-0 right-0 flex items-center justify-center w-24 ${rightAction.color} transition-opacity duration-200`}
          style={{ opacity: offset < 0 ? Math.min(Math.abs(offset) / 80, 1) : 0 }}
        >
          <div className="flex flex-col items-center text-white text-xs">
            {rightAction.icon}
            <span className="mt-1">{rightAction.label}</span>
          </div>
        </div>
      )}

      {/* Card Content */}
      <div
        className="bg-white transition-transform duration-200 ease-out"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

// Pull to Refresh Component
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  threshold?: number;
}

export function PullToRefresh({
  children,
  onRefresh,
  className = '',
  threshold = 100
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  }, [isPulling, startY, threshold]);

  const handleTouchEnd = useCallback(async () => {
    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        logger.info('Pull to refresh completed');
      } catch (error) {
        logger.error('Pull to refresh failed', toError(error), errorToContext(error));
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  const refreshProgress = Math.min(pullDistance / threshold, 1);

  return (
    <div 
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-emerald-50 transition-all duration-300 ease-out z-10"
        style={{
          height: `${pullDistance}px`,
          transform: `translateY(-${Math.max(0, threshold - pullDistance)}px)`
        }}
      >
        <div className="flex flex-col items-center text-emerald-600">
          <div
            className={`w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: `rotate(${refreshProgress * 360}deg)`,
              transition: isRefreshing ? 'none' : 'transform 0.1s ease-out'
            }}
          />
          <span className="text-xs mt-2 font-medium">
            {isRefreshing ? 'Ανανέωση...' : refreshProgress >= 1 ? 'Αφήστε για ανανέωση' : 'Τραβήξτε για ανανέωση'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}