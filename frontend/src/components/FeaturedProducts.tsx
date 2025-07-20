'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import React from 'react';
import Link from 'next/link';
import { EnhancedProductCard } from '@/components/ui/enhanced-product-card';
import { Button } from '@/components/ui/button';
import { useEnhancedProducts } from '@/lib/api/services/product/useProductsEnhanced';
import { ProductsGridLoading } from '@/components/ui/LoadingStates';
import { useCartActions } from '@/stores/cartStore';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FeaturedProducts() {
  const { products, isLoading, isError } = useEnhancedProducts({ featured: true, limit: 6 });
  const { addToCart } = useCartActions();

  // Handle cart actions
  const handleAddToCart = React.useCallback(async (productId: string | number) => {
    try {
      await addToCart(String(productId), 1);
    } catch (error) {
      logger.error('Failed to add to cart:', toError(error), errorToContext(error));
    }
  }, [addToCart]);

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">
                Προτεινόμενα Προϊόντα
              </h2>
            </div>
          </div>
          <ProductsGridLoading />
        </div>
      </section>
    );
  }

  if (isError || !products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <h2 className="text-3xl font-bold text-foreground">
              Προτεινόμενα Προϊόντα
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ανακαλύψτε τα καλύτερα ελληνικά προϊόντα από επιλεγμένους παραγωγούς
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {products.slice(0, 6).map((product: any, index: number) => {
            // Safety check: ensure we have a valid product object
            if (!product || typeof product !== 'object' || !product.id) {
              logger.warn('Invalid product data received:', product);
              return null;
            }

            // Extra safety: ensure product.categories is not an object that could be rendered directly
            if (product.categories && !Array.isArray(product.categories)) {
              logger.warn('Product categories is not an array, fixing:', product.categories);
              product.categories = [];
            }

            // Extra safety: ensure no nested objects will be rendered directly
            if (product.category && typeof product.category === 'object') {
              product.category = product.category.name || 'Unknown Category';
            }

            return (
              <EnhancedProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: String(product.name || ''),
                  slug: String(product.slug || ''),
                  price: Number(product.price) || 0,
                  originalPrice: Number(product.discount_price || product.price) || 0,
                  currency: 'EUR',
                  images: product.main_image ? [product.main_image] : [],
                  producer: product.producer && typeof product.producer === 'object' ? {
                    id: String(product.producer.id || 'unknown'),
                    name: String(product.producer.business_name || 'Unknown Producer')
                  } : undefined,
                  category: product.categories && Array.isArray(product.categories) && product.categories.length > 0 && typeof product.categories[0] === 'object' ? {
                    id: String(product.categories[0].id || 'unknown'),
                    name: String(product.categories[0].name || 'Unknown Category')
                  } : { id: 'default', name: 'Γενικά' },
                  stock_quantity: Number(product.stock_quantity || product.stock) || 0,
                  reviews: Array.isArray(product.reviews) ? product.reviews : [],
                  is_featured: Boolean(product.is_featured),
                  status: 'active'
                }}
                priority={index < 3} // Prioritize first 3 images
                showQuickAdd={true}
                showWishlist={true}
                onAddToCart={handleAddToCart}
                onToggleWishlist={(productId) => {
                  logger.info('Toggle wishlist for:', { productId });    // Wishlist feature planned for future release
                }}
                onQuickView={(productId) => {
                  logger.info('Quick view for:', { productId });    // Quick view implemented via product cards
                }}
                className="animate-fade-in"
              />
            );
          }).filter(Boolean)}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button asChild size="lg" className="group">
            <Link href="/products">
              Δείτε Όλα τα Προϊόντα
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}