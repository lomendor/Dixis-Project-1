'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';
import { 
  Receipt, 
  FileText, 
  Download, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Calculator,
  Euro,
  TrendingUp,
  PieChart,
  BarChart3
} from 'lucide-react';

interface TaxComplianceData {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalSales: number;
    totalVatCollected: number;
    totalVatPayable: number;
    netVatPosition: number;
  };
  breakdown: {
    standardRate: { sales: number; vat: number };
    reducedRate: { sales: number; vat: number };
    superReducedRate: { sales: number; vat: number };
    exempt: { sales: number; vat: number };
    reverseCharge: { sales: number; vat: number };
  };
  euTransactions: {
    totalValue: number;
    vatSaved: number;
    transactionCount: number;
  };
  compliance: {
    isCompliant: boolean;
    issues: string[];
    recommendations: string[];
  };
}

export default function TaxComplianceDashboard() {
  const [complianceData, setComplianceData] = useState<TaxComplianceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    fetchComplianceData();
  }, [selectedPeriod]);

  const fetchComplianceData = async () => {
    try {
      setIsLoading(true);
      
      // Calculate date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case 'current-month':
          startDate.setDate(1);
          break;
        case 'last-month':
          startDate.setMonth(endDate.getMonth() - 1, 1);
          endDate.setDate(0);
          break;
        case 'current-quarter':
          const quarterStart = Math.floor(endDate.getMonth() / 3) * 3;
          startDate.setMonth(quarterStart, 1);
          break;
        case 'current-year':
          startDate.setMonth(0, 1);
          break;
      }

      const response = await fetch(
        `/api/tax/compliance-report?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
      );

      if (response.ok) {
        const result = await response.json();
        setComplianceData(result.data);
      }
    } catch (error) {
      logger.error('Failed to fetch tax compliance data', toError(error), errorToContext(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = async (format: 'pdf' | 'csv') => {
    try {
      setIsGeneratingReport(true);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(1); // Current month

      const response = await fetch(
        `/api/tax/compliance-report?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}&format=${format}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tax-compliance-${selectedPeriod}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      logger.error('Failed to download compliance report', toError(error), errorToContext(error));
      alert('Αποτυχία λήψης αναφοράς');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getComplianceStatusColor = (isCompliant: boolean) => {
    return isCompliant ? 'text-green-600' : 'text-red-600';
  };

  const getComplianceStatusIcon = (isCompliant: boolean) => {
    return isCompliant ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <AlertTriangle className="w-5 h-5 text-red-600" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Φόρτωση δεδομένων συμμόρφωσης...</span>
      </div>
    );
  }

  if (!complianceData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Δεν ήταν δυνατή η φόρτωση των δεδομένων συμμόρφωσης.</p>
        <button
          onClick={fetchComplianceData}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Δοκιμάστε ξανά
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Φορολογική Συμμόρφωση</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="current-month">Τρέχων Μήνας</option>
            <option value="last-month">Προηγούμενος Μήνας</option>
            <option value="current-quarter">Τρέχον Τρίμηνο</option>
            <option value="current-year">Τρέχον Έτος</option>
          </select>
        </div>
      </div>

      {/* Compliance Status Card */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getComplianceStatusIcon(complianceData.compliance.isCompliant)}
            <div>
              <h3 className={`text-lg font-semibold ${getComplianceStatusColor(complianceData.compliance.isCompliant)}`}>
                {complianceData.compliance.isCompliant ? 'Συμμορφώνεται' : 'Απαιτεί Προσοχή'}
              </h3>
              <p className="text-sm text-gray-600">
                Κατάσταση φορολογικής συμμόρφωσης για την περίοδο
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDownloadReport('pdf')}
              disabled={isGeneratingReport}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => handleDownloadReport('csv')}
              disabled={isGeneratingReport}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Issues and Recommendations */}
        {(complianceData.compliance.issues.length > 0 || complianceData.compliance.recommendations.length > 0) && (
          <div className="mt-4 space-y-3">
            {complianceData.compliance.issues.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <h4 className="font-medium text-red-800 mb-2">Θέματα προς επίλυση:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {complianceData.compliance.issues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {complianceData.compliance.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <h4 className="font-medium text-blue-800 mb-2">Συστάσεις:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {complianceData.compliance.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Συνολικές Πωλήσεις</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(complianceData.summary.totalSales)}
              </p>
            </div>
            <Euro className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ΦΠΑ Συλλογή</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(complianceData.summary.totalVatCollected)}
              </p>
            </div>
            <Receipt className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">EU Συναλλαγές</p>
              <p className="text-2xl font-bold text-purple-600">
                {complianceData.euTransactions.transactionCount}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              Αξία: {formatCurrency(complianceData.euTransactions.totalValue)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ΦΠΑ Εξοικονόμηση</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(complianceData.euTransactions.vatSaved)}
              </p>
            </div>
            <Calculator className="w-8 h-8 text-green-400" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              Reverse Charge EU
            </p>
          </div>
        </div>
      </div>

      {/* VAT Breakdown */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <PieChart className="w-5 h-5" />
            <span>Ανάλυση ΦΠΑ ανά Συντελεστή</span>
          </h3>
        </div>

        <div className="space-y-4">
          {/* Standard Rate */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div>
                <div className="font-semibold">24% (Κανονικός Συντελεστής)</div>
                <div className="text-sm text-gray-500">Γενικές υπηρεσίες και προϊόντα</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatCurrency(complianceData.breakdown.standardRate.sales)}</div>
              <div className="text-sm text-gray-500">ΦΠΑ: {formatCurrency(complianceData.breakdown.standardRate.vat)}</div>
            </div>
          </div>

          {/* Reduced Rate */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <div>
                <div className="font-semibold">13% (Μειωμένος Συντελεστής)</div>
                <div className="text-sm text-gray-500">Αγροτικά προϊόντα και τρόφιμα</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatCurrency(complianceData.breakdown.reducedRate.sales)}</div>
              <div className="text-sm text-gray-500">ΦΠΑ: {formatCurrency(complianceData.breakdown.reducedRate.vat)}</div>
            </div>
          </div>

          {/* Super Reduced Rate */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div>
                <div className="font-semibold">6% (Υπερμειωμένος Συντελεστής)</div>
                <div className="text-sm text-gray-500">Βασικά τρόφιμα και φάρμακα</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatCurrency(complianceData.breakdown.superReducedRate.sales)}</div>
              <div className="text-sm text-gray-500">ΦΠΑ: {formatCurrency(complianceData.breakdown.superReducedRate.vat)}</div>
            </div>
          </div>

          {/* Reverse Charge */}
          {complianceData.breakdown.reverseCharge.sales > 0 && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div>
                  <div className="font-semibold">0% (Reverse Charge EU)</div>
                  <div className="text-sm text-gray-500">B2B συναλλαγές εντός ΕΕ</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatCurrency(complianceData.breakdown.reverseCharge.sales)}</div>
                <div className="text-sm text-gray-500">ΦΠΑ: €0.00</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Period Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            Περίοδος αναφοράς: {new Date(complianceData.period.startDate).toLocaleDateString('el-GR')} - 
            {new Date(complianceData.period.endDate).toLocaleDateString('el-GR')}
          </span>
        </div>
      </div>
    </div>
  );
}