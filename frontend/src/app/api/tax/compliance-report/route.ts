/**
 * Greek Tax Compliance Reporting API
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';
import { 
  generateTaxComplianceReport, 
  TaxCalculationResult,
  calculateGreekTax,
  TaxableItem 
} from '@/lib/tax/greekTaxCalculator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'json';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Απαιτούνται ημερομηνίες έναρξης και λήξης' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { error: 'Η ημερομηνία έναρξης πρέπει να είναι προγενέστερη της λήξης' },
        { status: 400 }
      );
    }

    // In production, fetch actual transactions from database
    // For now, generate mock compliance data
    const mockTransactions = generateMockTransactions(start, end);

    const complianceReport = generateTaxComplianceReport(mockTransactions, start, end);

    // Handle different output formats
    if (format === 'pdf') {
      // Generate PDF report
      const pdfBuffer = await generateCompliancePDF(complianceReport);
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="tax-compliance-${startDate}-${endDate}.pdf"`
        }
      });
    }

    if (format === 'csv') {
      // Generate CSV export
      const csvData = generateComplianceCSV(complianceReport);
      
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="tax-compliance-${startDate}-${endDate}.csv"`
        }
      });
    }

    logger.info('Tax compliance report generated', {
      period: `${startDate} to ${endDate}`,
      totalSales: complianceReport.summary.totalSales,
      vatCollected: complianceReport.summary.totalVatCollected,
      isCompliant: complianceReport.compliance.isCompliant
    });

    return NextResponse.json({
      success: true,
      data: complianceReport,
      meta: {
        generatedAt: new Date().toISOString(),
        period: `${startDate} to ${endDate}`,
        format
      }
    });

  } catch (error) {
    logger.error('Tax compliance report generation failed', toError(error), errorToContext(error));
    return NextResponse.json(
      { error: 'Αποτυχία δημιουργίας αναφοράς συμμόρφωσης' },
      { status: 500 }
    );
  }
}

/**
 * Generate mock transactions for the period
 */
function generateMockTransactions(startDate: Date, endDate: Date): TaxCalculationResult[] {
  const transactions: TaxCalculationResult[] = [];
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Generate 3-8 transactions per day
  for (let day = 0; day < daysDiff; day++) {
    const transactionsPerDay = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < transactionsPerDay; i++) {
      const isEUBusiness = Math.random() < 0.15; // 15% EU B2B transactions
      const isGreekBusiness = Math.random() < 0.25; // 25% Greek B2B transactions
      
      const mockItems: TaxableItem[] = [
        {
          id: `item-${day}-${i}-1`,
          name: 'Οργανικές Ντομάτες',
          price: 4.50 + (Math.random() * 2),
          quantity: Math.floor(Math.random() * 5) + 1,
          category: 'Φρέσκα Λαχανικά',
          vatCategory: 'reduced'
        },
        {
          id: `item-${day}-${i}-2`,
          name: 'Ελαιόλαδο',
          price: 15.90 + (Math.random() * 5),
          quantity: Math.floor(Math.random() * 3) + 1,
          category: 'Έλαια και Λάδια',
          vatCategory: 'reduced'
        }
      ];

      if (Math.random() < 0.3) {
        // Add standard VAT item occasionally
        mockItems.push({
          id: `item-${day}-${i}-3`,
          name: 'Συσκευασία Premium',
          price: 5.00,
          quantity: 1,
          category: 'Υπηρεσίες',
          vatCategory: 'standard'
        });
      }

      const customerCountry = isEUBusiness ? 
        ['DE', 'FR', 'IT', 'NL', 'ES'][Math.floor(Math.random() * 5)] : 'GR';
      
      const vatNumber = (isEUBusiness || isGreekBusiness) ? 
        `${customerCountry}123456789` : undefined;

      const taxResult = calculateGreekTax(
        mockItems,
        isEUBusiness || isGreekBusiness,
        vatNumber,
        customerCountry
      );

      transactions.push(taxResult);
    }
  }

  return transactions;
}

/**
 * Generate PDF compliance report
 */
