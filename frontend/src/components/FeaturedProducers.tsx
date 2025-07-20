'use client';

import React from 'react';
import Link from 'next/link';
import { ProducerImage } from '@/components/ui/OptimizedImage';
import { useEnhancedProducers } from '@/lib/api/services/producer/useProducersEnhanced';
import { ProducersGridLoading } from '@/components/ui/LoadingStates';

export default function FeaturedProducers() {
  const { producers, isLoading, isError } = useEnhancedProducers({ 
    verification_status: 'verified' 
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Προτεινόμενοι Παραγωγοί
          </h2>
          <ProducersGridLoading />
        </div>
      </section>
    );
  }

  if (isError || !producers || producers.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Προτεινόμενοι Παραγωγοί
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Γνωρίστε τους αυθεντικούς Έλληνες παραγωγούς και τις ιστορίες τους
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {producers.slice(0, 6).map((producer) => (
            <Link 
              key={producer.id} 
              href={`/producers/${producer.slug}`}
              className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Producer Image */}
              {producer.profile_image && (
                <div className="h-48 relative overflow-hidden">
                  <ProducerImage
                    src={producer.profile_image}
                    alt={producer.business_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Producer Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {producer.business_name}
                    </h3>
                    
                    {producer.location && (
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span className="mr-2">📍</span>
                        <span>{producer.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {producer.verification_status === 'verified' && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Επιβεβαιωμένος
                      </span>
                    </div>
                  )}
                </div>

                {producer.bio && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {producer.bio}
                  </p>
                )}

                {/* Specialties */}
                {producer.specialties && producer.specialties.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {producer.specialties.slice(0, 3).map((specialty, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {specialty}
                        </span>
                      ))}
                      {producer.specialties.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{producer.specialties.length - 3} ακόμα
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <span className="mr-1">📦</span>
                    <span>{producer.total_products || 0} προϊόντα</span>
                  </div>
                  {producer.rating && (
                    <div className="flex items-center">
                      <span className="mr-1">⭐</span>
                      <span>{producer.rating}</span>
                    </div>
                  )}
                </div>

                {/* Call to Action */}
                <div className="pt-2 border-t border-gray-100">
                  <span className="inline-flex items-center text-green-600 text-sm font-medium group-hover:text-green-700">
                    Δείτε τα Προϊόντα
                    <svg className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/producers"
            className="inline-flex items-center px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Δείτε Όλους τους Παραγωγούς
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}