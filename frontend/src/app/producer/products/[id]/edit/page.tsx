'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthUser } from '@/stores/authStore';
import ProductForm from '@/components/producer/ProductForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  stock_quantity: number;
  weight: number;
  dimensions: string;
  is_organic: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_featured: boolean;
  seasonality?: any;
  attributes?: any;
  images: Array<{
    id: number;
    path: string;
    is_main: boolean;
  }>;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const user = useAuthUser();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'producer') {
      router.push('/login');
      return;
    }

    fetchProduct();
  }, [user, params.id]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/producer/products/${params.id}`,
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

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/producer/products/${params.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(Object.fromEntries(formData)),
        }
      );

      if (response.ok) {
        // Handle new image uploads
        const images = formData.getAll('images') as File[];
        if (images.length > 0 && images[0].size > 0) {
          const imageFormData = new FormData();
          images.forEach(image => {
            imageFormData.append('images[]', image);
          });

          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/producer/products/${params.id}/images`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
              },
              body: imageFormData,
            }
          );
        }

        router.push('/producer/products');
      } else {
        const errorData = await response.json();
        logger.error('Error updating product:', toError(errorData), errorToContext(errorData));
      }
    } catch (error) {
      logger.error('Error updating product:', toError(error), errorToContext(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/producer/products"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Πίσω στα προϊόντα
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900">Επεξεργασία Προϊόντος</h1>
          <p className="text-gray-600 mt-1">
            Ενημερώστε τις πληροφορίες του προϊόντος σας
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {product && (
            <ProductForm
              product={product}
              onSubmit={handleSubmit}
              loading={submitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}