'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon, FireIcon, SparklesIcon, MicrophoneIcon } from '@heroicons/react/24/outline';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'suggestion' | 'category' | 'producer';
  count?: number;
  icon?: string;
}

interface SmartProductSearchProps {
  onSearch: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  className?: string;
  showVoiceSearch?: boolean;
}

// Smart Greek search suggestions based on AI analysis
const TRENDING_SEARCHES: SearchSuggestion[] = [
  { id: 't1', text: 'Καλαμάτα ελιές', type: 'trending', count: 156, icon: '🫒' },
  { id: 't2', text: 'Κρητικό τυρί', type: 'trending', count: 89, icon: '🧀' },
  { id: 't3', text: 'Μέλι θυμάρι', type: 'trending', count: 67, icon: '🍯' },
  { id: 't4', text: 'Βιολογικό ελαιόλαδο', type: 'trending', count: 234, icon: '🫒' },
  { id: 't5', text: 'Μαστίχα Χίου', type: 'trending', count: 43, icon: '🌿' }
];

const CATEGORY_SUGGESTIONS: SearchSuggestion[] = [
  { id: 'c1', text: 'Ελαιόλαδο & Ελιές', type: 'category', icon: '🫒' },
  { id: 'c2', text: 'Τυριά & Γαλακτοκομικά', type: 'category', icon: '🧀' },
  { id: 'c3', text: 'Μέλι & Γλυκά', type: 'category', icon: '🍯' },
  { id: 'c4', text: 'Κρασιά & Ποτά', type: 'category', icon: '🍷' },
  { id: 'c5', text: 'Παραδοσιακά Προϊόντα', type: 'category', icon: '🏛️' },
  { id: 'c6', text: 'Βότανα & Μπαχαρικά', type: 'category', icon: '🌿' }
];

const SMART_SUGGESTIONS: SearchSuggestion[] = [
  { id: 's1', text: 'ΠΟΠ προϊόντα', type: 'suggestion', icon: '🏆' },
  { id: 's2', text: 'Νησιώτικες ειδικότητες', type: 'suggestion', icon: '🏝️' },
  { id: 's3', text: 'Μοναστηριακά προϊόντα', type: 'suggestion', icon: '⛪' },
  { id: 's4', text: 'Παραδοσιακά γλυκά', type: 'suggestion', icon: '🧁' },
  { id: 's5', text: 'Αγιορείτικα προϊόντα', type: 'suggestion', icon: '🕊️' }
];

