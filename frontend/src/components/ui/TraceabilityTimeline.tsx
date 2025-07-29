'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  SunIcon,
  CogIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  BeakerIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface TraceabilityStep {
  id: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
  person?: string;
  details?: string[];
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'pending';
  color: string;
}

interface TraceabilityTimelineProps {
  // Product traceability data
  batchNumber?: string;
  harvestDate?: string;
  processingMethod?: string;
  productionFacility?: string;
  expiryDate?: string;
  
  // Producer information
  producerName?: string;
  farmLocation?: string;
  
  // Additional tracking data
  qualityChecks?: Array<{
    date: string;
    type: string;
    result: string;
    inspector?: string;
  }>;
  
  shippingDate?: string;
  currentLocation?: string;
  
  // Display options
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const TimelineStep: React.FC<{
  step: TraceabilityStep;
  isLast: boolean;
  showDetails: boolean;
  compact: boolean;
}> = ({ step, isLast, showDetails, compact }) => {
  const statusStyles = {
    completed: 'bg-green-100 text-green-600 border-green-200',
    current: 'bg-blue-100 text-blue-600 border-blue-200',
    pending: 'bg-gray-100 text-gray-400 border-gray-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex items-start space-x-4"
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
      )}
      
      {/* Step icon */}
      <div className={`
        relative z-10 flex items-center justify-center
        ${compact ? 'w-10 h-10' : 'w-12 h-12'}
        rounded-full border-2 ${statusStyles[step.status]}
      `}>
        <span className={compact ? 'w-5 h-5' : 'w-6 h-6'}>
          {step.icon}
        </span>
      </div>
      
      {/* Step content */}
      <div className="flex-1 min-w-0">
        <div className={`${compact ? 'pb-6' : 'pb-8'}`}>
          <div className="flex items-center justify-between">
            <h4 className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
              {step.title}
            </h4>
            {step.status === 'completed' && (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            )}
          </div>
          
