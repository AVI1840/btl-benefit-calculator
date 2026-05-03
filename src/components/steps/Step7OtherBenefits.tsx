import { CalculatorState, BENEFIT_TYPE_LABELS, BenefitType, OtherBenefit } from '@/types/calculator';
import { FormField } from '@/components/FormField';
import { RadioGroup } from '@/components/RadioGroup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Wallet, Info } from 'lucide-react';

interface Step7Props {
  state: CalculatorState;
  updateState: (updates: Partial<CalculatorState>) => void;
  errors: Record<string, string>;
}

export function Step7OtherBenefits({ state, updateState, errors }: Step7Props) {
  const benefitTypeOptions = (Object.entries(BENEFIT_TYPE_LABELS) as [BenefitType, string][]).map(
    ([value, label]) => ({ value, label })
  );

  const addBenefit = () => {
    const newBenefit: OtherBenefit = {
      id: crypto.randomUUID(),
      benefitType: 'other',
      benefitAmount: 0,
      benefitFrequency: 'monthly',
    };
    updateState({
      otherBenefits: [...state.otherBenefits, newBenefit],
    });
  };

  const updateBenefit = (id: string, updates: Partial<OtherBenefit>) => {
    updateState({
      otherBenefits: state.otherBenefits.map((benefit) =>
        benefit.id === id ? { ...benefit, ...updates } : benefit
      ),
    });
  };

  const removeBenefit = (id: string) => {
    updateState({
      otherBenefits: state.otherBenefits.filter((benefit) => benefit.id !== id),
    });
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold text-foreground mb-6">גמלאות אחרות</h2>

      <FormField
        id="hasOtherBenefits"
        label="האם את/ה מקבל/ת גמלאות נוספות?"
        required
        error={errors.hasOtherBenefits}
        helpText="גמלאות שמשולמות מגופים ממשלתיים או ציבוריים"
      >
        <RadioGroup
          id="hasOtherBenefits"
          name="hasOtherBenefits"
          options={[
            { value: 'true', label: 'כן' },
            { value: 'false', label: 'לא' },
          ]}
          value={state.hasOtherBenefits === null ? null : String(state.hasOtherBenefits)}
          onChange={(value) => {
            updateState({
              hasOtherBenefits: value === 'true',
              otherBenefits: value === 'false' ? [] : state.otherBenefits,
            });
          }}
          error={errors.hasOtherBenefits}
        />
      </FormField>

      {state.hasOtherBenefits === true && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <Wallet className="w-5 h-5" aria-hidden="true" />
              פרטי הגמלאות
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBenefit}
              className="flex items-center gap-1"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              הוסף גמלה
            </Button>
          </div>

          {state.otherBenefits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              לחץ/י על "הוסף גמלה" להוספת פרטי הגמלאות
            </p>
          ) : (
            <div className="space-y-4">
              {state.otherBenefits.map((benefit, index) => (
                <div
                  key={benefit.id}
                  className="p-4 bg-background rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-sm">גמלה {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBenefit(benefit.id)}
                      aria-label={`הסר גמלה ${index + 1}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label
                        htmlFor={`benefit-type-${benefit.id}`}
                        className="block text-xs font-medium text-muted-foreground mb-1"
                      >
                        סוג הגמלה
                      </label>
                      <Select
                        value={benefit.benefitType}
                        onValueChange={(value) =>
                          updateBenefit(benefit.id, { benefitType: value as BenefitType })
                        }
                      >
                        <SelectTrigger id={`benefit-type-${benefit.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {benefitTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label
                        htmlFor={`benefit-amount-${benefit.id}`}
                        className="block text-xs font-medium text-muted-foreground mb-1"
                      >
                        סכום
                      </label>
                      <Input
                        type="number"
                        id={`benefit-amount-${benefit.id}`}
                        min={0}
                        value={benefit.benefitAmount || ''}
                        onChange={(e) =>
                          updateBenefit(benefit.id, { benefitAmount: Number(e.target.value) })
                        }
                        placeholder="₪"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`benefit-frequency-${benefit.id}`}
                        className="block text-xs font-medium text-muted-foreground mb-1"
                      >
                        תדירות
                      </label>
                      <Select
                        value={benefit.benefitFrequency}
                        onValueChange={(value) =>
                          updateBenefit(benefit.id, {
                            benefitFrequency: value as 'monthly' | 'period',
                          })
                        }
                      >
                        <SelectTrigger id={`benefit-frequency-${benefit.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">חודשי</SelectItem>
                          <SelectItem value="period">לתקופה</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="info-box flex items-start gap-3 mt-4">
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-medium">הסבר אופן הניכוי:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><strong>חודשי:</strong> הסכום יחולק ל-30 ויוכפל במספר ימי אי הכושר</li>
                <li><strong>לתקופה:</strong> הסכום המלא ינוכה כפי שהוזן</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {state.hasOtherBenefits === false && (
        <div className="info-box flex items-start gap-3 mt-4">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm">לא יבוצע ניכוי גמלאות אחרות מהתט״ר.</p>
        </div>
      )}
    </div>
  );
}
