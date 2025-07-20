'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

// 10 simplified categories - SAFE approach
const SIMPLIFIED_CATEGORIES = [
  { id: '', name: 'Όλες οι Κατηγορίες', emoji: '🏪' },
  { id: 'elaiolado-elies', name: 'Ελαιόλαδο & Ελιές', emoji: '🫒' },
  { id: 'meli-proionta-meliou', name: 'Μέλι & Προϊόντα Μελιού', emoji: '🍯' },
  { id: 'tiria-galaktokomika', name: 'Τυριά & Γαλακτοκομικά', emoji: '🧀' },
  { id: 'ospria', name: 'Όσπρια', emoji: '🫘' },
  { id: 'zimarika-dimitriaka', name: 'Ζυμαρικά & Δημητριακά', emoji: '🍝' },
  { id: 'pota', name: 'Ποτά', emoji: '🍷' },
  { id: 'ksiri-karpi-apoksiramena', name: 'Ξηροί Καρποί & Αποξηραμένα', emoji: '🥜' },
  { id: 'mpakharika-botana', name: 'Μπαχαρικά & Βότανα', emoji: '🌿' },
  { id: 'glika-aleimmata', name: 'Γλυκά & Αλείμματα', emoji: '🍯' },
  { id: 'kallintika-peripiisi', name: 'Καλλυντικά & Περιποίηση', emoji: '🧴' },
];

export default function CategoryFilter({ selectedCategory, onCategoryChange, className = '' }: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCategoryData = SIMPLIFIED_CATEGORIES.find(cat => cat.id === selectedCategory) || SIMPLIFIED_CATEGORIES[0];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left shadow-sm hover:border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{selectedCategoryData.emoji}</span>
            <span className="font-medium text-gray-900">{selectedCategoryData.name}</span>
          </div>
          <ChevronDownIcon 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {SIMPLIFIED_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                onCategoryChange(category.id);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                selectedCategory === category.id ? 'bg-green-50 text-green-700' : 'text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{category.emoji}</span>
                <span className="font-medium">{category.name}</span>
                {selectedCategory === category.id && (
                  <span className="ml-auto text-green-600">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}