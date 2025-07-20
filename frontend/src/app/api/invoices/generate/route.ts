/**
 * Invoice Generation API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';
import { 
  generateInvoiceFromOrder, 
  generateInvoiceHTML, 
  generateInvoicePDF 
} from '@/lib/invoice/invoiceGenerator';

/**
 * Generate invoice for an order
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId, format = 'pdf' } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch order data from backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const orderResponse = await fetch(`${backendUrl}/api/orders/${orderId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!orderResponse.ok) {
      throw new Error(`Failed to fetch order: ${orderResponse.statusText}`);
    }

    const order = await orderResponse.json();

    // Generate invoice data
    const invoiceData = generateInvoiceFromOrder(order);

    // Generate appropriate format
    let result;
    let contentType;
    let filename;

    switch (format) {
      case 'html':
        result = generateInvoiceHTML(invoiceData);
        contentType = 'text/html';
        filename = `invoice-${invoiceData.invoiceNumber}.html`;
        break;
      
      case 'pdf':
      default:
        const pdfBuffer = await generateInvoicePDF(invoiceData);
        result = pdfBuffer;
        contentType = 'application/pdf';
        filename = `invoice-${invoiceData.invoiceNumber}.pdf`;
        break;
    }

    // Log successful generation
    logger.info('Invoice generated successfully', {
      orderId,
      invoiceNumber: invoiceData.invoiceNumber,
      format,
      customerEmail: invoiceData.customer.email
    });

    // Return the generated invoice
    if (format === 'html') {
      return new NextResponse(result, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${filename}"`,
        },
      });
    } else {
      return new NextResponse(result, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

  } catch (error) {
    logger.error('Invoice generation failed', toError(error), errorToContext(error));
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}

/**
 * Get invoice details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch order data from backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const orderResponse = await fetch(`${backendUrl}/api/orders/${orderId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!orderResponse.ok) {
      throw new Error(`Failed to fetch order: ${orderResponse.statusText}`);
    }

    const order = await orderResponse.json();

    // Generate invoice data (metadata only)
    const invoiceData = generateInvoiceFromOrder(order);

    // Return invoice metadata
    return NextResponse.json({
      invoiceNumber: invoiceData.invoiceNumber,
      date: invoiceData.date,
      dueDate: invoiceData.dueDate,
      customer: invoiceData.customer,
      company: invoiceData.company,
      subtotal: invoiceData.subtotal,
      vatAmount: invoiceData.vatAmount,
      total: invoiceData.total,
      currency: invoiceData.currency,
      itemsCount: invoiceData.items.length
    });

  } catch (error) {
    logger.error('Failed to get invoice details', toError(error), errorToContext(error));
    return NextResponse.json(
      { error: 'Failed to get invoice details' },
      { status: 500 }
    );
  }
}