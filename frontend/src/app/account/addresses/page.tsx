'use client';

import { useState, useEffect } from 'react';
import { 
  MapPinIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  HomeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

// Validation schema
const addressSchema = z.object({
  type: z.enum(['home', 'work', 'other']),
  firstName: z.string().min(2, 'Το όνομα πρέπει να είναι τουλάχιστον 2 χαρακτήρες'),
  lastName: z.string().min(2, 'Το επώνυμο πρέπει να είναι τουλάχιστον 2 χαρακτήρες'),
  company: z.string().optional(),
  address: z.string().min(5, 'Η διεύθυνση πρέπει να είναι τουλάχιστον 5 χαρακτήρες'),
  city: z.string().min(2, 'Η πόλη πρέπει να είναι τουλάχιστον 2 χαρακτήρες'),
  postalCode: z.string().regex(/^[0-9]{5}$/, 'Ο ταχυδρομικός κώδικας πρέπει να είναι 5 ψηφία'),
  phone: z.string().regex(/^(\+30)?[0-9]{10}$/, 'Μη έγκυρος αριθμός τηλεφώνου'),
  isDefault: z.boolean().optional()
});

type AddressFormData = z.infer<typeof addressSchema>;

interface Address extends AddressFormData {
  id: string;
  createdAt: string;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema)
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/account/addresses');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.data || []);
      } else {
        // Mock data for development
        const mockAddresses: Address[] = [
          {
            id: '1',
            type: 'home',
            firstName: 'Μαρία',
            lastName: 'Παπαδοπούλου',
            address: 'Πατησίων 123',
            city: 'Αθήνα',
            postalCode: '10678',
            phone: '6912345678',
            isDefault: true,
            createdAt: '2024-01-15'
          },
          {
            id: '2',
            type: 'work',
            firstName: 'Μαρία',
            lastName: 'Παπαδοπούλου',
            company: 'Εταιρεία ΑΒΓ',
            address: 'Βασιλίσσης Σοφίας 45',
            city: 'Αθήνα',
            postalCode: '10676',
            phone: '2101234567',
            isDefault: false,
            createdAt: '2024-01-20'
          }
        ];
        setAddresses(mockAddresses);
      }
    } catch (error) {
      logger.error('Failed to fetch addresses', toError(error), errorToContext(error));
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    try {
      const url = editingAddress 
        ? `/api/account/addresses/${editingAddress.id}`
        : '/api/account/addresses';
      
      const method = editingAddress ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const savedAddress = await response.json();
        
        if (editingAddress) {
          setAddresses(addresses.map(addr => 
            addr.id === editingAddress.id ? { ...savedAddress, id: editingAddress.id } : addr
          ));
        } else {
          setAddresses([...addresses, { ...savedAddress, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
        }
        
        // If this is set as default, update other addresses
        if (data.isDefault) {
          setAddresses(addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === (editingAddress?.id || savedAddress.id)
          })));
        }
        
        setShowForm(false);
        setEditingAddress(null);
        reset();
      }
    } catch (error) {
      logger.error('Failed to save address', toError(error), errorToContext(error));
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    Object.keys(address).forEach(key => {
      if (key !== 'id' && key !== 'createdAt') {
        setValue(key as keyof AddressFormData, address[key as keyof Address] as any);
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (addressId: string) => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη διεύθυνση;')) {
      try {
        const response = await fetch(`/api/account/addresses/${addressId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setAddresses(addresses.filter(addr => addr.id !== addressId));
        }
      } catch (error) {
        logger.error('Failed to delete address', toError(error), errorToContext(error));
      }
    }
  };

  const setAsDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/account/addresses/${addressId}/default`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setAddresses(addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        })));
      }
    } catch (error) {
      logger.error('Failed to set default address', toError(error), errorToContext(error));
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <HomeIcon className="h-5 w-5" />;
      case 'work':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      default:
        return <MapPinIcon className="h-5 w-5" />;
    }
  };

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case 'home':
        return 'Σπίτι';
      case 'work':
        return 'Εργασία';
      default:
        return 'Άλλο';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <MapPinIcon className="h-8 w-8 text-blue-600 mr-3" />
          Οι Διευθύνσεις μου ({addresses.length})
        </h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingAddress(null);
            reset();
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Νέα Διεύθυνση
        </button>
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {editingAddress ? 'Επεξεργασία Διεύθυνσης' : 'Νέα Διεύθυνση'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Address Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Τύπος διεύθυνσης
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['home', 'work', 'other'] as const).map((type) => (
                  <label key={type} className="relative">
                    <input
                      {...register('type')}
                      type="radio"
                      value={type}
                      className="sr-only peer"
                    />
                    <div className="flex items-center justify-center p-3 border border-gray-300 rounded-md cursor-pointer peer-checked:border-green-500 peer-checked:bg-green-50">
                      {getAddressTypeIcon(type)}
                      <span className="ml-2 text-sm font-medium">
                        {getAddressTypeLabel(type)}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Όνομα</label>
                <input
                  {...register('firstName')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Επώνυμο</label>
                <input
                  {...register('lastName')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Company (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Εταιρεία (προαιρετικό)</label>
              <input
                {...register('company')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Διεύθυνση</label>
              <input
                {...register('address')}
                type="text"
                placeholder="π.χ. Πατησίων 123"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            {/* City and Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Πόλη</label>
                <input
                  {...register('city')}
                  type="text"
                  placeholder="π.χ. Αθήνα"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ταχυδρομικός Κώδικας</label>
                <input
                  {...register('postalCode')}
                  type="text"
                  placeholder="π.χ. 10678"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Τηλέφωνο</label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="π.χ. 6912345678"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Default address */}
            <div className="flex items-center">
              <input
                {...register('isDefault')}
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Ορισμός ως προεπιλεγμένη διεύθυνση
              </label>
            </div>

            {/* Form actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAddress(null);
                  reset();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Ακύρωση
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                {editingAddress ? 'Ενημέρωση' : 'Αποθήκευση'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses List */}
      {addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-lg shadow p-6 ${
                address.isDefault ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getAddressTypeIcon(address.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {getAddressTypeLabel(address.type)}
                      </h3>
                      {address.isDefault && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Προεπιλογή
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900 font-medium">
                      {address.firstName} {address.lastName}
                    </p>
                    {address.company && (
                      <p className="text-gray-600">{address.company}</p>
                    )}
                    <p className="text-gray-600">
                      {address.address}
                    </p>
                    <p className="text-gray-600">
                      {address.city}, {address.postalCode}
                    </p>
                    <p className="text-gray-600">
                      {address.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => setAsDefault(address.id)}
                      className="text-sm text-green-600 hover:text-green-500"
                    >
                      Ορισμός ως προεπιλογή
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-gray-400 hover:text-red-500"
                    disabled={address.isDefault}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Δεν έχετε αποθηκευμένες διευθύνσεις
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Προσθέστε μια διεύθυνση για γρηγορότερες παραγγελίες!
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Προσθήκη διεύθυνσης
            </button>
          </div>
        </div>
      )}
    </div>
  );
}