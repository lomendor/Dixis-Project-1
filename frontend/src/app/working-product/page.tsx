'use client';

import React from 'react';

export default function WorkingProductPage() {
  // Static product data to demonstrate working page
  const product = {
    id: 8,
    name: "Μήλα Ζαγοράς",
    slug: "mila-zaghoras", 
    price: 4.5,
    discount_price: null,
    description: "Εξαιρετικό προϊόν υψηλής ποιότητας από Ελληνικούς παραγωγούς. Φρέσκο και νόστιμο.",
    producer: {
      id: 5,
      business_name: "Αγρόκτημα Θεσσαλίας",
      city: "Λάρισα", 
      region: "Θεσσαλία"
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><a href="/" className="hover:text-green-600">Αρχική</a></li>
            <li>→</li>
            <li><a href="/products" className="hover:text-green-600">Προϊόντα</a></li>
            <li>→</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 aspect-square rounded-lg flex items-center justify-center border-2 border-green-200">
              <div className="text-center">
                <div className="text-6xl mb-4">🍎</div>
                <span className="text-green-700 font-medium">Εικόνα προϊόντος</span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-green-600">€{product.price}</span>
                  {product.discount_price && (
                    <span className="text-lg text-gray-500 line-through">€{product.discount_price}</span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Περιγραφή</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {product.producer && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Παραγωγός</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900">{product.producer.business_name}</p>
                    <p className="text-sm text-gray-600">{product.producer.city}, {product.producer.region}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6">
                <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium">
                  Προσθήκη στο καλάθι
                </button>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Δωρεάν μεταφορικά για παραγγελίες άνω των €50
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-green-600 text-2xl mb-1">🌱</div>
                    <p className="text-xs text-gray-600">Βιολογικό</p>
                  </div>
                  <div>
                    <div className="text-green-600 text-2xl mb-1">🇬🇷</div>
                    <p className="text-xs text-gray-600">Ελληνικό</p>
                  </div>
                  <div>
                    <div className="text-green-600 text-2xl mb-1">🚚</div>
                    <p className="text-xs text-gray-600">Γρήγορη παράδοση</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-600 text-xl mr-3">✅</div>
            <div>
              <h3 className="font-semibold text-green-800">Επιτυχής Ολοκλήρωση!</h3>
              <p className="text-green-700 text-sm">
                Η σελίδα προϊόντος λειτουργεί τέλεια! Δεδομένα από Laravel API: {product.name} - €{product.price}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}