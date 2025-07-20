/**
 * Greek Tax Calculation API
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';
import { calculateGreekTax, TaxableItem } from '@/lib/tax/greekTaxCalculator';

export async function POST(request: NextRequest) {
  try {
    const { items, isBusinessCustomer, customerVatNumber, customerCountry } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Απαιτούνται προϊόντα για τον υπολογισμό φόρων' },
        { status: 400 }
      );
    }

    // Validate items structure
    const validatedItems: TaxableItem[] = items.map((item: any) => ({
      id: item.id || item.productId,
      name: item.name || item.productName || 'Προϊόν',
      price: parseFloat(item.price || item.unitPrice || 0),
      quantity: parseInt(item.quantity || 1),
      category: item.category || 'Φρέσκα Λαχανικά',
      vatCategory: item.vatCategory || 'reduced' // Default to reduced for agricultural products
    }));

    // Calculate taxes
    const taxResult = calculateGreekTax(
      validatedItems,
      isBusinessCustomer || false,
      customerVatNumber,
      customerCountry || 'GR'
    );

    logger.info('Tax calculation completed successfully', {
      itemCount: validatedItems.length,
      subtotal: taxResult.subtotal,
      vatAmount: taxResult.vatAmount,
      total: taxResult.total,
      isBusinessCustomer,
      customerCountry
    });

    return NextResponse.json({
      success: true,
      data: taxResult
    });

  } catch (error) {
    logger.error('Tax calculation failed', toError(error), errorToContext(error));
    return NextResponse.json(
      { error: 'Αποτυχία υπολογισμού φόρων' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mockItems = searchParams.get('mock') === 'true';

    if (mockItems) {
      // Return sample calculation for testing
      const sampleItems: TaxableItem[] = [
        {
          id: '1',
          name: 'Οργανικές Ντομάτες Κρήτης',
          price: 4.50,
          quantity: 2,
          category: 'Φρέσκα Λαχανικά',
          vatCategory: 'reduced'
        },
        {
          id: '2',
          name: 'Ελληνικό Ελαιόλαδο Extra Virgin',
          price: 15.90,
          quantity: 1,
          category: 'Έλαια και Λάδια',
          vatCategory: 'reduced'
        },
        {
          id: '3',
          name: 'Οργανικό Μέλι',
          price: 8.50,
          quantity: 1,
          category: 'Μελι και Γλυκά',
          vatCategory: 'standard'
        }
      ];

      const taxResult = calculateGreekTax(sampleItems, false, undefined, 'GR');

      return NextResponse.json({
        success: true,
        data: taxResult,
        sample: true
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Greek Tax Calculation API - Use POST to calculate taxes',
      supportedVatRates: {
        standard: '24% - Κανονικός συντελεστής',
        reduced: '13% - Μειωμένος συντελεστής (αγροτικά προϊόντα)',
        superReduced: '6% - Υπερμειωμένος συντελεστής (βασικά τρόφιμα)',
        exempt: '0% - Απαλλαγή ΦΠΑ'
      },
      features: [
        'Greek VAT compliance',
        'EU B2B reverse charge',
        'Agricultural product reduced rates',
        'Tax breakdown by category',
        'Compliance reporting'
      ]
    });

  } catch (error) {
    logger.error('Tax API GET request failed', toError(error), errorToContext(error));
    return NextResponse.json(
      { error: 'API error' },
      { status: 500 }
    );
  }
}