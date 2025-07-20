'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthUser } from '@/stores/authStore';
import ProductForm from '@/components/producer/ProductForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NewProductPage() {
  const router = useRouter();
  const user = useAuthUser();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'producer') {
      router.push('/login');
    }
  }, [user, router]);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/producer/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      if (response.ok) {
        const data = await response.json();
        
        // If there are images to upload
        const images = formData.getAll('images') as File[];
        if (images.length > 0 && images[0].size > 0) {
          const imageFormData = new FormData();
          images.forEach(image => {
            imageFormData.append('images[]', image);
          });

          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/producer/products/${data.product.id}/images`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
            body: imageFormData,
          });
        }

        router.push('/producer/products');
      } else {
        const errorData = await response.json();
        logger.error('Error creating product:', toError(errorData), errorToContext(errorData));
      }
    } catch (error) {
      logger.error('Error creating product:', toError(error));
    } finally {
      setLoading(false);
    }
  };

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
          
          <h1 className="text-2xl font-bold text-gray-900">Νέο Προϊόν</h1>
          <p className="text-gray-600 mt-1">
            Προσθέστε ένα νέο προϊόν στο κατάστημά σας
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <ProductForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
}