async function generateCompliancePDF(report: any): Promise<Buffer> {
  // This is a placeholder - in production you would use a PDF library
  // like puppeteer, jsPDF, or PDFKit
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Αναφορά Φορολογικής Συμμόρφωσης</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; }
        .breakdown { margin: 20px 0; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f2f2f2; }
        .total { font-weight: bold; background-color: #e6f3ff; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Αναφορά Φορολογικής Συμμόρφωσης</h1>
        <h2>Dixis Fresh</h2>
        <p>Περίοδος: ${new Date(report.period.startDate).toLocaleDateString('el-GR')} - ${new Date(report.period.endDate).toLocaleDateString('el-GR')}</p>
    </div>

    <div class="summary">
        <h3>Συνοπτικά Στοιχεία</h3>
        <p><strong>Συνολικές Πωλήσεις:</strong> €${report.summary.totalSales.toFixed(2)}</p>
        <p><strong>Συνολικό ΦΠΑ:</strong> €${report.summary.totalVatCollected.toFixed(2)}</p>
        <p><strong>Κατάσταση Συμμόρφωσης:</strong> ${report.compliance.isCompliant ? 'Συμμορφώνεται' : 'Απαιτεί προσοχή'}</p>
    </div>

    <div class="breakdown">
        <h3>Ανάλυση ΦΠΑ</h3>
        <table class="table">
            <tr>
                <th>Συντελεστής ΦΠΑ</th>
                <th>Πωλήσεις (€)</th>
                <th>ΦΠΑ (€)</th>
            </tr>
            <tr>
                <td>24% (Κανονικός)</td>
                <td>${report.breakdown.standardRate.sales.toFixed(2)}</td>
                <td>${report.breakdown.standardRate.vat.toFixed(2)}</td>
            </tr>
            <tr>
                <td>13% (Μειωμένος)</td>
                <td>${report.breakdown.reducedRate.sales.toFixed(2)}</td>
                <td>${report.breakdown.reducedRate.vat.toFixed(2)}</td>
            </tr>
            <tr>
                <td>6% (Υπερμειωμένος)</td>
                <td>${report.breakdown.superReducedRate.sales.toFixed(2)}</td>
                <td>${report.breakdown.superReducedRate.vat.toFixed(2)}</td>
            </tr>
            <tr>
                <td>0% (Reverse Charge EU)</td>
                <td>${report.breakdown.reverseCharge.sales.toFixed(2)}</td>
                <td>0.00</td>
            </tr>
            <tr class="total">
                <td><strong>ΣΥΝΟΛΟ</strong></td>
                <td><strong>${report.summary.totalSales.toFixed(2)}</strong></td>
                <td><strong>${report.summary.totalVatCollected.toFixed(2)}</strong></td>
            </tr>
        </table>
    </div>

    ${report.compliance.issues.length > 0 ? `
    <div class="issues">
        <h3>Θέματα Συμμόρφωσης</h3>
        <ul>
            ${report.compliance.issues.map((issue: string) => `<li>${issue}</li>`).join('')}
        </ul>
    </div>
    ` : ''}

    <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
        <p>Αυτή η αναφορά δημιουργήθηκε αυτόματα από το σύστημα Dixis Fresh</p>
        <p>Ημερομηνία δημιουργίας: ${new Date().toLocaleDateString('el-GR')}</p>
    </div>
</body>
</html>`;

  return Buffer.from(htmlContent, 'utf-8');
}

/**
 * Generate CSV compliance export
 */
function generateComplianceCSV(report: any): string {
  const headers = [
    'Συντελεστής ΦΠΑ',
    'Πωλήσεις (€)',
    'ΦΠΑ (€)',
    'Ποσοστό επί συνόλου'
  ];

  const rows = [
    ['24% (Κανονικός)', report.breakdown.standardRate.sales.toFixed(2), report.breakdown.standardRate.vat.toFixed(2), ((report.breakdown.standardRate.sales / report.summary.totalSales) * 100).toFixed(1) + '%'],
    ['13% (Μειωμένος)', report.breakdown.reducedRate.sales.toFixed(2), report.breakdown.reducedRate.vat.toFixed(2), ((report.breakdown.reducedRate.sales / report.summary.totalSales) * 100).toFixed(1) + '%'],
    ['6% (Υπερμειωμένος)', report.breakdown.superReducedRate.sales.toFixed(2), report.breakdown.superReducedRate.vat.toFixed(2), ((report.breakdown.superReducedRate.sales / report.summary.totalSales) * 100).toFixed(1) + '%'],
    ['0% (Reverse Charge)', report.breakdown.reverseCharge.sales.toFixed(2), '0.00', ((report.breakdown.reverseCharge.sales / report.summary.totalSales) * 100).toFixed(1) + '%'],
    ['ΣΥΝΟΛΟ', report.summary.totalSales.toFixed(2), report.summary.totalVatCollected.toFixed(2), '100.0%']
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}