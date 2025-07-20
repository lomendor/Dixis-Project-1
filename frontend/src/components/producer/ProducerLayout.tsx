'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  UserIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { navigationVariants } from '@/lib/design-system/variants';

interface ProducerLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/producer/dashboard', 
    icon: HomeIcon,
    description: 'Επισκόπηση δραστηριότητας'
  },
  { 
    name: 'Προϊόντα', 
    href: '/producer/products', 
    icon: ShoppingBagIcon,
    description: 'Διαχείριση προϊόντων',
    badge: '12'
  },
  { 
    name: 'Παραγγελίες', 
    href: '/producer/orders', 
    icon: ChartBarIcon,
    description: 'Διαχείριση παραγγελιών',
    badge: '3'
  },
  { 
    name: 'Προφίλ', 
    href: '/producer/profile', 
    icon: UserIcon,
    description: 'Στοιχεία παραγωγού'
  },
  { 
    name: 'Συνδρομή', 
    href: '/producer/subscription', 
    icon: CreditCardIcon,
    description: 'Διαχείριση συνδρομής'
  },
  { 
    name: 'Βοήθεια', 
    href: '/producer/help', 
    icon: QuestionMarkCircleIcon,
    description: 'Υποστήριξη & FAQ'
  },
  { 
    name: 'Ρυθμίσεις', 
    href: '/producer/settings', 
    icon: CogIcon,
    description: 'Ρυθμίσεις λογαριασμού'
  },
];

export default function ProducerLayout({ children }: ProducerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = usePathname();

  // Enhanced header component
  const ProducerHeader = () => (
    <motion.header 
      className="bg-white border-b border-secondary-200 shadow-sm"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Mobile menu button + Search */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </Button>
            
            {/* Search bar */}
            <div className="hidden sm:block">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Αναζήτηση προϊόντων, παραγγελιών..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 touch-manipulation"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>
          </div>

          {/* Right side - Notifications + Profile */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative"
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              </Button>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-secondary-900">Κτήμα Παπαδόπουλου</p>
                <p className="text-xs text-secondary-500">producer@dixis.io</p>
              </div>
              <Button variant="ghost" size="icon">
                <UserCircleIcon className="h-8 w-8 text-secondary-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );

  // Enhanced sidebar component
  const ProducerSidebar = ({ mobile = false }) => (
    <div className={cn(
      'flex flex-col h-full',
      mobile ? 'w-full' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-secondary-200">
        <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">D</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-secondary-900">Dixis</h1>
          <p className="text-xs text-secondary-500">Παραγωγός</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className={cn(
                  navigationVariants({ 
                    variant: isActive ? 'active' : 'default',
                    size: 'md'
                  }),
                  'w-full justify-start relative group'
                )}
                onClick={() => mobile && setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-secondary-500 mt-0.5 group-hover:text-secondary-600">
                    {item.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-secondary-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-secondary-600 hover:text-secondary-900"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
          Αποσύνδεση
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              className="fixed inset-0 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div 
                className="fixed inset-0 bg-secondary-900 bg-opacity-75" 
                onClick={() => setSidebarOpen(false)} 
              />
            </motion.div>
            
            <motion.div 
              className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white shadow-xl lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <XMarkIcon className="h-6 w-6" />
                </Button>
              </div>
              <ProducerSidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-secondary-200 shadow-sm">
          <ProducerSidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <ProducerHeader />
        
        <main className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
