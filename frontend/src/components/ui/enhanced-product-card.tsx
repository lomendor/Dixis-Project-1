'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn, formatPrice } from "@/lib/utils";

interface Product {
  id: string | number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  images?: Array<{
    id: string | number;
    url: string;
    path?: string;
    is_main?: boolean;
  }>;
  producer?: {
    id: string | number;
    name: string;
    slug?: string;
  };
  category?: {
    id: string | number;
    name: string;
  };
  stock_quantity?: number;
  reviews?: {
    averageRating: number;
    totalCount: number;
  };
  is_featured?: boolean;
  status?: string;
}

interface EnhancedProductCardProps {
  product: Product;
  priority?: boolean;
  showQuickAdd?: boolean;
  showWishlist?: boolean;
  onAddToCart?: (productId: string | number) => void;
  onToggleWishlist?: (productId: string | number) => void;
  onQuickView?: (productId: string | number) => void;
  className?: string;
  variant?: "default" | "compact" | "minimal";
}

export function EnhancedProductCard({
  product,
  priority = false,
  showQuickAdd = true,
  showWishlist = true,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  className,
  variant = "default"
}: EnhancedProductCardProps) {
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Calculate discount percentage
  const discountPercentage = React.useMemo(() => {
    if (!product.originalPrice || !product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }, [product.originalPrice, product.price]);

  const hasDiscount = discountPercentage > 0;

  // Get main product image
  const mainImage = React.useMemo(() => {
    if (!product?.images?.length) return '/placeholder-product.svg';
    
    const primary = product.images.find(img => img.is_main);
    const image = primary || product.images[0];
    
    // Handle both API formats
    if (image.url) return image.url;
    if (image.path) return `${process.env.NEXT_PUBLIC_API_URL}/storage/${image.path}`;
    return '/placeholder-product.svg';
  }, [product.images]);

  // Format prices
  const formattedPrice = formatPrice(product.price, product.currency);
  const formattedOriginalPrice = product.originalPrice 
    ? formatPrice(product.originalPrice, product.currency) 
    : null;

  // Handle cart actions
  const handleAddToCart = React.useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onAddToCart) return;
    
    setIsLoading(true);
    try {
      await onAddToCart(product.id);
    } catch (error) {
      logger.error('Failed to add to cart:', toError(error), errorToContext(error));
    } finally {
      setIsLoading(false);
    }
  }, [onAddToCart, product.id]);

  const handleToggleWishlist = React.useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onToggleWishlist) return;
    
    setIsWishlisted(!isWishlisted);
    try {
      await onToggleWishlist(product.id);
    } catch (error) {
      logger.error('Failed to toggle wishlist:', toError(error), errorToContext(error));
      setIsWishlisted(isWishlisted); // Revert on error
    }
  }, [onToggleWishlist, product.id, isWishlisted]);

  const handleQuickView = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onQuickView) {
      onQuickView(product.id);
    }
  }, [onQuickView, product.id]);

  // Get status badge variant
  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card 
      className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        "border-border/50 hover:border-border",
        variant === "compact" && "max-w-sm",
        variant === "minimal" && "border-0 shadow-none hover:shadow-md",
        className
      )}
    >
      <div className="relative">
        <AspectRatio ratio={4/3} className="bg-muted">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-transform duration-300",
              "group-hover:scale-105"
            )}
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </AspectRatio>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <Badge variant="destructive" className="text-xs font-bold">
              -{discountPercentage}%
            </Badge>
          )}
          {product.is_featured && (
            <Badge variant="warning" className="text-xs">
              ⭐ Featured
            </Badge>
          )}
          {product.status && variant !== "minimal" && (
            <Badge variant={getStatusVariant(product.status)} className="text-xs">
              {product.status === 'active' ? 'Active' : 
               product.status === 'pending' ? 'Pending' : 
               product.status === 'approved' ? 'Approved' : 
               product.status}
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        {showWishlist && (
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              "hover:bg-background hover:scale-110"
            )}
            onClick={handleToggleWishlist}
          >
            <Heart 
              className={cn(
                "h-4 w-4",
                isWishlisted && "fill-red-500 text-red-500"
              )}
            />
          </Button>
        )}

        {/* Quick Action Overlay */}
        {(showQuickAdd || onQuickView) && (
          <div className={cn(
            "absolute inset-0 bg-black/40 backdrop-blur-sm",
            "opacity-0 group-hover:opacity-100 transition-all duration-300",
            "flex items-center justify-center gap-2"
          )}>
            {onQuickView && (
              <Button
                size="sm"
                variant="secondary"
                className="bg-background/90 hover:bg-background"
                onClick={handleQuickView}
              >
                <Eye className="h-4 w-4 mr-1" />
                Quick View
              </Button>
            )}
            {showQuickAdd && onAddToCart && (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90"
                onClick={handleAddToCart}
                disabled={isLoading}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                {isLoading ? "Adding..." : "Add to Cart"}
              </Button>
            )}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Product Name */}
          <Link href={`/products/${product.slug}`}>
            <h3 className={cn(
              "font-semibold leading-tight transition-colors",
              "group-hover:text-primary line-clamp-2",
              variant === "compact" ? "text-sm" : "text-base"
            )}>
              {product.name}
            </h3>
          </Link>

          {/* Producer */}
          {product.producer && variant !== "minimal" && (
            <p className="text-sm text-muted-foreground">
              by {product.producer.name}
            </p>
          )}

          {/* Category */}
          {product.category && variant === "default" && (
            <p className="text-xs text-muted-foreground">
              {product.category.name}
            </p>
          )}

          {/* Rating */}
          {product.reviews && product.reviews.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < Math.floor(product.reviews!.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.reviews.totalCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-bold text-primary",
              variant === "compact" ? "text-base" : "text-lg"
            )}>
              {formattedPrice}
            </span>
            {formattedOriginalPrice && hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formattedOriginalPrice}
              </span>
            )}
          </div>

          {/* Stock */}
          {product.stock_quantity !== undefined && variant === "default" && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Stock: {product.stock_quantity}</span>
              <span className={cn(
                product.stock_quantity > 10 ? "text-green-600" :
                product.stock_quantity > 0 ? "text-yellow-600" : "text-red-600"
              )}>
                {product.stock_quantity > 10 ? "In Stock" :
                 product.stock_quantity > 0 ? "Low Stock" : "Out of Stock"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}