'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
  description?: string;
}

interface B2BNavigationMenuProps {
  className?: string;
  cartItemCount?: number;
}

export default function B2BNavigationMenu({ 
  className = '', 
  cartItemCount = 0 
}: B2BNavigationMenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/b2b/dashboard',
      icon: HomeIcon,
      description: 'Overview and quick stats'
    },
    {
      name: 'Products',
      href: '/b2b/products',
      icon: ShoppingBagIcon,
      description: 'Browse wholesale catalog'
    },
    {
      name: 'Analytics',
      href: '/b2b/dashboard/analytics',
      icon: ChartBarIcon,
      description: 'Business performance insights'
    },
    {
      name: 'Cart',
      href: '/b2b/cart',
      icon: ShoppingCartIcon,
      badge: cartItemCount,
      description: 'Review bulk order'
    },
    {
      name: 'Orders',
      href: '/b2b/orders',
      icon: DocumentTextIcon,
      description: 'Order history and tracking'
    },
    {
      name: 'Pricing',
      href: '/b2b/pricing',
      icon: CurrencyEuroIcon,
      description: 'Tier benefits and volume discounts'
    },
    {
      name: 'Account',
      href: '/b2b/account',
      icon: UserGroupIcon,
      description: 'Business account settings'
    },
    {
      name: 'Settings',
      href: '/b2b/settings',
      icon: CogIcon,
      description: 'Preferences and configuration'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/b2b/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const NavItem = ({ item, mobile = false }: { item: NavigationItem; mobile?: boolean }) => (
    <Link
      href={item.href}
      className={`${
        mobile ? 'block px-3 py-2' : 'flex items-center px-3 py-2'
      } text-sm font-medium rounded-md transition-colors relative ${
        isActive(item.href)
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
      onClick={() => mobile && setIsMobileMenuOpen(false)}
    >
      <item.icon className={`${mobile ? 'mr-3' : 'mr-2'} h-5 w-5 flex-shrink-0`} />
      <span className={mobile ? '' : 'hidden lg:block'}>{item.name}</span>
      
      {item.badge !== undefined && item.badge > 0 && (
        <span className={`${
          mobile ? 'ml-auto' : 'ml-2'
        } inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full`}>
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
      
      {mobile && item.description && (
        <span className="block text-xs text-gray-500 mt-1 ml-8">
          {item.description}
        </span>
      )}
    </Link>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`hidden md:flex bg-white border-r border-gray-200 ${className}`}>
        <div className="flex flex-col w-full">
          <div className="flex-1 px-4 py-6 space-y-1">
            {navigationItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
          
          {/* User Tier Info */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">B</span>
                </div>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900">Bronze Partner</p>
                <p className="text-xs text-gray-500">5% tier discount</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile menu button */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">B2B Portal</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile menu */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: isMobileMenuOpen ? 0 : '-100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">B2B Portal</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 py-4 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => (
                <NavItem key={item.name} item={item} mobile />
              ))}
            </div>

            {/* Mobile Tier Info */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">B</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Bronze Partner</p>
                  <p className="text-xs text-gray-500">5% tier discount • 15 days credit</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}