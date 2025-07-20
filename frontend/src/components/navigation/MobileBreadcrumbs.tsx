'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRightIcon, ChevronLeftIcon, HomeIcon } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

const routeLabels: Record<string, string> = {
  '': 'Αρχική',
  'products': 'Προϊόντα',
  'search': 'Αναζήτηση',
  'adoptions': 'Υιοθεσίες',
  'b2b': 'B2B Portal',
  'dashboard': 'Dashboard',
  'login': 'Σύνδεση',
  'settings': 'Ρυθμίσεις',
  'orders': 'Παραγγελίες',
  'reports': 'Αναφορές',
  'checkout': 'Ολοκλήρωση Παραγγελίας',
  'confirmation': 'Επιβεβαίωση',
  'contact': 'Επικοινωνία',
  'about': 'Σχετικά με εμάς'
};

export default function MobileBreadcrumbs() {
  const pathname = usePathname();
  
  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Αρχική', href: '/' }
    ];

    // Build breadcrumbs from path segments
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      // Handle dynamic routes (e.g., /products/[slug])
      const label = routeLabels[segment] || 
                   (segment.length > 20 ? `${segment.substring(0, 20)}...` : segment);
      
      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrentPage: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  
  // Don't show breadcrumbs on home page
  if (pathname === '/') {
    return null;
  }

  // Show compact breadcrumbs on mobile
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      {/* Mobile Compact View */}
      <div className="lg:hidden">
        {breadcrumbs.length > 1 && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
            {/* Back Button */}
            {breadcrumbs.length > 1 && (
              <Link
                href={breadcrumbs[breadcrumbs.length - 2].href}
                className="mobile-btn touch-feedback flex items-center space-x-1 text-gray-600 hover:text-gray-900 py-1 px-2 rounded-md"
                aria-label="Go back"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span className="mobile-caption">Πίσω</span>
              </Link>
            )}
            
            {/* Current Page with Context */}
            <div className="flex items-center space-x-1 flex-1 min-w-0">
              <HomeIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <ChevronRightIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
              
              {/* Show parent if available */}
              {breadcrumbs.length > 2 && (
                <>
                  <span className="mobile-caption text-gray-500 truncate">
                    {breadcrumbs[breadcrumbs.length - 2].label}
                  </span>
                  <ChevronRightIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                </>
              )}
              
              <span className="mobile-caption font-medium text-gray-900 truncate">
                {breadcrumbs[breadcrumbs.length - 1].label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Full View */}
      <div className="hidden lg:block">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
              )}
              
              {item.isCurrentPage ? (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {index === 0 && (
                    <HomeIcon className="w-4 h-4 inline mr-1" />
                  )}
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}