import { CalculatorState } from '@/types/calculator';
import { FormField } from '@/components/FormField';
import { RadioGroup } from '@/components/RadioGroup';
import { Input } from '@/components/ui/input';
import { AlertTriangle } from 'lucide-react';

interface Step1Props {
  state: CalculatorState;
  updateState: (updates: Partial<CalculatorState>) => void;
  errors: Record<string, string>;
}

export function Step1Threshold({ state, updateState, errors }: Step1Props) {
  const showNotRecognizedError = state.recognizedEvent === false;
  const showAgeError = state.age !== null && state.age < 14;

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold text-foreground mb-6">בדיקות סף ותאריך אירוע</h2>

      <FormField
        id="recognizedEvent"
        label="האם הוכרת כנפגע/ת פעולות איבה?"
        required
        error={errors.recognizedEvent}
      >
        <RadioGroup
          id="recognizedEvent"
          name="recognizedEvent"
          options={[
            { value: 'true', label: 'כן' },
            { value: 'false', label: 'לא' },
          ]}
          value={state.recognizedEvent === null ? null : String(state.recognizedEvent)}
          onChange={(value) => updateState({ recognizedEvent: value === 'true' })}
          error={errors.recognizedEvent}
        />
      </FormField>

      {showNotRecognizedError && (
        <div className="error-box flex items-start gap-3 mb-6" role="alert">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">אין זכאות לתט״ר בשלב זה</p>
            <p className="text-sm mt-1">
              אם לא הוכר/ה כנפגע/ת פעולות איבה – אין זכאות לתט״ר. יש לפנות תחילה להכרה כנפגע/ת פעולות איבה.
            </p>
          </div>
        </div>
      )}

      {state.recognizedEvent === true && (
        <>
          <FormField
            id="eventDate"
            label="תאריך האירוע"
            required
            error={errors.eventDate}
          >
            <Input
              type="date"
              id="eventDate"
              value={state.eventDate}
              onChange={(e) => updateState({ eventDate: e.target.value })}
              className={errors.eventDate ? 'input-error' : ''}
              aria-describedby={errors.eventDate ? 'eventDate-error' : undefined}
            />
          </FormField>

          <FormField
            id="age"
            label="גיל ביום האירוע"
            required
            error={errors.age}
            helpText="גיל מלא בשנים"
          >
            <Input
              type="number"
              id="age"
              min={0}
              max={120}
              value={state.age ?? ''}
              onChange={(e) => updateState({ age: e.target.value ? Number(e.target.value) : null })}
              className={errors.age ? 'input-error' : ''}
              aria-describedby={errors.age ? 'age-error' : 'age-help'}
            />
          </FormField>

          {showAgeError && (
            <div className="error-box flex items-start gap-3" role="alert">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">לא ניתן להגיש תט״ר</p>
                <p className="text-sm mt-1">
                  מתחת לגיל 14 לא ניתן להגיש תביעה לתגמול תלויים ושאירים.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
