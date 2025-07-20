'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  Squares2X2Icon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  UserIcon,
  HeartIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { useCartSummary } from '@/stores/cartStore';
import SearchBar from '@/components/SearchBar';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { name: 'Αρχική', href: '/', icon: HomeIcon },
  { name: 'Προϊόντα', href: '/products', icon: ShoppingBagIcon },
  { name: 'Υιοθεσίες', href: '/adoptions', icon: HeartIcon },
  { name: 'Παραγωγοί', href: '/producers', icon: UserGroupIcon },
  { name: 'Κατηγορίες', href: '/categories', icon: Squares2X2Icon },
  { name: 'Σχετικά', href: '/about', icon: InformationCircleIcon },
];

export default function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const pathname = usePathname();

  // Unified auth and cart state
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCartSummary();

  const [searchFocused, setSearchFocused] = useState(false);

  const handleLinkClick = () => {
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80 mobile-backdrop-blur" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 mobile-safe-area">
                {/* Header */}
                <div className="flex h-16 shrink-0 items-center justify-between">
                  <Link href="/" onClick={handleLinkClick} className="text-2xl font-bold text-green-600">
                    Dixis
                  </Link>
                  <button
                    type="button"
                    className="mobile-btn-icon text-gray-400 hover:text-gray-600 touch-feedback"
                    onClick={onClose}
                  >
                    <span className="sr-only">Κλείσιμο μενού</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Search */}
                <div className="mobile-fade-in">
                  <div className="relative">
                    <MagnifyingGlassIcon
                      className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${
                        searchFocused ? 'text-green-600' : 'text-gray-400'
                      }`}
                    />
                    <SearchBar
                      placeholder="Αναζήτηση προϊόντων..."
                      className="mobile-input pl-10"
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                    />
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-1 flex-col mobile-spacing">
                  <ul role="list" className="flex flex-1 flex-col gap-y-2">
                    {navigationItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            onClick={handleLinkClick}
                            className={`mobile-nav-item flex items-center gap-x-3 text-sm font-semibold leading-6 touch-feedback ${
                              isActive
                                ? 'bg-green-50 text-green-700'
                                : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                            }`}
                          >
                            <item.icon
                              className={`h-6 w-6 shrink-0 ${
                                isActive ? 'text-green-600' : 'text-gray-400'
                              }`}
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Quick Actions */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <Link
                      href="/cart"
                      onClick={handleLinkClick}
                      className="mobile-nav-item flex items-center gap-x-3 text-sm font-semibold leading-6 text-gray-700 hover:text-green-600 hover:bg-gray-50 touch-feedback"
                    >
                      <div className="relative">
                        <ShoppingCartIcon className="h-6 w-6 shrink-0 text-gray-400" />
                        {itemCount > 0 && (
                          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold text-white">
                            {itemCount > 9 ? '9+' : itemCount}
                          </span>
                        )}
                      </div>
                      Καλάθι {itemCount > 0 && `(${itemCount})`}
                    </Link>

                    <Link
                      href="/favorites"
                      onClick={handleLinkClick}
                      className="mobile-nav-item flex items-center gap-x-3 text-sm font-semibold leading-6 text-gray-700 hover:text-green-600 hover:bg-gray-50 touch-feedback"
                    >
                      <HeartIcon className="h-6 w-6 shrink-0 text-gray-400" />
                      Αγαπημένα
                    </Link>
                  </div>

                  {/* User Section */}
                  <div className="border-t border-gray-200 pt-4">
                    {isAuthenticated && user ? (
                      <div className="space-y-2">
                        <div className="mobile-nav-item flex items-center gap-x-3">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user.firstName || user.email}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <Link
                          href="/profile"
                          onClick={handleLinkClick}
                          className="mobile-nav-item flex items-center gap-x-3 text-sm font-semibold leading-6 text-gray-700 hover:text-green-600 hover:bg-gray-50 touch-feedback"
                        >
                          <UserIcon className="h-6 w-6 shrink-0 text-gray-400" />
                          Προφίλ
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="mobile-nav-item w-full flex items-center gap-x-3 text-sm font-semibold leading-6 text-red-600 hover:bg-red-50 touch-feedback"
                        >
                          <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Αποσύνδεση
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Link
                          href="/login"
                          onClick={handleLinkClick}
                          className="mobile-btn mobile-btn-primary w-full text-center touch-feedback"
                        >
                          Σύνδεση
                        </Link>
                        <Link
                          href="/register"
                          onClick={handleLinkClick}
                          className="mobile-btn mobile-btn-secondary w-full text-center touch-feedback"
                        >
                          Εγγραφή
                        </Link>
                      </div>
                    )}
                  </div>
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
