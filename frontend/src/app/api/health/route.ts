import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse } from '@/lib/api/production';
import { productionConfig } from '@/lib/config/production';

export async function GET(request: NextRequest) {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      status: 'healthy',
    };

    // Add more health checks here
    const healthChecks = await Promise.allSettled([
      checkDatabase(),
      checkRedis(),
      checkExternalServices(),
    ]);

    const results = healthChecks.map((result, index) => ({
      name: ['database', 'redis', 'external'][index],
      status: result.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      details: result.status === 'fulfilled' ? result.value : result?.reason?.message,
    }));

    const overallStatus = results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy';

    const response = createApiResponse({
      ...checks,
      status: overallStatus,
      checks: results,
    });

    return NextResponse.json(response, {
      status: overallStatus === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    const response = createApiResponse(undefined, {
      code: 'HEALTH_CHECK_ERROR',
      message: error instanceof Error ? error.message : 'Health check failed',
    });

    return NextResponse.json(response, { status: 503 });
  }
}

async function checkDatabase(): Promise<any> {
  // Mock database check - replace with actual database ping
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        connected: true,
        responseTime: Math.random() * 100,
      });
    }, 10);
  });
}

async function checkRedis(): Promise<any> {
  // Mock Redis check - replace with actual Redis ping
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        connected: true,
        responseTime: Math.random() * 50,
      });
    }, 5);
  });
}

async function checkExternalServices(): Promise<any> {
  // Mock external services check
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        services: {
          stripe: 'healthy',
          sendgrid: 'healthy',
          aws: 'healthy',
        },
      });
    }, 20);
  });
}
