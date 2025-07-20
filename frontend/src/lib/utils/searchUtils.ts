'use client';

import { logger } from '@/lib/logging/productionLogger';

// Keyboard shortcuts for search
export const SEARCH_SHORTCUTS = {
  FOCUS_SEARCH: { key: '/', ctrlKey: false, description: 'Focus search bar' },
  CLEAR_SEARCH: { key: 'Escape', ctrlKey: false, description: 'Clear search' },
  TOGGLE_FILTERS: { key: 'f', ctrlKey: true, description: 'Toggle filters' },
  NEXT_RESULT: { key: 'ArrowDown', ctrlKey: false, description: 'Next result' },
  PREV_RESULT: { key: 'ArrowUp', ctrlKey: false, description: 'Previous result' },
} as const;

// Text highlighting utility
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm || !text) return text;
  
  const normalizedSearchTerm = searchTerm
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
    
  const normalizedText = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
    
  const regex = new RegExp(`(${normalizedSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  
  return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>');
};

// Search analytics tracking
export interface SearchAnalytics {
  query: string;
  resultsCount: number;
  clickedResult?: string;
  timestamp: number;
  filters?: Record<string, any>;
}

const SEARCH_ANALYTICS_KEY = 'dixis_search_analytics';

export const trackSearchAnalytics = (analytics: SearchAnalytics) => {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(SEARCH_ANALYTICS_KEY);
    const history: SearchAnalytics[] = stored ? JSON.parse(stored) : [];
    
    // Keep only last 50 searches
    const updated = [analytics, ...history].slice(0, 50);
    localStorage.setItem(SEARCH_ANALYTICS_KEY, JSON.stringify(updated));
  } catch (error) {
    logger.warn('Failed to track search analytics:', error);
  }
};

export const getSearchAnalytics = (): SearchAnalytics[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(SEARCH_ANALYTICS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Popular search queries based on analytics
export const getPopularQueries = (limit = 5): string[] => {
  const analytics = getSearchAnalytics();
  const queryCount = new Map<string, number>();
  
  analytics.forEach(({ query }) => {
    if (query.length >= 2) {
      queryCount.set(query, (queryCount.get(query) || 0) + 1);
    }
  });
  
  return Array.from(queryCount.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([query]) => query);
};

// Search performance metrics
export interface SearchMetrics {
  averageResponseTime: number;
  totalSearches: number;
  popularQueries: string[];
  noResultsQueries: string[];
  clickThroughRate: number;
}

export const getSearchMetrics = (): SearchMetrics => {
  const analytics = getSearchAnalytics();
  
  const totalSearches = analytics.length;
  const clickedSearches = analytics.filter(a => a.clickedResult).length;
  const noResultsQueries = analytics
    .filter(a => a.resultsCount === 0)
    .map(a => a.query);
    
  return {
    averageResponseTime: 0, // Would need to track this
    totalSearches,
    popularQueries: getPopularQueries(),
    noResultsQueries: [...new Set(noResultsQueries)].slice(0, 10),
    clickThroughRate: totalSearches > 0 ? (clickedSearches / totalSearches) * 100 : 0
  };
};

// Keyboard shortcut manager
export class SearchKeyboardManager {
  private listeners: Map<string, (event: KeyboardEvent) => void> = new Map();
  
  constructor() {
    if (typeof window !== 'undefined') {
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
  }
  
  private handleKeyDown(event: KeyboardEvent) {
    // Don't trigger shortcuts when typing in form elements
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as any)?.contentEditable === 'true'
    ) {
      // Exception: Allow Escape to blur focus
      if (event.key === 'Escape') {
        (event.target as HTMLElement).blur();
      }
      return;
    }
    
    const shortcutKey = this.getShortcutKey(event);
    const listener = this.listeners.get(shortcutKey);
    
    if (listener) {
      event.preventDefault();
      event.stopPropagation();
      listener(event);
    }
  }
  
  private getShortcutKey(event: KeyboardEvent): string {
    const parts = [];
    if (event.ctrlKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    parts.push(event.key);
    return parts.join('+');
  }
  
  addShortcut(key: string, ctrlKey: boolean, callback: (event: KeyboardEvent) => void) {
    const shortcutKey = ctrlKey ? `ctrl+${key}` : key;
    this.listeners.set(shortcutKey, callback);
  }
  
  removeShortcut(key: string, ctrlKey: boolean) {
    const shortcutKey = ctrlKey ? `ctrl+${key}` : key;
    this.listeners.delete(shortcutKey);
  }
  
  destroy() {
    if (typeof window !== 'undefined') {
      document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }
    this.listeners.clear();
  }
}

// Search result highlighting helper
export const createHighlightedText = (text: string, highlight: string) => {
  if (!highlight) {
    return { __html: text };
  }
  
  const highlightedHTML = highlightSearchTerm(text, highlight);
  return { __html: highlightedHTML };
};