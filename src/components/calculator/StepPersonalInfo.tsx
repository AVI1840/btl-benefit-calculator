import React from 'react';
import NumericInput from './NumericInput';
import { ArrowLeft } from 'lucide-react';

interface StepPersonalInfoProps {
  widowAge: number | null;
  deceasedAge: number | null;
  onWidowAgeChange: (age: number | null) => void;
  onDeceasedAgeChange: (age: number | null) => void;
  onNext: () => void;
}

const StepPersonalInfo: React.FC<StepPersonalInfoProps> = ({
  widowAge,
  deceasedAge,
  onWidowAgeChange,
  onDeceasedAgeChange,
  onNext,
}) => {
  const canProceed = widowAge !== null && deceasedAge !== null;

  const getValidationMessage = (): string | null => {
    if (widowAge === null && deceasedAge === null) return 'יש למלא את גיל האלמן/ה ואת גיל המנוח/ה';
    if (widowAge === null) return 'יש למלא את גיל האלמן/ה';
    if (deceasedAge === null) return 'יש למלא את גיל המנוח/ה';
    return null;
  };

  return (
    <div className="calculator-card animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">פרטים אישיים</h2>
        <p className="text-sm text-muted-foreground mt-1">הזינו את הפרטים הבסיסיים לצורך חישוב הזכאות</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NumericInput
          label="גיל האלמן/ה"
          value={widowAge}
          onChange={onWidowAgeChange}
          placeholder="הזן גיל"
          min={1}
          max={120}
          tooltip="הגיל הנוכחי של האלמן/ה בשנים מלאות"
        />
        
        <NumericInput
          label="גיל המנוח/ה בעת הפטירה"
          value={deceasedAge}
          onChange={onDeceasedAgeChange}
          placeholder="הזן גיל"
          min={1}
          max={120}
          tooltip="גיל המנוח/ה בעת הפטירה בשנים מלאות"
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        {!canProceed && (
          <p className="text-sm text-muted-foreground" role="status">
            {getValidationMessage()}
          </p>
        )}
        {canProceed && <div />}
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
  );
};

export default StepPersonalInfo;
