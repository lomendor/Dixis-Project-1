'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  PhotoIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock_quantity: number;
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  category: {
    id: number;
    name: string;
  };
  images: Array<{
    id: number;
    path: string;
    is_main: boolean;
  }>;
  created_at: string;
  updated_at: string;
}

interface ProductsResponse {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function ProducerProductsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0
  });
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'producer') {
      router.push('/login');
      return;
    }

    fetchProducts();
  }, [user, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/producer/products?page=${currentPage}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data: ProductsResponse = await response.json();
        setProducts(data.data);
        setTotalPages(data.last_page);
        
        // Calculate stats
        const allProducts = data.data;
        setStats({
          total: data.total,
          active: allProducts.filter(p => p.status === 'active' || p.status === 'approved').length,
          pending: allProducts.filter(p => p.status === 'pending').length,
          inactive: allProducts.filter(p => p.status === 'inactive' || p.status === 'rejected').length
        });
      }
    } catch (error) {
      logger.error('Error fetching products:', toError(error), errorToContext(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το προϊόν;')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/producer/products/${productId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      logger.error('Error deleting product:', toError(error), errorToContext(error));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) {
      alert('Παρακαλώ επιλέξτε προϊόντα για bulk action');
      return;
    }

    const confirmMessage = 
      action === 'active' ? `Ενεργοποίηση ${selectedProducts.length} προϊόντων;` :
      action === 'inactive' ? `Απενεργοποίηση ${selectedProducts.length} προϊόντων;` :
      action === 'featured' ? `Ορισμός ${selectedProducts.length} προϊόντων ως προτεινόμενα;` :
      action === 'delete' ? `Διαγραφή ${selectedProducts.length} προϊόντων; ΠΡΟΣΟΧΗ: Η ενέργεια δεν αναιρείται!` :
      `Εφαρμογή bulk action σε ${selectedProducts.length} προϊόντα;`;

    if (!confirm(confirmMessage)) return;

    setBulkActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (action === 'delete') {
        // Handle bulk delete
        for (const productId of selectedProducts) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/producer/products/${productId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });
        }
      } else {
        // Handle bulk status update (would need backend endpoint)
        const updateData = action === 'featured' 
          ? { is_featured: true }
          : { status: action };

        // This would typically be a single bulk API call
        // For now, simulate individual updates
        for (const productId of selectedProducts) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/producer/products/${productId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          });
        }
      }

      setSelectedProducts([]);
      fetchProducts();
      alert(`✅ Bulk action "${action}" εφαρμόστηκε επιτυχώς!`);
    } catch (error) {
      logger.error('Error in bulk action:', toError(error), errorToContext(error));
      alert('❌ Σφάλμα κατά το bulk action');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; text: string }> = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Ενεργό' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Εγκεκριμένο' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Υπό έγκριση' },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon, text: 'Ανενεργό' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Απορρίφθηκε' }
    };

    const config = statusConfig[status] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Διαχείριση Προϊόντων</h1>
              <p className="text-gray-600 mt-1">Διαχειριστείτε τα προϊόντα του καταστήματός σας</p>
            </div>
            <Link
              href="/producer/products/new"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Νέο Προϊόν
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Σύνολο Προϊόντων</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-gray-100 rounded-full p-3">
                <PhotoIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ενεργά</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Υπό Έγκριση</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ανενεργά</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <div className="bg-gray-100 rounded-full p-3">
                <XCircleIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-blue-800 font-medium">
                  {selectedProducts.length} προϊόντα επιλεγμένα
                </span>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Καθαρισμός επιλογής
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  className="border border-blue-300 rounded px-3 py-1 text-sm bg-white"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkAction(e.target.value);
                      e.target.value = ''; // Reset selection
                    }
                  }}
                  disabled={bulkActionLoading}
                >
                  <option value="">Επιλέξτε ενέργεια...</option>
                  <option value="active">✅ Ενεργοποίηση</option>
                  <option value="inactive">⏸️ Απενεργοποίηση</option>
                  <option value="featured">⭐ Προτεινόμενα</option>
                  <option value="delete" style={{color: 'red'}}>🗑️ Διαγραφή</option>
                </select>
                
                {bulkActionLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Αναζήτηση προϊόντων..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Όλες οι καταστάσεις</option>
                <option value="active">Ενεργά</option>
                <option value="approved">Εγκεκριμένα</option>
                <option value="pending">Υπό έγκριση</option>
                <option value="inactive">Ανενεργά</option>
                <option value="rejected">Απορριφθέντα</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Δεν βρέθηκαν προϊόντα</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Προϊόν
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Κατηγορία
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Τιμή
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Απόθεμα
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Κατάσταση
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ενέργειες
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${product.images.find(img => img.is_main)?.path || product.images[0].path}`}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover"
                                placeholder="blur"
                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <PhotoIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.is_featured && (
                                <span className="text-yellow-600">⭐ Προτεινόμενο</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product?.category?.name || 'Χωρίς κατηγορία'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">€{product.price.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">
                          Καθαρό: €{(product.price * 0.88).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stock_quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/producer/products/${product.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Προβολή"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link
                            href={`/producer/products/${product.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Επεξεργασία"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Διαγραφή"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Προηγούμενη
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Επόμενη
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === index + 1
                        ? 'z-10 bg-green-50 border-green-500 text-green-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}