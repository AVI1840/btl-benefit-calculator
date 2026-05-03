interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
  id: string;
}

export function RadioGroup({ name, options, value, onChange, error, id }: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={`${id}-label`}
      aria-describedby={error ? `${id}-error` : undefined}
      className="flex flex-wrap gap-3"
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
            ${
              value === option.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }
            ${error ? 'border-destructive' : ''}
          `}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-primary accent-primary"
          />
          <span className="text-sm font-medium">{option.label}</span>
        </label>
      ))}
    </div>
  );
}
