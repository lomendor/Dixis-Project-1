'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartSummary } from '@/stores/cartStore';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X,
  Heart,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  Star,
  TrendingUp,
  Award
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  type: string;
  order: number;
}

const ProfessionalNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { itemCount } = useCartSummary();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch categories from Laravel API directly
  useEffect(() => {
    fetch('http://localhost:8000/api/v1/categories')
      .then(res => res.json())
      .then(data => {
        // Filter main categories (parent_id is null) and sort by order
        const mainCategories = data
          .filter((cat: Category) => cat.parent_id === null && cat.type === 'product')
          .sort((a: Category, b: Category) => a.order - b.order)
          .slice(0, 8); // Take first 8 main categories
        setCategories(mainCategories);
      })
      .catch(err => logger.error('Failed to fetch categories:', toError(err), errorToContext(err)));
  }, []);

  // Category icons mapping
  const getCategoryIcon = (name: string) => {
    const iconMap: { [key: string]: string } = {
      'ελαιόλαδο': '🫒',
      'ελιά': '🫒',
      'μέλι': '🍯',
      'τυρί': '🧀',
      'γαλακτοκομικά': '🧀',
      'κρασί': '🍷',
      'ποτά': '🍷',
      'βότανα': '🌿',
      'μπαχαρικά': '🌿',
      'δημητριακά': '🌾',
      'άλευρα': '🌾',
      'όσπρια': '🫘',
      'ζυμαρικά': '🍝',
      'ξηροί': '🥜',
      'καρποί': '🥜',
      'αλείμματα': '🍯',
      'μανιτάρια': '🍄',
      'καλλυντικά': '🧴',
      'περιποίηση': '🧴'
    };

    const lowerName = name.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerName.includes(key)) {
        return icon;
      }
    }
    return '📦'; // Default icon
  };

  const megaMenuContent = (
    <div className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-gray-100 z-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Categories */}
          <div className="md:col-span-2">
            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-emerald-600" />
              Κατηγορίες Προϊόντων
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="flex items-center p-3 rounded-xl hover:bg-emerald-50 transition-colors group"
                >
                  <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">
                    {getCategoryIcon(category.name)}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-emerald-600">
                      {category.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Δείτε όλα
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Featured */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Προτεινόμενα
            </h3>
            <div className="space-y-3">
              <Link href="/products/featured" className="block p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Βιολογικά Προϊόντα</div>
                <div className="text-sm text-gray-500">Πιστοποιημένα βιολογικά</div>
              </Link>
              <Link href="/products/bestsellers" className="block p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Best Sellers</div>
                <div className="text-sm text-gray-500">Τα πιο δημοφιλή</div>
              </Link>
              <Link href="/products/new" className="block p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Νέα Προϊόντα</div>
                <div className="text-sm text-gray-500">Τελευταίες προσθήκες</div>
              </Link>
            </div>
          </div>

          {/* Producers */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-emerald-600" />
              Παραγωγοί
            </h3>
            <div className="space-y-3">
              <Link href="/producers" className="block p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Όλοι οι Παραγωγοί</div>
                <div className="text-sm text-gray-500">120+ επαληθευμένοι</div>
              </Link>
              <Link href="/producers/featured" className="block p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Επιλεγμένοι</div>
                <div className="text-sm text-gray-500">Οι κορυφαίοι</div>
              </Link>
              <Link href="/become-producer" className="block p-3 rounded-xl hover:bg-emerald-50 transition-colors">
                <div className="font-medium text-emerald-600">Γίνε Παραγωγός</div>
                <div className="text-sm text-emerald-500">Ξεκίνα τώρα</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Main Navigation */}
      <motion.nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100' 
            : 'bg-white shadow-md'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <div>
                <div className="font-bold text-2xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Dixis
                </div>
                <div className="text-xs text-gray-500 -mt-1">Αυθεντικά Ελληνικά</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
                Αρχική
              </Link>
              
              <Link href="/products" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
                Προϊόντα
              </Link>

              <Link href="/producers" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
                Παραγωγοί
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
                Σχετικά
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
                Επικοινωνία
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Αναζήτηση προϊόντων..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-transparent rounded-full focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Wishlist */}
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="w-5 h-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                  2
                </Badge>
              </Button>

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-emerald-500">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Account */}
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 shadow-xl"
          >
            <div className="container mx-auto px-4 py-6">
              {/* Mobile Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Αναζήτηση..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full"
                  />
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-4">
                <Link href="/" className="block py-3 text-gray-700 font-medium border-b border-gray-100">
                  Αρχική
                </Link>
                <Link href="/products" className="block py-3 text-gray-700 font-medium border-b border-gray-100">
                  Προϊόντα
                </Link>
                <Link href="/producers" className="block py-3 text-gray-700 font-medium border-b border-gray-100">
                  Παραγωγοί
                </Link>
                <Link href="/about" className="block py-3 text-gray-700 font-medium border-b border-gray-100">
                  Σχετικά
                </Link>
                <Link href="/contact" className="block py-3 text-gray-700 font-medium">
                  Επικοινωνία
                </Link>
              </div>


            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfessionalNavbar;