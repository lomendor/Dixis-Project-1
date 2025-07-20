'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Eye, 
  Sparkles,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  producer: string;
  location: string;
  rating: number;
  reviews: number;
  isOrganic?: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
  discount?: number;
  tags?: string[];
}

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Θυμαρίσιο Μέλι Κρήτης',
    slug: 'thyme-honey-crete',
    price: 18.50,
    originalPrice: 22.00,
    image: '/honey-jar.jpg',
    producer: 'Μελισσοκομία Παπαδάκη',
    location: 'Χανιά, Κρήτη',
    rating: 4.9,
    reviews: 127,
    isOrganic: true,
    isBestseller: true,
    discount: 16,
    tags: ['Βιολογικό', 'Best Seller', 'Κρητικό']
  },
  {
    id: '2',
    name: 'Extra Virgin Ελαιόλαδο Κορωνέικη',
    slug: 'koroneiki-olive-oil',
    price: 28.90,
    image: '/olive-oil-bottle.jpg',
    producer: 'Ελαιώνες Καλαμάτας',
    location: 'Καλαμάτα, Μεσσηνία',
    rating: 4.8,
    reviews: 89,
    isOrganic: true,
    isNew: true,
    tags: ['Extra Virgin', 'Κορωνέικη', 'Βραβευμένο']
  },
  {
    id: '3',
    name: 'Φέτα ΠΟΠ Παραδοσιακή',
    slug: 'traditional-feta-cheese',
    price: 12.40,
    originalPrice: 15.00,
    image: '/feta-cheese.jpg',
    producer: 'Τυροκομεία Ηπείρου',
    location: 'Ιωάννινα, Ήπειρος',
    rating: 4.7,
    reviews: 64,
    isBestseller: true,
    discount: 17,
    tags: ['ΠΟΠ', 'Παραδοσιακό', 'Ήπειρος']
  },
  {
    id: '4',
    name: 'Βιολογικό Τσάι Βουνού',
    slug: 'organic-mountain-tea',
    price: 8.90,
    image: '/mountain-tea.jpg',
    producer: 'Βότανα Πίνδου',
    location: 'Μέτσοβο, Ήπειρος',
    rating: 4.6,
    reviews: 43,
    isOrganic: true,
    isNew: true,
    tags: ['Βιολογικό', 'Βότανα', 'Πίνδος']
  },
  {
    id: '5',
    name: 'Κρασί Ασύρτικο Σαντορίνης',
    slug: 'assyrtiko-wine-santorini',
    price: 32.00,
    image: '/assyrtiko-wine.jpg',
    producer: 'Οινοποιεία Αργυρού',
    location: 'Σαντορίνη, Κυκλάδες',
    rating: 4.9,
    reviews: 156,
    isBestseller: true,
    tags: ['Ασύρτικο', 'Σαντορίνη', 'Award Winner']
  },
  {
    id: '6',
    name: 'Παραδοσιακή Τραχανάς',
    slug: 'traditional-trahanas',
    price: 6.50,
    image: '/trahanas.jpg',
    producer: 'Παραδοσιακά Προϊόντα Μάνης',
    location: 'Καρδαμύλη, Μάνη',
    rating: 4.5,
    reviews: 28,
    tags: ['Παραδοσιακό', 'Χειροποίητο', 'Μάνη']
  }
];

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 overflow-hidden">
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-[4/3]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            priority={index < 3}
            onError={(e) => {
              e.currentTarget.src = `/api/placeholder/400/300?text=${encodeURIComponent(product.name.split(' ')[0])}`;
            }}
          />
          
          {/* Main Badge */}
          {(product.isNew || product.isBestseller || product.discount) && (
            <Badge className={`absolute top-3 left-3 font-bold shadow-lg ${
              product.isNew ? 'bg-emerald-600' :
              product.isBestseller ? 'bg-orange-500' :
              product.discount ? 'bg-red-500' : ''
            }`}>
              {product.isNew && 'ΝΕΟ'}
              {product.isBestseller && 'Best Seller'}
              {product.discount && `-${product.discount}%`}
            </Badge>
          )}

          {/* Wishlist Button */}
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={() => setIsWishlisted(!isWishlisted)}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'text-red-500 fill-current' : ''}`} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Product Name */}
          <h3 className="font-bold text-lg md:text-xl mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>

          {/* Producer */}
          <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base">{product.producer}</p>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[1,2,3,4,5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({product.reviews})
            </span>
          </div>
          
          {/* Price and Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-2xl md:text-3xl font-bold text-emerald-600">
                €{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through ml-2">
                  €{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto min-h-[44px] touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Προσθήκη στο Καλάθι</span>
              <span className="sm:hidden">Προσθήκη</span>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

interface ModernProductGridProps {
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
}

const ModernProductGrid: React.FC<ModernProductGridProps> = ({
  title = "Επιλεγμένα Προϊόντα",
  subtitle = "Ανακαλύψτε τα καλύτερα προϊόντα από όλη την Ελλάδα",
  showFilters = false
}) => {
  return (
    <section className="py-16 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
          <div className="mt-6 w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-8">
          {sampleProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 text-lg shadow-xl">
            <Link href="/products">
              <Zap className="mr-2 h-5 w-5" />
              Δες Όλα τα Προϊόντα
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ModernProductGrid;