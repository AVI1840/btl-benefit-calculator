import { CalculatorState, ABSENCE_SCOPE_LABELS, AbsenceScope } from '@/types/calculator';
import { FormField } from '@/components/FormField';
import { RadioGroup } from '@/components/RadioGroup';
import { Input } from '@/components/ui/input';
import { calculateDaysDifference } from '@/utils/calculations';
import { Calendar, Info } from 'lucide-react';

interface Step5Props {
  state: CalculatorState;
  updateState: (updates: Partial<CalculatorState>) => void;
  errors: Record<string, string>;
}

export function Step5Incapacity({ state, updateState, errors }: Step5Props) {
  const scopeOptions = (Object.entries(ABSENCE_SCOPE_LABELS) as [AbsenceScope, string][]).map(
    ([value, label]) => ({ value, label })
  );

  const daysOfDisability =
    state.absenceStartDate && state.absenceEndDate
      ? calculateDaysDifference(state.absenceStartDate, state.absenceEndDate)
      : 0;

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold text-foreground mb-6">תקופת אי כושר</h2>

      <FormField
        id="absenceStartDate"
        label="תאריך תחילת אי כושר"
        required
        error={errors.absenceStartDate}
      >
        <Input
          type="date"
          id="absenceStartDate"
          value={state.absenceStartDate}
          onChange={(e) => updateState({ absenceStartDate: e.target.value })}
          className={errors.absenceStartDate ? 'input-error' : ''}
        />
      </FormField>

      <FormField
        id="absenceEndDate"
        label="תאריך סיום אי כושר"
        required
        error={errors.absenceEndDate}
      >
        <Input
          type="date"
          id="absenceEndDate"
          value={state.absenceEndDate}
          min={state.absenceStartDate}
          onChange={(e) => updateState({ absenceEndDate: e.target.value })}
          className={errors.absenceEndDate ? 'input-error' : ''}
        />
      </FormField>

      {daysOfDisability > 0 && (
        <div className="info-box flex items-start gap-3 mb-6">
          <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p>
            <span className="font-medium">סה״כ ימי אי כושר: </span>
            <span className="text-lg font-bold">{daysOfDisability} ימים</span>
            <span className="text-sm block mt-1">(כולל יום התחלה ויום סיום)</span>
          </p>
        </div>
      )}

      <FormField
        id="absenceScope"
        label="היקף אי הכושר"
        required
        error={errors.absenceScope}
        helpText="מלא = 100%, חצי = 50%, רבע = 25%"
      >
        <RadioGroup
          id="absenceScope"
          name="absenceScope"
          options={scopeOptions}
          value={state.absenceScope}
          onChange={(value) => updateState({ absenceScope: value as AbsenceScope })}
          error={errors.absenceScope}
        />
      </FormField>

      {state.absenceScope !== 'full' && (
        <div className="info-box flex items-start gap-3 mt-4">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm">
            אי כושר חלקי ({state.absenceScope === 'half' ? '50%' : '25%'}) ישפיע על התעריף היומי בהתאם.
          </p>
        </div>
      )}
    </div>
  );
}
