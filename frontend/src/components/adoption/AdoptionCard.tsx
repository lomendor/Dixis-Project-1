'use client';

// Enhanced Adoption Card Component - Production-ready with modern UX patterns
// Features: Progressive loading, accessibility, error boundaries, mobile optimization

import React, { useState, useEffect, useRef, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Heart, 
  MapPin,
  Calendar,
  Star,
  TreePine,
  Flower2,
  Home,
  PawPrint,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { AdoptableItem } from '@/lib/api/models/adoption/types';
import { useAdoptionActions } from '@/stores/adoptionStore';
import { ErrorBoundary } from 'react-error-boundary';

interface AdoptionCardProps {
  item: AdoptableItem;
  onQuickAdopt?: (item: AdoptableItem) => void;
  className?: string;
  priority?: boolean;
}

// Type icons mapping
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'tree':
      return TreePine;
    case 'beehive':
      return Flower2;
    case 'plot':
      return Home;
    case 'animal':
      return PawPrint;
    default:
      return TreePine;
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

// Skeleton Loader Component
const AdoptionCardSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
    {/* Image skeleton */}
    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer" />
    </div>
    
    {/* Content skeleton */}
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
      <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
      </div>
      <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
      <div className="h-10 bg-gray-200 rounded animate-pulse" />
    </div>
  </div>
);

// Error Fallback Component
const AdoptionCardError = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="group relative bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden p-6">
    <div className="text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
      <h3 className="text-sm font-medium text-gray-900 mb-1">Σφάλμα φόρτωσης</h3>
      <p className="text-xs text-gray-600 mb-3">Δεν μπορέσαμε να φορτώσουμε αυτή την υιοθεσία</p>
      <button
        onClick={resetErrorBoundary}
        className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
        aria-label="Δοκιμάστε ξανά"
      >
        <RefreshCw className="w-4 h-4" />
        Δοκιμάστε ξανά
      </button>
    </div>
  </div>
);

