/**
 * Greek Tax Calculation System
 * Compliant with Greek VAT and tax regulations
 */

import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

export interface TaxCalculationResult {
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  total: number;
  taxBreakdown: TaxBreakdownItem[];
  isBusinessCustomer: boolean;
  vatNumber?: string;
  exemptions?: TaxExemption[];
}

export interface TaxBreakdownItem {
  category: string;
  amount: number;
  vatRate: number;
  vatAmount: number;
  description: string;
}

export interface TaxExemption {
  type: 'reduced_vat' | 'exempt' | 'reverse_charge';
  reason: string;
  originalRate: number;
  appliedRate: number;
  savedAmount: number;
}

export interface TaxableItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  vatCategory: 'standard' | 'reduced' | 'exempt';
}

export interface TaxConfiguration {
  standardVatRate: number; // 24% in Greece
  reducedVatRate: number;  // 13% for food items
  superReducedVatRate: number; // 6% for basic necessities
  exemptThreshold?: number; // For small businesses
  reverseChargeThreshold?: number; // For EU B2B transactions
}

// Greek VAT rates as of 2024
export const GREEK_TAX_CONFIG: TaxConfiguration = {
  standardVatRate: 24,
  reducedVatRate: 13,
  superReducedVatRate: 6,
  exemptThreshold: 10000, // €10,000 annual threshold
  reverseChargeThreshold: 0 // All EU B2B subject to reverse charge
};

/**
 * Main tax calculation function
 */
export function calculateGreekTax(
  items: TaxableItem[],
  isBusinessCustomer: boolean = false,
  customerVatNumber?: string,
  customerCountry: string = 'GR'
): TaxCalculationResult {
  try {
    let subtotal = 0;
    let totalVatAmount = 0;
    const taxBreakdown: TaxBreakdownItem[] = [];
    const exemptions: TaxExemption[] = [];

    // Process each item
    for (const item of items) {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      // Determine VAT rate based on category
      const vatRate = getVatRateForCategory(item.category, item.vatCategory);
      
      // Check for exemptions or special rates
      const exemption = checkForExemptions(
        item,
        isBusinessCustomer,
        customerVatNumber,
        customerCountry
      );

      const effectiveVatRate = exemption ? exemption.appliedRate : vatRate;
      const vatAmount = (itemTotal * effectiveVatRate) / 100;
      totalVatAmount += vatAmount;

      // Add to tax breakdown
      taxBreakdown.push({
        category: item.category,
        amount: itemTotal,
        vatRate: effectiveVatRate,
        vatAmount,
        description: getVatDescription(item.category, effectiveVatRate)
      });

      // Track exemptions
      if (exemption) {
        exemptions.push(exemption);
      }
    }

    const result: TaxCalculationResult = {
      subtotal,
      vatAmount: Math.round(totalVatAmount * 100) / 100,
      vatRate: (totalVatAmount / subtotal) * 100, // Effective VAT rate
      total: Math.round((subtotal + totalVatAmount) * 100) / 100,
      taxBreakdown,
      isBusinessCustomer,
      vatNumber: customerVatNumber,
      exemptions: exemptions.length > 0 ? exemptions : undefined
    };

    logger.info('Greek tax calculation completed', {
      subtotal,
      vatAmount: result.vatAmount,
      total: result.total,
      itemCount: items.length,
      isBusinessCustomer,
      exemptionsCount: exemptions.length
    });

    return result;

  } catch (error) {
    logger.error('Greek tax calculation failed', toError(error), errorToContext(error));
    throw new Error('Αποτυχία υπολογισμού φόρων');
  }
}

/**
 * Determine VAT rate based on product category
 */
function getVatRateForCategory(category: string, vatCategory: 'standard' | 'reduced' | 'exempt'): number {
  // Greek agricultural products typically fall under reduced VAT
  const reducedVatCategories = [
    'Φρέσκα Λαχανικά',
    'Φρούτα',
    'Κρέας και Πουλερικά',
    'Γαλακτοκομικά',
    'Ψάρια και Θαλασσινά',
    'Αυγά',
    'Δημητριακά'
  ];

  const superReducedCategories = [
    'Βασικά Τρόφιμα',
    'Φάρμακα',
    'Ιατρικές Υπηρεσίες'
  ];

  switch (vatCategory) {
    case 'exempt':
      return 0;
    case 'reduced':
      return GREEK_TAX_CONFIG.reducedVatRate;
    case 'standard':
    default:
      // Check if category qualifies for reduced rate
      if (reducedVatCategories.includes(category)) {
        return GREEK_TAX_CONFIG.reducedVatRate; // 13%
      }
      if (superReducedCategories.includes(category)) {
        return GREEK_TAX_CONFIG.superReducedVatRate; // 6%
      }
      return GREEK_TAX_CONFIG.standardVatRate; // 24%
  }
}

/**
 * Check for tax exemptions or special rates
 */
