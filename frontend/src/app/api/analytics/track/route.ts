import { logger } from '@/lib/logging/productionLogger';

import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
  session_id?: string;
  timestamp?: number;
  url?: string;
  user_agent?: string;
}

export async function POST(request: NextRequest) {
  try {
    const event: AnalyticsEvent = await request.json();

    // Validate required fields
    if (!event.action || !event.category) {
      return NextResponse.json(
        { error: 'Missing required fields: action and category' },
        { status: 400 }
      );
    }

    // Add server-side metadata
    const enrichedEvent = {
      ...event,
      server_timestamp: Date.now(),
      ip_address: getClientIP(request),
      user_agent: request.headers.get('user-agent') || event.user_agent,
      referer: request.headers.get('referer'),
      origin: request.headers.get('origin')
    };

    // Process the event
    await processAnalyticsEvent(enrichedEvent);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      logger.info('Analytics Event:', enrichedEvent);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Analytics tracking error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

async function processAnalyticsEvent(event: AnalyticsEvent & Record<string, any>) {
  // In a real application, you would:
  // 1. Store in database (PostgreSQL, MongoDB, etc.)
  // 2. Send to analytics service (Google Analytics, Mixpanel, etc.)
  // 3. Process for real-time dashboards
  // 4. Queue for batch processing

  // For now, we'll simulate processing
  if (process.env.NODE_ENV === 'production') {
    // Store in database
    await storeInDatabase(event);
    
    // Send to external analytics services
    await sendToExternalServices(event);
  }
}

async function storeInDatabase(event: any) {
  // Simulate database storage
  // In production, use your preferred database:
  
  /*
  Example with Prisma:
  await prisma.analyticsEvent.create({
    data: {
      action: event.action,
      category: event.category,
      label: event.label,
      value: event.value,
      sessionId: event.session_id,
      timestamp: new Date(event.timestamp),
      url: event.url,
      userAgent: event.user_agent,
      ipAddress: event.ip_address,
      customParameters: event.custom_parameters
    }
  });
  */
  
  logger.info('Event stored in database:', event.action);
}

async function sendToExternalServices(event: any) {
  // Send to external analytics services
  const promises = [];

  // Google Analytics (server-side)
  if (process.env.GA_MEASUREMENT_ID && process.env.GA_API_SECRET) {
    promises.push(sendToGoogleAnalytics(event));
  }

  // Mixpanel
  if (process.env.MIXPANEL_TOKEN) {
    promises.push(sendToMixpanel(event));
  }

  // Custom analytics service
  if (process.env.CUSTOM_ANALYTICS_ENDPOINT) {
    promises.push(sendToCustomService(event));
  }

  await Promise.allSettled(promises);
}

async function sendToGoogleAnalytics(event: any) {
  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: event.session_id || 'anonymous',
          events: [{
            name: event.action,
            parameters: {
              event_category: event.category,
              event_label: event.label,
              value: event.value,
              ...event.custom_parameters
            }
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`GA API error: ${response.status}`);
    }
  } catch (error) {
    logger.error('Failed to send to Google Analytics:', error instanceof Error ? error : new Error(String(error)));
  }
}

async function sendToMixpanel(event: any) {
  try {
    const response = await fetch('https://api.mixpanel.com/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event: event.action,
        properties: {
          token: process.env.MIXPANEL_TOKEN,
          distinct_id: event.session_id || 'anonymous',
          category: event.category,
          label: event.label,
          value: event.value,
          time: event.timestamp,
          ...event.custom_parameters
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Mixpanel API error: ${response.status}`);
    }
  } catch (error) {
    logger.error('Failed to send to Mixpanel:', error instanceof Error ? error : new Error(String(error)));
  }
}

async function sendToCustomService(event: any) {
  try {
    const response = await fetch(process.env.CUSTOM_ANALYTICS_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CUSTOM_ANALYTICS_TOKEN}`
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error(`Custom service error: ${response.status}`);
    }
  } catch (error) {
    logger.error('Failed to send to custom service:', error instanceof Error ? error : new Error(String(error)));
  }
}

function getClientIP(request: NextRequest): string {
  // Try various headers for client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (clientIP) {
    return clientIP;
  }

  // Fallback to connection remote address
  return 'unknown';
}
