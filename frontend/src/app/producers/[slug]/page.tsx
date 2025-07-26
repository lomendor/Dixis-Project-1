// Server-side producer detail page following producers page pattern
import Link from 'next/link';
import { buildApiUrl } from '@/lib/api/config/unified';

interface Producer {
  id: number;
  business_name: string;
  slug: string;
  bio: string;
  location: string;
  profile_image: string;
  specialties: string[];
  verification_status: string;
  rating: number;
  total_products: number;
  review_count: number;
  website_url?: string;
  processing_time_days?: number;
  minimum_order_amount?: number;
}

interface ProducerDetailPageProps {
  params: { slug: string };
}

export default async function ProducerDetailPage({ params }: ProducerDetailPageProps) {
  const { slug } = params;
  let producer: Producer | null = null;
  let error = null;
  
  try {
    // Server-side fetch - no CORS issues, same pattern as products page
    const response = await fetch(buildApiUrl(`producers/slug/${slug}`), {
      next: { revalidate: 60 },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      producer = data.data || data;
    } else {
      error = `Backend returned status ${response.status}`;
    }
  } catch (err) {
    error = `Failed to fetch producer: ${err}`;
    console.error('Producer fetch error:', err);
  }

  if (error || !producer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Σφάλμα φόρτωσης</h2>
            <p className="text-red-600 mb-4">{error || 'Ο παραγωγός δεν βρέθηκε'}</p>
            <div className="space-x-4">
              <Link
                href="/producers"
                className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Επιστροφή στους Παραγωγούς
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Αρχική
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link href="/producers" className="text-gray-500 hover:text-gray-700">
              Παραγωγοί
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900">{producer.business_name}</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {producer.profile_image && (
          <div className="h-64 bg-gray-200 relative">
            <img
              src={producer.profile_image}
              alt={producer.business_name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {producer.business_name}
              </h1>
              {producer.location && (
                <p className="text-gray-600 flex items-center">
                  <span className="mr-2">📍</span>
                  {producer.location}
                </p>
              )}
            </div>
            
            {producer.verification_status === 'verified' && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✓ Επιβεβαιωμένος
              </div>
            )}
          </div>

          {producer.bio && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Σχετικά με εμάς</h2>
              <p className="text-gray-700 leading-relaxed">{producer.bio}</p>
            </div>
          )}

          {producer.specialties && producer.specialties.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Ειδικότητες</h2>
              <div className="flex flex-wrap gap-2">
                {producer.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{producer.total_products || 0}</p>
              <p className="text-gray-600 text-sm">Προϊόντα</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {producer.rating || 0}
                <span className="text-xl">⭐</span>
              </p>
              <p className="text-gray-600 text-sm">Βαθμολογία</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{producer.review_count || 0}</p>
              <p className="text-gray-600 text-sm">Κριτικές</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Link
          href={`/producers/${producer.slug}/products`}
          className="flex-1 bg-green-600 text-white text-center py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Δείτε τα Προϊόντα
        </Link>
        
        {producer.website_url && (
          <a
            href={producer.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-100 text-gray-700 text-center py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Επισκεφθείτε την Ιστοσελίδα
          </a>
        )}
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {producer.processing_time_days && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Χρόνος Επεξεργασίας</h3>
            <p className="text-gray-700">{producer.processing_time_days} ημέρες</p>
          </div>
        )}
        
        {producer.minimum_order_amount && producer.minimum_order_amount > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Ελάχιστη Παραγγελία</h3>
            <p className="text-gray-700">{producer.minimum_order_amount}€</p>
          </div>
        )}
      </div>
    </div>
  );
}