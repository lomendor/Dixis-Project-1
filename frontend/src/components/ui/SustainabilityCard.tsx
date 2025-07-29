'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CloudIcon,
  BeakerIcon,
  SunIcon,
  SparklesIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface SustainabilityMetric {
  label: string;
  value: number | string;
  unit?: string;
  icon: React.ReactNode;
  color: string;
  benchmark?: number;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

interface SustainabilityCardProps {
  carbonFootprint?: number;
  waterUsage?: number;
  pesticideFreeDays?: number;
  soilHealthScore?: number;
  renewableEnergyPercentage?: number;
  
  // Display options
  showComparisons?: boolean;
  showTrends?: boolean;
  compact?: boolean;
  className?: string;
}

const MetricItem: React.FC<{
  metric: SustainabilityMetric;
  showComparisons: boolean;
  showTrends: boolean;
  compact: boolean;
}> = ({ metric, showComparisons, showTrends, compact }) => {
  const formatValue = (value: number | string, unit?: string) => {
    if (typeof value === 'number' && value % 1 !== 0) {
      return `${value.toFixed(2)}${unit || ''}`;
    }
    return `${value}${unit || ''}`;
  };

  const getBenchmarkStatus = (value: number, benchmark?: number) => {
    if (!benchmark) return null;
    
    if (value <= benchmark * 0.8) return 'excellent';
    if (value <= benchmark) return 'good';
    if (value <= benchmark * 1.2) return 'average';
    return 'needs-improvement';
  };

  const benchmarkStatus = typeof metric.value === 'number' && metric.benchmark 
    ? getBenchmarkStatus(metric.value, metric.benchmark)
    : null;

  const statusColors = {
    excellent: 'text-green-600 bg-green-50',
    good: 'text-blue-600 bg-blue-50',
    average: 'text-yellow-600 bg-yellow-50',
    'needs-improvement': 'text-red-600 bg-red-50'
  };

  const statusLabels = {
    excellent: 'Εξαιρετικό',
    good: 'Καλό',
    average: 'Μέτριο',
    'needs-improvement': 'Χρειάζεται βελτίωση'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        p-4 rounded-lg border-2 border-opacity-20 
        ${metric.color} hover:scale-105 transition-transform duration-200
        ${compact ? 'p-3' : 'p-4'}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className={`${compact ? 'w-5 h-5' : 'w-6 h-6'}`}>
            {metric.icon}
          </span>
          <span className={`font-medium ${compact ? 'text-sm' : 'text-base'}`}>
            {metric.label}
          </span>
        </div>
        
        {showTrends && metric.trend && (
          <div className={`flex items-center ${compact ? 'text-xs' : 'text-sm'}`}>
            {metric.trend === 'up' && <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />}
            {metric.trend === 'down' && <ArrowTrendingDownIcon className="w-4 h-4 text-green-500" />}
          </div>
        )}
      </div>

      <div className={`${compact ? 'text-lg' : 'text-2xl'} font-bold mb-1`}>
        {formatValue(metric.value, metric.unit)}
      </div>

      {metric.description && (
        <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'} mb-2`}>
          {metric.description}
        </p>
      )}

      {showComparisons && benchmarkStatus && (
        <div className={`
          inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
          ${statusColors[benchmarkStatus]}
        `}>
          <CheckCircleIcon className="w-3 h-3" />
          <span>{statusLabels[benchmarkStatus]}</span>
        </div>
      )}

      {showComparisons && metric.benchmark && typeof metric.value === 'number' && (
        <div className={`mt-2 ${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
          Μέσος όρος: {formatValue(metric.benchmark, metric.unit)}
        </div>
      )}
    </motion.div>
  );
};

export default function SustainabilityCard({
  carbonFootprint,
  waterUsage,
  pesticideFreeDays = 0,
  soilHealthScore,
  renewableEnergyPercentage,
  showComparisons = true,
  showTrends = true,
  compact = false,
  className = ''
}: SustainabilityCardProps) {
  const metrics: SustainabilityMetric[] = [];

  // Carbon Footprint
  if (carbonFootprint !== undefined && carbonFootprint > 0) {
    metrics.push({
      label: 'Ανθρακικό Αποτύπωμα',
      value: carbonFootprint,
      unit: ' kg CO₂',
      icon: <CloudIcon className="w-full h-full" />,
      color: carbonFootprint < 1.0 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200',
      benchmark: 2.5, // Average for agricultural products
      trend: carbonFootprint < 1.0 ? 'down' : 'neutral',
      description: 'Εκπομπές CO₂ ανά μονάδα προϊόντος'
    });
  }

  // Water Usage
  if (waterUsage !== undefined && waterUsage > 0) {
    metrics.push({
      label: 'Κατανάλωση Νερού',
      value: waterUsage,
      unit: ' L',
      icon: <BeakerIcon className="w-full h-full" />,
      color: waterUsage < 100 ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-cyan-100 text-cyan-800 border-cyan-200',
      benchmark: 200, // Average water usage
      trend: waterUsage < 100 ? 'down' : 'neutral',
      description: 'Λίτρα νερού ανά μονάδα προϊόντος'
    });
  }

  // Pesticide Free Days
  if (pesticideFreeDays > 0) {
    const isPesticideFree = pesticideFreeDays >= 365;
    metrics.push({
      label: 'Χωρίς Φυτοφάρμακα',
      value: isPesticideFree ? '100% Φυσικό' : pesticideFreeDays,
      unit: isPesticideFree ? '' : ' ημέρες',
      icon: <SparklesIcon className="w-full h-full" />,
      color: isPesticideFree ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-lime-100 text-lime-800 border-lime-200',
      benchmark: 180, // 6 months average
      trend: 'up',
      description: isPesticideFree ? 'Πάντα χωρίς χημικά' : 'Ημέρες χωρίς χημικά φυτοφάρμακα'
    });
  }

  // Soil Health Score
  if (soilHealthScore !== undefined && soilHealthScore > 0) {
    metrics.push({
      label: 'Υγεία Εδάφους',
      value: soilHealthScore,
      unit: '/10',
      icon: <CheckCircleIcon className="w-full h-full" />,
      color: soilHealthScore >= 8 ? 'bg-green-100 text-green-800 border-green-200' : 
             soilHealthScore >= 6 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
             'bg-red-100 text-red-800 border-red-200',
      benchmark: 6, // Average soil health
      trend: soilHealthScore >= 8 ? 'up' : 'neutral',
      description: 'Δείκτης ποιότητας και υγείας εδάφους'
    });
  }

  // Renewable Energy
  if (renewableEnergyPercentage !== undefined && renewableEnergyPercentage > 0) {
    metrics.push({
      label: 'Ανανεώσιμη Ενέργεια',
      value: renewableEnergyPercentage,
      unit: '%',
      icon: <SunIcon className="w-full h-full" />,
      color: renewableEnergyPercentage >= 75 ? 'bg-teal-100 text-teal-800 border-teal-200' : 'bg-indigo-100 text-indigo-800 border-indigo-200',
      benchmark: 30, // Average renewable energy usage
      trend: 'up',
      description: 'Ποσοστό πράσινης ενέργεια στην παραγωγή'
    });
  }

  if (metrics.length === 0) {
    return null;
  }

  return (
    <div className={`sustainability-card ${className}`}>
      <div className="mb-4">
        <h3 className={`font-semibold text-gray-900 flex items-center space-x-2 ${compact ? 'text-base' : 'text-lg'}`}>
          <SunIcon className={`text-green-600 ${compact ? 'w-5 h-5' : 'w-6 h-6'}`} />
          <span>Περιβαλλοντικό Αποτύπωμα</span>
        </h3>
        <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'} mt-1`}>
          Δεδομένα αειφορίας και περιβαλλοντικής επίδασης
        </p>
      </div>

      <div className={`grid gap-4 ${
        compact ? 'grid-cols-2' : 
        metrics.length <= 2 ? 'grid-cols-1 md:grid-cols-2' :
        metrics.length <= 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {metrics.map((metric, index) => (
          <MetricItem
            key={`${metric.label}-${index}`}
            metric={metric}
            showComparisons={showComparisons}
            showTrends={showTrends}
            compact={compact}
          />
        ))}
      </div>

      {showComparisons && (
        <div className={`mt-4 p-3 bg-gray-50 rounded-lg ${compact ? 'text-xs' : 'text-sm'}`}>
          <p className="text-gray-600">
            <strong>Σημείωση:</strong> Οι συγκρίσεις βασίζονται σε μέσους όρους της βιομηχανίας τροφίμων. 
            Τα δεδομένα ενημερώνονται τακτικά από τον παραγωγό.
          </p>
        </div>
      )}
    </div>
  );
}

// Specialized variants
export function CompactSustainabilityCard(props: Omit<SustainabilityCardProps, 'compact'>) {
  return <SustainabilityCard {...props} compact={true} />;
}

export function DetailedSustainabilityCard(props: Omit<SustainabilityCardProps, 'showComparisons' | 'showTrends'>) {
  return <SustainabilityCard {...props} showComparisons={true} showTrends={true} />;
}