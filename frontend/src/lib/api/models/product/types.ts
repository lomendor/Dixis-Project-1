import { ID } from '../../client/apiTypes';

/**
 * Product interface representing a product entity
 */
export interface Product {
  id: ID;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  originalPrice?: number; // Original price before any discounts
  currency?: string; // Currency code (default: EUR)
  discount?: number; // In percentage
  description: string;
  shortDescription?: string;
  image?: string;
  imageUrl?: string; // Alias for image
  imageAlt?: string;
  gallery?: ProductImage[];
  stock: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  unit?: string;
  unitCount?: number;
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
  categories?: Category[];
  category?: Category; // Single category for backward compatibility
  tags?: string[];
  isOrganic?: boolean;
  isLocal?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isLactoseFree?: boolean;
  isSugarFree?: boolean;
  featured: boolean;
  producerId: ID;
  producerName?: string;
  producerSlug?: string;
  producerImage?: string;
  producerPrice?: number; // Producer's base price
  commissionRate?: number; // Platform commission rate
  origin?: string;
  regionOfOrigin?: string;
  location?: string; // Product/Producer location
  producer_location?: string; // For search compatibility
  nutrition?: NutritionInfo;
  carbonFootprint?: number; // In grams of CO2 equivalent
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Simple product interface with basic details
 */
export interface SimpleProduct {
  id: ID;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image?: string;
  imageUrl?: string; // Alias for image
  shortDescription?: string;
  rating?: number;
  producerId: ID;
  producerName?: string;
  featured: boolean;
  isOrganic?: boolean;
  category?: Category;
}

/**
 * Product image interface
 */
export interface ProductImage {
  id: ID;
  src: string;
  alt?: string;
  order?: number;
  isMain?: boolean;
}

/**
 * Category interface
 */
export interface Category {
  id: ID;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  description?: string;
  parentId?: ID;
  level?: number;
  count?: number;
}

/**
 * Nutrition information interface
 */
export interface NutritionInfo {
  servingSize?: string;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  sodium?: number;
  fiber?: number;
  sugar?: number;
  additionalInfo?: Record<string, number>;
}

/**
 * Product review interface
 */
export interface ProductReview {
  id: ID;
  productId: ID;
  userId: ID;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  title?: string;
  photos?: string[];
  verifiedPurchase: boolean;
  helpfulCount?: number;
  replyComment?: string;
  replyDate?: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Review type alias for backward compatibility
 */
export type Review = ProductReview;

/**
 * Product status enum
 */
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

/**
 * Review status enum
 */
export enum ReviewStatus {
  PUBLISHED = 'published',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

/**
 * Filter options for products list
 */
export interface ProductFilterOptions {
  search?: string;
  category?: ID | ID[];
  producer?: ID | ID[];
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  status?: ProductStatus | ProductStatus[];
  isOrganic?: boolean;
  isLocal?: boolean;
  minRating?: number;
  tags?: string[];
  inStock?: boolean;
  stock?: number; // For backward compatibility
  onSale?: boolean;
  sortBy?: 'price' | 'rating' | 'newest' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

/**
 * Inventory update interface
 */
export interface InventoryUpdate {
  productId: ID;
  stock: number;
  reorderPoint?: number;
  backorderAllowed?: boolean;
  notes?: string;
}

/**
 * Related product type
 */
export interface RelatedProduct {
  id: ID;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image?: string;
  relationType: RelationType;
}  

/**
 * Related product type enum
 */
export enum RelationType {
  SIMILAR = 'similar',
  COMPLEMENTARY = 'complementary',
  ALTERNATIVE = 'alternative',
  FREQUENTLY_BOUGHT_TOGETHER = 'frequently_bought_together',
}