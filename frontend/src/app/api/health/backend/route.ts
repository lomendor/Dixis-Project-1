import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🏥 Checking backend health...');
    
    const startTime = Date.now();
    const backendUrl = 'http://localhost:8080/api/v1/health';
    
    try {
      const response = await fetch(backendUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend is healthy');
        
        return NextResponse.json({
          status: 'healthy',
          backend: 'connected',
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          details: data
        });
      }
      
      console.warn('⚠️ Backend returned non-OK status:', response.status);
      return NextResponse.json({
        status: 'unhealthy',
        backend: 'error',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
        error: `Backend returned status ${response.status}`
      }, { status: 503 });
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ Backend health check failed:', error);
      
      return NextResponse.json({
        status: 'unhealthy',
        backend: 'disconnected',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Connection failed',
        fallback: 'Using mock data'
      }, { status: 503 });
    }
    
  } catch (error) {
    console.error('❌ Health check error:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}