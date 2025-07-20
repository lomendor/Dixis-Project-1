'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X,
  Phone,
  Mail
} from 'lucide-react';

const SimpleNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary-700 text-white py-2 text-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>210 123 4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>info@dixis.gr</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span>🚛 Δωρεάν αποστολή άνω των 50€</span>
              <span>✨ Αυθεντικά ελληνικά προϊόντα</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <div>
                <div className="font-bold text-2xl text-primary-700">
                  Dixis
                </div>
                <div className="text-xs text-neutral-500 -mt-1">Αυθεντικά Ελληνικά</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/products" className="text-neutral-700 hover:text-primary-700 font-medium transition-colors">
                Προϊόντα
              </Link>
              <Link href="/producers" className="text-neutral-700 hover:text-primary-700 font-medium transition-colors">
                Παραγωγοί
              </Link>
              <Link href="/become-producer" className="text-neutral-700 hover:text-primary-700 font-medium transition-colors">
                Γίνε Παραγωγός
              </Link>
              <Link href="/contact" className="text-neutral-700 hover:text-primary-700 font-medium transition-colors">
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
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-transparent rounded-full focus:bg-white focus:border-green-300 focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-neutral-700 hover:text-primary-700 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Link>

              {/* B2B Portal */}
              <Link
                href="/b2b/login"
                className="bg-primary-700 hover:bg-primary-800 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                B2B
              </Link>

              {/* User Account */}
              <Link href="/account" className="p-2 text-neutral-700 hover:text-primary-700 transition-colors">
                <User className="w-5 h-5" />
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2 text-neutral-700 hover:text-primary-700 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
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
              <Link href="/products" className="block py-3 text-neutral-700 font-medium border-b border-secondary-200">
                Προϊόντα
              </Link>
              <Link href="/producers" className="block py-3 text-neutral-700 font-medium border-b border-secondary-200">
                Παραγωγοί
              </Link>
              <Link href="/become-producer" className="block py-3 text-neutral-700 font-medium border-b border-secondary-200">
                Γίνε Παραγωγός
              </Link>
              <Link href="/contact" className="block py-3 text-neutral-700 font-medium border-b border-secondary-200">
                Επικοινωνία
              </Link>
              <Link href="/b2b/login" className="block py-3 text-primary-700 font-bold">
                B2B Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SimpleNavbar;