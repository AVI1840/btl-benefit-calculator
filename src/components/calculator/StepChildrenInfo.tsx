import React from 'react';
import NumericInput from './NumericInput';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StepChildrenInfoProps {
  numberOfChildren: number | null;
  childrenAges: (number | null)[];
  onNumberOfChildrenChange: (count: number | null) => void;
  onChildAgeChange: (index: number, age: number | null) => void;
  onNext: () => void;
  onPrev: () => void;
}

const StepChildrenInfo: React.FC<StepChildrenInfoProps> = ({
  numberOfChildren,
  childrenAges,
  onNumberOfChildrenChange,
  onChildAgeChange,
  onNext,
  onPrev,
}) => {
  const canProceed = numberOfChildren !== null && 
    (numberOfChildren === 0 || 
      (childrenAges.length === numberOfChildren && 
       childrenAges.every(age => age !== null)));

  const getValidationMessage = (): string | null => {
    if (numberOfChildren === null) return 'יש להזין את מספר הילדים (0 אם אין ילדים)';
    if (numberOfChildren > 0 && childrenAges.some(age => age === null)) {
      const missing = childrenAges.filter(age => age === null).length;
      return `יש למלא גיל עבור ${missing} ילדים נוספים`;
    }
    return null;
  };

  return (
    <div className="calculator-card animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">פרטי ילדים</h2>
        <p className="text-sm text-muted-foreground mt-1">הזינו את מספר הילדים וגילאיהם. אם אין ילדים, הזינו 0.</p>
      </div>
      
      <div className="mb-6">
        <NumericInput
          label="מספר ילדים"
          value={numberOfChildren}
          onChange={onNumberOfChildrenChange}
          placeholder="הזן מספר"
          min={0}
          max={20}
          tooltip="מספר הילדים הזכאים לקצבה (עד גיל 18, או עד 20 אם בשירות צבאי/לאומי)"
        />
      </div>

      {numberOfChildren !== null && numberOfChildren > 0 && (
        <div className="border border-border rounded-lg p-4 bg-muted/30">
          <p className="text-sm font-medium text-foreground mb-3">גילאי הילדים</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: numberOfChildren }, (_, index) => (
              <NumericInput
                key={index}
                label={`ילד ${index + 1}`}
                value={childrenAges[index] ?? null}
                onChange={(age) => onChildAgeChange(index, age)}
                placeholder="גיל"
                min={0}
                max={25}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button onClick={onPrev} className="btn-secondary flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          חזור
        </button>
        
        <div className="flex items-center gap-4">
          {!canProceed && (
            <p className="text-sm text-muted-foreground hidden sm:block" role="status">
              {getValidationMessage()}
            </p>
          )}
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`btn-primary flex items-center gap-2 ${!canProceed ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="המשך לשלב הבא"
          >
            המשך
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepChildrenInfo;
