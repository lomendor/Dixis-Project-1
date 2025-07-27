'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  UserCircleIcon,
  CubeIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { useCartSummary } from '@/stores/cartStore';
import B2BCartDrawer from './B2BCartDrawer';

interface B2BLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/b2b/dashboard', icon: HomeIcon },
  { name: 'Προϊόντα', href: '/b2b/products', icon: CubeIcon },
  { name: 'Παραγγελίες', href: '/b2b/orders', icon: ShoppingBagIcon },
  { name: 'Τιμολόγια', href: '/b2b/invoices', icon: DocumentTextIcon },
  { name: 'Αναφορές', href: '/b2b/reports', icon: ChartBarIcon },
  { name: 'Ρυθμίσεις', href: '/b2b/settings', icon: CogIcon },
];

export default function B2BLayout({ children }: B2BLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { itemCount } = useCartSummary();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
          </div>

          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white shadow-xl lg:hidden">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                <div className="flex flex-shrink-0 items-center px-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">D</span>
                    </div>
                    <span className="ml-2 text-xl font-bold text-gray-900">Dixis</span>
                    <span className="ml-2 text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">B2B</span>
                  </div>
                </div>
                <nav className="mt-5 space-y-1 px-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                          isActive
                            ? 'bg-blue-100 text-blue-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className={`mr-4 h-6 w-6 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </>
        )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Dixis</span>
                <span className="ml-2 text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">B2B</span>
              </div>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Cart section */}
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md group"
            >
              <div className="flex items-center w-full">
                <ShoppingCartIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                <span className="flex-1">Καλάθι B2B</span>
                {itemCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* User section */}
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {user?.businessName || user?.name || 'Business User'}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-500"
                title="Αποσύνδεση"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar for mobile */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Dixis</span>
              <span className="ml-2 text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">B2B</span>
            </div>
            <div className="flex items-center space-x-2">
              {/* B2B Cart button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative text-gray-400 hover:text-gray-500"
                title="Καλάθι B2B"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
              <UserCircleIcon className="h-6 w-6 text-gray-400" />
              <button
                onClick={logout}
                className="text-gray-400 hover:text-gray-500"
                title="Αποσύνδεση"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* B2B Cart Drawer */}
      <B2BCartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
