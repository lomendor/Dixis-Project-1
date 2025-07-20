'use client';

import React, { useState } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { useCurrencyStore, Currency } from '@/stores/currencyStore';

interface CurrencySelectorProps {
  className?: string;
  variant?: 'header' | 'inline' | 'mobile';
  showFlag?: boolean;
  showName?: boolean;
}

export default function CurrencySelector({ 
  className = '',
  variant = 'header',
  showFlag = true,
  showName = false
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { 
    selectedCurrency, 
    availableCurrencies, 
    setSelectedCurrency,
    isLoadingRates 
  } = useCurrencyStore();

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    setIsOpen(false);
  };

  // Variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'header':
        return {
          button: 'flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200',
          dropdown: 'absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50',
          item: 'flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer'
        };
      case 'mobile':
        return {
          button: 'flex items-center space-x-2 px-4 py-3 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all duration-200',
          dropdown: 'absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50',
          item: 'flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer'
        };
      default: // inline
        return {
          button: 'flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200',
          dropdown: 'absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50',
          item: 'flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`relative ${className}`}>
      {/* Currency Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.button}
        disabled={isLoadingRates}
      >
        {/* Loading indicator */}
        {isLoadingRates && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        
        {/* Globe icon for mobile/compact view */}
        {!showFlag && !isLoadingRates && (
          <Globe className="w-4 h-4" />
        )}
        
        {/* Flag */}
        {showFlag && !isLoadingRates && (
          <span className="text-lg">{selectedCurrency.flag}</span>
        )}
        
        {/* Currency code */}
        <span className="font-medium text-sm">
          {selectedCurrency.code}
        </span>
        
        {/* Currency name (optional) */}
        {showName && (
          <span className="hidden sm:inline text-sm opacity-75">
            {selectedCurrency.name}
          </span>
        )}
        
        {/* Dropdown arrow */}
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className={styles.dropdown}>
            <div className="py-2">
              {/* Header */}
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Globe className="w-4 h-4" />
                  <span>Επιλέξτε Νόμισμα</span>
                </div>
              </div>
              
              {/* Currency Options */}
              {availableCurrencies.map((currency) => (
                <div
                  key={currency.code}
                  onClick={() => handleCurrencySelect(currency)}
                  className={styles.item}
                >
                  {/* Flag */}
                  <span className="text-lg">{currency.flag}</span>
                  
                  {/* Currency Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {currency.code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {currency.name}
                        </div>
                      </div>
                      
                      {/* Symbol */}
                      <div className="text-lg font-bold text-gray-600">
                        {currency.symbol}
                      </div>
                    </div>
                  </div>
                  
                  {/* Selected indicator */}
                  {selectedCurrency.code === currency.code && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </div>
              ))}
              
              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Οι τιμές ενημερώνονται σε πραγματικό χρόνο
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Specialized variants for common use cases
export function HeaderCurrencySelector({ className }: { className?: string }) {
  return (
    <CurrencySelector 
      variant="header" 
      showFlag={true}
      className={className}
    />
  );
}

export function MobileCurrencySelector({ className }: { className?: string }) {
  return (
    <CurrencySelector 
      variant="mobile" 
      showFlag={true}
      showName={false}
      className={className}
    />
  );
}

export function InlineCurrencySelector({ 
  className,
  showName = false 
}: { 
  className?: string;
  showName?: boolean;
}) {
  return (
    <CurrencySelector 
      variant="inline" 
      showFlag={true}
      showName={showName}
      className={className}
    />
  );
}
