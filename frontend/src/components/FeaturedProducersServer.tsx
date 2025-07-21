import Link from 'next/link';
import { MapPin, Users, Star } from 'lucide-react';

interface Producer {
  id: number;
  business_name: string;
  slug: string;
  bio: string;
  location: string;
  profile_image?: string;
  verification_status: 'verified' | 'pending' | 'rejected';
  rating?: number;
  total_products: number;
}

async function getFeaturedProducers(): Promise<Producer[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/v1/producers?per_page=6`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    });
    
    if (!response.ok) {
      console.error('Failed to fetch producers:', response.status);
      return getStaticProducers();
    }
    
    const data = await response.json();
    return data.data || getStaticProducers();
  } catch (error) {
    console.error('Error fetching producers:', error);
    return getStaticProducers();
  }
}

function getStaticProducers(): Producer[] {
  return [
    {
      id: 1,
      business_name: "Ελαιώνες Καλαμάτας",
      slug: "producer-2",
      bio: "Παραγωγή εξαιρετικού παρθένου ελαιολάδου από τους ελαιώνες της Καλαμάτας.",
      location: "Καλαμάτα",
      verification_status: "verified",
      rating: 4.9,
      total_products: 3
    },
    {
      id: 2,
      business_name: "Μελισσοκομείο Χαλκιδικής",
      slug: "producer-4",
      bio: "Παραγωγή εξαιρετικού μελιού από τα μελίσσια της Χαλκιδικής.",
      location: "Χαλκιδική",
      verification_status: "verified",
      rating: 5.0,
      total_products: 2
    },
    {
      id: 3,
      business_name: "Αμπελώνες Νεμέας",
      slug: "producer-3",
      bio: "Παραγωγή εκλεκτών κρασιών από τους αμπελώνες της Νεμέας.",
      location: "Νεμέα",
      verification_status: "verified",
      rating: 4.8,
      total_products: 4
    }
  ];
}

function getProducerInitials(businessName: string): string {
  const words = businessName.split(' ');
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  return businessName.substring(0, 2).toUpperCase();
}

function getProducerEmoji(businessName: string, location: string): string {
  const name = businessName.toLowerCase();
  const loc = location.toLowerCase();
  
  if (name.includes('ελαι') || name.includes('olive')) return '🫒';
  if (name.includes('μελι') || name.includes('honey') || name.includes('μελισσ')) return '🍯';
  if (name.includes('αμπελ') || name.includes('wine') || name.includes('κρασ')) return '🍇';
  if (name.includes('τυρ') || name.includes('cheese')) return '🧀';
  if (loc.includes('κρήτη') || loc.includes('crete')) return '🫒';
  if (loc.includes('μέτσοβο') || loc.includes('ήπειρος')) return '🍯';
  if (loc.includes('νάξος') || loc.includes('κυκλάδες')) return '🧀';
  
  return '🌿';
}

function getProducerSpecialtyBadge(businessName: string): { text: string; color: string } {
  const name = businessName.toLowerCase();
  
  if (name.includes('ελαι') || name.includes('olive')) {
    return { text: 'Ελαιόλαδο', color: 'bg-primary-100 text-primary-700' };
  }
  if (name.includes('μελι') || name.includes('honey') || name.includes('μελισσ')) {
    return { text: 'Μέλι & Μελισσοκομία', color: 'bg-accent-100 text-accent-700' };
  }
  if (name.includes('αμπελ') || name.includes('wine') || name.includes('κρασ')) {
    return { text: 'Κρασί & Αμπέλια', color: 'bg-purple-100 text-purple-700' };
  }
  if (name.includes('τυρ') || name.includes('cheese')) {
    return { text: 'Τυροκομία', color: 'bg-yellow-100 text-yellow-700' };
  }
  
  return { text: 'Παραδοσιακά Προϊόντα', color: 'bg-secondary-200 text-neutral-700' };
}

export default async function FeaturedProducersServer() {
  const producers = await getFeaturedProducers();
  const displayProducers = producers.slice(0, 4).filter(p => p.business_name && p.business_name !== 'Test Producer');

  return (
    <div className="relative">
      <div className="overflow-x-auto scrollbar-hide touch-pan-x">
        <div className="flex gap-6 pb-6 px-4 md:px-0" style={{ scrollSnapType: 'x mandatory' }}>
          {displayProducers.map((producer) => {
            const specialty = getProducerSpecialtyBadge(producer.business_name);
            const initials = getProducerInitials(producer.business_name);
            const emoji = getProducerEmoji(producer.business_name, producer.location);
            
            return (
              <div 
                key={producer.id}
                className="flex-shrink-0 w-80 md:w-96 bg-white rounded-2xl shadow-lg hover:shadow-xl border border-secondary-200/50 transition-all duration-500 hover:-translate-y-1 group cursor-pointer select-none"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Producer Header */}
                <div className="p-6 text-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full mx-auto flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                      {producer.profile_image ? (
                        <img 
                          src={producer.profile_image} 
                          alt={producer.business_name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-primary-700 relative z-10">{initials}</span>
                          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">
                            {emoji}
                          </div>
                        </>
                      )}
                    </div>
                    {/* Verification Badge */}
                    {producer.verification_status === 'verified' && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-neutral-900 mb-1 leading-tight">
                    {producer.business_name}
                  </h3>
                  
                  {producer.location && (
                    <div className="flex items-center justify-center text-sm text-primary-600 mb-3">
                      <MapPin className="h-3 w-3 mr-1" />
                      {producer.location}
                    </div>
                  )}
                  
                  <div className={`text-xs px-3 py-1 rounded-full inline-block ${specialty.color}`}>
                    {specialty.text}
                  </div>
                </div>

                {/* Story Preview */}
                <div className="px-6 pb-6">
                  <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                    {producer.bio || `Παραγωγός premium προϊόντων από ${producer.location || 'την Ελλάδα'} με παράδοση και αγάπη για την ποιότητα.`}
                  </p>
                  
                  {/* Products Count & Rating */}
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-4">
                    <span>{emoji} {producer.total_products} Προϊόντα</span>
                    {producer.rating && (
                      <span className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        {producer.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/producers/${producer.slug}`}
                    className="block w-full bg-primary-50 text-primary-700 py-3 px-4 rounded-xl hover:bg-primary-100 transition-colors text-sm font-medium text-center"
                  >
                    Δείτε την Ιστορία
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Scroll Indicators */}
      <div className="flex justify-center mt-8 md:hidden">
        <div className="flex space-x-3">
          {displayProducers.map((_, index) => (
            <div 
              key={index} 
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === 0 
                  ? 'bg-primary-500 shadow-lg' 
                  : 'bg-neutral-300 hover:bg-neutral-400'
              }`}
            ></div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-neutral-500">Σύρετε για περισσότερους παραγωγούς</p>
        </div>
      </div>
    </div>
  );
}