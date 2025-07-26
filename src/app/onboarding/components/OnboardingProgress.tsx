"use client";

import { CheckIcon } from "@heroicons/react/24/outline";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export default function OnboardingProgress({
  currentStep,
  totalSteps,
  stepTitles,
}: OnboardingProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={index} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all
                ${isCompleted 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }
              `}>
                {isCompleted ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{stepNumber}</span>
                )}
              </div>
              
              <div className="hidden sm:block ml-3">
                <p className={`text-sm font-medium ${
                  isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {title}
                </p>
              </div>
              
              {index < stepTitles.length - 1 && (
                <div className={`
                  hidden sm:block w-16 h-0.5 mx-4 transition-all
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4">
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );
}