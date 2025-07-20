/**
 * Invoice generation utilities
 */

import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

export interface InvoiceData {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customer: {
    name: string;
    email: string;
    address?: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    vatNumber?: string;
  };
  company: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    vatNumber: string;
    phone: string;
    email: string;
  };
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    vatRate: number;
  }[];
  subtotal: number;
  vatAmount: number;
  total: number;
  currency: string;
  notes?: string;
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(orderId: string): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  
  return `INV-${year}${month}-${timestamp}`;
}

/**
 * Calculate VAT amounts
 */
export function calculateVAT(amount: number, vatRate: number = 24): { vatAmount: number; totalWithVat: number } {
  const vatAmount = (amount * vatRate) / 100;
  const totalWithVat = amount + vatAmount;
  
  return {
    vatAmount: Math.round(vatAmount * 100) / 100,
    totalWithVat: Math.round(totalWithVat * 100) / 100
  };
}

/**
 * Generate invoice HTML template
 */
export function generateInvoiceHTML(data: InvoiceData): string {
  const logoUrl = process.env.NEXT_PUBLIC_BASE_URL + '/images/dixis-logo-with-text.png';
  
  return `
<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Τιμολόγιο ${data.invoiceNumber}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 2px solid #16a34a;
            padding-bottom: 20px;
        }
        .logo {
            max-height: 80px;
        }
        .invoice-info {
            text-align: right;
        }
        .invoice-number {
            font-size: 24px;
            font-weight: bold;
            color: #16a34a;
            margin-bottom: 10px;
        }
        .company-info, .customer-info {
            margin-bottom: 30px;
        }
        .company-info h3, .customer-info h3 {
            color: #16a34a;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            background-color: #16a34a;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        .items-table tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .totals {
            margin-left: auto;
            width: 300px;
        }
        .totals table {
            width: 100%;
            border-collapse: collapse;
        }
        .totals td {
            padding: 8px 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        .totals .total-row {
            font-weight: bold;
            font-size: 18px;
            background-color: #16a34a;
            color: white;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
        .notes {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        @media print {
            body { margin: 0; padding: 10px; }
            .header { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="${logoUrl}" alt="Dixis Fresh" class="logo">
        <div class="invoice-info">
            <div class="invoice-number">ΤΙΜΟΛΟΓΙΟ ${data.invoiceNumber}</div>
            <div><strong>Ημερομηνία:</strong> ${new Date(data.date).toLocaleDateString('el-GR')}</div>
            <div><strong>Προθεσμία Πληρωμής:</strong> ${new Date(data.dueDate).toLocaleDateString('el-GR')}</div>
            <div><strong>Παραγγελία:</strong> ${data.orderNumber}</div>
        </div>
    </div>

    <div class="info-grid">
        <div class="company-info">
            <h3>Στοιχεία Εταιρείας</h3>
            <div><strong>${data.company.name}</strong></div>
            <div>${data.company.address}</div>
            <div>${data.company.city}, ${data.company.postalCode}</div>
            <div>${data.company.country}</div>
            <div><strong>ΑΦΜ:</strong> ${data.company.vatNumber}</div>
            <div><strong>Τηλ:</strong> ${data.company.phone}</div>
            <div><strong>Email:</strong> ${data.company.email}</div>
        </div>

        <div class="customer-info">
            <h3>Στοιχεία Πελάτη</h3>
            <div><strong>${data.customer.name}</strong></div>
            ${data.customer.address ? `
                <div>${data.customer.address.street}</div>
                <div>${data.customer.address.city}, ${data.customer.address.postalCode}</div>
                <div>${data.customer.address.country}</div>
            ` : ''}
            <div><strong>Email:</strong> ${data.customer.email}</div>
            ${data.customer.vatNumber ? `<div><strong>ΑΦΜ:</strong> ${data.customer.vatNumber}</div>` : ''}
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Περιγραφή</th>
                <th style="text-align: center;">Ποσότητα</th>
                <th style="text-align: right;">Τιμή Μονάδας</th>
                <th style="text-align: right;">ΦΠΑ %</th>
                <th style="text-align: right;">Σύνολο</th>
            </tr>
        </thead>
        <tbody>
            ${data.items.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">€${item.unitPrice.toFixed(2)}</td>
                    <td style="text-align: right;">${item.vatRate}%</td>
                    <td style="text-align: right;">€${item.total.toFixed(2)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td>Υποσύνολο:</td>
                <td style="text-align: right;">€${data.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
                <td>ΦΠΑ (24%):</td>
                <td style="text-align: right;">€${data.vatAmount.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
                <td>Τελικό Σύνολο:</td>
                <td style="text-align: right;">€${data.total.toFixed(2)}</td>
            </tr>
        </table>
    </div>

    ${data.notes ? `
        <div class="notes">
            <strong>Σημειώσεις:</strong><br>
            ${data.notes}
        </div>
    ` : ''}

    <div class="footer">
        <p>Αυτό το τιμολόγιο δημιουργήθηκε αυτόματα από το σύστημα Dixis Fresh.</p>
        <p>Για οποιαδήποτε απορία, επικοινωνήστε μαζί μας στο support@dixis.gr</p>
    </div>
</body>
</html>`;
}

/**
 * Generate invoice data from order
 */
export function generateInvoiceFromOrder(order: any): InvoiceData {
  const invoiceNumber = generateInvoiceNumber(order.id);
  const currentDate = new Date();
  const dueDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Calculate totals
  const subtotal = order?.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
  const { vatAmount, totalWithVat } = calculateVAT(subtotal);

  return {
    id: order.id,
    orderNumber: order.order_number || `#${order.id}`,
    invoiceNumber,
    date: currentDate.toISOString(),
    dueDate: dueDate.toISOString(),
    customer: {
      name: `${order?.customer?.first_name || ''} ${order?.customer?.last_name || ''}`.trim() || 'Πελάτης',
      email: order?.customer?.email || '',
      address: order.shipping_address ? {
        street: order.shipping_address.address,
        city: order.shipping_address.city,
        postalCode: order.shipping_address.postal_code,
        country: 'Ελλάδα'
      } : undefined,
      vatNumber: order?.customer?.vat_number
    },
    company: {
      name: 'Dixis Fresh',
      address: 'Πατησίων 123',
      city: 'Αθήνα',
      postalCode: '10678',
      country: 'Ελλάδα',
      vatNumber: '123456789',
      phone: '+30 210 123 4567',
      email: 'info@dixis.gr'
    },
    items: order?.items?.map((item: any) => ({
      id: item.id,
      description: item?.product?.name || item.name || 'Προϊόν',
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.price * item.quantity,
      vatRate: 24
    })) || [],
    subtotal,
    vatAmount,
    total: totalWithVat,
    currency: 'EUR',
    notes: 'Ευχαριστούμε για την προτίμησή σας!'
  };
}

/**
 * Convert HTML to PDF (placeholder - you'll need a PDF library)
 */
export async function generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
  try {
    // This is a placeholder. In a real implementation, you would use:
    // - puppeteer
    // - jsPDF
    // - pdfkit
    // - or send to a backend service that generates PDFs
    
    const html = generateInvoiceHTML(invoiceData);
    
    // For now, return the HTML as a buffer
    // In production, replace this with actual PDF generation
    return Buffer.from(html, 'utf-8');
  } catch (error) {
    logger.error('PDF generation failed', toError(error), errorToContext(error));
    throw error;
  }
}