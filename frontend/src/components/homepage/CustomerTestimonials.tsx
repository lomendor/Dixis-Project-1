'use client';

import { useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  comment: string;
  productBought: string;
  purchaseDate: string;
  isVerified: boolean;
}

export default function CustomerTestimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Μαρία Παπαδοπούλου",
      location: "Αθήνα, Κολωνάκι",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b8e5?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      comment: "Απίστευτη ποιότητα! Οι ντομάτες από τη Σαντορίνη είχαν γεύση που δεν είχα δοκιμάσει χρόνια. Η παράδοση έγινε την επόμενη μέρα και τα προϊόντα ήταν φρεσκότατα.",
      productBought: "Ντομάτες Σαντορίνης",
      purchaseDate: "2 ημέρες πριν",
      isVerified: true
    },
    {
      id: 2,
      name: "Γιάννης Κοντός",
      location: "Θεσσαλονίκη",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      comment: "Η φέτα από την Ήπειρο είναι κάτι το ξεχωριστό! Νιώθεις την αυθεντικότητα σε κάθε μπουκιά. Συνεχίστε έτσι!",
      productBought: "Φέτα ΠΟΠ Ήπειρος",
      purchaseDate: "1 εβδομάδα πριν",
      isVerified: true
    },
    {
      id: 3,
      name: "Ελένη Δημητρίου",
      location: "Πάτρα",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      comment: "Το ελαιόλαδο είναι καταπληκτικό! Η γεύση είναι πλούσια και αισθάνεσαι ότι αγοράζεις κάτι πραγματικά αυθεντικό. Θα συνεχίσω να παραγγέλνω!",
      productBought: "Ελαιόλαδο Εξτρα Παρθένο",
      purchaseDate: "3 ημέρες πριν",
      isVerified: true
    },
    {
      id: 4,
      name: "Νίκος Μαυρογιάννης",
      location: "Αθήνα, Γλυφάδα",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      comment: "Επιτέλους μπορώ να αγοράσω φρέσκα προϊόντα με εμπιστοσύνη! Η εξυπηρέτηση είναι άψογη και οι τιμές δίκαιες.",
      productBought: "Μέλι Ελάτου",
      purchaseDate: "5 ημέρες πριν",
      isVerified: true
    },
    {
      id: 5,
      name: "Άννα Λεβέντη",
      location: "Αθήνα, Κηφισιά",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      comment: "Η πιο εύκολη και αξιόπιστη αγορά που έχω κάνει online! Τα προϊόντα ήρθαν γρήγορα και η ποιότητα ξεπέρασε τις προσδοκίες μου.",
      productBought: "Μικτό πακέτο προϊόντων",
      purchaseDate: "1 εβδομάδα πριν",
      isVerified: true
    }
  ];

  useEffect(() => {
    if (isAutoPlay) {
      const interval = setInterval(() => {
        setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentReview = testimonials[currentTestimonial];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-6 py-3 mb-6">
            <span className="text-blue-600 text-lg">💬</span>
            <span className="text-blue-700 font-semibold">Κριτικές πελατών</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Τι λένε οι πελάτες μας
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Πάνω από 10,000 ικανοποιημένοι πελάτες εμπιστεύονται το Dixis για την καθημερινή τους διατροφή
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
              <div className="text-9xl text-gray-300">"</div>
            </div>
            
            {/* Rating */}
            <div className="flex items-center mb-6">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-2xl ${
                    i < currentReview.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ⭐
                </span>
              ))}
            </div>
            
            {/* Comment */}
            <blockquote className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 relative z-10">
              "{currentReview.comment}"
            </blockquote>
            
            {/* Product Info */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-8">
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">📦 Προϊόν:</span> {currentReview.productBought}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">📅 Αγορά:</span> {currentReview.purchaseDate}
              </div>
            </div>
            
            {/* Customer Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={currentReview.avatar}
                  alt={currentReview.name}
                  className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-blue-200"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900">{currentReview.name}</h4>
                    {currentReview.isVerified && (
                      <span className="text-blue-500" title="Επαληθευμένος αγοραστής">✅</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">📍 {currentReview.location}</p>
                </div>
              </div>
              
              {/* Navigation */}
              <div className="flex space-x-2">
                <button
                  onClick={prevTestimonial}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 p-2 rounded-full transition-colors duration-200"
                >
                  <span className="text-xl">←</span>
                </button>
                <button
                  onClick={nextTestimonial}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 p-2 rounded-full transition-colors duration-200"
                >
                  <span className="text-xl">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Dots */}
        <div className="flex justify-center space-x-3 mb-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentTestimonial
                  ? 'bg-blue-500 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Auto-play Control */}
        <div className="text-center mb-16">
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isAutoPlay
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            suppressHydrationWarning
          >
            <div className={`w-2 h-2 rounded-full ${isAutoPlay ? 'bg-blue-500' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium" suppressHydrationWarning>
              {mounted ? (isAutoPlay ? 'Αυτόματη εναλλαγή' : 'Χειροκίνητη εναλλαγή') : 'Αυτόματη εναλλαγή'}
            </span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-gray-200">
          <div className="text-center group">
            <div className="text-3xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">10,000+</div>
            <div className="text-gray-600">Ικανοποιημένοι πελάτες</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">4.8/5</div>
            <div className="text-gray-600">Μέση αξιολόγηση</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">98%</div>
            <div className="text-gray-600">Θετικές κριτικές</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">24h</div>
            <div className="text-gray-600">Μέσος χρόνος παράδοσης</div>
          </div>
        </div>
      </div>
    </section>
  );
}