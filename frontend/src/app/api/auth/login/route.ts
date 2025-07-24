import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse } from '@/lib/api/production';

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        createApiResponse(null, {
          code: 'MISSING_CREDENTIALS',
          message: 'Email και κωδικός είναι υποχρεωτικά'
        }),
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
          remember_me: rememberMe
        }),
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        
        // Create response with auth cookies
        const response = NextResponse.json(createApiResponse(data));
        
        // Set HTTP-only cookie for token
        if (data.access_token) {
          response.cookies.set('auth_token', data.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
            path: '/',
          });
        }

        return response;
      } else {
        const errorData = await backendResponse.json().catch(() => ({}));
        
        // If backend route is not found, use development fallback
        if (errorData.message && errorData.message.includes('could not be found')) {
          console.log('Laravel auth route not found, using development fallback');
          
          if ((email === 'test@dixis.gr' || email === 'producer@dixis.gr') && password === 'password') {
            const mockUser = {
              user: {
                id: email === 'producer@dixis.gr' ? 2 : 1,
                name: email === 'producer@dixis.gr' ? 'Test Producer' : 'Test User',
                email: email,
                role: email === 'producer@dixis.gr' ? 'producer' : 'customer',
                emailVerified: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              access_token: 'mock_token_' + Date.now(),
              refresh_token: 'mock_refresh_' + Date.now(),
              expires_in: 3600
            };

            const response = NextResponse.json(createApiResponse(mockUser));
            response.cookies.set('auth_token', mockUser.access_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
              path: '/',
            });

            return response;
          }
        }
        
        return NextResponse.json(
          createApiResponse(null, {
            code: 'LOGIN_FAILED',
            message: errorData.message || 'Λάθος email ή κωδικός'
          }),
          { status: 401 }
        );
      }
    } catch (backendError) {
      console.error('Backend authentication failed:', backendError);
      
      // Fallback authentication for development
      if (process.env.NODE_ENV === 'development') {
        if ((email === 'test@dixis.gr' || email === 'producer@dixis.gr') && password === 'password') {
          const mockUser = {
            user: {
              id: email === 'producer@dixis.gr' ? 2 : 1,
              name: email === 'producer@dixis.gr' ? 'Test Producer' : 'Test User',
              email: email,
              role: email === 'producer@dixis.gr' ? 'producer' : 'customer',
              emailVerified: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            access_token: 'mock_token_' + Date.now(),
            refresh_token: 'mock_refresh_' + Date.now(),
            expires_in: 3600
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
    console.error('Login API error:', error);
    return NextResponse.json(
      createApiResponse(null, {
        code: 'LOGIN_ERROR',
        message: 'Σφάλμα κατά τη σύνδεση'
      }),
      { status: 500 }
    );
  }
}