// Server-side producers page following products page pattern
import Link from 'next/link';
import { buildApiUrl } from '@/lib/api/core/config';

interface Producer {
  id: number;
  business_name: string;
  slug: string;
  bio: string;
  location: string;
  profile_image: string;
  specialties: string[];
  verification_status: string;
}

export default async function ServerProducersPage() {
  let producers: Producer[] = [];
  let error = null;
  
  try {
    // Server-side fetch - no CORS issues, same pattern as products page
    const response = await fetch(buildApiUrl('api/v1/producers'), {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      producers = data.data || [];
    } else {
      error = `Backend returned status ${response.status}`;
    }
  } catch (err) {
    error = `Failed to fetch producers: ${err}`;
    console.error('Producers fetch error:', err);
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Page Header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="container-premium py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-6">
              Οι Παραγωγοί μας
            </h1>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Γνωρίστε τους ανθρώπους πίσω από τις αυθεντικές γεύσεις της Ελλάδας
            </p>
            <div className="mt-8">
              <span className="inline-flex items-center bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-semibold">
                {producers.length} Πιστοποιημένοι Παραγωγοί
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-premium py-16">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p><strong>Σφάλμα:</strong> {error}</p>
            <p className="text-sm mt-2">Παρακαλούμε ελέγξτε ότι το Laravel backend τρέχει στο VPS.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {producers.map((producer) => (
            <div key={producer.id} className="card-elevated overflow-hidden hover:-translate-y-1 transition-all duration-300 group">
              <div className="aspect-[4/3] bg-secondary-100 relative overflow-hidden">
                {producer.profile_image ? (
                  <img 
                    src={producer.profile_image} 
                    alt={producer.business_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100">
                    <span className="text-4xl text-primary-600">🏛️</span>
                  </div>
                )}
                
                {producer.verification_status === 'verified' && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-primary-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
                      ✓ Επιβεβαιωμένος
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3 leading-tight">
                  {producer.business_name}
                </h3>
                
                <div className="flex items-center text-primary-600 text-sm mb-4">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {producer.location}
                </div>
                
                <p className="text-neutral-600 text-sm mb-6 leading-relaxed line-clamp-3">
                  {producer.bio}
                </p>
                
                {producer.specialties && producer.specialties.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {producer.specialties.slice(0, 2).map((specialty, index) => (
                        <span
                          key={index}
                          className="text-xs bg-accent-100 text-accent-700 px-3 py-1 rounded-full font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                      {producer.specialties.length > 2 && (
                        <span className="text-xs text-neutral-500 px-3 py-1">
                          +{producer.specialties.length - 2} ακόμα
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <Link 
                  href={`/producers/${producer.slug}`}
                  className="btn-primary w-full justify-center text-center"
                >
                  Δείτε την Ιστορία
                </Link>
              </div>
            </div>
          ))}
        </div>

        {producers.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">👨‍🌾</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Δεν βρέθηκαν παραγωγοί</h3>
            <p className="text-neutral-600">Παρακαλούμε δοκιμάστε ξανά αργότερα</p>
          </div>
        )}
      </div>
    </div>
  );
}