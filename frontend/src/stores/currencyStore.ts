import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
}

interface CurrencyState {
  // Current selected currency
  selectedCurrency: Currency;
  
  // Available currencies
  availableCurrencies: Currency[];
  
  // Exchange rates cache
  exchangeRates: Record<string, ExchangeRate>;
  
  // Loading states
  isLoadingRates: boolean;
  
  // Actions
  setSelectedCurrency: (currency: Currency) => void;
  fetchExchangeRates: () => Promise<void>;
  convertPrice: (amount: number, fromCurrency: string, toCurrency?: string) => number;
  formatPrice: (amount: number, currency?: Currency) => string;
}

// Default currencies
const DEFAULT_CURRENCIES: Currency[] = [
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺'
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸'
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧'
  }
];

// Exchange rate service
class ExchangeRateService {
  private static readonly API_URL = 'https://api.exchangerate-api.com/v4/latest';
  private static readonly FALLBACK_RATES = {
    'EUR-USD': 1.08,
    'EUR-GBP': 0.86,
    'USD-EUR': 0.93,
    'USD-GBP': 0.79,
    'GBP-EUR': 1.16,
    'GBP-USD': 1.27
  };

  static async fetchRates(baseCurrency: string = 'EUR'): Promise<Record<string, number>> {
    try {
      const response = await fetch(`${this.API_URL}/${baseCurrency}`);
      if (!response.ok) throw new Error('Failed to fetch rates');
      
      const data = await response.json();
      return data.rates;
    } catch (error) {
      console.warn('Failed to fetch live exchange rates, using fallback:', error);
      
      // Return fallback rates
      const fallbackRates: Record<string, number> = {};
      Object.entries(this.FALLBACK_RATES).forEach(([pair, rate]) => {
        const [from, to] = pair.split('-');
        if (from === baseCurrency) {
          fallbackRates[to] = rate;
        }
      });
      
      // Add base currency
      fallbackRates[baseCurrency] = 1;
      
      return fallbackRates;
    }
  }
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedCurrency: DEFAULT_CURRENCIES[0], // EUR as default
      availableCurrencies: DEFAULT_CURRENCIES,
      exchangeRates: {},
      isLoadingRates: false,

      // Actions
      setSelectedCurrency: (currency: Currency) => {
        set({ selectedCurrency: currency });
        // Fetch new rates when currency changes
        get().fetchExchangeRates();
      },

      fetchExchangeRates: async () => {
        const { selectedCurrency } = get();
        set({ isLoadingRates: true });

        try {
          const rates = await ExchangeRateService.fetchRates(selectedCurrency.code);
          
          // Convert to our format
          const exchangeRates: Record<string, ExchangeRate> = {};
          Object.entries(rates).forEach(([toCurrency, rate]) => {
            const key = `${selectedCurrency.code}-${toCurrency}`;
            exchangeRates[key] = {
              from: selectedCurrency.code,
              to: toCurrency,
              rate: rate as number,
              lastUpdated: new Date()
            };
          });

          set({ exchangeRates, isLoadingRates: false });
        } catch (error) {
          console.error('Failed to fetch exchange rates:', error);
          set({ isLoadingRates: false });
        }
      },

      convertPrice: (amount: number, fromCurrency: string, toCurrency?: string): number => {
        const { selectedCurrency, exchangeRates } = get();
        const targetCurrency = toCurrency || selectedCurrency.code;
        
        // If same currency, return original amount
        if (fromCurrency === targetCurrency) {
          return amount;
        }

        // Look for direct conversion rate
        const directKey = `${fromCurrency}-${targetCurrency}`;
        if (exchangeRates[directKey]) {
          return amount * exchangeRates[directKey].rate;
        }

        // Look for reverse conversion rate
        const reverseKey = `${targetCurrency}-${fromCurrency}`;
        if (exchangeRates[reverseKey]) {
          return amount / exchangeRates[reverseKey].rate;
        }

        // Fallback to hardcoded rates
        const fallbackKey = `${fromCurrency}-${targetCurrency}`;
        const fallbackRate = ExchangeRateService['FALLBACK_RATES'][fallbackKey as keyof typeof ExchangeRateService['FALLBACK_RATES']];
        
        if (fallbackRate) {
          return amount * fallbackRate;
        }

        // If no rate found, return original amount
        console.warn(`No exchange rate found for ${fromCurrency} to ${targetCurrency}`);
        return amount;
      },

      formatPrice: (amount: number, currency?: Currency): string => {
        const { selectedCurrency } = get();
        const targetCurrency = currency || selectedCurrency;
        
        // Format based on currency
        const formatter = new Intl.NumberFormat('el-GR', {
          style: 'currency',
          currency: targetCurrency.code,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });

        return formatter.format(amount);
      }
    }),
    {
      name: 'dixis-currency-store',
      partialize: (state) => ({
        selectedCurrency: state.selectedCurrency,
        exchangeRates: state.exchangeRates
      })
    }
  )
);

// Hook for easy currency conversion in components
export const useCurrencyConversion = () => {
  const { convertPrice, formatPrice, selectedCurrency } = useCurrencyStore();
  
  return {
    convertPrice,
    formatPrice,
    selectedCurrency,
    convertAndFormat: (amount: number, fromCurrency: string = 'EUR') => {
      const converted = convertPrice(amount, fromCurrency);
      return formatPrice(converted);
    }
  };
};
