import { CalculatorState, DISABILITY_DEDUCTIONS } from '@/types/calculator';
import { FormField } from '@/components/FormField';
import { RadioGroup } from '@/components/RadioGroup';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils/calculations';
import { Info } from 'lucide-react';

interface Step2Props {
  state: CalculatorState;
  updateState: (updates: Partial<CalculatorState>) => void;
  errors: Record<string, string>;
}

const DISABILITY_OPTIONS = [
  { value: '20', label: '20%' },
  { value: '30', label: '30%' },
  { value: '40', label: '40%' },
  { value: '50', label: '50%' },
  { value: '60', label: '60%' },
  { value: '70', label: '70%' },
  { value: '80', label: '80%' },
  { value: '90', label: '90%' },
  { value: '100', label: '100%' },
  { value: '101', label: 'מעל 100% (נכות מיוחדת)' },
];

export function Step2Disability({ state, updateState, errors }: Step2Props) {
  const monthlyDeduction = state.disabilityPercent
    ? DISABILITY_DEDUCTIONS[state.disabilityPercent]
    : null;

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold text-foreground mb-6">נכות מוכרת</h2>

      <FormField
        id="recognizedDisability"
        label="האם יש לך אחוזי נכות מוכרים?"
        required
        error={errors.recognizedDisability}
      >
        <RadioGroup
          id="recognizedDisability"
          name="recognizedDisability"
          options={[
            { value: 'true', label: 'כן' },
            { value: 'false', label: 'לא' },
          ]}
          value={state.recognizedDisability === null ? null : String(state.recognizedDisability)}
          onChange={(value) => {
            updateState({
              recognizedDisability: value === 'true',
              disabilityPercent: value === 'false' ? null : state.disabilityPercent,
            });
          }}
          error={errors.recognizedDisability}
        />
      </FormField>

      {state.recognizedDisability === true && (
        <>
          <FormField
            id="disabilityPercent"
            label="אחוז נכות מוכר"
            required
            error={errors.disabilityPercent}
            helpText="תט״ר רלוונטי רק למי שיש לו 20% נכות ומעלה"
          >
            <Select
              value={state.disabilityPercent?.toString() || ''}
              onValueChange={(value) => updateState({ disabilityPercent: Number(value) })}
            >
              <SelectTrigger
                id="disabilityPercent"
                className={errors.disabilityPercent ? 'input-error' : ''}
                aria-describedby={errors.disabilityPercent ? 'disabilityPercent-error' : 'disabilityPercent-help'}
              >
                <SelectValue placeholder="בחר/י אחוז נכות" />
              </SelectTrigger>
              <SelectContent>
                {DISABILITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {monthlyDeduction && (
            <div className="info-box flex items-start gap-3 mt-4">
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">ניכוי נכות חודשי</p>
                <p className="text-sm mt-1">
                  עבור {state.disabilityPercent === 101 ? 'מעל 100%' : `${state.disabilityPercent}%`} נכות,
                  הניכוי החודשי הוא {formatCurrency(monthlyDeduction)}.
                  הניכוי בפועל יחושב לפי תקופת אי הכושר.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {state.recognizedDisability === false && (
        <div className="info-box flex items-start gap-3 mt-4">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm">
            אם אין לך אחוזי נכות מוכרים, לא יבוצע ניכוי נכות מהתט״ר.
          </p>
        </div>
      )}
    </div>
  );
}
