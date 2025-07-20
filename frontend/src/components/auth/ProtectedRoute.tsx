'use client';

import React from 'react';
import { useRequireAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo,
  fallback 
}: ProtectedRouteProps) {
  const { isAuthorized, isLoading } = useRequireAuth(requiredRole, redirectTo);

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Έλεγχος πρόσβασης...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Redirect is handled by the hook
  }

  return <>{children}</>;
}

export default ProtectedRoute;
