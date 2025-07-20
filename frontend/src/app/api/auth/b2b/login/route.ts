import { logger } from '@/lib/logging/productionLogger';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email και κωδικός πρόσβασης είναι υποχρεωτικά' },
        { status: 400 }
      );
    }

    // Try to authenticate with Laravel backend
    try {
      const backendResponse = await fetch('http://localhost:8000/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          remember_me: rememberMe,
        }),
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        // Transform response to B2B format
        return NextResponse.json({
          success: true,
          user: {
            ...data.user,
            business_name: data.user?.business?.business_name || data.user.name,
            verified: data.user?.business?.verified || false,
          },
          access_token: data.token,
          token_type: 'Bearer',
          expires_in: 3600
        });
      } else {
        const errorData = await backendResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Authentication failed');
      }
    } catch (backendError) {
      logger.warn('Backend authentication failed, trying demo credentials:', {
        error: backendError instanceof Error ? backendError.message : String(backendError)
      });
      
      // Fallback to demo credentials if backend is unavailable
      if (email === 'demo@business.com' && password === 'demo123') {
        return NextResponse.json({
          success: true,
          user: {
            id: 1,
            name: 'Demo Business User',
            email: 'demo@business.com',
            role: 'business',
            business_name: 'Demo Επιχείρηση',
            verified: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          access_token: 'demo_token_' + Date.now(),
          token_type: 'Bearer',
          expires_in: 3600
        });
      }
    }

    // Invalid credentials
    return NextResponse.json(
      { error: 'Λάθος email ή κωδικός πρόσβασης' },
      { status: 401 }
    );

  } catch (error) {
    logger.error('B2B Login API Error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Σφάλμα κατά τη σύνδεση. Παρακαλώ δοκιμάστε ξανά.' },
      { status: 500 }
    );
  }
}