// Main Adoption Card Component
const AdoptionCardInner: React.FC<AdoptionCardProps> = ({ 
  item, 
  onQuickAdopt,
  className = '',
  priority = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [touched, setTouched] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { openFlow } = useAdoptionActions();

  // Get the cheapest plan for display
  const cheapestPlan = item?.adoption_plans?.filter(plan => plan.active)
    ?.sort((a, b) => a.price - b.price)[0];

  const TypeIcon = getTypeIcon(item.type);

  // Handle touch interactions for mobile
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleTouchStart = () => setTouched(true);
    const handleTouchEnd = () => setTimeout(() => setTouched(false), 150);

    card.addEventListener('touchstart', handleTouchStart);
    card.addEventListener('touchend', handleTouchEnd);

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleQuickAdopt = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onQuickAdopt) {
      onQuickAdopt(item);
    } else {
      openFlow(item);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div 
      ref={cardRef}
      className={`
        group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden
        transition-all duration-300 ease-out
        hover:shadow-xl hover:border-gray-200 hover:-translate-y-1
        focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2
        ${touched ? 'scale-[0.98]' : ''}
        ${className}
      `}
      role="article"
      aria-label={`${item.name} - ${getTypeLabel(item.type)} προς υιοθεσία`}
    >
      {/* Status Badge */}
      {item.status !== 'available' && (
        <div className="absolute top-3 left-3 z-10">
          <span className={`
            px-3 py-1 text-xs font-medium rounded-full
            backdrop-blur-sm transition-all duration-200
            ${item.status === 'adopted' 
              ? 'bg-red-100/90 text-red-800' 
              : 'bg-gray-100/90 text-gray-800'
            }
          `}>
            {item.status === 'adopted' ? 'Υιοθετημένο' : 'Μη διαθέσιμο'}
          </span>
        </div>
      )}

      {/* Featured Badge */}
      {item.featured && (
        <div className="absolute top-3 right-3 z-10">
          <div className="
            bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-medium rounded-full 
            flex items-center gap-1 backdrop-blur-sm
            transform transition-transform duration-200 group-hover:scale-110
          ">
            <Star className="w-3 h-3 fill-current" />
            Προτεινόμενο
          </div>
        </div>
      )}

      {/* Wishlist Button */}
      {!item.featured && (
        <button
          onClick={handleWishlistToggle}
          className={`
            absolute top-3 right-3 z-10 p-2 rounded-full shadow-sm
            backdrop-blur-sm transition-all duration-200
            ${isWishlisted 
              ? 'bg-red-50 hover:bg-red-100' 
              : 'bg-white/80 hover:bg-white'
            }
            transform hover:scale-110 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          `}
          aria-label={isWishlisted ? 'Αφαίρεση από τα αγαπημένα' : 'Προσθήκη στα αγαπημένα'}
          aria-pressed={isWishlisted}
        >
          <Heart 
            className={`w-4 h-4 transition-all duration-200 ${
              isWishlisted 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-600 hover:text-red-500'
            }`} 
          />
        </button>
      )}

      <Link 
        href={`/adoptions/${item.slug}`} 
        className="block focus:outline-none"
        aria-label={`Δείτε λεπτομέρειες για ${item.name}`}
      >
        {/* Adoption Image with Progressive Loading */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {/* Blur placeholder */}
          <div 
            className={`
              absolute inset-0 bg-gradient-to-br from-green-100 to-green-200
              transition-opacity duration-700
              ${imageLoaded ? 'opacity-0' : 'opacity-100'}
            `}
          />
          
          {!imageError && item.main_image && item.main_image.trim() !== '' ? (
            <>
              <Image
                src={item.main_image}
                alt={`${item.name} - ${getTypeLabel(item.type)}`}
                fill
                className={`
                  object-cover transition-all duration-700
                  group-hover:scale-110
                  ${imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'}
                `}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
              />
              
              {/* Loading shimmer */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
              <div className="text-green-600 text-center">
                <div className="
                  w-16 h-16 mx-auto mb-2 bg-green-300 rounded-lg 
                  flex items-center justify-center
                  transform transition-transform duration-300 group-hover:scale-110
                ">
                  <TypeIcon className="w-8 h-8" />
                </div>
                <p className="text-sm font-medium">Εικόνα μη διαθέσιμη</p>
              </div>
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute bottom-3 left-3">
            <div className="
              bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full 
              flex items-center gap-1.5 text-xs font-medium text-gray-700
              transform transition-all duration-200 group-hover:bg-white
            ">
              <TypeIcon className="w-4 h-4" />
              {getTypeLabel(item.type)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="
            font-semibold text-gray-900 mb-2 line-clamp-2 
            transition-colors duration-200 group-hover:text-green-600
          ">
            {item.name}
          </h3>

          {/* Producer */}
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <span>Από:</span>
            <span className="font-medium text-green-600 group-hover:text-green-700 transition-colors duration-200">
              {item.producer.business_name}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {item.description}
          </p>

          {/* Pricing */}
          {cheapestPlan && (
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  €{cheapestPlan.price}
                </div>
                <div className="text-xs text-gray-500">
                  για {cheapestPlan.duration_months} μήνες
                </div>
              </div>
              {item.adoption_plans.length > 1 && (
                <div className="
                  text-xs text-green-600 font-medium
                  transform transition-all duration-200 group-hover:scale-105
                ">
                  +{item.adoption_plans.length - 1} πλάνα
                </div>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Action Buttons */}
      <div className="p-4 pt-0">
        <button
          onClick={handleQuickAdopt}
          disabled={item.status !== 'available'}
          className={`
            w-full py-2.5 px-4 rounded-lg font-medium
            transition-all duration-200 transform
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${item.status === 'available'
              ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-md active:scale-[0.98] focus:ring-green-500'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
          aria-label={`Υιοθέτησε ${item.name} τώρα`}
          aria-disabled={item.status !== 'available'}
        >
          {item.status === 'available' ? 'Υιοθέτησε τώρα' : 'Μη διαθέσιμο'}
        </button>
      </div>
    </div>
  );
};

// Export with Error Boundary and Loading State
export const AdoptionCard: React.FC<AdoptionCardProps & { loading?: boolean }> = ({ loading, ...props }) => {
  if (loading) {
    return <AdoptionCardSkeleton className={props.className} />;
  }

  return (
    <ErrorBoundary
      FallbackComponent={AdoptionCardError}
      resetKeys={[props.item.id]}
    >
      <AdoptionCardInner {...props} />
    </ErrorBoundary>
  );
};

// Memoized export for performance
export default memo(AdoptionCard);

// CSS for shimmer animation (add to your global styles)
const shimmerStyles = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
`;