'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { reactQueryCacheConfig } from '@/lib/performance/cacheStrategy';

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          ...reactQueryCacheConfig.defaultOptions,
          queries: {
            ...reactQueryCacheConfig.defaultOptions.queries,
            retry: (failureCount, error) => {
              // Don't retry AbortErrors
              if (error instanceof Error && error.name === 'AbortError') {
                return false;
              }
              // Use config retry count
              return failureCount < (reactQueryCacheConfig.defaultOptions.queries.retry || 2);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
