import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api/core/config';
import { createApiResponse } from '@/lib/api/production';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (token) {
      // Try to logout from Laravel backend
      try {
        await fetch(buildApiUrl('api/auth/logout'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
      } catch (backendError) {
        console.warn('Backend logout failed:', backendError);
        // Continue with frontend logout even if backend fails
      }
    }

    // Clear auth cookie
    const response = NextResponse.json(createApiResponse({ message: 'Αποσύνδεση επιτυχής' }));
    response.cookies.delete('auth_token');

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    
    // Even if there's an error, clear the cookie
    const response = NextResponse.json(createApiResponse({ message: 'Αποσύνδεση επιτυχής' }));
    response.cookies.delete('auth_token');
    
    return response;
  }
}