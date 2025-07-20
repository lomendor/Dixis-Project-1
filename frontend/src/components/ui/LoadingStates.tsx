'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-green-600', sizeClasses[size], className)} />
  );
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 1 }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-gray-200 rounded',
            i === 0 ? 'h-4' : 'h-3 mt-2',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-3 bg-gray-200 rounded w-3/4 mb-3" />
        
        {/* Price skeleton */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="h-5 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>
        
        {/* Button skeleton */}
        <div className="h-9 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function ProducerCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="p-6">
        <div className="h-5 bg-gray-200 rounded mb-2" />
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
        
        {/* Stats skeleton */}
        <div className="flex space-x-4 mb-4">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
        
        {/* Button skeleton */}
        <div className="h-9 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

interface PageLoadingProps {
  title?: string;
  description?: string;
}

export function PageLoading({ title = 'Φόρτωση...', description }: PageLoadingProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
      </div>
    </div>
  );
}

export function ProductsGridLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProducersGridLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProducerCardSkeleton key={i} />
      ))}
    </div>
  );
}

interface InlineLoadingProps {
  text?: string;
  size?: 'sm' | 'md';
}

export function InlineLoading({ text = 'Φόρτωση...', size = 'sm' }: InlineLoadingProps) {
  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size={size} />
      <span className={cn('text-gray-600', size === 'sm' ? 'text-sm' : 'text-base')}>
        {text}
      </span>
    </div>
  );
}

export function ButtonLoading({ children, isLoading, ...props }: any) {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <LoadingSpinner size="sm" />
          <span>Φόρτωση...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// Search loading states
export function SearchResultsLoading() {
  return (
    <div className="space-y-6">
      {/* Results summary skeleton */}
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-32" />
      </div>
      
      {/* Products grid skeleton */}
      <ProductsGridLoading />
    </div>
  );
}

export function CartLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg border animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

export function ProducerProfileLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Cover image skeleton */}
        <div className="h-64 bg-gray-200" />
        
        {/* Content skeleton */}
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-40" />
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded-full" />
          </div>

          {/* Bio skeleton */}
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-3" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>

          {/* Specialties skeleton */}
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded w-24 mb-3" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded-full w-20" />
              ))}
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2" />
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 h-12 bg-gray-200 rounded-lg" />
        <div className="flex-1 h-12 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

export default LoadingSpinner;
