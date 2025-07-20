'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { useState } from 'react';
import Link from 'next/link';
import { Upload, Download, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

interface CSVRow {
  productId: string;
  productName: string;
  quantity: number;
  wholesalePrice: number;
  total: number;
  status: 'valid' | 'invalid' | 'warning';
  message?: string;
}

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      processCSV(selectedFile);
    } else {
      alert('Παρακαλώ επιλέξτε ένα έγκυρο CSV αρχείο');
    }
  };

  const processCSV = async (file: File) => {
    setIsProcessing(true);
    setUploadStatus('processing');

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      
      // Validate headers
      const expectedHeaders = ['product_id', 'quantity'];
      const hasValidHeaders = expectedHeaders.every(header => 
        headers.some(h => h.toLowerCase().trim() === header)
      );

      if (!hasValidHeaders) {
        throw new Error('Μη έγκυρες κολόνες CSV. Απαιτούνται: product_id, quantity');
      }

      // Process data rows
      const processedData: CSVRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const productId = values[0]?.trim();
        const quantity = parseInt(values[1]?.trim());

        if (!productId || isNaN(quantity)) {
          processedData.push({
            productId: productId || 'N/A',
            productName: 'Άγνωστο προϊόν',
            quantity: quantity || 0,
            wholesalePrice: 0,
            total: 0,
            status: 'invalid',
            message: 'Μη έγκυρα δεδομένα'
          });
          continue;
        }

        // Simulate product lookup (in real app, this would be an API call)
        const mockProduct = await simulateProductLookup(productId);
        
        processedData.push({
          productId,
          productName: mockProduct.name,
          quantity,
          wholesalePrice: mockProduct.wholesalePrice,
          total: quantity * mockProduct.wholesalePrice,
          status: mockProduct.exists ? 'valid' : 'invalid',
          message: mockProduct.exists ? undefined : 'Προϊόν δεν βρέθηκε'
        });
      }

      setCsvData(processedData);
      setUploadStatus('success');
    } catch (error) {
      logger.error('CSV processing error:', toError(error), errorToContext(error));
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };  // Simulate product lookup (replace with real API call)
  const simulateProductLookup = async (productId: string) => {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
    
    const mockProducts: Record<string, any> = {
      '56': { name: 'Εξτραπάρθενο Ελαιόλαδο Κορωνέικη', wholesalePrice: 10.63, exists: true },
      '58': { name: 'Ελιές Καλαμών Εξαιρετικές', wholesalePrice: 7.57, exists: true },
      '60': { name: 'Μέλι Θυμαρίσιο Κρήτης', wholesalePrice: 15.30, exists: true },
    };

    return mockProducts[productId] || { name: 'Άγνωστο προϊόν', wholesalePrice: 0, exists: false };
  };

  const downloadTemplate = () => {
    const csvContent = 'product_id,quantity\n56,10\n58,5\n60,3';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_order_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkOrder = () => {
    const validItems = csvData.filter(item => item.status === 'valid');
    if (validItems.length === 0) {
      alert('Δεν υπάρχουν έγκυρα προϊόντα για παραγγελία');
      return;
    }

    // Here you would integrate with the B2B cart store
    alert(`Θα προστεθούν ${validItems.length} προϊόντα στην παραγγελία`);
  };

  const getTotalAmount = () => {
    return csvData
      .filter(item => item.status === 'valid')
      .reduce((sum, item) => sum + item.total, 0);
  };

  const getValidItemsCount = () => {
    return csvData.filter(item => item.status === 'valid').length;
  };  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/b2b/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Επιστροφή στο Dashboard</span>
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900">Bulk Upload Παραγγελίας</h1>
                <p className="text-sm text-gray-600">Ανέβασμα παραγγελίας από CSV αρχείο</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Ανέβασμα CSV Αρχείου</h2>
              </div>
              
              <div className="p-6">
                {/* Template Download */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-blue-900">Κατεβάστε το Template</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Χρησιμοποιήστε το template για να δημιουργήσετε το CSV αρχείο σας
                      </p>
                      <button
                        onClick={downloadTemplate}
                        className="mt-2 flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                      >
                        <Download className="w-4 h-4" />
                        <span>Κατέβασμα Template</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ανεβάστε το CSV αρχείο σας
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Επιλέξτε ένα CSV αρχείο με τα προϊόντα και τις ποσότητες
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md cursor-pointer inline-block"
                  >
                    Επιλογή Αρχείου
                  </label>
                  {file && (
                    <p className="mt-2 text-sm text-gray-600">
                      Επιλεγμένο αρχείο: {file.name}
                    </p>
                  )}
                </div>

                {/* Processing Status */}
                {isProcessing && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                      <span className="text-yellow-800">Επεξεργασία αρχείου...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>            {/* Results Table */}
            {csvData.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Αποτελέσματα Επεξεργασίας</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Κατάσταση
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID Προϊόντος
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Όνομα Προϊόντος
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ποσότητα
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Τιμή Μονάδας
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Σύνολο
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {csvData.map((row, index) => (
                        <tr key={index} className={row.status === 'invalid' ? 'bg-red-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {row.status === 'valid' ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                              )}
                              <span className="ml-2 text-sm">
                                {row.status === 'valid' ? 'Έγκυρο' : 'Μη έγκυρο'}
                              </span>
                            </div>
                            {row.message && (
                              <p className="text-xs text-red-600 mt-1">{row.message}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.productId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.productName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            €{row.wholesalePrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            €{row.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            {csvData.length > 0 && (
              <div className="bg-white rounded-lg shadow sticky top-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Σύνοψη Παραγγελίας</h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Συνολικά προϊόντα:</span>
                      <span className="font-medium">{csvData.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Έγκυρα προϊόντα:</span>
                      <span className="font-medium text-green-600">{getValidItemsCount()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Μη έγκυρα:</span>
                      <span className="font-medium text-red-600">{csvData.length - getValidItemsCount()}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Συνολικό κόστος:</span>
                        <span>€{getTotalAmount().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {getValidItemsCount() > 0 && (
                    <button
                      onClick={handleBulkOrder}
                      className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium"
                    >
                      Προσθήκη στην Παραγγελία ({getValidItemsCount()} προϊόντα)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}