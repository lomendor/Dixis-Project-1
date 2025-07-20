'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Producer {
  id: number;
  business_name: string;
  location: string;
  bio: string;
  verification_status: string;
  total_products: number;
}

export default function FarmerStories() {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducers() {
      try {
        console.log('🔄 Fetching producers...');
        const response = await fetch('/api/producers?per_page=4');
        console.log('📡 Producers response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('📦 Producers data received:', data);

          if (data.success && Array.isArray(data.data)) {
            console.log('✅ Setting producers:', data.data.length, 'items');
            setProducers(data.data.slice(0, 4));
          } else {
            console.warn('⚠️ Invalid producers data structure, using fallback');
            setProducers([
              { id: 1, business_name: 'Ελαιώνες Καλαμάτας', location: 'Καλαμάτα', bio: 'Παραγωγή εξαιρετικού παρθένου ελαιόλαδου', verification_status: 'verified', total_products: 15 },
              { id: 2, business_name: 'Αμπελώνες Νεμέας', location: 'Νεμέα', bio: 'Παραγωγή εκλεκτών κρασιών', verification_status: 'verified', total_products: 8 },
              { id: 3, business_name: 'Μελισσοκομείο Χαλκιδικής', location: 'Χαλκιδική', bio: 'Παραγωγή εξαιρετικού μελιού', verification_status: 'verified', total_products: 12 },
              { id: 4, business_name: 'Φάρμα Βιολογικών Λαχανικών', location: 'Αθήνα', bio: 'Βιολογικά λαχανικά και φρούτα', verification_status: 'verified', total_products: 25 }
            ]);
          }
        } else {
          console.error('❌ Producers response not ok:', response.status);
          setProducers([
            { id: 1, business_name: 'Ελαιώνες Καλαμάτας', location: 'Καλαμάτα', bio: 'Παραγωγή εξαιρετικού παρθένου ελαιόλαδου', verification_status: 'verified', total_products: 15 },
            { id: 2, business_name: 'Αμπελώνες Νεμέας', location: 'Νεμέα', bio: 'Παραγωγή εκλεκτών κρασιών', verification_status: 'verified', total_products: 8 },
            { id: 3, business_name: 'Μελισσοκομείο Χαλκιδικής', location: 'Χαλκιδική', bio: 'Παραγωγή εξαιρετικού μελιού', verification_status: 'verified', total_products: 12 },
            { id: 4, business_name: 'Φάρμα Βιολογικών Λαχανικών', location: 'Αθήνα', bio: 'Βιολογικά λαχανικά και φρούτα', verification_status: 'verified', total_products: 25 }
          ]);
        }
      } catch (error) {
        console.error('💥 Error fetching producers:', error);
        setProducers([
          { id: 1, business_name: 'Ελαιώνες Καλαμάτας', location: 'Καλαμάτα', bio: 'Παραγωγή εξαιρετικού παρθένου ελαιόλαδου', verification_status: 'verified', total_products: 15 },
          { id: 2, business_name: 'Αμπελώνες Νεμέας', location: 'Νεμέα', bio: 'Παραγωγή εκλεκτών κρασιών', verification_status: 'verified', total_products: 8 },
          { id: 3, business_name: 'Μελισσοκομείο Χαλκιδικής', location: 'Χαλκιδική', bio: 'Παραγωγή εξαιρετικού μελιού', verification_status: 'verified', total_products: 12 },
          { id: 4, business_name: 'Φάρμα Βιολογικών Λαχανικών', location: 'Αθήνα', bio: 'Βιολογικά λαχανικά και φρούτα', verification_status: 'verified', total_products: 25 }
        ]);
      } finally {
        console.log('🏁 Setting producers loading to false');
        setLoading(false);
      }
    }

    fetchProducers();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-green-100 rounded-full px-4 py-2 mb-6">
            <span className="text-green-600 text-sm">👥</span>
            <span className="text-green-600 font-semibold text-sm">Γνωρίστε τους παραγωγούς</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ιστορίες από την ελληνική γη
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Πίσω από κάθε προϊόν κρύβεται μια ιστορία παράδοσης, αγάπης και σεβασμού στη φύση.
          </p>
        </div>

        {/* Producers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {producers.map((producer) => (
            <div
              key={producer.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              {/* Producer Avatar */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl">🧑‍🌾</span>
              </div>

              {/* Producer Info */}
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {producer.business_name}
                </h3>

                <div className="flex items-center justify-center text-gray-600 mb-2">
                  <span className="text-sm">📍 {producer.location}</span>
                </div>

                {/* Verification Badge */}
                {producer.verification_status === 'verified' && (
                  <div className="inline-flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs mb-3">
                    <span>✓ Επαληθευμένος</span>
                  </div>
                )}

                {/* Bio */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {producer.bio || 'Παραγωγός ποιοτικών ελληνικών προϊόντων'}
                </p>

                {/* Products Count */}
                <div className="text-xs text-gray-500 mb-4">
                  {producer.total_products} προϊόντα
                </div>

                {/* View Profile Button */}
                <Link
                  href={`/producers/${producer.id}`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors inline-block"
                >
                  Δείτε προφίλ
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🛡️ Εγγύηση Ποιότητας & Αυθεντικότητας
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Όλοι οι παραγωγοί μας είναι πιστοποιημένοι και ελέγχονται τακτικά.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-2xl mb-3">🏆</div>
              <h4 className="font-semibold text-gray-900 mb-2">Πιστοποιήσεις</h4>
              <p className="text-gray-600 text-sm">Bio, ΠΟΠ, HACCP certifications</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-3">🔍</div>
              <h4 className="font-semibold text-gray-900 mb-2">Τακτικοί Έλεγχοι</h4>
              <p className="text-gray-600 text-sm">Έλεγχοι ποιότητας κάθε 3 μήνες</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-3">📱</div>
              <h4 className="font-semibold text-gray-900 mb-2">Ιχνηλασιμότητα</h4>
              <p className="text-gray-600 text-sm">Από την παραγωγή στο τραπέζι</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-green-600 rounded-lg p-8 text-white mt-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Θέλετε να γίνετε παραγωγός-συνεργάτης;
          </h3>
          <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
            Ενταχθείτε στην κοινότητά μας και προσφέρετε τα προϊόντα σας σε όλη την Ελλάδα.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/producer/register"
              className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Γίνετε συνεργάτης →
            </Link>
            <Link
              href="/about"
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Μάθετε περισσότερα
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}