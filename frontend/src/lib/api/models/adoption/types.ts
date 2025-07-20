'use client';

// Adoption System TypeScript Interfaces
// Following existing patterns from product/types.ts

export interface Producer {
  id: number;
  business_name: string;
  slug: string;
  logo?: string;
  location?: string;
}

export interface AdoptionPlan {
  id: number;
  adoptable_item_id: number;
  name: string;
  description: string;
  price: number;
  duration_months: number;
  benefits: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdoptableItem {
  id: number;
  producer_id: number;
  name: string;
  slug: string;
  description: string;
  type: 'tree' | 'beehive' | 'plot' | 'animal';
  location: string;
  status: 'available' | 'adopted' | 'unavailable';
  main_image: string;
  gallery_images: string[];
  attributes?: Record<string, any>;
  featured: boolean;
  producer: Producer;
  adoption_plans: AdoptionPlan[];
  created_at: string;
  updated_at: string;
}

export interface AdoptionUpdate {
  id: number;
  adoption_id: number;
  title: string;
  content: string;
  images?: string[];
  status: 'draft' | 'published';
  notify_adopter: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Adoption {
  id: number;
  user_id: number;
  adoptable_item_id: number;
  adoption_plan_id: number;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string;
  price_paid: number;
  payment_status: 'pending' | 'paid' | 'failed';
  certificate_number: string;
  notes?: string;
  adoptable_item: AdoptableItem;
  adoption_plan: AdoptionPlan;
  updates?: AdoptionUpdate[];
  created_at: string;
  updated_at: string;
}

export interface AdoptionFilterOptions {
  type?: 'tree' | 'beehive' | 'plot' | 'animal';
  producer_id?: number;
  featured?: boolean;
  status?: 'available' | 'adopted' | 'unavailable';
  sort_by?: 'created_at' | 'name' | 'price';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface CreateAdoptionData {
  adoptable_item_id: number;
  adoption_plan_id: number;
  payment_method: 'stripe' | 'paypal' | 'bank_transfer' | 'cod';
  notes?: string;
}

export interface AdoptionUpdateData {
  title: string;
  content: string;
  images?: File[];
  status?: 'draft' | 'published';
  notify_adopter?: boolean;
}

// API Response Types
export interface AdoptableItemsResponse {
  data: AdoptableItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AdoptionsResponse {
  data: Adoption[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AdoptionUpdatesResponse {
  data: AdoptionUpdate[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
