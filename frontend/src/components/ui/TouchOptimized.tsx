'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';

// Touch-optimized button with haptic feedback simulation
interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function TouchButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
}: TouchButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    primary: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[56px]',
  };

  return (
    <motion.button
      className={cn(
        'rounded-lg font-medium transition-all duration-150 touch-manipulation',
        'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      whileTap={{ scale: 0.95 }}
      onTapStart={() => setIsPressed(true)}
      onTap={() => {
        setIsPressed(false);
        onClick?.();
      }}
      onTapCancel={() => setIsPressed(false)}
      disabled={disabled}
      style={{
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </motion.button>
  );
}

// Swipeable card component
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
  swipeThreshold?: number;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = '',
  swipeThreshold = 100,
}: SwipeableCardProps) {
  const [dragX, setDragX] = useState(0);
  const constraintsRef = useRef(null);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset } = info;
    
    if (offset.x > swipeThreshold && onSwipeRight) {
      onSwipeRight();
    } else if (offset.x < -swipeThreshold && onSwipeLeft) {
      onSwipeLeft();
    }
    
    setDragX(0);
  };

  return (
    <motion.div
      ref={constraintsRef}
      className={cn('touch-manipulation', className)}
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      dragElastic={0.2}
      onDrag={(event, info) => setDragX(info.offset.x)}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
      style={{
        x: dragX,
      }}
    >
      {children}
    </motion.div>
  );
}

// Pull-to-refresh component
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  className = '',
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePanStart = () => {
    if (containerRef?.current?.scrollTop === 0) {
      setIsPulling(true);
    }
  };

  const handlePan = (event: any, info: PanInfo) => {
    if (isPulling && info.offset.y > 0) {
      setPullDistance(Math.min(info.offset.y, 120));
    }
  };

  const handlePanEnd = async (event: any, info: PanInfo) => {
    if (isPulling && info.offset.y > 80) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn('relative overflow-auto touch-manipulation', className)}
      onPanStart={handlePanStart}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      style={{
        paddingTop: isPulling ? pullDistance : 0,
      }}
    >
      {(isPulling || isRefreshing) && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-center h-16 bg-gray-50">
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
            className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full"
          />
          <span className="ml-2 text-sm text-gray-600">
            {isRefreshing ? 'Ανανέωση...' : 'Τραβήξτε για ανανέωση'}
          </span>
        </div>
      )}
      {children}
    </motion.div>
  );
}

// Touch-optimized slider/carousel
interface TouchSliderProps {
  children: React.ReactNode[];
  className?: string;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function TouchSlider({
  children,
  className = '',
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 3000,
}: TouchSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);

  useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % children.length);
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, children.length]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset } = info;
    const threshold = 50;

    if (offset.x > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (offset.x < -threshold && currentIndex < children.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    
    setDragX(0);
  };

  return (
    <div className={cn('relative overflow-hidden touch-manipulation', className)}>
      <motion.div
        className="flex"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDrag={(event, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        animate={{ x: -currentIndex * 100 + '%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ x: dragX }}
      >
        {children.map((child, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {child}
          </div>
        ))}
      </motion.div>

      {showDots && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {children.map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200 touch-manipulation',
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              )}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Mobile-optimized input with better touch targets
interface TouchInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  className?: string;
  error?: string;
}

export function TouchInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  className = '',
  error,
}: TouchInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full px-4 py-3 text-base border border-gray-300 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
          'touch-manipulation min-h-[48px]',
          error && 'border-red-500 focus:ring-red-500',
          'disabled:bg-gray-100 disabled:cursor-not-allowed'
        )}
        style={{
          fontSize: '16px', // Prevents zoom on iOS
          WebkitAppearance: 'none',
        }}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// Touch-optimized select dropdown
interface TouchSelectProps {
  label?: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TouchSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Επιλέξτε...',
  className = '',
}: TouchSelectProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          'w-full px-4 py-3 text-base border border-gray-300 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
          'touch-manipulation min-h-[48px] bg-white',
          'appearance-none cursor-pointer'
        )}
        style={{
          fontSize: '16px', // Prevents zoom on iOS
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
