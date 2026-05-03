import { CalculatorState } from '@/types/calculator';
import { FormField } from '@/components/FormField';
import { RadioGroup } from '@/components/RadioGroup';
import { Input } from '@/components/ui/input';
import { calculateDaysDifference } from '@/utils/calculations';
import { AlertTriangle, Info } from 'lucide-react';

interface Step6Props {
  state: CalculatorState;
  updateState: (updates: Partial<CalculatorState>) => void;
  errors: Record<string, string>;
}

export function Step6Hospitalization({ state, updateState, errors }: Step6Props) {
  const daysOfDisability =
    state.absenceStartDate && state.absenceEndDate
      ? calculateDaysDifference(state.absenceStartDate, state.absenceEndDate)
      : 0;

  const showReductionWarning = state.hospitalized === true && state.hospitalDays > 14;

  // חישוב הפחתה צפויה
  const getReductionInfo = () => {
    if (!state.hospitalized || state.hospitalDays <= 14) return null;

    const age = state.age;
    if (age !== null && age >= 14 && age < 18) {
      return { rate: 12.5, reason: 'גיל 14-18' };
    }

    if (
      age !== null &&
      age >= 18 &&
      state.maritalStatus === 'single' &&
      (!state.hasChildren || state.children.every((c) => c.age >= 18))
    ) {
      return { rate: 25, reason: 'רווק/ה ללא ילדים מתחת לגיל 18' };
    }

    return null;
  };

  const reductionInfo = getReductionInfo();

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold text-foreground mb-6">אשפוז</h2>

      <FormField
        id="hospitalized"
        label="האם היית מאושפז/ת במהלך תקופת אי הכושר?"
        required
        error={errors.hospitalized}
      >
        <RadioGroup
          id="hospitalized"
          name="hospitalized"
          options={[
            { value: 'true', label: 'כן' },
            { value: 'false', label: 'לא' },
          ]}
          value={state.hospitalized === null ? null : String(state.hospitalized)}
          onChange={(value) => {
            updateState({
              hospitalized: value === 'true',
              hospitalDays: value === 'false' ? 0 : state.hospitalDays,
            });
          }}
          error={errors.hospitalized}
        />
      </FormField>

      {state.hospitalized === true && (
        <>
          <FormField
            id="hospitalDays"
            label="מספר ימי אשפוז"
            required
            error={errors.hospitalDays}
            helpText={daysOfDisability > 0 ? `מקסימום ${daysOfDisability} ימים (לפי תקופת אי הכושר)` : undefined}
          >
            <Input
              type="number"
              id="hospitalDays"
              min={0}
              max={daysOfDisability || undefined}
              value={state.hospitalDays || ''}
              onChange={(e) => updateState({ hospitalDays: Number(e.target.value) })}
              className={errors.hospitalDays ? 'input-error' : ''}
            />
          </FormField>

          {showReductionWarning && reductionInfo && (
            <div className="error-box flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">הפחתת אשפוז תופעל</p>
                <p className="text-sm mt-1">
                  מאחר שיש יותר מ-14 ימי אשפוז, תופעל הפחתה של {reductionInfo.rate}% על ימי האשפוז בלבד
                  ({reductionInfo.reason}).
                </p>
              </div>
            </div>
          )}

          {state.hospitalDays > 0 && state.hospitalDays <= 14 && (
            <div className="info-box flex items-start gap-3">
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <p className="text-sm">
                הפחתת אשפוז מופעלת רק כאשר יש יותר מ-14 ימי אשפוז. במקרה זה לא תהיה הפחתה.
              </p>
            </div>
          )}
        </>
      )}

      {state.hospitalized === false && (
        <div className="info-box flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm">לא תופעל הפחתת אשפוז.</p>
        </div>
      )}
    </div>
  );
}
