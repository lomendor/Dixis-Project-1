/**
 * Centralized Price Calculator
 * 
 * Provides consistent price calculations across the entire application
 * Fixes rounding inconsistencies and ensures mathematical accuracy
 */

export interface PriceBreakdown {
  producerPrice: number;
  commission: number;
  commissionRate: number;
  priceBeforeVat: number;
  vat: number;
  vatRate: number;
  finalPrice: number;
  // Additional fields for display
  producerPercentage: number;
  platformPercentage: number;
  vatPercentage: number;
}

export interface PriceCalculatorOptions {
  /** Producer's base price (what they want to receive) */
  producerPrice: number;
  /** Commission rate as percentage (e.g., 12 for 12%) */
  commissionRate?: number;
  /** VAT rate as percentage (e.g., 24 for 24%) */
  vatRate?: number;
  /** Round to specified decimal places */
  precision?: number;
}

/**
 * Primary price calculation function
 * Uses proper rounding to avoid floating point precision issues
 */
export function calculatePrice(options: PriceCalculatorOptions): PriceBreakdown {
  const {
    producerPrice,
    commissionRate = 12, // Default 12% commission
    vatRate = 24, // Default Greek VAT rate
    precision = 2
  } = options;

  // Ensure input is valid
  if (producerPrice < 0) {
    throw new Error('Producer price cannot be negative');
  }
  if (commissionRate < 0 || commissionRate > 100) {
    throw new Error('Commission rate must be between 0 and 100');
  }
  if (vatRate < 0 || vatRate > 100) {
    throw new Error('VAT rate must be between 0 and 100');
  }

  // Helper function for consistent rounding
  const roundToPrecision = (value: number): number => {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  };

  // Step 1: Calculate commission
  const commission = roundToPrecision(producerPrice * (commissionRate / 100));

  // Step 2: Calculate price before VAT
  const priceBeforeVat = roundToPrecision(producerPrice + commission);

  // Step 3: Calculate VAT on the total (producer + commission)
  const vat = roundToPrecision(priceBeforeVat * (vatRate / 100));

  // Step 4: Calculate final price
  const finalPrice = roundToPrecision(priceBeforeVat + vat);

  // Calculate percentages for transparency display
  const producerPercentage = roundToPrecision((producerPrice / finalPrice) * 100);
  const platformPercentage = roundToPrecision((commission / finalPrice) * 100);
  const vatPercentage = roundToPrecision((vat / finalPrice) * 100);

  return {
    producerPrice: roundToPrecision(producerPrice),
    commission,
    commissionRate,
    priceBeforeVat,
    vat,
    vatRate,
    finalPrice,
    producerPercentage,
    platformPercentage,
    vatPercentage
  };
}

/**
 * Calculate producer price from final consumer price
 * Useful for admin when setting retail prices
 */
export function calculateProducerPriceFromFinal(
  finalPrice: number,
  commissionRate: number = 12,
  vatRate: number = 24
): PriceBreakdown {
  // Working backwards: finalPrice = (producerPrice + commission) * (1 + vatRate/100)
  // Where commission = producerPrice * (commissionRate/100)
  // So: finalPrice = producerPrice * (1 + commissionRate/100) * (1 + vatRate/100)
  // Therefore: producerPrice = finalPrice / ((1 + commissionRate/100) * (1 + vatRate/100))

  const vatMultiplier = 1 + (vatRate / 100);
  const commissionMultiplier = 1 + (commissionRate / 100);
  const totalMultiplier = commissionMultiplier * vatMultiplier;
  
  const producerPrice = finalPrice / totalMultiplier;
  
  return calculatePrice({
    producerPrice,
    commissionRate,
    vatRate
  });
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = 'EUR', locale: string = 'el-GR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Validate price breakdown calculations
 * Ensures the sum of components equals the final price
 */
export function validatePriceBreakdown(breakdown: PriceBreakdown): boolean {
  const calculatedTotal = breakdown.producerPrice + breakdown.commission + breakdown.vat;
  const difference = Math.abs(calculatedTotal - breakdown.finalPrice);
  
  // Allow for minimal floating point differences (less than 1 cent)
  return difference < 0.01;
}

/**
 * Create price breakdown for multiple quantities
 */
export function calculateBulkPrice(
  options: PriceCalculatorOptions & { quantity: number }
): PriceBreakdown & { quantity: number; totalPrice: number } {
  const { quantity, ...priceOptions } = options;
  const singleItemBreakdown = calculatePrice(priceOptions);
  
  return {
    ...singleItemBreakdown,
    quantity,
    totalPrice: singleItemBreakdown.finalPrice * quantity
  };
}

/**
 * Calculate price with discount
 */
export function calculateDiscountedPrice(
  options: PriceCalculatorOptions & { discountPercentage: number }
): PriceBreakdown & { originalPrice: number; discountAmount: number; discountPercentage: number } {
  const { discountPercentage, ...priceOptions } = options;
  
  const originalBreakdown = calculatePrice(priceOptions);
  const discountAmount = originalBreakdown.finalPrice * (discountPercentage / 100);
  const discountedFinalPrice = originalBreakdown.finalPrice - discountAmount;
  
  // Recalculate with discounted final price
  const discountedBreakdown = calculateProducerPriceFromFinal(
    discountedFinalPrice,
    priceOptions.commissionRate,
    priceOptions.vatRate
  );
  
  return {
    ...discountedBreakdown,
    originalPrice: originalBreakdown.finalPrice,
    discountAmount,
    discountPercentage
  };
}

/**
 * Compare prices between different commission rates
 * Useful for showing subscription benefits
 */
export function comparePrices(
  producerPrice: number,
  commissionRates: number[],
  vatRate: number = 24
): Array<PriceBreakdown & { savings?: number }> {
  const breakdowns = commissionRates.map(rate => 
    calculatePrice({ producerPrice, commissionRate: rate, vatRate })
  );
  
  // Calculate savings compared to highest commission rate
  const highestPrice = Math.max(...breakdowns.map(b => b.finalPrice));
  
  return breakdowns.map(breakdown => ({
    ...breakdown,
    savings: highestPrice - breakdown.finalPrice
  }));
}

// Export commonly used calculations as constants
export const DEFAULT_COMMISSION_RATES = {
  FREE_PLAN: 12,
  PREMIUM_PLAN: 9,
  ENTERPRISE_PLAN: 7
} as const;

export const VAT_RATES = {
  GREECE_MAINLAND: 24,
  GREECE_ISLANDS: 13,
  EU_STANDARD: 20
} as const;