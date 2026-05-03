import React from 'react';
import NumericInput from './NumericInput';
import { ArrowRight, BarChart3 } from 'lucide-react';
import type { OptionData } from '@/types/calculator';

interface StepOptionsInputProps {
  options: OptionData[];
  onOptionChange: (optionId: string, field: keyof OptionData, value: number | null) => void;
  onShowResults: () => void;
  onPrev: () => void;
}

const StepOptionsInput: React.FC<StepOptionsInputProps> = ({
  options,
  onOptionChange,
  onShowResults,
  onPrev,
}) => {
  const canProceed = options.some(
    opt => opt.baseAmount !== null || opt.additionalAmount !== null
  );

  return (
    <div className="calculator-card animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">הזנת נתוני אופציות</h2>
        <p className="text-sm text-muted-foreground mt-1">
          הזינו את הנתונים עבור כל אופציה שברצונכם להשוות. ניתן למלא חלק מהאופציות בלבד.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {options.map((option, index) => (
          <div
            key={option.id}
            className="border border-option-border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold">
                {index + 1}
              </span>
              <h3 className="font-semibold text-lg text-primary">
                {option.name}
              </h3>
            </div>
            
            <div className="space-y-4">
              <NumericInput
                label="סכום בסיס"
                value={option.baseAmount}
                onChange={(value) => onOptionChange(option.id, 'baseAmount', value)}
                placeholder="0"
                min={0}
                suffix="₪"
                tooltip="סכום הקצבה הבסיסי לפני תוספות"
              />
              
              <NumericInput
                label="תוספת"
                value={option.additionalAmount}
                onChange={(value) => onOptionChange(option.id, 'additionalAmount', value)}
                placeholder="0"
                min={0}
                suffix="₪"
                tooltip="תוספת לקצבה הבסיסית (תוספת ותק, ילדים וכו׳)"
              />
              
              <NumericInput
                label="מקדם התאמה"
                value={option.adjustmentFactor}
                onChange={(value) => onOptionChange(option.id, 'adjustmentFactor', value)}
                placeholder="100"
                min={0}
                max={200}
                suffix="%"
                tooltip="אחוז ההתאמה שמוכפל בסכום הכולל. 100% = ללא שינוי, מעל 100% = תוספת, מתחת = הפחתה"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button onClick={onPrev} className="btn-secondary flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          חזור
        </button>
        
        <div className="flex items-center gap-4">
          {!canProceed && (
            <p className="text-sm text-muted-foreground hidden sm:block" role="status">
              יש למלא נתונים באופציה אחת לפחות
            </p>
          )}
          <button
            onClick={onShowResults}
            disabled={!canProceed}
            className={`btn-primary flex items-center gap-2 ${!canProceed ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="הצג תוצאות השוואה"
          >
            <BarChart3 className="w-4 h-4" />
            הצג תוצאות
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepOptionsInput;
