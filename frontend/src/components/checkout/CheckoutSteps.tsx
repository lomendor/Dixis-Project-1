'use client';

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

interface Step {
  id: number;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface CheckoutStepsProps {
  steps: Step[];
  currentStep: number;
}

export default function CheckoutSteps({ steps, currentStep }: CheckoutStepsProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-center space-x-8">
        {steps.map((step, stepIdx) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isUpcoming = step.id > currentStep;

          return (
            <li key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors
                    ${isCompleted 
                      ? 'bg-green-600 border-green-600' 
                      : isCurrent 
                        ? 'border-green-600 bg-white' 
                        : 'border-gray-300 bg-white'
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-6 h-6 text-white" />
                  ) : (
                    <step.icon 
                      className={`
                        w-6 h-6 
                        ${isCurrent ? 'text-green-600' : 'text-gray-400'}
                      `} 
                    />
                  )}
                </div>

                {/* Step Info */}
                <div className="mt-3 text-center">
                  <p 
                    className={`
                      text-sm font-medium 
                      ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}
                    `}
                  >
                    {step.name}
                  </p>
                  <p 
                    className={`
                      text-xs 
                      ${isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'}
                    `}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {stepIdx < steps.length - 1 && (
                <div 
                  className={`
                    hidden sm:block w-16 h-0.5 ml-8 mr-8 mt-6 
                    ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}
                  `}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
