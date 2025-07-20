'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import B2BProtectedRoute from '@/components/b2b/B2BProtectedRoute';
import B2BLayout from '@/components/b2b/B2BLayout';

interface B2BRootLayoutProps {
  children: React.ReactNode;
}

export default function B2BRootLayout({ children }: B2BRootLayoutProps) {
  const pathname = usePathname();
  
  // Pages that don't need authentication
  const publicPages = ['/b2b/login', '/b2b/register', '/b2b/verify-email'];
  const isPublicPage = publicPages.includes(pathname);

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <B2BProtectedRoute>
      <B2BLayout>
        {children}
      </B2BLayout>
    </B2BProtectedRoute>
  );
}