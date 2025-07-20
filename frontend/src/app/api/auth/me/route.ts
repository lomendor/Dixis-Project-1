import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse } from '@/lib/api/production';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        createApiResponse(null, {
          code: 'NO_TOKEN',
          message: 'Δεν είστε συνδεδεμένος'
        }),
        { status: 401 }
      );
    }

    // Try to get user from Laravel backend
    try {
      const backendResponse = await fetch('http://localhost:8000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        return NextResponse.json(createApiResponse(data));
      } else {
        // Token might be invalid, clear it
        const response = NextResponse.json(
          createApiResponse(null, {
            code: 'INVALID_TOKEN',
            message: 'Άκυρη σύνδεση'
          }),
          { status: 401 }
        );
        response.cookies.delete('auth_token');
        return response;
      }
    } catch (backendError) {
      console.error('Backend me request failed:', backendError);
      
      // Fallback for development mode
      if (process.env.NODE_ENV === 'development' && token.startsWith('mock_token_')) {
        const mockUser = {
          id: 1,
          name: 'Test User',
          email: 'test@dixis.gr',
          role: 'customer',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return NextResponse.json(createApiResponse(mockUser));
      }

      return NextResponse.json(
        createApiResponse(null, {
          code: 'BACKEND_UNAVAILABLE',
          message: 'Υπηρεσία μη διαθέσιμη'
        }),
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json(
      createApiResponse(null, {
        code: 'AUTH_ERROR',
        message: 'Σφάλμα ελέγχου ταυτότητας'
      }),
      { status: 500 }
    );
  }
}