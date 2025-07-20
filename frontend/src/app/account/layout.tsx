'use client';

import { useRequireAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  UserIcon, 
  ShoppingBagIcon, 
  HeartIcon, 
  CreditCardIcon,
  MapPinIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useUnifiedAuthStore } from '@/stores/unifiedAuthStore';

const navigation = [
  { name: 'Πίνακας Ελέγχου', href: '/account', icon: UserIcon },
  { name: 'Οι Παραγγελίες μου', href: '/account/orders', icon: ShoppingBagIcon },
  { name: 'Αγαπημένα', href: '/account/wishlist', icon: HeartIcon },
  { name: 'Διευθύνσεις', href: '/account/addresses', icon: MapPinIcon },
  { name: 'Μέθοδοι Πληρωμής', href: '/account/payment-methods', icon: CreditCardIcon },
  { name: 'Ειδοποιήσεις', href: '/account/notifications', icon: BellIcon },
  { name: 'Ρυθμίσεις', href: '/account/settings', icon: Cog6ToothIcon },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useUnifiedAuthStore();
  const { isAuthorized, isLoading } = useRequireAuth('customer');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Redirect is handled by useRequireAuth
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-full">
        {/* Sidebar for desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
              <div className="flex-grow flex flex-col">
                <nav className="flex-1 px-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`
                          group flex items-center px-2 py-2 text-sm font-medium rounded-md
                          ${isActive 
                            ? 'bg-green-100 text-green-900' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <item.icon
                          className={`
                            mr-3 flex-shrink-0 h-6 w-6
                            ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-500'}
                          `}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              
              {/* Logout button */}
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <button
                  onClick={logout}
                  className="flex-shrink-0 w-full group block"
                >
                  <div className="flex items-center">
                    <ArrowLeftOnRectangleIcon className="inline-block h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        Αποσύνδεση
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2">
          <select
            value={pathname}
            onChange={(e) => window.location.href = e.target.value}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
          >
            {navigation.map((item) => (
              <option key={item.href} value={item.href}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}