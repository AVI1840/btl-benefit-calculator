import { CalculatorState, EMPLOYMENT_STATUS_LABELS, EmploymentStatus, CONSTANTS } from '@/types/calculator';
import { FormField } from '@/components/FormField';
import { RadioGroup } from '@/components/RadioGroup';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/utils/calculations';
import { Info } from 'lucide-react';

interface Step4Props {
  state: CalculatorState;
  updateState: (updates: Partial<CalculatorState>) => void;
  errors: Record<string, string>;
}

export function Step4Employment({ state, updateState, errors }: Step4Props) {
  const employmentOptions = (Object.entries(EMPLOYMENT_STATUS_LABELS) as [EmploymentStatus, string][]).map(
    ([value, label]) => ({ value, label })
  );

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold text-foreground mb-6">תעסוקה ושכר</h2>

      <FormField
        id="employmentStatus"
        label="מצב תעסוקה לפני האירוע"
        required
        error={errors.employmentStatus}
      >
        <RadioGroup
          id="employmentStatus"
          name="employmentStatus"
          options={employmentOptions}
          value={state.employmentStatus}
          onChange={(value) => updateState({ employmentStatus: value as EmploymentStatus })}
          error={errors.employmentStatus}
        />
      </FormField>

      {state.employmentStatus === 'employee' && (
        <div className="mt-6 p-4 bg-muted rounded-lg space-y-4">
          <h3 className="font-medium">פרטי שכר (שכיר)</h3>

          <FormField
            id="grossAvg3m"
            label="ממוצע שכר ברוטו ב-3 חודשים אחרונים"
            required
            error={errors.grossAvg3m}
            helpText={`תקרת שכר לחישוב: ${formatCurrency(CONSTANTS.SALARY_CAP)}`}
          >
            <Input
              type="number"
              id="grossAvg3m"
              min={0}
              value={state.grossAvg3m || ''}
              onChange={(e) => updateState({ grossAvg3m: Number(e.target.value) })}
              className={errors.grossAvg3m ? 'input-error' : ''}
              placeholder="₪"
            />
          </FormField>

          <FormField
            id="avgMonthlyDeductions"
            label="ממוצע ניכויים חודשיים (מס, ביטוח לאומי וכו׳)"
            required
            error={errors.avgMonthlyDeductions}
          >
            <Input
              type="number"
              id="avgMonthlyDeductions"
              min={0}
              value={state.avgMonthlyDeductions || ''}
              onChange={(e) => updateState({ avgMonthlyDeductions: Number(e.target.value) })}
              className={errors.avgMonthlyDeductions ? 'input-error' : ''}
              placeholder="₪"
            />
          </FormField>

          <FormField
            id="additionalPay"
            label="תשלומים נוספים שנתיים (בונוסים, מתנות וכו׳)"
            error={errors.additionalPay}
            helpText="אופציונלי - סכום שנתי"
          >
            <Input
              type="number"
              id="additionalPay"
              min={0}
              value={state.additionalPay || ''}
              onChange={(e) => updateState({ additionalPay: Number(e.target.value) })}
              placeholder="₪"
            />
          </FormField>
        </div>
      )}

      {state.employmentStatus === 'self_employed' && (
        <div className="mt-6 p-4 bg-muted rounded-lg space-y-4">
          <h3 className="font-medium">פרטי הכנסה (עצמאי)</h3>

          <FormField
            id="prevYearIncome"
            label="הכנסה שנתית (שנה שלפני האירוע)"
            required
            error={errors.prevYearIncome}
            helpText="הכנסה שנתית ברוטו כפי שדווחה למס הכנסה"
          >
            <Input
              type="number"
              id="prevYearIncome"
              min={0}
              value={state.prevYearIncome || ''}
              onChange={(e) => updateState({ prevYearIncome: Number(e.target.value) })}
              className={errors.prevYearIncome ? 'input-error' : ''}
              placeholder="₪"
            />
          </FormField>

          <FormField
            id="currentYearIncome"
            label="הכנסה שנתית בשנת האירוע"
            required
            error={errors.currentYearIncome}
          >
            <Input
              type="number"
              id="currentYearIncome"
              min={0}
              value={state.currentYearIncome || ''}
              onChange={(e) => updateState({ currentYearIncome: Number(e.target.value) })}
              className={errors.currentYearIncome ? 'input-error' : ''}
              placeholder="₪"
            />
          </FormField>
        </div>
      )}

      {state.employmentStatus === 'not_working' && (
        <div className="info-box flex items-start gap-3 mt-6">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">חישוב לפי תעריף מינימום</p>
            <p className="text-sm mt-1">
              {state.age !== null && state.age >= 14 && state.age < 18
                ? 'בגילאי 14-18, התעריף היומי יהיה 50% מהתעריף המינימלי.'
                : 'התעריף היומי יחושב לפי התעריף המינימלי.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
