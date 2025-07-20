'use client';

import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import BusinessAnalyticsDashboard from '@/components/b2b/analytics/BusinessAnalyticsDashboard';
import { SkeletonCard } from '@/components/mobile/ProgressiveLoading';

export default function B2BAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ErrorBoundary fallback={
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Analytics Error</h2>
            <p className="text-red-600">Unable to load business analytics. Please try again later.</p>
          </div>
        }>
          <Suspense fallback={
            <div className="space-y-6">
              <SkeletonCard className="h-8 w-64" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <SkeletonCard key={i} className="h-32" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkeletonCard className="h-80" />
                <SkeletonCard className="h-80" />
              </div>
            </div>
          }>
            <BusinessAnalyticsDashboard />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}