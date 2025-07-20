'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useB2BAuth } from '@/lib/api/services/b2b/useB2BAuth';

interface B2BProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function B2BProtectedRoute({
  children,
  fallback
}: B2BProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useB2BAuth();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/b2b/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
  }, [isAuthenticated, router]);

  // Show loading while checking auth
  if (typeof window === 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export default B2BProtectedRoute;