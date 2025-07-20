import { logger } from '@/lib/logging/productionLogger';

import { NextRequest, NextResponse } from 'next/server';

interface B2BRegistrationData {
  businessName: string;
  contactName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  taxId: string;
  businessType: string;
  agreeToTerms: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: B2BRegistrationData = await request.json();
    const { 
      businessName, 
      contactName, 
      email, 
      password, 
      confirmPassword,
      phone,
      address,
      city,
      postalCode,
      taxId,
      businessType,
      agreeToTerms
    } = body;

    // Validate required fields
    if (!businessName || !contactName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Όλα τα υποχρεωτικά πεδία πρέπει να συμπληρωθούν' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Παρακαλώ εισάγετε έγκυρο email' },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Οι κωδικοί πρόσβασης δεν ταιριάζουν' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 8 χαρακτήρες' },
        { status: 400 }
      );
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      return NextResponse.json(
        { error: 'Πρέπει να αποδεχτείτε τους όρους χρήσης' },
        { status: 400 }
      );
    }

    // Check if email already exists (mock check)
    if (email === 'existing@business.com') {
      return NextResponse.json(
        { error: 'Αυτό το email χρησιμοποιείται ήδη' },
        { status: 409 }
      );
    }

    // For demo purposes, create mock successful registration
    const newUser = {
      id: Date.now(),
      name: contactName,
      email: email,
      role: 'business',
      business_name: businessName,
      phone: phone,
      address: address,
      city: city,
      postal_code: postalCode,
      tax_id: taxId,
      business_type: businessType,
      verified: false, // Email verification required
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Generate access token
    const accessToken = 'new_user_token_' + Date.now();

    return NextResponse.json({
      success: true,
      message: 'Η εγγραφή ολοκληρώθηκε επιτυχώς! Ελέγξτε το email σας για επιβεβαίωση.',
      user: newUser,
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      email_verification_required: true
    });

  } catch (error) {
    logger.error('B2B Registration API Error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Σφάλμα κατά την εγγραφή. Παρακαλώ δοκιμάστε ξανά.' },
      { status: 500 }
    );
  }
}