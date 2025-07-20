'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  UserGroupIcon, 
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging/productionLogger';
import TouchGestures from './TouchInteractions';
import DixisLogo from '@/components/ui/DixisLogo';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
  isB2B?: boolean;
}

const navigationItems: NavigationItem[] = [
  { name: 'Αρχική', href: '/', icon: HomeIcon },
  { name: 'Προϊόντα', href: '/products', icon: ShoppingBagIcon },
  { name: 'Παραγωγοί', href: '/producers', icon: UserGroupIcon },
  { name: 'Αναζήτηση', href: '/search', icon: MagnifyingGlassIcon },
  { name: 'Καλάθι', href: '/cart', icon: ShoppingCartIcon, badge: 0 }
];

const b2bNavigationItems: NavigationItem[] = [
  { name: 'Dashboard', href: '/b2b/dashboard', icon: ChartBarIcon, isB2B: true },
  { name: 'Προϊόντα B2B', href: '/b2b/products', icon: ShoppingBagIcon, isB2B: true },
  { name: 'Παραγγελίες', href: '/b2b/orders', icon: BuildingOfficeIcon, isB2B: true },
  { name: 'Αναφορές', href: '/b2b/reports', icon: ChartBarIcon, isB2B: true }
];

export default function MobileEnhancedNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isB2BMode, setIsB2BMode] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const lastScrollY = useRef(0);
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide navigation on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY.current;
      
      // Hide on scroll down, show on scroll up
      if (scrollDifference > 10 && currentScrollY > 100) {
        setIsVisible(false);
      } else if (scrollDifference < -10) {
        setIsVisible(true);
      }
      
      setIsScrolled(currentScrollY > 10);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Detect B2B mode
  useEffect(() => {
    setIsB2BMode(pathname.startsWith('/b2b'));
  }, [pathname]);

  const currentItems = isB2BMode ? b2bNavigationItems : navigationItems;

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    logger.debug('Mobile menu toggled', { isOpen: !isMenuOpen });
  };

  const handleNavigate = (href: string) => {
    router.push(href);
    setIsMenuOpen(false);
    logger.debug('Mobile navigation', { href });
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
            : 'bg-white'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <TouchGestures onDoubleTap={() => router.push('/')}>
            <Link href="/" className="flex items-center space-x-3">
              <DixisLogo variant="icon" size="md" animated clickable={false} />
              <span className="font-bold text-gray-900 text-lg">
                {isB2BMode ? 'Dixis B2B' : 'Dixis Fresh'}
              </span>
            </Link>
          </TouchGestures>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Cart Icon (only for consumer mode) */}
            {!isB2BMode && (
              <TouchGestures onLongPress={() => logger.debug('Cart long press')}>
                <button
                  onClick={() => router.push('/cart')}
                  className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  <ShoppingCartIcon className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    0
                  </span>
                </button>
              </TouchGestures>
            )}

            {/* Menu Button */}
            <TouchGestures onLongPress={() => setIsMenuOpen(true)}>
              <button
                onClick={handleMenuToggle}
                className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </TouchGestures>
          </div>
        </div>
      </motion.header>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white"
          >
            <TouchGestures 
              onSwipeDown={() => setIsMenuOpen(false)}
              className="h-full overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {isB2BMode ? 'B2B Μενού' : 'Μενού'}
                </h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="px-4 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Λειτουργία
                  </span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => {
                        setIsB2BMode(false);
                        router.push('/');
                      }}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        !isB2BMode 
                          ? 'bg-white text-emerald-600 shadow-sm' 
                          : 'text-gray-600'
                      }`}
                    >
                      Λιανική
                    </button>
                    <button
                      onClick={() => {
                        setIsB2BMode(true);
                        router.push('/b2b/dashboard');
                      }}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        isB2BMode 
                          ? 'bg-white text-emerald-600 shadow-sm' 
                          : 'text-gray-600'
                      }`}
                    >
                      B2B
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="px-4 py-6">
                <div className="space-y-2">
                  {currentItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <TouchGestures
                        key={item.href}
                        onLongPress={() => logger.debug('Navigation item long press', { item: item.name })}
                      >
                        <button
                          onClick={() => handleNavigate(item.href)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                            isActive
                              ? 'bg-emerald-50 border border-emerald-200'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${
                              isActive 
                                ? 'bg-emerald-100 text-emerald-600' 
                                : 'bg-white text-gray-600'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className={`font-medium ${
                              isActive ? 'text-emerald-900' : 'text-gray-900'
                            }`}>
                              {item.name}
                            </span>
                          </div>

                          {/* Badge */}
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="bg-emerald-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                              {item.badge}
                            </span>
                          )}

                          {/* Active Indicator */}
                          {isActive && (
                            <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                          )}
                        </button>
                      </TouchGestures>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="px-4 py-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Γρήγορες Ενέργειες
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <TouchGestures onLongPress={() => logger.debug('Quick action: profile')}>
                    <button
                      onClick={() => handleNavigate(isB2BMode ? '/b2b/settings' : '/profile')}
                      className="p-4 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded-lg mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-900">Προφίλ</span>
                    </button>
                  </TouchGestures>

                  <TouchGestures onLongPress={() => logger.debug('Quick action: support')}>
                    <button
                      onClick={() => handleNavigate('/support')}
                      className="p-4 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded-lg mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-900">Υποστήριξη</span>
                    </button>
                  </TouchGestures>
                </div>
              </div>
            </TouchGestures>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation (Fixed for key pages) */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: isVisible && !isMenuOpen ? 0 : 100 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom"
      >
        <div className="flex items-center justify-around py-2">
          {currentItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <TouchGestures
                key={item.href}
                onLongPress={() => handleNavigate(item.href)}
              >
                <button
                  onClick={() => handleNavigate(item.href)}
                  className={`flex flex-col items-center justify-center p-2 min-w-[60px] transition-all duration-200 ${
                    isActive ? 'transform scale-110' : ''
                  }`}
                >
                  <div className={`relative p-1 ${
                    isActive ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                    {/* Badge */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-medium mt-1 ${
                    isActive ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    {item.name.length > 8 ? item.name.substring(0, 8) + '...' : item.name}
                  </span>
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute bottom-0 w-6 h-0.5 bg-emerald-600 rounded-full"
                    />
                  )}
                </button>
              </TouchGestures>
            );
          })}
        </div>
      </motion.nav>

      {/* Spacer for fixed bottom navigation */}
      <div className="h-16 md:h-0" />
    </>
  );
}