export default function SmartProductSearch({
  onSearch,
  onSuggestionSelect,
  placeholder = 'Αναζήτηση προϊόντων με AI...',
  className = '',
  showVoiceSearch = true
}: SmartProductSearchProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<SearchSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('dixis-recent-searches');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentSearches(parsed.slice(0, 5)); // Keep only last 5 searches
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }
  }, []);

  // Generate smart suggestions based on query
  useEffect(() => {
    if (query.length > 1) {
      // AI-powered suggestions (simulated for now, will integrate with backend AI)
      const suggestions = generateSmartSuggestions(query);
      setSmartSuggestions(suggestions);
    } else {
      setSmartSuggestions([]);
    }
  }, [query]);

  // Handle input changes
  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(true);
    
    // Trigger search with debouncing
    const timeoutId = setTimeout(() => {
      if (value.trim()) {
        onSearch(value);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Handle search submission
  const handleSubmit = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      // Add to recent searches
      const newSearch: SearchSuggestion = {
        id: `recent-${Date.now()}`,
        text: searchQuery.trim(),
        type: 'recent'
      };
      
      const updatedRecent = [newSearch, ...recentSearches.filter(s => s.text !== searchQuery.trim())].slice(0, 5);
      setRecentSearches(updatedRecent);
      localStorage.setItem('dixis-recent-searches', JSON.stringify(updatedRecent));
      
      onSearch(searchQuery);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSubmit(suggestion.text);
    onSuggestionSelect?.(suggestion);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    onSearch('');
  };

  // Voice search functionality (Web Speech API)
  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'el-GR'; // Greek language
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsVoiceActive(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSubmit(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        setIsVoiceActive(false);
      };

      recognition.onend = () => {
        setIsVoiceActive(false);
      };

      recognition.start();
    } else {
      alert('Η φωνητική αναζήτηση δεν υποστηρίζεται σε αυτόν τον περιηγητή.');
    }
  };

  // Generate smart suggestions based on query (AI simulation)
  const generateSmartSuggestions = (query: string): SearchSuggestion[] => {
    const lowercaseQuery = query.toLowerCase();
    const suggestions: SearchSuggestion[] = [];

    // Search in trending items
    TRENDING_SEARCHES.forEach(item => {
      if (item.text.toLowerCase().includes(lowercaseQuery)) {
        suggestions.push(item);
      }
    });

    // Search in categories
    CATEGORY_SUGGESTIONS.forEach(item => {
      if (item.text.toLowerCase().includes(lowercaseQuery)) {
        suggestions.push(item);
      }
    });

    // Add smart contextual suggestions
    if (lowercaseQuery.includes('βιολογικ')) {
      suggestions.push({ id: 'bio1', text: 'βιολογικά προϊόντα με πιστοποίηση', type: 'suggestion', icon: '🌱' });
    }
    
    if (lowercaseQuery.includes('παραδοσιακ')) {
      suggestions.push({ id: 'trad1', text: 'παραδοσιακά ελληνικά εδέσματα', type: 'suggestion', icon: '🏛️' });
    }

    if (lowercaseQuery.includes('μέλι')) {
      suggestions.push({ id: 'honey1', text: 'θυμαρίσιο μέλι Ελλάδας', type: 'suggestion', icon: '🍯' });
    }

    return suggestions.slice(0, 8); // Limit to 8 suggestions
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allSuggestions = query.length > 1 ? smartSuggestions : 
    [...recentSearches, ...TRENDING_SEARCHES, ...SMART_SUGGESTIONS];

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            }
            if (e.key === 'Escape') {
              setShowSuggestions(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-20 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-white shadow-sm"
        />
        
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400" />
            </button>
          )}
          
          {showVoiceSearch && (
            <button
              onClick={startVoiceSearch}
              className={`p-2 rounded-full transition-all duration-200 ${
                isVoiceActive 
                  ? 'bg-red-100 text-red-600 animate-pulse' 
                  : 'hover:bg-green-100 text-green-600'
              }`}
              title="Φωνητική αναζήτηση"
            >
              <MicrophoneIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto"
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && query.length <= 1 && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                <ClockIcon className="h-4 w-4 mr-2" />
                Πρόσφατες Αναζητήσεις
              </h3>
              {recentSearches.map(suggestion => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-gray-700">{suggestion.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {query.length <= 1 && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                <FireIcon className="h-4 w-4 mr-2" />
                Δημοφιλείς Αναζητήσεις
              </h3>
              {TRENDING_SEARCHES.slice(0, 5).map(suggestion => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex items-center justify-between w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="flex items-center text-gray-700">
                    <span className="mr-2">{suggestion.icon}</span>
                    {suggestion.text}
                  </span>
                  {suggestion.count && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      {suggestion.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Smart Suggestions */}
          {smartSuggestions.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                <SparklesIcon className="h-4 w-4 mr-2" />
                Έξυπνες Προτάσεις
              </h3>
              {smartSuggestions.map(suggestion => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex items-center w-full text-left px-3 py-2 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <span className="mr-2">{suggestion.icon}</span>
                  <span className="text-gray-700">{suggestion.text}</span>
                  {suggestion.type === 'suggestion' && (
                    <SparklesIcon className="h-4 w-4 ml-auto text-green-500" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Categories */}
          {query.length <= 1 && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Κατηγορίες</h3>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_SUGGESTIONS.map(suggestion => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors text-left"
                  >
                    <span className="mr-2">{suggestion.icon}</span>
                    <span className="text-sm text-gray-700">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {allSuggestions.length === 0 && query.length > 1 && (
            <div className="p-4 text-center text-gray-500">
              <p>Δεν βρέθηκαν προτάσεις για "{query}"</p>
              <p className="text-sm mt-1">Δοκιμάστε διαφορετικές λέξεις-κλειδιά</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}