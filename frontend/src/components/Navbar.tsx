'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './SearchBar';
import { HeaderCartIcon } from './cart/ModernCartIcon';
import MobileNavigation from './ui/MobileNavigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserIcon, ChevronDownIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { AvatarImage } from '@/components/ui/OptimizedImage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DixisLogoCustom } from '@/components/ui/DixisLogo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Unified auth hooks
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-secondary-200/60">
      <div className="container-premium">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DixisLogoCustom size="lg" animated={true} />
          </motion.div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-md mx-12">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search premium products..."
                className="w-full pl-10 pr-4 py-3 bg-secondary-100/60 border-0 rounded-xl text-neutral-800 placeholder-neutral-500 focus:bg-white focus:ring-2 focus:ring-primary-200 transition-all duration-200"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link href="/" className="nav-link">
              Αρχική
            </Link>
            <Link href="/products" className="nav-link">
              Προϊόντα
            </Link>
            <Link href="/producers" className="nav-link">
              Παραγωγοί
            </Link>
            <Link href="/about" className="nav-link">
              Σχετικά
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <HeaderCartIcon />

            {isAuthenticated && user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-secondary-100 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center ring-2 ring-primary-200/50">
                    {(user as any).avatar ? (
                      <AvatarImage
                        src={(user as any).avatar}
                        alt={(user as any).firstName || 'User'}
                        size={36}
                        className="rounded-lg"
                      />
                    ) : (
                      <UserIcon className="w-5 h-5 text-primary-700" />
                    )}
                  </div>
                  <div className="hidden xl:block text-left">
                    <div className="text-sm font-medium text-neutral-800">
                      {(user as any).firstName || 'User'}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {user.role === 'producer' ? 'Producer' : 'Customer'}
                    </div>
                  </div>
                  <ChevronDownIcon className="w-4 h-4 text-neutral-500" />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-elevated border border-secondary-200 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-secondary-100">
                        <div className="text-sm font-medium text-neutral-800">
                          {(user as any).firstName || 'User'}
                        </div>
                        <div className="text-xs text-neutral-500">{user.email}</div>
                      </div>
                      
                      <div className="py-1">
                        <Link
                          href={user.role === 'producer' ? '/producer/dashboard' : '/dashboard'}
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-secondary-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-secondary-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-secondary-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Orders
                        </Link>
                        <Link
                          href="/favorites"
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-secondary-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Favorites
                        </Link>
                      </div>

                      <div className="border-t border-secondary-100 py-1">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/producer/register"
                  className="text-sm font-medium text-accent-600 hover:text-accent-700 transition-colors px-3 py-2 rounded-lg hover:bg-accent-50"
                >
                  Γίνε Παραγωγός
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-medium text-neutral-700 hover:text-primary-700 transition-colors px-3 py-2 rounded-lg hover:bg-secondary-50"
                >
                  Σύνδεση
                </Link>
                <Link
                  href="/register"
                  className="btn-primary text-sm"
                >
                  Εγγραφή
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-3">
            <HeaderCartIcon />
            <button
              className="mobile-btn-icon text-gray-700 hover:text-green-600 touch-feedback p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Άνοιγμα μενού"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        <MobileNavigation isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>
    </nav>
  );
}