          <p className={`text-gray-600 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
            {step.description}
          </p>
          
          {/* Metadata */}
          <div className={`mt-2 space-y-1 ${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
            {step.date && (
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-4 h-4" />
                <span>{step.date}</span>
              </div>
            )}
            
            {step.location && (
              <div className="flex items-center space-x-1">
                <MapPinIcon className="w-4 h-4" />
                <span>{step.location}</span>
              </div>
            )}
            
            {step.person && (
              <div className="flex items-center space-x-1">
                <UserIcon className="w-4 h-4" />
                <span>{step.person}</span>
              </div>
            )}
          </div>
          
          {/* Additional details */}
          {showDetails && step.details && step.details.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <ul className={`space-y-1 ${compact ? 'text-xs' : 'text-sm'} text-gray-600`}>
                {step.details.map((detail, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function TraceabilityTimeline({
  batchNumber,
  harvestDate,
  processingMethod,
  productionFacility,
  expiryDate,
  producerName,
  farmLocation,
  qualityChecks = [],
  shippingDate,
  currentLocation,
  showDetails = true,
  compact = false,
  className = ''
}: TraceabilityTimelineProps) {
  const steps: TraceabilityStep[] = [];
  
  // Step 1: Farm Production
  if (harvestDate || farmLocation) {
    const details = [];
    if (batchNumber) details.push(`Αριθμός παρτίδας: ${batchNumber}`);
    if (farmLocation) details.push(`Τοποθεσία φάρμας: ${farmLocation}`);
    if (producerName) details.push(`Παραγωγός: ${producerName}`);
    
    steps.push({
      id: 'farm',
      title: 'Παραγωγή στη Φάρμα',
      description: 'Συγκομιδή και αρχική επεξεργασία του προϊόντος',
      date: harvestDate,
      location: farmLocation,
      person: producerName,
      details,
      icon: <SunIcon />,
      status: 'completed',
      color: 'green'
    });
  }
  
  // Step 2: Processing
  if (processingMethod || productionFacility) {
    const details = [];
    if (processingMethod) details.push(`Μέθοδος επεξεργασίας: ${processingMethod}`);
    if (productionFacility) details.push(`Εγκατάσταση: ${productionFacility}`);
    
    steps.push({
      id: 'processing',
      title: 'Επεξεργασία & Συσκευασία',
      description: 'Επεξεργασία και συσκευασία του προϊόντος',
      location: productionFacility,
      details,
      icon: <CogIcon />,
      status: 'completed',
      color: 'blue'
    });
  }
  
  // Step 3: Quality Control
  if (qualityChecks.length > 0) {
    const details = qualityChecks.map(check => 
      `${check.type}: ${check.result} (${check.date}${check.inspector ? `, ${check.inspector}` : ''})`
    );
    
    steps.push({
      id: 'quality',
      title: 'Έλεγχος Ποιότητας',
      description: 'Επιθεώρηση και πιστοποίηση ποιότητας',
      date: qualityChecks[0]?.date,
      person: qualityChecks[0]?.inspector,
      details,
      icon: <BeakerIcon />,
      status: 'completed',
      color: 'purple'
    });
  }
  
  // Step 4: Distribution
  if (shippingDate) {
    const details = [];
    if (shippingDate) details.push(`Ημερομηνία αποστολής: ${shippingDate}`);
    if (currentLocation) details.push(`Τρέχουσα τοποθεσία: ${currentLocation}`);
    
    steps.push({
      id: 'shipping',
      title: 'Διανομή & Μεταφορά',
      description: 'Αποστολή προς τους πελάτες',
      date: shippingDate,
      location: currentLocation,
      details,
      icon: <TruckIcon />,
      status: currentLocation ? 'current' : 'completed',
      color: 'orange'
    });
  }
  
  // Step 5: Retail/Customer
  steps.push({
    id: 'retail',
    title: 'Διάθεση στην Αγορά',
    description: 'Διαθέσιμο στους καταναλωτές',
    location: 'Διαδικτυακό κατάστημα Dixis',
    details: expiryDate ? [`Ημερομηνία λήξης: ${expiryDate}`] : [],
    icon: <BuildingStorefrontIcon />,
    status: 'current',
    color: 'teal'
  });
  
  if (steps.length === 0) {
    return (
      <div className={`traceability-timeline ${className}`}>
        <div className="text-center py-8 text-gray-500">
          <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Δεν υπάρχουν διαθέσιμα δεδομένα ιχνηλασιμότητας</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`traceability-timeline ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className={`font-semibold text-gray-900 flex items-center space-x-2 ${compact ? 'text-base' : 'text-lg'}`}>
          <DocumentTextIcon className={`text-blue-600 ${compact ? 'w-5 h-5' : 'w-6 h-6'}`} />
          <span>Ιχνηλασιμότητα Προϊόντος</span>
        </h3>
        <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'} mt-1`}>
          Ακολουθήστε το ταξίδι του προϊόντος από τη φάρμα στο τραπέζι σας
        </p>
        
        {batchNumber && (
          <div className={`mt-2 inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full ${compact ? 'text-xs' : 'text-sm'}`}>
            <span className="font-medium">Batch:</span>
            <span className="font-mono">{batchNumber}</span>
          </div>
        )}
      </div>
      
      {/* Timeline */}
      <div className="space-y-0">
        {steps.map((step, index) => (
          <TimelineStep
            key={step.id}
            step={step}
            isLast={index === steps.length - 1}
            showDetails={showDetails}
            compact={compact}
          />
        ))}
      </div>
      
      {/* Footer */}
      <div className={`mt-6 p-4 bg-green-50 rounded-lg ${compact ? 'text-xs' : 'text-sm'}`}>
        <div className="flex items-start space-x-2">
          <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-900">Πιστοποιημένη Ιχνηλασιμότητα</p>
            <p className="text-green-700 mt-1">
              Όλα τα στάδια παραγωγής και διανομής είναι πιστοποιημένα και ελεγμένα 
              σύμφωνα με τα ευρωπαϊκά πρότυπα ποιότητας και ασφάλειας τροφίμων.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Specialized variants
export function CompactTraceabilityTimeline(props: Omit<TraceabilityTimelineProps, 'compact' | 'showDetails'>) {
  return <TraceabilityTimeline {...props} compact={true} showDetails={false} />;
}

export function DetailedTraceabilityTimeline(props: Omit<TraceabilityTimelineProps, 'showDetails'>) {
  return <TraceabilityTimeline {...props} showDetails={true} />;
}