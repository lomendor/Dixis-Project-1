'use client';

import { logger } from '@/lib/logging/productionLogger';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalSearch } from '@/lib/api/services/search/useGlobalSearch';
import { 
  SearchKeyboardManager, 
  trackSearchAnalytics, 
  createHighlightedText 
} from '@/lib/utils/searchUtils';

interface SearchBarProps {
  placeholder?: string;
  showSuggestions?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

// Smart search utilities
const RECENT_SEARCHES_KEY = 'dixis_recent_searches';
const MAX_RECENT_SEARCHES = 5;

const getRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentSearch = (query: string) => {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    const recent = getRecentSearches();
    const updated = [query, ...recent.filter(q => q !== query)].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
};

// Popular searches fallback
const POPULAR_SEARCHES = [
  'ελαιόλαδο',
  'μέλι',
  'τυρί',
  'κρασί',
  'φέτα',
  'βιολογικά προϊόντα',
  'κρητικά προϊόντα',
  'θυμαρίσιο μέλι'
];

export default function SearchBar({
  placeholder = "Αναζήτηση προϊόντων, παραγωγών...",
  showSuggestions = true,
  onSearch,
  className = "",
  onFocus,
  onBlur
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const keyboardManager = useRef<SearchKeyboardManager | null>(null);

  // Debounce search query for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Load recent searches and setup keyboard shortcuts
  useEffect(() => {
    setRecentSearches(getRecentSearches());
    
    // Initialize keyboard manager
    keyboardManager.current = new SearchKeyboardManager();
    
    // Add search focus shortcut (/)
    keyboardManager.current.addShortcut('/', false, (event) => {
      event.preventDefault();
      inputRef?.current?.focus();
      setShowDropdown(true);
    });
    
    // Add toggle filters shortcut (Ctrl+F)
    keyboardManager.current.addShortcut('f', true, (event) => {
      event.preventDefault();
      // This would trigger filter toggle in parent component
      logger.info('Toggle filters shortcut pressed');
    });
    
    return () => {
      keyboardManager?.current?.destroy();
    };
  }, []);

  // Only call search hook when we have a debounced query
  const shouldSearch = debouncedQuery.length >= 2 && showDropdown;
  const { results, isLoading } = useGlobalSearch({
    query: shouldSearch ? debouncedQuery : undefined
  });

  // Smart suggestions logic
  const getSuggestions = useCallback(() => {
    if (query.length < 2) {
      // Show recent searches or popular searches when no query
      return recentSearches.length > 0 ? recentSearches : POPULAR_SEARCHES.slice(0, 5);
    }
    
    // Show API suggestions if available, fallback to filtered popular searches
    const apiSuggestions = results?.suggestions || [];
    if (apiSuggestions.length > 0) {
      return apiSuggestions;
    }
    
    // Fallback: filter popular searches
    return POPULAR_SEARCHES.filter(search => 
      search.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }, [query, results?.suggestions, recentSearches]);

  const suggestions = getSuggestions();
  const quickResults = {
    products: results?.products.slice(0, 3) || [],
    producers: results?.producers.slice(0, 2) || []
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef?.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setShowDropdown(value.length >= 2);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    const totalItems = suggestions.length + quickResults.products.length + quickResults.producers.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectItem(selectedIndex);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef?.current?.blur();
        break;
    }
  };

  const handleSelectItem = (index: number) => {
    let currentIndex = 0;

    // Check suggestions
    if (index < suggestions.length) {
      const suggestion = suggestions[index];
      setQuery(suggestion);
      setShowDropdown(false);
      performSearch(suggestion);
      return;
    }
    currentIndex += suggestions.length;

    // Check products
    if (index < currentIndex + quickResults.products.length) {
      const productIndex = index - currentIndex;
      const product = quickResults.products[productIndex];
      handleProductClick(product.slug, product.name);
      return;
    }
    currentIndex += quickResults.products.length;

    // Check producers
    if (index < currentIndex + quickResults.producers.length) {
      const producerIndex = index - currentIndex;
      const producer = quickResults.producers[producerIndex];
      handleProducerClick(producer.slug, producer.business_name);
      return;
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      performSearch(query.trim());
    }
  };

  const performSearch = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    
    // Track search analytics
    trackSearchAnalytics({
      query: trimmedQuery,
      resultsCount: results?.totalProducts || 0,
      timestamp: Date.now(),
      filters: results ? {
        hasProducts: results.totalProducts > 0,
        hasProducers: results.totalProducers > 0
      } : undefined
    });
    
    // Save to recent searches
    saveRecentSearch(trimmedQuery);
    setRecentSearches(getRecentSearches());
    
    setShowDropdown(false);
    setSelectedIndex(-1);
    
    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion);
  };