function checkForExemptions(
  item: TaxableItem,
  isBusinessCustomer: boolean,
  customerVatNumber?: string,
  customerCountry: string = 'GR'
): TaxExemption | null {
  // EU B2B Reverse Charge
  if (isBusinessCustomer && customerVatNumber && customerCountry !== 'GR' && isEUCountry(customerCountry)) {
    const originalRate = getVatRateForCategory(item.category, item.vatCategory);
    return {
      type: 'reverse_charge',
      reason: 'EU B2B Reverse Charge - VAT να καταβληθεί από αγοραστή',
      originalRate,
      appliedRate: 0,
      savedAmount: (item.price * item.quantity * originalRate) / 100
    };
  }

  // Small business exemption (if applicable)
  // Note: This would require checking annual revenue
  
  return null;
}

/**
 * Get human-readable VAT description
 */
function getVatDescription(category: string, vatRate: number): string {
  switch (vatRate) {
    case 0:
      return 'Απαλλαγή ΦΠΑ';
    case 6:
      return 'Υπερμειωμένος συντελεστής ΦΠΑ (6%)';
    case 13:
      return 'Μειωμένος συντελεστής ΦΠΑ (13%) - Αγροτικά προϊόντα';
    case 24:
      return 'Κανονικός συντελεστής ΦΠΑ (24%)';
    default:
      return `ΦΠΑ ${vatRate}%`;
  }
}

/**
 * Check if country is in EU
 */
function isEUCountry(countryCode: string): boolean {
  const euCountries = [
    'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 
    'FR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 
    'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
  ];
  return euCountries.includes(countryCode.toUpperCase());
}

/**
 * Generate tax compliance report
 */
export interface TaxComplianceReport {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalSales: number;
    totalVatCollected: number;
    totalVatPayable: number;
    netVatPosition: number;
  };
  breakdown: {
    standardRate: { sales: number; vat: number };
    reducedRate: { sales: number; vat: number };
    superReducedRate: { sales: number; vat: number };
    exempt: { sales: number; vat: number };
    reverseCharge: { sales: number; vat: number };
  };
  euTransactions: {
    totalValue: number;
    vatSaved: number;
    transactionCount: number;
  };
  compliance: {
    isCompliant: boolean;
    issues: string[];
    recommendations: string[];
  };
}

export function generateTaxComplianceReport(
  transactions: TaxCalculationResult[],
  startDate: Date,
  endDate: Date
): TaxComplianceReport {
  const summary = {
    totalSales: 0,
    totalVatCollected: 0,
    totalVatPayable: 0,
    netVatPosition: 0
  };

  const breakdown = {
    standardRate: { sales: 0, vat: 0 },
    reducedRate: { sales: 0, vat: 0 },
    superReducedRate: { sales: 0, vat: 0 },
    exempt: { sales: 0, vat: 0 },
    reverseCharge: { sales: 0, vat: 0 }
  };

  const euTransactions = {
    totalValue: 0,
    vatSaved: 0,
    transactionCount: 0
  };

  // Process transactions
  transactions.forEach(transaction => {
    summary.totalSales += transaction.subtotal;
    summary.totalVatCollected += transaction.vatAmount;

    // Categorize by VAT rate
    transaction.taxBreakdown.forEach(item => {
      switch (item.vatRate) {
        case 24:
          breakdown.standardRate.sales += item.amount;
          breakdown.standardRate.vat += item.vatAmount;
          break;
        case 13:
          breakdown.reducedRate.sales += item.amount;
          breakdown.reducedRate.vat += item.vatAmount;
          break;
        case 6:
          breakdown.superReducedRate.sales += item.amount;
          breakdown.superReducedRate.vat += item.vatAmount;
          break;
        case 0:
          if (transaction.exemptions?.some(e => e.type === 'reverse_charge')) {
            breakdown.reverseCharge.sales += item.amount;
            euTransactions.totalValue += item.amount;
            euTransactions.transactionCount++;
          } else {
            breakdown.exempt.sales += item.amount;
          }
          break;
      }
    });

    // Track EU exemptions
    if (transaction.exemptions) {
      transaction.exemptions.forEach(exemption => {
        if (exemption.type === 'reverse_charge') {
          euTransactions.vatSaved += exemption.savedAmount;
        }
      });
    }
  });

  // Calculate net VAT position
  summary.totalVatPayable = summary.totalVatCollected; // Simplified
  summary.netVatPosition = summary.totalVatCollected;

  // Compliance check
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (summary.totalVatCollected === 0 && summary.totalSales > 0) {
    issues.push('Δεν έχει συλλεχθεί ΦΠΑ παρά τις πωλήσεις');
  }

  if (euTransactions.totalValue > 50000) {
    recommendations.push('Υψηλή αξία EU συναλλαγών - εξετάστε VAT OSS scheme');
  }

  const report: TaxComplianceReport = {
    period: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    },
    summary,
    breakdown,
    euTransactions,
    compliance: {
      isCompliant: issues.length === 0,
      issues,
      recommendations
    }
  };

  logger.info('Tax compliance report generated', {
    totalSales: summary.totalSales,
    totalVatCollected: summary.totalVatCollected,
    euTransactionCount: euTransactions.transactionCount,
    isCompliant: report.compliance.isCompliant
  });

  return report;
}