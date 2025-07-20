'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';
import { 
  UserIcon,
  ShoppingBagIcon,
  HeartIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/stores/cartStore';

const userNavigation = [
  { name: 'Προφίλ μου', href: '/account', icon: UserIcon },
  { name: 'Παραγγελίες', href: '/account/orders', icon: ShoppingBagIcon },
  { name: 'Αγαπημένα', href: '/account/wishlist', icon: HeartIcon },
  { name: 'Ρυθμίσεις', href: '/account/settings', icon: Cog6ToothIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCartStore();
  
  const cartItemsCount = cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        {/* Cart Button for guests */}
        <Link
          href="/cart"
          className="relative p-2 text-gray-700 hover:text-emerald-600 transition-colors"
        >
          <ShoppingBagIcon className="h-6 w-6" />
          {cartItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemsCount > 99 ? '99+' : cartItemsCount}
            </span>
          )}
        </Link>

        {/* Auth Links */}
        <Link
          href="/auth/login"
          className="text-gray-700 hover:text-emerald-600 transition-colors"
        >
          Σύνδεση
        </Link>
        <Link
          href="/auth/register"
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
        >
          Εγγραφή
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Cart Button */}
      <Link
        href="/cart"
        className="relative p-2 text-gray-700 hover:text-emerald-600 transition-colors"
      >
        <ShoppingBagIcon className="h-6 w-6" />
        {cartItemsCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {cartItemsCount > 99 ? '99+' : cartItemsCount}
          </span>
        )}
      </Link>

      {/* User Menu */}
      <Menu as="div" className="relative">
        <div>
          <Menu.Button className="flex max-w-xs items-center rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
            <span className="sr-only">Open user menu</span>
            <div className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
              <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {(user as any)?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-700">
                  {(user as any)?.firstName || 'Χρήστης'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email}
                </p>
              </div>
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </div>
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {(user as any)?.firstName} {(user as any)?.lastName}
              </p>
              <p className="text-sm text-gray-500">
                {user?.email}
              </p>
            </div>

            {/* Navigation Items */}
            {userNavigation.map((item) => (
              <Menu.Item key={item.name}>
                {({ active }) => (
                  <Link
                    href={item.href}
                    className={classNames(
                      active ? 'bg-gray-100' : '',
                      'flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5 text-gray-400" />
                    {item.name}
                  </Link>
                )}
              </Menu.Item>
            ))}

            {/* Separator */}
            <div className="border-t border-gray-100 my-1"></div>

            {/* Logout */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={logout}
                  className={classNames(
                    active ? 'bg-gray-100' : '',
                    'flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
                  Αποσύνδεση
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}