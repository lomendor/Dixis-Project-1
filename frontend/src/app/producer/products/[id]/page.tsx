'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthUser } from '@/stores/authStore';
import { buildApiUrl, buildStorageUrl } from '@/lib/utils/apiUrls';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyEuroIcon,
  ScaleIcon,
  CubeIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: {
    id: number;
    name: string;
  };
  stock_quantity: number;
  weight: number;
  dimensions: string;
  is_organic: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_featured: boolean;
  status: string;
  seasonality?: any;
  attributes?: any;
  images: Array<{
    id: number;
    path: string;
    is_main: boolean;
  }>;
  created_at: string;
  updated_at: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const user = useAuthUser();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'producer') {
      router.push('/login');
      return;
    }

    fetchProduct();
  }, [user, params.id]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(
        buildApiUrl(`producer/products/${params.id}`),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        if (data.images && data.images.length > 0) {
          const mainImage = data.images.find((img: any) => img.is_main) || data.images[0];
          setSelectedImage(mainImage.path);
        }
      } else {
        router.push('/producer/products');
      }
    } catch (error) {
      logger.error('Error fetching product:', toError(error), errorToContext(error));
      router.push('/producer/products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το προϊόν;')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(
        buildApiUrl(`producer/products/${params.id}`),
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        router.push('/producer/products');
      }
    } catch (error) {
      logger.error('Error deleting product:', toError(error), errorToContext(error));
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-2" />
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/producer/products"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Πίσω στα προϊόντα
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center mt-2 space-x-4">
                {getStatusBadge(product.status)}
                {product.is_featured && (
                  <span className="text-yellow-600 flex items-center">
                    ⭐ Προτεινόμενο προϊόν
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href={`/producer/products/${product.id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Επεξεργασία
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Διαγραφή
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Εικόνες Προϊόντος</h2>
              
              {product.images && product.images.length > 0 ? (
                <div>
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <Image
                      src={buildStorageUrl(selectedImage)}
                      alt={product.name}
                      width={600}
                      height={400}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2">
                    {product.images.map((image) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImage(image.path)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                          selectedImage === image.path ? 'border-green-500' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={buildStorageUrl(image.path)}
                          alt={product.name}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                        {image.is_main && (
                          <span className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 rounded">
                            Κύρια
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Δεν υπάρχουν εικόνες</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Περιγραφή</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
            </div>

            {/* Attributes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Χαρακτηριστικά</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={product.is_organic}
                    readOnly
                    className="h-4 w-4 text-green-600 rounded"
                  />
                  <label className="ml-2 text-gray-700">Βιολογικό</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={product.is_vegan}
                    readOnly
                    className="h-4 w-4 text-green-600 rounded"
                  />
                  <label className="ml-2 text-gray-700">Vegan</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={product.is_gluten_free}
                    readOnly
                    className="h-4 w-4 text-green-600 rounded"
                  />
                  <label className="ml-2 text-gray-700">Χωρίς γλουτένη</label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing and Info */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Τιμολόγηση</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Τιμή πώλησης</p>
                  <p className="text-3xl font-bold text-gray-900">€{product.price.toFixed(2)}</p>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Προμήθεια (12%)</span>
                    <span className="text-sm font-medium text-red-600">
                      -€{(product.price * 0.12).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Καθαρά έσοδα</span>
                    <span className="text-lg font-bold text-green-600">
                      €{(product.price * 0.88).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Πληροφορίες</h2>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <TagIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Κατηγορία</p>
                    <p className="font-medium">{product?.category?.name || 'Χωρίς κατηγορία'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <CubeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Απόθεμα</p>
                    <p className="font-medium">{product.stock_quantity} τεμάχια</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <ScaleIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Βάρος</p>
                    <p className="font-medium">{product.weight}g</p>
                  </div>
                </div>
                
                {product.dimensions && (
                  <div className="flex items-center">
                    <CubeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Διαστάσεις</p>
                      <p className="font-medium">{product.dimensions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ιστορικό</h2>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Δημιουργήθηκε</p>
                  <p className="font-medium">
                    {new Date(product.created_at).toLocaleDateString('el-GR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Τελευταία ενημέρωση</p>
                  <p className="font-medium">
                    {new Date(product.updated_at).toLocaleDateString('el-GR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}