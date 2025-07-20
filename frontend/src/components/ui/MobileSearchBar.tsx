'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useMobileViewport } from '@/hooks/useMobileInteractions';

interface MobileSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export default function MobileSearchBar({ 
  placeholder = "Αναζήτηση...", 
  onSearch,
  className = "" 
}: MobileSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isMobileViewport = useMobileViewport();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dixis-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        logger.error('Error loading recent searches:', toError(error), errorToContext(error));
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [
      searchQuery,
      ...recentSearches.filter(item => item !== searchQuery)
    ].slice(0, 5); // Keep only 5 recent searches
    
    setRecentSearches(updated);
    localStorage.setItem('dixis-recent-searches', JSON.stringify(updated));
  };

  // Mock suggestions - in real app, this would be an API call
  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const mockSuggestions = [
        'Ελαιόλαδο Καλαμάτας',
        'Μέλι Θυμαρίσιο',
        'Φέτα ΠΟΠ',
        'Κρασί Σαντορίνης',
        'Ελιές Καλαμών'
      ].filter(item => 
        item.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSuggestions(mockSuggestions);
      setIsLoading(false);
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
  };

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    saveRecentSearch(searchQuery);
    setIsExpanded(false);
    setQuery('');
    
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => {
      inputRef?.current?.focus();
    }, 100);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setQuery('');
    setSuggestions([]);
    inputRef?.current?.blur();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('dixis-recent-searches');
  };

  if (!isMobileViewport) {
    // Regular search bar for desktop
    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Collapsed Search Button */}
      {!isExpanded && (
        <button
          onClick={handleExpand}
          className={`mobile-btn mobile-btn-secondary flex items-center space-x-2 w-full ${className}`}
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          <span className="text-gray-500">{placeholder}</span>
        </button>
      )}

      {/* Expanded Search Overlay */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-white mobile-safe-area">
          {/* Search Header */}
          <div className="mobile-drawer-header flex items-center space-x-3">
            <button
              onClick={handleCollapse}
              className="mobile-btn-icon text-gray-400 hover:text-gray-600 touch-feedback"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="mobile-input w-full pl-10 pr-4"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
            
            {query && (
              <button
                onClick={() => setQuery('')}
                className="mobile-btn-icon text-gray-400 hover:text-gray-600 touch-feedback"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Search Content */}
          <div className="mobile-drawer-content">
            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
              </div>
            )}

            {/* Suggestions */}
            {!isLoading && suggestions.length > 0 && (
              <div className="mb-6">
                <h3 className="mobile-label mb-3">Προτάσεις</h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="mobile-nav-item w-full flex items-center space-x-3 text-left touch-feedback"
                    >
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                      <span className="flex-1">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {!isLoading && !query && recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="mobile-label">Πρόσφατες αναζητήσεις</h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-sm text-gray-500 hover:text-gray-700 touch-feedback"
                  >
                    Καθαρισμός
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="mobile-nav-item w-full flex items-center space-x-3 text-left touch-feedback"
                    >
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                      <span className="flex-1">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !query && recentSearches.length === 0 && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ξεκινήστε την αναζήτηση
                </h3>
                <p className="text-gray-500">
                  Αναζητήστε προϊόντα, παραγωγούς ή κατηγορίες
                </p>
              </div>
            )}

            {/* No Results */}
            {!isLoading && query && suggestions.length === 0 && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Δεν βρέθηκαν προτάσεις
                </h3>
                <p className="text-gray-500 mb-4">
                  Δοκιμάστε διαφορετικούς όρους αναζήτησης
                </p>
                <button
                  onClick={() => handleSearch()}
                  className="mobile-btn mobile-btn-primary"
                >
                  Αναζήτηση για "{query}"
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
