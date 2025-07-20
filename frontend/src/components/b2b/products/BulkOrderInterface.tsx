'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface BulkOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: 'valid' | 'invalid' | 'warning';
  message?: string;
}

interface BulkOrderInterfaceProps {
  onBulkOrder?: (items: BulkOrderItem[]) => void;
  onDownloadTemplate?: () => void;
}

export default function BulkOrderInterface({
  onBulkOrder,
  onDownloadTemplate
}: BulkOrderInterfaceProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [bulkItems, setBulkItems] = useState<BulkOrderItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Παρακαλώ ανεβάστε ένα CSV αρχείο');
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);

    // Simulate CSV processing
    setTimeout(() => {
      const mockItems: BulkOrderItem[] = [
        {
          product_id: '1',
          product_name: 'Εξαιρετικό Παρθένο Ελαιόλαδο',
          quantity: 24,
          unit_price: 9.50,
          total_price: 228.00,
          status: 'valid'
        },
        {
          product_id: '2',
          product_name: 'Βιολογικό Μέλι Θυμαριού',
          quantity: 12,
          unit_price: 14.50,
          total_price: 174.00,
          status: 'valid'
        },        {
          product_id: '999',
          product_name: 'Άγνωστο Προϊόν',
          quantity: 10,
          unit_price: 0,
          total_price: 0,
          status: 'invalid',
          message: 'Το προϊόν δεν βρέθηκε'
        }
      ];
      
      setBulkItems(mockItems);
      setIsProcessing(false);
      setShowResults(true);
    }, 2000);
  };

  const handleDownloadTemplate = () => {
    if (onDownloadTemplate) {
      onDownloadTemplate();
    } else {
      // Default template download
      const csvContent = 'product_id,quantity\n1,24\n2,12\n';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bulk_order_template.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleBulkOrder = () => {
    const validItems = bulkItems.filter(item => item.status === 'valid');
    if (onBulkOrder) {
      onBulkOrder(validItems);
    }
  };

  const totalAmount = bulkItems
    .filter(item => item.status === 'valid')
    .reduce((sum, item) => sum + item.total_price, 0);

  const validCount = bulkItems.filter(item => item.status === 'valid').length;
  const invalidCount = bulkItems.filter(item => item.status === 'invalid').length;  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bulk Παραγγελία</h3>
          <p className="text-sm text-gray-600">Ανεβάστε CSV αρχείο για μαζική παραγγελία</p>
        </div>
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <DocumentArrowDownIcon className="h-4 w-4" />
          Κατέβασμα Template
        </button>
      </div>

      {!showResults ? (
        <>
          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Επεξεργασία αρχείου...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Σύρετε το CSV αρχείο εδώ ή κάντε κλικ για επιλογή
                </p>
                <p className="text-sm text-gray-500">
                  Υποστηρίζονται μόνο CSV αρχεία
                </p>
              </div>
            )}
          </div>          {/* Instructions */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Οδηγίες CSV:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Το αρχείο πρέπει να περιέχει τις στήλες: product_id, quantity</li>
              <li>• Χρησιμοποιήστε κόμμα (,) ως διαχωριστικό</li>
              <li>• Η πρώτη γραμμή πρέπει να περιέχει τα headers</li>
              <li>• Κατεβάστε το template για παράδειγμα</li>
            </ul>
          </div>
        </>
      ) : (
        <>
          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Έγκυρα</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{validCount}</div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2">
                <XMarkIcon className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Άκυρα</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{invalidCount}</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2">
                <ShoppingCartIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Σύνολο</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">€{totalAmount.toFixed(2)}</div>
            </div>
          </div>          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Προϊόν</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Ποσότητα</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Τιμή Μονάδας</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Σύνολο</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Κατάσταση</th>
                </tr>
              </thead>
              <tbody>
                {bulkItems.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{item.product_name}</div>
                      <div className="text-xs text-gray-500">ID: {item.product_id}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{item.quantity}</td>
                    <td className="py-3 px-4 text-gray-700">€{item.unit_price.toFixed(2)}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">€{item.total_price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      {item.status === 'valid' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          <CheckCircleIcon className="h-3 w-3" />
                          Έγκυρο
                        </span>
                      )}
                      {item.status === 'invalid' && (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            <XMarkIcon className="h-3 w-3" />
                            Άκυρο
                          </span>
                          {item.message && (
                            <div className="text-xs text-red-600 mt-1">{item.message}</div>
                          )}
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>          {/* Actions */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setShowResults(false);
                setUploadedFile(null);
                setBulkItems([]);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Ανέβασμα νέου αρχείου
            </button>
            
            <div className="flex gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-600">Σύνολο έγκυρων προϊόντων:</div>
                <div className="text-lg font-bold text-blue-600">€{totalAmount.toFixed(2)}</div>
              </div>
              
              <button
                onClick={handleBulkOrder}
                disabled={validCount === 0}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <ShoppingCartIcon className="h-4 w-4" />
                Προσθήκη στο καλάθι ({validCount})
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}