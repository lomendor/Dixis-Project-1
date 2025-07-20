'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  MenuIcon, 
  XIcon, 
  HomeIcon, 
  ShoppingBagIcon, 
  SearchIcon,
  UserIcon,
  BuildingIcon,
  TreePineIcon,
  ChevronRightIcon
} from 'lucide-react';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  submenu?: NavigationItem[];
}

const mainNavigation: NavigationItem[] = [
  {
    href: '/',
    label: 'Αρχική',
    icon: HomeIcon
  },
  {
    href: '/products',
    label: 'Προϊόντα',
    icon: ShoppingBagIcon
  },
  {
    href: '/search',
    label: 'Αναζήτηση',
    icon: SearchIcon
  },
  {
    href: '/adoptions',
    label: 'Υιοθεσίες',
    icon: TreePineIcon
  },
  {
    href: '/b2b',
    label: 'B2B Portal',
    icon: BuildingIcon,
    submenu: [
      { href: '/b2b/login', label: 'Σύνδεση B2B', icon: UserIcon },
      { href: '/b2b/dashboard', label: 'Dashboard', icon: BuildingIcon }
    ]
  }
];

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
    setExpandedSubmenu(null);
  }, [pathname]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleSubmenu = (href: string) => {
    setExpandedSubmenu(expandedSubmenu === href ? null : href);
  };

  const isActiveRoute = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mobile-btn touch-feedback p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Toggle mobile menu"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <XIcon className="w-6 h-6" />
          ) : (
            <MenuIcon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" aria-hidden="true" />
      )}

      {/* Mobile Menu Panel */}
      <div
        ref={navRef}
        className={`lg:hidden fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="mobile-title font-bold text-gray-900">Dixis</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="mobile-btn touch-feedback p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4" role="navigation">
          <ul className="space-y-1 px-4">
            {mainNavigation.map((item) => (
              <li key={item.href}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.href)}
                      className={`mobile-btn touch-feedback w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        isActiveRoute(item.href)
                          ? 'bg-green-100 text-green-700 border-l-4 border-green-500'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      aria-expanded={expandedSubmenu === item.href}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span className="mobile-body font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <ChevronRightIcon 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          expandedSubmenu === item.href ? 'rotate-90' : ''
                        }`} 
                      />
                    </button>
                    
                    {/* Submenu */}
                    {expandedSubmenu === item.href && (
                      <ul className="mt-2 space-y-1 pl-8">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className={`mobile-btn touch-feedback flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                                isActiveRoute(subItem.href)
                                  ? 'bg-green-50 text-green-600'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <subItem.icon className="w-4 h-4" />
                              <span className="mobile-caption">{subItem.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`mobile-btn touch-feedback flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActiveRoute(item.href)
                        ? 'bg-green-100 text-green-700 border-l-4 border-green-500'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="mobile-body font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 space-y-3">
          <Link
            href="/contact"
            className="mobile-btn touch-feedback w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg mobile-body font-medium text-center block"
          >
            Επικοινωνία
          </Link>
          <Link
            href="/about"
            className="mobile-btn touch-feedback w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg mobile-body font-medium text-center block"
          >
            Σχετικά με εμάς
          </Link>
        </div>
      </div>
    </>
  );
}