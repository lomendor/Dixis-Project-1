'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

interface UseMobileInteractionsOptions {
  onSwipe?: (gesture: SwipeGesture) => void;
  onTap?: (position: TouchPosition) => void;
  onLongPress?: (position: TouchPosition) => void;
  onPinch?: (scale: number) => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  tapDelay?: number;
}

export function useMobileInteractions(options: UseMobileInteractionsOptions = {}) {
  const {
    onSwipe,
    onTap,
    onLongPress,
    onPinch,
    swipeThreshold = 50,
    longPressDelay = 500,
    tapDelay = 200,
  } = options;

  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null);
  const [touchEnd, setTouchEnd] = useState<TouchPosition | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number>(0);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  // Utility functions
  const getDistance = (touch1: TouchPosition, touch2: TouchPosition): number => {
    return Math.sqrt(
      Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2)
    );
  };

  const getTouchPosition = (touch: Touch): TouchPosition => ({
    x: touch.clientX,
    y: touch.clientY,
  });

  const getPinchDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const touch1 = getTouchPosition(touches[0]);
    const touch2 = getTouchPosition(touches[1]);
    return getDistance(touch1, touch2);
  };

  const getSwipeDirection = (start: TouchPosition, end: TouchPosition): 'left' | 'right' | 'up' | 'down' => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  };

  // Clear timers
  const clearTimers = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
      tapTimer.current = null;
    }
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;
    
    if (touches.length === 1) {
      // Single touch
      const position = getTouchPosition(touches[0] as unknown as Touch);
      setTouchStart(position);
      setTouchEnd(null);
      setTouchStartTime(Date.now());
      setIsLongPressing(false);
      setIsPinching(false);

      // Start long press timer
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          setIsLongPressing(true);
          onLongPress(position);
          
          // Add haptic feedback if available
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }, longPressDelay);
      }
    } else if (touches.length === 2) {
      // Pinch gesture
      clearTimers();
      setIsPinching(true);
      setInitialPinchDistance(getPinchDistance(touches as unknown as TouchList));
    }
  }, [onLongPress, longPressDelay, clearTimers]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;
    
    if (touches.length === 1 && touchStart) {
      const position = getTouchPosition(touches[0] as unknown as Touch);
      setTouchEnd(position);
      
      // Cancel long press if moved too much
      const distance = getDistance(touchStart, position);
      if (distance > 10) {
        clearTimers();
        setIsLongPressing(false);
      }
    } else if (touches.length === 2 && isPinching && onPinch) {
      const currentDistance = getPinchDistance(touches as unknown as TouchList);
      if (initialPinchDistance > 0) {
        const scale = currentDistance / initialPinchDistance;
        onPinch(scale);
      }
    }
  }, [touchStart, isPinching, initialPinchDistance, onPinch, clearTimers]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    clearTimers();
    
    if (!touchStart || !touchEnd || isLongPressing) {
      setTouchStart(null);
      setTouchEnd(null);
      setIsLongPressing(false);
      setIsPinching(false);
      return;
    }

    const distance = getDistance(touchStart, touchEnd);
    const duration = Date.now() - touchStartTime;
    const velocity = distance / duration;

    // Check for swipe gesture
    if (distance > swipeThreshold && onSwipe) {
      const direction = getSwipeDirection(touchStart, touchEnd);
      onSwipe({
        direction,
        distance,
        velocity,
        duration,
      });
      
      // Add haptic feedback for swipe
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    } 
    // Check for tap gesture
    else if (distance < 10 && duration < tapDelay && onTap) {
      onTap(touchStart);
      
      // Add subtle haptic feedback for tap
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }

    // Reset state
    setTouchStart(null);
    setTouchEnd(null);
    setIsLongPressing(false);
    setIsPinching(false);
  }, [
    touchStart,
    touchEnd,
    touchStartTime,
    isLongPressing,
    swipeThreshold,
    tapDelay,
    onSwipe,
    onTap,
    clearTimers,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Detect mobile device
  const isMobile = useCallback(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }, []);

  // Detect touch support
  const hasTouchSupport = useCallback(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  // Get device orientation
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  // Prevent default touch behaviors when needed
  const preventDefaultTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
  }, []);

  return {
    // Event handlers
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    preventDefaultTouch,
    
    // State
    isLongPressing,
    isPinching,
    orientation,
    
    // Utilities
    isMobile: isMobile(),
    hasTouchSupport: hasTouchSupport(),
    
    // Touch position data
    touchStart,
    touchEnd,
  };
}

// Hook for detecting mobile viewport
export function useMobileViewport() {
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);

    return () => {
      window.removeEventListener('resize', checkViewport);
    };
  }, []);

  return isMobileViewport;
}

// Hook for safe area insets (iOS notch support)
export function useSafeAreaInsets() {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateInsets = () => {
      const style = getComputedStyle(document.documentElement);
      setInsets({
        top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
      });
    };

    updateInsets();
    window.addEventListener('resize', updateInsets);
    window.addEventListener('orientationchange', updateInsets);

    return () => {
      window.removeEventListener('resize', updateInsets);
      window.removeEventListener('orientationchange', updateInsets);
    };
  }, []);

  return insets;
}
