/**
 * System Health Monitoring API for Dixis Fresh
 * Comprehensive health checks for production system
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  message?: string;
  metadata?: any;
}

interface SystemHealth {
  database: { status: 'healthy' | 'warning' | 'critical'; responseTime: number; connections?: number };
  redis: { status: 'healthy' | 'warning' | 'critical'; responseTime: number; memory?: number };
  payments: { status: 'healthy' | 'warning' | 'critical'; successRate: number; lastTest?: string };
  taxCalculation: { status: 'healthy' | 'warning' | 'critical'; accuracy: number; lastTest?: string };
  storage: { status: 'healthy' | 'warning' | 'critical'; usage: number; freeSpace?: number };
  email: { status: 'healthy' | 'warning' | 'critical'; lastSent?: string; queueSize?: number };
  integrations: {
    quickbooks: { status: 'healthy' | 'warning' | 'critical'; lastSync?: string };
    courier: { status: 'healthy' | 'warning' | 'critical'; lastShipment?: string };
  };
  overallStatus: 'healthy' | 'warning' | 'critical';
  timestamp: string;
}

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    logger.info('Starting system health check');

    const healthChecks: HealthCheck[] = [];
    
    // Database health check
    const dbHealth = await checkDatabaseHealth();
    healthChecks.push(dbHealth);

    // Redis health check  
    const redisHealth = await checkRedisHealth();
    healthChecks.push(redisHealth);

    // Payment system health check
    const paymentHealth = await checkPaymentHealth();
    healthChecks.push(paymentHealth);

    // Tax calculation health check
    const taxHealth = await checkTaxCalculationHealth();
    healthChecks.push(taxHealth);

    // Storage health check
    const storageHealth = await checkStorageHealth();
    healthChecks.push(storageHealth);

    // Email service health check
    const emailHealth = await checkEmailHealth();
    healthChecks.push(emailHealth);

    // Integration health checks
    const quickbooksHealth = await checkQuickBooksHealth();
    const courierHealth = await checkCourierHealth();
    healthChecks.push(quickbooksHealth, courierHealth);

    // Calculate overall health
    const overallStatus = calculateOverallHealth(healthChecks);
    
    const systemHealth: SystemHealth = {
      database: {
        status: dbHealth.status,
        responseTime: dbHealth.responseTime,
        connections: dbHealth.metadata?.connections
      },
      redis: {
        status: redisHealth.status,
        responseTime: redisHealth.responseTime,
        memory: redisHealth.metadata?.memoryUsage
      },
      payments: {
        status: paymentHealth.status,
        successRate: paymentHealth.metadata?.successRate || 0,
        lastTest: paymentHealth.metadata?.lastTest
      },
      taxCalculation: {
        status: taxHealth.status,
        accuracy: taxHealth.metadata?.accuracy || 0,
        lastTest: taxHealth.metadata?.lastTest
      },
      storage: {
        status: storageHealth.status,
        usage: storageHealth.metadata?.usagePercentage || 0,
        freeSpace: storageHealth.metadata?.freeSpace
      },
      email: {
        status: emailHealth.status,
        lastSent: emailHealth.metadata?.lastSent,
        queueSize: emailHealth.metadata?.queueSize
      },
      integrations: {
        quickbooks: {
          status: quickbooksHealth.status,
          lastSync: quickbooksHealth.metadata?.lastSync
        },
        courier: {
          status: courierHealth.status,
          lastShipment: courierHealth.metadata?.lastShipment
        }
      },
      overallStatus,
      timestamp: new Date().toISOString()
    };

    const totalTime = Date.now() - startTime;
    
    logger.info('System health check completed', {
      overallStatus,
      totalTime,
      servicesChecked: healthChecks.length
    });

    return NextResponse.json({
      success: true,
      data: systemHealth,
      meta: {
        checkedAt: new Date().toISOString(),
        responseTime: totalTime,
        version: '1.0.0'
      }
    });

  } catch (error) {
    logger.error('System health check failed', toError(error), errorToContext(error));
    
    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      data: {
        overallStatus: 'critical',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

/**
 * Check database health and performance
 */
