import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  onStepClick?: (step: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
  onStepClick,
}) => {
  return (
    <nav aria-label="שלבי המחשבון" className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const isClickable = isCompleted && onStepClick;

        return (
          <React.Fragment key={stepNumber}>
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(stepNumber)}
                disabled={!isClickable}
                className={`step-indicator transition-all duration-300 ${
                  isActive
                    ? 'step-indicator-active scale-110 shadow-md'
                    : isCompleted
                    ? 'step-indicator-completed cursor-pointer hover:scale-105'
                    : 'step-indicator-inactive'
                } ${!isClickable ? 'cursor-default' : ''}`}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`שלב ${stepNumber}: ${stepLabels[index]}${isCompleted ? ' (הושלם)' : isActive ? ' (נוכחי)' : ''}`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  stepNumber
                )}
              </button>
              <span
                className={`text-xs font-medium transition-colors duration-300 ${
                  isActive
                    ? 'text-primary font-semibold'
                    : isCompleted
                    ? 'text-success'
                    : 'text-muted-foreground'
                }`}
              >
                {stepLabels[index]}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`h-0.5 w-12 transition-colors duration-500 ${
                  isCompleted ? 'bg-success' : 'bg-muted'
                }`}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default StepIndicator;
