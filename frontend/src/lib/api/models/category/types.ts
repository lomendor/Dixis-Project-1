export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parent_id?: number;
  product_count: number;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithChildren extends Category {
  children?: Category[];
}

export interface CategoryFilters {
  parent_id?: number;
  is_featured?: boolean;
  search?: string;
}

export interface CategoryResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
