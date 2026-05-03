import { CalculatorState, MARITAL_STATUS_LABELS, MaritalStatus, ChildInfo } from '@/types/calculator';
import { FormField } from '@/components/FormField';
import { RadioGroup } from '@/components/RadioGroup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Users } from 'lucide-react';

interface Step3Props {
  state: CalculatorState;
  updateState: (updates: Partial<CalculatorState>) => void;
  errors: Record<string, string>;
}

export function Step3Family({ state, updateState, errors }: Step3Props) {
  const maritalOptions = (Object.entries(MARITAL_STATUS_LABELS) as [MaritalStatus, string][]).map(
    ([value, label]) => ({ value, label })
  );

  const addChild = () => {
    const newChild: ChildInfo = {
      id: crypto.randomUUID(),
      age: 0,
    };
    updateState({
      children: [...state.children, newChild],
      childrenCount: state.childrenCount + 1,
    });
  };

  const updateChild = (id: string, age: number) => {
    updateState({
      children: state.children.map((child) =>
        child.id === id ? { ...child, age } : child
      ),
    });
  };

  const removeChild = (id: string) => {
    updateState({
      children: state.children.filter((child) => child.id !== id),
      childrenCount: Math.max(0, state.childrenCount - 1),
    });
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold text-foreground mb-6">מצב משפחתי וילדים</h2>

      <FormField
        id="maritalStatus"
        label="מצב משפחתי"
        required
        error={errors.maritalStatus}
      >
        <RadioGroup
          id="maritalStatus"
          name="maritalStatus"
          options={maritalOptions}
          value={state.maritalStatus}
          onChange={(value) => updateState({ maritalStatus: value as MaritalStatus })}
          error={errors.maritalStatus}
        />
      </FormField>

      <FormField
        id="hasChildren"
        label="האם יש לך ילדים?"
        required
        error={errors.hasChildren}
      >
        <RadioGroup
          id="hasChildren"
          name="hasChildren"
          options={[
            { value: 'true', label: 'כן' },
            { value: 'false', label: 'לא' },
          ]}
          value={state.hasChildren === null ? null : String(state.hasChildren)}
          onChange={(value) => {
            const hasChildren = value === 'true';
            updateState({
              hasChildren,
              children: hasChildren ? state.children : [],
              childrenCount: hasChildren ? state.childrenCount : 0,
            });
          }}
          error={errors.hasChildren}
        />
      </FormField>

      {state.hasChildren === true && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <Users className="w-5 h-5" aria-hidden="true" />
              פרטי הילדים
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addChild}
              className="flex items-center gap-1"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              הוסף ילד/ה
            </Button>
          </div>

          {state.children.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              לחץ/י על "הוסף ילד/ה" להוספת פרטי הילדים
            </p>
          ) : (
            <div className="space-y-3">
              {state.children.map((child, index) => (
                <div
                  key={child.id}
                  className="flex items-center gap-3 p-3 bg-background rounded-lg"
                >
                  <span className="text-sm font-medium min-w-fit">ילד/ה {index + 1}:</span>
                  <div className="flex-1">
                    <label htmlFor={`child-age-${child.id}`} className="sr-only">
                      גיל ילד/ה {index + 1}
                    </label>
                    <Input
                      type="number"
                      id={`child-age-${child.id}`}
                      min={0}
                      max={120}
                      placeholder="גיל"
                      value={child.age || ''}
                      onChange={(e) => updateChild(child.id, Number(e.target.value))}
                      className="max-w-24"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeChild(child.id)}
                    aria-label={`הסר ילד/ה ${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {errors.children && (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {errors.children}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
