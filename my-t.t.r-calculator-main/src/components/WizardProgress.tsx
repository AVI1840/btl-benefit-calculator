import { Check } from 'lucide-react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  stopped: boolean;
}

export function WizardProgress({ currentStep, totalSteps, stepTitles, stopped }: WizardProgressProps) {
  return (
    <nav aria-label="שלבי המחשבון" className="mb-8">
      <ol className="flex items-center justify-between gap-2" role="list">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <li
              key={stepNumber}
              className="flex flex-col items-center flex-1"
              aria-current={isActive ? 'step' : undefined}
            >
              <div className="flex items-center w-full">
                <div
                  className={`wizard-step-indicator ${
                    isCompleted
                      ? 'wizard-step-completed'
                      : isActive
                      ? 'wizard-step-active'
                      : 'wizard-step-pending'
                  }`}
                  aria-hidden="true"
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < totalSteps && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-colors ${
                      isCompleted ? 'bg-success' : 'bg-border'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </div>
              <span
                className={`mt-2 text-xs text-center hidden sm:block ${
                  isActive ? 'font-semibold text-primary' : 'text-muted-foreground'
                }`}
              >
                {stepTitles[index]}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-4 text-center sm:hidden">
        <span className="text-sm font-medium text-primary">
          שלב {currentStep}: {stepTitles[currentStep - 1]}
        </span>
      </div>
      {stopped && (
        <div className="mt-4 text-center">
          <span className="text-sm text-destructive font-medium">התהליך נעצר</span>
        </div>
      )}
    </nav>
  );
}
