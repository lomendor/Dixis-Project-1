'use client';

import React, { useEffect, useState } from 'react';

export default function TestProductPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product...');
        const response = await fetch('http://localhost:8000/api/v1/products/slug/mila-zaghoras', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Result:', result);
        
        if (result.status === 'success' && result.data) {
          setProduct(result.data);
          console.log('Product set:', result.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Φόρτωση προϊόντος...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Σφάλμα</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Προϊόν δεν βρέθηκε</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="bg-gray-200 aspect-square rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Εικόνα προϊόντος</span>
            </div>
          </div>
          <div>
            <div className="space-y-4">
              <div>
                <span className="text-3xl font-bold text-green-600">€{product.price}</span>
                {product.discount_price && (
                  <span className="ml-2 text-lg text-gray-500 line-through">€{product.discount_price}</span>
                )}
              </div>
              <p className="text-gray-600">{product.description}</p>
              {product.producer && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900">Παραγωγός</h3>
                  <p className="text-gray-600">{product.producer.business_name}</p>
                  <p className="text-sm text-gray-500">{product.producer.city}, {product.producer.region}</p>
                </div>
              )}
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
                Προσθήκη στο καλάθι
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}