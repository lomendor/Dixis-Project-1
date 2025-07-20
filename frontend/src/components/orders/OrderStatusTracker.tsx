'use client';

import React from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  TruckIcon, 
  HomeIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  TruckIcon as TruckIconSolid,
  HomeIcon as HomeIconSolid
} from '@heroicons/react/24/solid';

interface OrderStatusTrackerProps {
  status: string;
  createdAt: string;
  updatedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export default function OrderStatusTracker({
  status,
  createdAt,
  updatedAt,
  shippedAt,
  deliveredAt
}: OrderStatusTrackerProps) {
  
  const steps = [
    {
      id: 'confirmed',
      name: 'Επιβεβαίωση',
      description: 'Η παραγγελία επιβεβαιώθηκε',
      icon: CheckCircleIcon,
      iconSolid: CheckCircleIconSolid,
      date: createdAt
    },
    {
      id: 'processing',
      name: 'Επεξεργασία',
      description: 'Προετοιμασία παραγγελίας',
      icon: ClockIcon,
      iconSolid: ClockIconSolid,
      date: updatedAt
    },
    {
      id: 'shipped',
      name: 'Αποστολή',
      description: 'Η παραγγελία αποστάλθηκε',
      icon: TruckIcon,
      iconSolid: TruckIconSolid,
      date: shippedAt
    },
    {
      id: 'delivered',
      name: 'Παράδοση',
      description: 'Η παραγγελία παραδόθηκε',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      date: deliveredAt
    }
  ];

  const getStepStatus = (stepId: string) => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);
    const stepIndex = statusOrder.indexOf(stepId);
    
    if (status === 'cancelled') {
      return stepId === 'confirmed' ? 'cancelled' : 'inactive';
    }
    
    if (stepIndex <= currentIndex) {
      return 'completed';
    } else if (stepIndex === currentIndex + 1) {
      return 'current';
    } else {
      return 'inactive';
    }
  };

  const getStepClasses = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return {
          container: 'text-green-600',
          icon: 'bg-green-600 text-white',
          line: 'bg-green-600'
        };
      case 'current':
        return {
          container: 'text-blue-600',
          icon: 'bg-blue-600 text-white',
          line: 'bg-gray-300'
        };
      case 'cancelled':
        return {
          container: 'text-red-600',
          icon: 'bg-red-600 text-white',
          line: 'bg-gray-300'
        };
      default:
        return {
          container: 'text-gray-400',
          icon: 'bg-gray-300 text-gray-600',
          line: 'bg-gray-300'
        };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'cancelled') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-600 mb-2">Παραγγελία Ακυρώθηκε</h3>
          <p className="text-gray-600">
            Η παραγγελία ακυρώθηκε στις {formatDate(updatedAt || createdAt)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, stepIndex) => {
          const stepStatus = getStepStatus(step.id);
          const classes = getStepClasses(stepStatus);
          const Icon = stepStatus === 'completed' ? step.iconSolid : step.icon;
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step */}
              <div className="relative flex flex-col items-center">
                {/* Icon */}
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 border-transparent
                  ${classes.icon}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Step Info */}
                <div className={`mt-3 text-center ${classes.container}`}>
                  <p className="text-sm font-medium">{step.name}</p>
                  <p className="text-xs mt-1">{step.description}</p>
                  {step.date && stepStatus === 'completed' && (
                    <p className="text-xs mt-1 text-gray-500">
                      {formatDate(step.date)}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Connector Line */}
              {stepIndex < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className={`h-0.5 ${classes.line}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Mobile View */}
      <div className="md:hidden mt-8">
        <div className="space-y-4">
          {steps.map((step) => {
            const stepStatus = getStepStatus(step.id);
            const classes = getStepClasses(stepStatus);
            const Icon = stepStatus === 'completed' ? step.iconSolid : step.icon;
            
            return (
              <div key={step.id} className="flex items-center space-x-4">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full
                  ${classes.icon}
                `}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className={`flex-1 ${classes.container}`}>
                  <p className="font-medium">{step.name}</p>
                  <p className="text-sm">{step.description}</p>
                  {step.date && stepStatus === 'completed' && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(step.date)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
