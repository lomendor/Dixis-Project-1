'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  PhotoIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    stock_quantity: number;
    status: string;
    is_featured: boolean;
    category?: {
      id: number;
      name: string;
    };
    images?: Array<{
      id: number;
      path: string;
      is_main: boolean;
    }>;
  };
  onDelete?: (id: number) => void;
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
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
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const mainImage = product?.images?.find(img => img.is_main) || product.images?.[0];

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Image */}
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        {mainImage ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${mainImage.path}`}
            alt={product.name}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gray-100">
            <PhotoIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          {product.is_featured && (
            <span className="text-yellow-500" title="Προτεινόμενο προϊόν">
              ⭐
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-2">
          {product?.category?.name || 'Χωρίς κατηγορία'}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xl font-bold text-gray-900">€{product.price.toFixed(2)}</p>
            <p className="text-xs text-gray-500">
              Καθαρό: €{(product.price * 0.88).toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{product.stock_quantity}</p>
            <p className="text-xs text-gray-500">Απόθεμα</p>
          </div>
        </div>

        <div className="mb-3">
          {getStatusBadge(product.status)}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <Link
            href={`/producer/products/${product.id}`}
            className="text-blue-600 hover:text-blue-900 flex items-center text-sm"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            Προβολή
          </Link>
          <Link
            href={`/producer/products/${product.id}/edit`}
            className="text-indigo-600 hover:text-indigo-900 flex items-center text-sm"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Επεξεργασία
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(product.id)}
              className="text-red-600 hover:text-red-900 flex items-center text-sm"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Διαγραφή
            </button>
          )}
        </div>
      </div>
    </div>
  );
}