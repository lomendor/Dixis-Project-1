'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ChevronUpDownIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  producer: string;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  image: string;
  createdAt: string;
}

interface ProductsTableProps {
  products?: Product[];
  loading?: boolean;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Βιολογικό Ελαιόλαδο Εξαιρετικό Παρθένο',
    price: 12.99,
    category: 'Έλαια',
    producer: 'Κτήμα Παπαδόπουλου',
    stock: 45,
    status: 'active',
    image: '/placeholder-product.jpg',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Μέλι Θυμαρίσιο Κρήτης',
    price: 8.50,
    category: 'Μέλι',
    producer: 'Μελισσοκομία Κρήτης',
    stock: 23,
    status: 'active',
    image: '/placeholder-product.jpg',
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    name: 'Φέτα ΠΟΠ Λέσβου',
    price: 15.80,
    category: 'Τυριά',
    producer: 'Τυροκομείο Λέσβου',
    stock: 0,
    status: 'out_of_stock',
    image: '/placeholder-product.jpg',
    createdAt: '2024-01-13'
  },
  {
    id: '4',
    name: 'Κρασί Ασύρτικο Σαντορίνης',
    price: 22.00,
    category: 'Κρασιά',
    producer: 'Οινοποιείο Σαντορίνης',
    stock: 12,
    status: 'active',
    image: '/placeholder-product.jpg',
    createdAt: '2024-01-12'
  },
  {
    id: '5',
    name: 'Παστίτσιο Παραδοσιακό',
    price: 18.50,
    category: 'Έτοιμα Φαγητά',
    producer: 'Μαγειρική Τέχνη',
    stock: 8,
    status: 'inactive',
    image: '/placeholder-product.jpg',
    createdAt: '2024-01-11'
  }
];

const statusConfig = {
  active: {
    label: 'Ενεργό',
    className: 'bg-success-100 text-success-800',
  },
  inactive: {
    label: 'Ανενεργό',
    className: 'bg-secondary-100 text-secondary-800',
  },
  out_of_stock: {
    label: 'Εξαντλημένο',
    className: 'bg-error-100 text-error-800',
  },
};

export default function ProductsTable({ products = mockProducts, loading = false }: ProductsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortField, setSortField] = useState<keyof Product>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.producer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-secondary-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-semibold">
            Διαχείριση Προϊόντων ({filteredProducts.length})
          </CardTitle>
          
          <Button asChild>
            <Link href="/admin/products/new">
              <PlusIcon className="h-4 w-4 mr-2" />
              Νέο Προϊόν
            </Link>
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="Αναζήτηση προϊόντων..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Όλες οι κατηγορίες</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Όλες οι καταστάσεις</option>
            <option value="active">Ενεργά</option>
            <option value="inactive">Ανενεργά</option>
            <option value="out_of_stock">Εξαντλημένα</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Προϊόν
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center gap-1">
                    Τιμή
                    <ChevronUpDownIcon className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Κατηγορία
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Παραγωγός
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center gap-1">
                    Απόθεμα
                    <ChevronUpDownIcon className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Κατάσταση
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Ενέργειες
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-secondary-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-secondary-900 line-clamp-2">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    €{product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    {product.producer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      product.stock === 0 ? 'bg-error-100 text-error-800' :
                      product.stock < 10 ? 'bg-warning-100 text-warning-800' :
                      'bg-success-100 text-success-800'
                    )}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      statusConfig[product.status].className
                    )}>
                      {statusConfig[product.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/products/${product.id}`}>
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-error-600 hover:text-error-700">
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 p-4">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-secondary-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={60}
                  height={60}
                  className="h-15 w-15 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-secondary-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-secondary-500 mt-1">{product.producer}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-semibold text-primary-600">
                      €{product.price.toFixed(2)}
                    </span>
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      statusConfig[product.status].className
                    )}>
                      {statusConfig[product.status].label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-secondary-500">
                      Απόθεμα: {product.stock}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/products/${product.id}`}>
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBagIcon className="mx-auto h-12 w-12 text-secondary-400" />
            <h3 className="mt-2 text-sm font-medium text-secondary-900">Δεν βρέθηκαν προϊόντα</h3>
            <p className="mt-1 text-sm text-secondary-500">
              Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
