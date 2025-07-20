'use client';

import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

// Adoption Details Page - Following existing patterns from products/[slug]/page.tsx
// Detailed view with adoption flow integration

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, 
  Calendar, 
  Star, 
  Heart,
  Share2,
  TreePine,
  Flower2,
  Home,
  PawPrint,
  CheckCircle,
  Clock,
  Euro,
  Users
} from 'lucide-react';
import { useAdoptableItem } from '@/lib/api/services/adoption';
import { useAdoptionActions } from '@/stores/adoptionStore';
import { AdoptionPlanSelector } from '@/components/adoption/AdoptionPlanSelector';

interface AdoptionDetailsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Type icons mapping
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'tree':
      return <TreePine className="w-5 h-5" />;
    case 'beehive':
      return <Flower2 className="w-5 h-5" />;
    case 'plot':
      return <Home className="w-5 h-5" />;
    case 'animal':
      return <PawPrint className="w-5 h-5" />;
    default:
      return <TreePine className="w-5 h-5" />;
  }
};

// Type labels mapping
const getTypeLabel = (type: string) => {
  switch (type) {
    case 'tree':
      return 'Δέντρο';
    case 'beehive':
      return 'Κυψέλη';
    case 'plot':
      return 'Οικόπεδο';
    case 'animal':
      return 'Ζώο';
    default:
      return 'Άγνωστο';
  }
};

export default function AdoptionDetailsPage({ params }: AdoptionDetailsPageProps) {
  const [slug, setSlug] = React.useState<string>('');
  
  React.useEffect(() => {
    params.then(({ slug }) => setSlug(slug));
  }, [params]);
  
  if (!slug) return <div>Loading...</div>;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const { openFlow } = useAdoptionActions();
  
  // Fetch adoption item
  const { data: item, isLoading, error } = useAdoptableItem(slug) as {
    data?: any;
    isLoading: boolean;
    error: any;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Δεν βρέθηκε</h2>
          <p className="text-gray-600 mb-4">Το αντικείμενο προς υιοθεσία δεν βρέθηκε.</p>
          <Link 
            href="/adoptions"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg inline-block"
          >
            Επιστροφή στις υιοθεσίες
          </Link>
        </div>
      </div>
    );
  }

  // Prepare images
  const allImages = [item.main_image, ...(item.gallery_images || [])].filter(Boolean);

  const handleAdopt = () => {
    openFlow(item);
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text: `Δείτε αυτό το ${getTypeLabel(item.type).toLowerCase()} για υιοθεσία`,
          url: window.location.href,
        });
      } catch (error) {
        logger.info('Error sharing:', errorToContext(error));
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Ο σύνδεσμος αντιγράφηκε!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-green-600">Αρχική</Link>
          <span>/</span>
          <Link href="/adoptions" className="hover:text-green-600">Υιοθεσίες</Link>
          <span>/</span>
          <span className="text-gray-900">{item.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-xl">
              {allImages.length > 0 ? (
                <Image
                  src={allImages[selectedImageIndex]}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                  <div className="text-green-600 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-green-300 rounded-lg flex items-center justify-center">
                      {getTypeIcon(item.type)}
                    </div>
                    <p className="text-lg font-medium">Εικόνα μη διαθέσιμη</p>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              {item.status !== 'available' && (
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    item.status === 'adopted' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status === 'adopted' ? 'Υιοθετημένο' : 'Μη διαθέσιμο'}
                  </span>
                </div>
              )}

              {/* Featured Badge */}
              {item.featured && (
                <div className="absolute top-4 right-4">
                  <div className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    Προτεινόμενο
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImageIndex === index 
                        ? 'border-green-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${item.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12.5vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getTypeIcon(item.type)}
                <span className="text-sm font-medium text-green-600">
                  {getTypeLabel(item.type)}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {item.name}
              </h1>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Link 
                    href={`/producers/${item.producer.slug}`}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    {item.producer.business_name}
                  </Link>
                  
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{item.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleWishlistToggle}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Heart 
                      className={`w-5 h-5 ${
                        isWishlisted 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-600'
                      }`} 
                    />
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Περιγραφή</h3>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Adoption Plans */}
            {item.adoption_plans && item.adoption_plans.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Πλάνα Υιοθεσίας</h3>
                <AdoptionPlanSelector 
                  plans={item.adoption_plans.filter((plan: any) => plan.active)}
                  onPlanSelect={(plan) => {
                    // Handle plan selection
                    logger.info('Selected plan:', plan);
                  }}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAdopt}
                disabled={item.status !== 'available'}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
                  item.status === 'available'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {item.status === 'available' ? 'Υιοθέτησε τώρα' : 'Μη διαθέσιμο'}
              </button>
              
              {item.status === 'available' && (
                <p className="text-sm text-gray-500 text-center">
                  Ασφαλής πληρωμή με Stripe • Ακύρωση ανά πάσα στιγμή
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
