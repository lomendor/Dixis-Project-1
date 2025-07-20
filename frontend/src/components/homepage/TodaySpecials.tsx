'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  producer: {
    name: string;
    location: string;
  };
  rating: number;
  reviews: number;
  discount?: number;
  isLimited?: boolean;
  stock: number;
}

export default function TodaySpecials() {
  const [timeLeft, setTimeLeft] = useState(86400); // 24 hours in seconds
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simplified special offers
  const todaySpecials: Product[] = [
    {
      id: 1,
      name: "Φρέσκες τομάτες Σαντορίνης",
      price: 4.50,
      originalPrice: 6.00,
      image: "https://images.unsplash.com/photo-1546470427-e3b68632d0df?w=400&h=300&fit=crop",
      producer: { name: "Αγρόκτημα Κυκλάδων", location: "Σαντορίνη" },
      rating: 4.8,
      reviews: 127,
      discount: 25,
      isLimited: true,
      stock: 12
    },
    {
      id: 2,
      name: "Ελαιόλαδο Εξτρα Παρθένο",
      price: 12.90,
      originalPrice: 16.00,
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop",
      producer: { name: "Ελαιώνες Καλαμάτας", location: "Καλαμάτα" },
      rating: 4.9,
      reviews: 203,
      discount: 20,
      isLimited: false,
      stock: 45
    },
    {
      id: 3,
      name: "Μέλι Θυμαρίσιο Κρήτης",
      price: 8.50,
      originalPrice: 11.00,
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop",
      producer: { name: "Μελισσοκομείο Χανίων", location: "Κρήτη" },
      rating: 4.7,
      reviews: 89,
      discount: 23,
      isLimited: true,
      stock: 8
    },
    {
      id: 4,
      name: "Φασόλια Γίγαντες Φλώρινας",
      price: 6.20,
      originalPrice: 8.50,
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop",
      producer: { name: "Όσπρια Μακεδονίας", location: "Φλώρινα" },
      rating: 4.6,
      reviews: 156,
      discount: 27,
      isLimited: false,
      stock: 32
    }
  ];

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 86400);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-red-100 rounded-full px-4 py-2 mb-6">
            <span className="text-red-600 text-sm">🔥</span>
            <span className="text-red-600 font-semibold text-sm">Προσφορές ημέρας</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Οι καλύτερες προσφορές σήμερα
          </h2>
          
          <p className="text-lg text-gray-600 mb-6">
            Ειδικές τιμές σε επιλεγμένα προϊόντα - Περιορισμένος χρόνος!
          </p>

          {/* Countdown Timer */}
          <div className="inline-flex items-center space-x-4 bg-gray-900 text-white px-6 py-3 rounded-lg">
            <span className="text-sm">⏰ Η προσφορά λήγει σε:</span>
            <span className="text-xl font-mono font-bold text-yellow-400" suppressHydrationWarning>
              {mounted ? formatTime(timeLeft) : '24:00:00'}
            </span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {todaySpecials.map((product) => (
            <div
              key={product.id}
              className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow group"
            >
              {/* Product Image */}
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Discount Badge */}
                {product.discount && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    -{product.discount}%
                  </div>
                )}
                
                {/* Limited Badge */}
                {product.isLimited && (
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
                    Περιορισμένα
                  </div>
                )}

                {/* Heart Icon */}
                <button className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
                  <span className="text-gray-600">🤍</span>
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                <div className="flex items-center text-gray-600 mb-2">
                  <span className="text-xs">📍 {product.producer.location}</span>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  από {product.producer.name}
                </div>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      €{product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        €{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock */}
                <div className="text-xs text-gray-500 mb-4">
                  {product.stock} διαθέσιμα
                </div>

                {/* Add to Cart Button */}
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2">
                  <span>🛒</span>
                  <span>Προσθήκη στο καλάθι</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/products?featured=true"
            className="inline-flex items-center bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors space-x-2"
          >
            <span>Δείτε όλες τις προσφορές</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}