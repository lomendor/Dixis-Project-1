/**
 * Backend Detection Utilities
 * Smart detection of backend availability for graceful degradation
 */

interface HealthCheckResult {
  isAvailable: boolean;
  status: 'healthy' | 'degraded';
  timestamp: string;
  latency?: number;
}

let cachedHealthCheck: HealthCheckResult | null = null;
let lastHealthCheckTime = 0;
const HEALTH_CHECK_CACHE_DURATION = 30000; // 30 seconds

/**
 * Check if the Laravel backend is available
 * Uses caching to avoid excessive health checks
 */
export async function isBackendAvailable(): Promise<boolean> {
  const now = Date.now();
  
  // Use cached result if recent
  if (cachedHealthCheck && (now - lastHealthCheckTime) < HEALTH_CHECK_CACHE_DURATION) {
    return cachedHealthCheck.isAvailable;
  }

  try {
    const startTime = Date.now();
    const response = await fetch('/api/health-check', {
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });

    const healthData = await response.json();
    const latency = Date.now() - startTime;

    cachedHealthCheck = {
      isAvailable: healthData.backend === 'available',
      status: healthData.status,
      timestamp: healthData.timestamp,
      latency
    };

    lastHealthCheckTime = now;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🏥 Backend health check: ${cachedHealthCheck.isAvailable ? '✅ Available' : '❌ Unavailable'} (${latency}ms)`);
    }

    return cachedHealthCheck.isAvailable;
  } catch (error) {
    console.log('Health check failed:', error);
    
    cachedHealthCheck = {
      isAvailable: false,
      status: 'degraded',
      timestamp: new Date().toISOString()
    };

    lastHealthCheckTime = now;
    return false;
  }
}

/**
 * Get detailed backend status information
 */
export async function getBackendStatus(): Promise<HealthCheckResult> {
  await isBackendAvailable(); // This will update the cache
  return cachedHealthCheck || {
    isAvailable: false,
    status: 'degraded',
    timestamp: new Date().toISOString()
  };
}

/**
 * Clear the health check cache (useful for testing)
 */
export function clearHealthCheckCache(): void {
  cachedHealthCheck = null;
  lastHealthCheckTime = 0;
}

/**
 * Determine cart mode based on configuration and backend availability
 */
export async function getCartMode(): Promise<'api' | 'local'> {
  const useRealCart = process.env.NEXT_PUBLIC_USE_REAL_CART === 'true';
  
  if (!useRealCart) {
    return 'local';
  }

  const backendAvailable = await isBackendAvailable();
  return backendAvailable ? 'api' : 'local';
}