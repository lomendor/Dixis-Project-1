import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Forward request to Laravel backend
    const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        message: 'Εάν το email υπάρχει στο σύστημα, θα λάβετε οδηγίες επαναφοράς κωδικού.'
      });
    } else {
      return NextResponse.json(
        { message: data.message || 'Σφάλμα αποστολής email.' },
        { status: response.status }
      );
    }
  } catch (error) {
    logger.error('Forgot password API error', toError(error), errorToContext(error));
    return NextResponse.json(
      { message: 'Σφάλμα αποστολής email. Παρακαλώ δοκιμάστε ξανά.' },
      { status: 500 }
    );
  }
}