  const handleProductClick = (productSlug: string, productName: string) => {
    // Track click analytics
    trackSearchAnalytics({
      query: query,
      resultsCount: results?.totalProducts || 0,
      clickedResult: `product:${productName}`,
      timestamp: Date.now()
    });
    
    router.push(`/products/${productSlug}`);
    setShowDropdown(false);
  };

  const handleProducerClick = (producerSlug: string, producerName: string) => {
    // Track click analytics
    trackSearchAnalytics({
      query: query,
      resultsCount: results?.totalProducers || 0,
      clickedResult: `producer:${producerName}`,
      timestamp: Date.now()
    });
    
    router.push(`/producers/${producerSlug}`);
    setShowDropdown(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            query.length >= 2 && setShowDropdown(true);
            onFocus?.();
          }}
          onBlur={() => {
            onBlur?.();
          }}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 pr-20 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px] touch-manipulation"
          style={{ fontSize: '16px', WebkitTapHighlightColor: 'transparent' }}
        />

        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        {/* Keyboard shortcut indicator */}
        {!showDropdown && !query && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-12">
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded">
              /
            </kbd>
          </div>
        )}

        <button
          onClick={handleSearch}
          className="absolute inset-y-0 right-0 flex items-center pr-3"
        >
          <svg className="w-5 h-5 text-gray-400 hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
          </svg>
        </button>
      </div>

      {/* Search Dropdown */}
      {showDropdown && showSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Smart Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2 flex items-center space-x-2">
                {query.length < 2 ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{recentSearches.length > 0 ? 'Πρόσφατες αναζητήσεις' : 'Δημοφιλείς αναζητήσεις'}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Προτάσεις</span>
                  </>
                )}
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`mobile-btn touch-feedback w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedIndex === index ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {query.length < 2 && recentSearches.includes(suggestion) ? (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                    <span className="mobile-body lg:text-sm">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick Results - Products */}
          {quickResults.products.length > 0 && (
            <div className="border-t border-gray-100 p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                Προϊόντα
              </div>
              {quickResults.products.map((product, index) => {
                const globalIndex = suggestions.length + index;
                return (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.slug, product.name)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedIndex === globalIndex ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div 
                          className="text-sm font-medium text-gray-900 truncate"
                          dangerouslySetInnerHTML={createHighlightedText(product.name, query)}
                        />
                        <div className="text-xs text-gray-500">€{product.price}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Results - Producers */}
          {quickResults.producers.length > 0 && (
            <div className="border-t border-gray-100 p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                Παραγωγοί
              </div>
              {quickResults.producers.map((producer, index) => {
                const globalIndex = suggestions.length + quickResults.products.length + index;
                return (
                  <button
                    key={producer.id}
                    onClick={() => handleProducerClick(producer.slug, producer.business_name)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedIndex === globalIndex ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0">
                        <img
                          src={producer.profile_image || '/placeholder-producer.jpg'}
                          alt={producer.business_name}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-producer.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div 
                          className="text-sm font-medium text-gray-900 truncate"
                          dangerouslySetInnerHTML={createHighlightedText(producer.business_name, query)}
                        />
                        <div 
                          className="text-xs text-gray-500"
                          dangerouslySetInnerHTML={createHighlightedText(producer.location || '', query)}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && !isLoading && suggestions.length === 0 && quickResults.products.length === 0 && quickResults.producers.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <div className="text-sm">Δεν βρέθηκαν αποτελέσματα για "{query}"</div>
              <div className="text-xs mt-1">Δοκιμάστε διαφορετικούς όρους αναζήτησης</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
