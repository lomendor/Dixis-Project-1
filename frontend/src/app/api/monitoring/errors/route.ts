import { logger } from '@/lib/logging/productionLogger';

import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse } from '@/lib/api/production';
import { productionConfig } from '@/lib/config/production';

export async function POST(request: NextRequest) {
  try {
    // Only accept error reports in production or development
    if (!productionConfig.isProduction && !productionConfig.isDevelopment) {
      return NextResponse.json(
        createApiResponse(undefined, {
          code: 'FORBIDDEN',
          message: 'Error reporting not available in this environment',
        }),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { error, context, severity, category, fingerprint } = body;

    // Validate required fields
    if (!error || !error.message) {
      return NextResponse.json(
        createApiResponse(undefined, {
          code: 'VALIDATION_ERROR',
          message: 'Error message is required',
        }),
        { status: 400 }
      );
    }

    // Create error report
    const errorReport = {
      id: generateErrorId(),
      timestamp: new Date().toISOString(),
      error: {
        name: error.name || 'Error',
        message: error.message,
        stack: error.stack,
      },
      context: {
        ...context,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent'),
        url: context?.url || request.headers.get('referer'),
      },
      severity: severity || 'medium',
      category: category || 'unknown',
      fingerprint: fingerprint || generateFingerprint(error),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    };

    // Store error report (in production, this would go to a database)
    await storeErrorReport(errorReport);

    // Send to external monitoring services
    if (productionConfig.isProduction) {
      await sendToExternalMonitoring(errorReport);
    }

    // Log error for development
    if (productionConfig.isDevelopment) {
      logger.error('Error Report:', new Error(JSON.stringify(errorReport)));
    }

    const response = createApiResponse({
      id: errorReport.id,
      status: 'received',
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    logger.error('Failed to process error report:', error instanceof Error ? error : new Error(String(error)));
    
    const response = createApiResponse(undefined, {
      code: 'INTERNAL_ERROR',
      message: 'Failed to process error report',
    });

    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Only allow in development or with proper authentication
    if (productionConfig.isProduction) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !isValidAuthToken(authHeader)) {
        return NextResponse.json(
          createApiResponse(undefined, {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          }),
          { status: 401 }
        );
      }
    }

    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const severity = url.searchParams.get('severity');
    const category = url.searchParams.get('category');

    // Fetch error reports (mock implementation)
    const errorReports = await getErrorReports({
      limit: Math.min(limit, 100), // Max 100 per request
      offset,
      severity,
      category,
    });

    const response = createApiResponse(errorReports.data, undefined, {
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: errorReports.total,
        totalPages: Math.ceil(errorReports.total / limit),
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    const response = createApiResponse(undefined, {
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Failed to fetch error reports',
    });

    return NextResponse.json(response, { status: 500 });
  }
}

function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateFingerprint(error: any): string {
  const key = `${error.name || 'Error'}-${error.message}-${error?.stack?.split('\n')[1] || ''}`;
  return Buffer.from(key).toString('base64').slice(0, 16);
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

function isValidAuthToken(authHeader: string): boolean {
  // Simple token validation - in production, use proper JWT validation
  const token = authHeader.replace('Bearer ', '');
  return token === process.env.MONITORING_API_TOKEN;
}

async function storeErrorReport(errorReport: any): Promise<void> {
  // Mock storage - in production, store in database
  logger.info('Storing error report:', errorReport.id);
  
  // You could store in a file, database, or external service
  // For now, we'll just log it
}

async function sendToExternalMonitoring(errorReport: any): Promise<void> {
  try {
    // Send to Sentry, DataDog, or other monitoring services
    // This is a mock implementation
    
    if (productionConfig.sentryDsn) {
      // Would send to Sentry here
      logger.info('Would send to Sentry:', errorReport.id);
    }
    
    // Could also send to Slack, Discord, email, etc.
    if (errorReport.severity === 'critical') {
      await sendCriticalErrorAlert(errorReport);
    }
  } catch (error) {
    logger.error('Failed to send to external monitoring:', error instanceof Error ? error : new Error(String(error)));
  }
}

async function sendCriticalErrorAlert(errorReport: any): Promise<void> {
  // Send critical error alerts via email, Slack, etc.
  logger.info('CRITICAL ERROR ALERT:', errorReport.id);
  
  // Mock implementation - in production, send actual alerts
  try {
    // Example: Send to Slack webhook
    // await fetch(process.env.SLACK_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     text: `🚨 Critical Error in ${errorReport.environment}`,
    //     attachments: [{
    //       color: 'danger',
    //       fields: [
    //         { title: 'Error', value: errorReport.error.message, short: false },
    //         { title: 'Category', value: errorReport.category, short: true },
    //         { title: 'Environment', value: errorReport.environment, short: true },
    //       ],
    //     }],
    //   }),
    // });
  } catch (error) {
    logger.error('Failed to send critical error alert:', error instanceof Error ? error : new Error(String(error)));
  }
}

async function getErrorReports(filters: {
  limit: number;
  offset: number;
  severity?: string | null;
  category?: string | null;
}): Promise<{ data: any[]; total: number }> {
  // Mock implementation - in production, query from database
  const mockErrors = Array.from({ length: 25 }, (_, i) => ({
    id: `err_${Date.now() - i * 1000}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(Date.now() - i * 60000).toISOString(),
    error: {
      name: ['TypeError', 'ReferenceError', 'NetworkError'][i % 3],
      message: `Mock error message ${i + 1}`,
    },
    severity: ['low', 'medium', 'high', 'critical'][i % 4],
    category: ['api', 'ui', 'auth', 'payment'][i % 4],
    environment: process.env.NODE_ENV,
  }));

  // Apply filters
  let filtered = mockErrors;
  
  if (filters.severity) {
    filtered = filtered.filter(err => err.severity === filters.severity);
  }
  
  if (filters.category) {
    filtered = filtered.filter(err => err.category === filters.category);
  }

  // Apply pagination
  const paginated = filtered.slice(filters.offset, filters.offset + filters.limit);

  return {
    data: paginated,
    total: filtered.length,
  };
}
