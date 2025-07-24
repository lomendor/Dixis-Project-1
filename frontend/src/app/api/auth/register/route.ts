import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api/core/config';
import { createApiResponse } from '@/lib/api/production';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, password_confirmation, userType = 'customer' } = await request.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        createApiResponse(null, {
          code: 'MISSING_FIELDS',
          message: 'Όνομα, email και κωδικός είναι υποχρεωτικά'
        }),
        { status: 400 }
      );
    }

    if (password !== password_confirmation) {
      return NextResponse.json(
        createApiResponse(null, {
          code: 'PASSWORD_MISMATCH',
          message: 'Οι κωδικοί δεν ταιριάζουν'
        }),
        { status: 400 }
      );
    }

    // Try to register with Laravel backend
    try {
      const backendResponse = await fetch(buildApiUrl('api/v1/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation,
          role: userType
        }),
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        
        // Create response with auth cookies
        const response = NextResponse.json(createApiResponse(data));
        
        // Set HTTP-only cookie for token if provided
        if (data.access_token) {
          response.cookies.set('auth_token', data.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60, // 1 day
            path: '/',
          });
        }

        return response;
      } else {
        const errorData = await backendResponse.json().catch(() => ({}));
        
        // If backend route is not found, use development fallback
        if (errorData.message && errorData.message.includes('could not be found')) {
          console.log('Laravel register route not found, using development fallback');
          
          const mockUser = {
            user: {
              id: Math.floor(Math.random() * 1000) + 100,
              name,
              email,
              role: userType,
              emailVerified: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            access_token: 'mock_token_' + Date.now(),
            refresh_token: 'mock_refresh_' + Date.now(),
            expires_in: 3600,
            message: 'Εγγραφή επιτυχής! (Development mode - χρησιμοποιήστε test@dixis.gr για login)'
          };

          const response = NextResponse.json(createApiResponse(mockUser));
          response.cookies.set('auth_token', mockUser.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60,
            path: '/',
          });

          return response;
        }
        
        return NextResponse.json(
          createApiResponse(null, {
            code: 'REGISTRATION_FAILED',
            message: errorData.message || 'Αποτυχία εγγραφής'
          }),
          { status: 400 }
        );
      }
    } catch (backendError) {
      console.error('Backend registration failed:', backendError);
      
      // Fallback registration for development
      if (process.env.NODE_ENV === 'development') {
        const mockUser = {
          user: {
            id: Math.floor(Math.random() * 1000) + 100,
            name,
            email,
            role: userType,
            emailVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          access_token: 'mock_token_' + Date.now(),
          refresh_token: 'mock_refresh_' + Date.now(),
          expires_in: 3600,
          message: 'Εγγραφή επιτυχής! (Development mode - χρησιμοποιήστε test@dixis.gr για login)'
        };

        const response = NextResponse.json(createApiResponse(mockUser));
        response.cookies.set('auth_token', mockUser.access_token, {
          httpOnly: true,
          secure: false,
          maxAge: 24 * 60 * 60,
          path: '/',
        });

        return response;
      }

      return NextResponse.json(
        createApiResponse(null, {
          code: 'BACKEND_UNAVAILABLE',
          message: 'Υπηρεσία μη διαθέσιμη. Παρακαλώ δοκιμάστε αργότερα.'
        }),
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      createApiResponse(null, {
        code: 'REGISTRATION_ERROR',
        message: 'Σφάλμα κατά την εγγραφή'
      }),
      { status: 500 }
    );
  }
}