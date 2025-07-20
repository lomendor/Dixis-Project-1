export interface Producer {
  id: number;
  user_id: number;
  business_name: string;
  slug: string;
  bio?: string;
  location?: string;
  profile_image?: string;
  cover_image?: string;
  specialties?: string[];
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  website_url?: string; // Alias for website - compatibility

  // CRITICAL: Missing business properties causing errors
  total_products?: number; // Total number of products
  rating?: number; // Average rating
  review_count?: number; // Number of reviews
  processing_time_days?: number; // Processing time in days
  minimum_order_amount?: number; // Minimum order amount

  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface SimpleProducer {
  id: number;
  business_name: string;
  location?: string;
  profile_image?: string;
}

export interface ProducerFilters {
  location?: string;
  specialties?: string[];
  verification_status?: string;
  search?: string;
}

export interface ProducerResponse {
  producers: Producer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