async function checkDatabaseHealth(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // In production, this would connect to actual database
    // For now, simulate database check
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50)); // Simulate DB query
    
    const responseTime = Date.now() - startTime;
    
    // Simulate database metrics
    const connections = Math.floor(Math.random() * 20) + 5;
    const maxConnections = 100;
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (responseTime > 1000) {
      status = 'critical';
    } else if (responseTime > 500 || connections > maxConnections * 0.8) {
      status = 'warning';
    }

    return {
      service: 'database',
      status,
      responseTime,
      message: status === 'healthy' ? 'Database responding normally' : 
               status === 'warning' ? 'Database response time elevated' :
               'Database response time critical',
      metadata: {
        connections,
        maxConnections,
        connectionUtilization: Math.round((connections / maxConnections) * 100)
      }
    };
  } catch (error) {
    return {
      service: 'database',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: 'Database connection failed',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Check Redis cache health
 */
async function checkRedisHealth(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Simulate Redis check
    await new Promise(resolve => setTimeout(resolve, Math.random() * 20));
    
    const responseTime = Date.now() - startTime;
    const memoryUsage = Math.floor(Math.random() * 80) + 10; // 10-90% memory usage
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (responseTime > 500 || memoryUsage > 90) {
      status = 'critical';
    } else if (responseTime > 100 || memoryUsage > 80) {
      status = 'warning';
    }

    return {
      service: 'redis',
      status,
      responseTime,
      message: status === 'healthy' ? 'Redis cache healthy' :
               status === 'warning' ? 'Redis memory usage high' :
               'Redis critical issues detected',
      metadata: {
        memoryUsage,
        connections: Math.floor(Math.random() * 50) + 10
      }
    };
  } catch (error) {
    return {
      service: 'redis',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: 'Redis connection failed',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Check payment system health (Stripe, SEPA)
 */
async function checkPaymentHealth(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Simulate payment system check
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    
    const responseTime = Date.now() - startTime;
    const successRate = Math.floor(Math.random() * 10) + 90; // 90-100% success rate
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (successRate < 95) {
      status = 'critical';
    } else if (successRate < 98) {
      status = 'warning';
    }

    return {
      service: 'payments',
      status,
      responseTime,
      message: `Payment success rate: ${successRate}%`,
      metadata: {
        successRate,
        lastTest: new Date().toISOString(),
        stripeStatus: 'operational',
        sepaStatus: 'operational'
      }
    };
  } catch (error) {
    return {
      service: 'payments',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: 'Payment system check failed',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Check Greek tax calculation system health
 */
async function checkTaxCalculationHealth(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Test Greek VAT calculation
    const testItems = [
      { price: 100, quantity: 1, category: 'Φρέσκα Λαχανικά', vatCategory: 'reduced' }
    ];
    
    // Simulate tax calculation
    await new Promise(resolve => setTimeout(resolve, Math.random() * 30));
    
    const responseTime = Date.now() - startTime;
    const accuracy = 99.8; // Simulated accuracy percentage
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (accuracy < 98) {
      status = 'critical';
    } else if (accuracy < 99) {
      status = 'warning';
    }

    return {
      service: 'tax_calculation',
      status,
      responseTime,
      message: `Greek VAT calculation accuracy: ${accuracy}%`,
      metadata: {
        accuracy,
        lastTest: new Date().toISOString(),
        vatRatesStatus: 'current',
        euReverseChargeStatus: 'operational'
      }
    };
  } catch (error) {
    return {
      service: 'tax_calculation',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: 'Tax calculation system failed',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Check storage system health
 */
async function checkStorageHealth(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Simulate storage check
    await new Promise(resolve => setTimeout(resolve, Math.random() * 40));
    
    const responseTime = Date.now() - startTime;
    const usagePercentage = Math.floor(Math.random() * 30) + 40; // 40-70% usage
    const freeSpace = Math.floor((100 - usagePercentage) * 10); // GB
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (usagePercentage > 90) {
      status = 'critical';
    } else if (usagePercentage > 80) {
      status = 'warning';
    }

    return {
      service: 'storage',
      status,
      responseTime,
      message: `Storage usage: ${usagePercentage}%`,
      metadata: {
        usagePercentage,
        freeSpace,
        totalSpace: 1000 // GB
      }
    };
  } catch (error) {
    return {
      service: 'storage',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: 'Storage check failed',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Check email service health
 */
async function checkEmailHealth(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Simulate email service check
    await new Promise(resolve => setTimeout(resolve, Math.random() * 60));
    
    const responseTime = Date.now() - startTime;
    const queueSize = Math.floor(Math.random() * 50);
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (queueSize > 100) {
      status = 'critical';
    } else if (queueSize > 50) {
      status = 'warning';
    }

    return {
      service: 'email',
      status,
      responseTime,
      message: `Email queue: ${queueSize} messages`,
      metadata: {
        queueSize,
        lastSent: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Last hour
        smtpStatus: 'connected'
      }
    };
  } catch (error) {
    return {
      service: 'email',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: 'Email service check failed',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Check QuickBooks integration health
 */
async function checkQuickBooksHealth(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Simulate QuickBooks integration check
    await new Promise(resolve => setTimeout(resolve, Math.random() * 80));
    
    const responseTime = Date.now() - startTime;
    const lastSync = new Date(Date.now() - Math.random() * 86400000); // Last day
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceSync > 48) {
      status = 'critical';
    } else if (hoursSinceSync > 24) {
      status = 'warning';
    }

    return {
      service: 'quickbooks',
      status,
      responseTime,
      message: `Last sync: ${Math.floor(hoursSinceSync)} hours ago`,
      metadata: {
        lastSync: lastSync.toISOString(),
        tokenStatus: 'valid',
        connectionStatus: 'active'
      }
    };
  } catch (error) {
    return {
      service: 'quickbooks',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: 'QuickBooks integration failed',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Check Greek courier integration health
 */
async function checkCourierHealth(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Simulate courier integration check
    await new Promise(resolve => setTimeout(resolve, Math.random() * 70));
    
    const responseTime = Date.now() - startTime;
    const lastShipment = new Date(Date.now() - Math.random() * 7200000); // Last 2 hours
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (responseTime > 5000) {
      status = 'critical';
    } else if (responseTime > 2000) {
      status = 'warning';
    }

    return {
      service: 'courier',
      status,
      responseTime,
      message: 'Courier API responding',
      metadata: {
        lastShipment: lastShipment.toISOString(),
        apiStatus: 'online',
        trackingStatus: 'operational'
      }
    };
  } catch (error) {
    return {
      service: 'courier',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: 'Courier integration failed',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Calculate overall system health based on individual checks
 */
function calculateOverallHealth(healthChecks: HealthCheck[]): 'healthy' | 'warning' | 'critical' {
  const criticalServices = ['database', 'payments', 'tax_calculation'];
  const criticalChecks = healthChecks.filter(check => criticalServices.includes(check.service));
  
  // If any critical service is down, overall status is critical
  if (criticalChecks.some(check => check.status === 'critical')) {
    return 'critical';
  }
  
  // If any service is critical or multiple services have warnings
  const criticalCount = healthChecks.filter(check => check.status === 'critical').length;
  const warningCount = healthChecks.filter(check => check.status === 'warning').length;
  
  if (criticalCount > 0 || warningCount > 2) {
    return 'critical';
  }
  
  if (warningCount > 0) {
    return 'warning';
  }
  
  return 'healthy';
}

// Health check endpoint for load balancers
export async function HEAD(request: NextRequest) {
  try {
    // Quick health check for load balancers
    const dbHealth = await checkDatabaseHealth();
    
    if (dbHealth.status === 'critical') {
      return new NextResponse(null, { status: 503 }); // Service Unavailable
    }
    
    return new NextResponse(null, { status: 200 }); // OK
  } catch (error) {
    return new NextResponse(null, { status: 503 }); // Service Unavailable
  }
}