import React, { useState, useCallback, useId } from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NumericInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  label?: string;
  id?: string;
  className?: string;
  tooltip?: string;
  suffix?: string;
  error?: string;
}

/**
 * Numeric input that handles replace-only behavior:
 * - Value is replaced, never concatenated
 * - Empty input = null
 * - Initial value is empty (null), not 0
 * - No automatic transformations
 */
const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  placeholder = '',
  min,
  max,
  label,
  id,
  className = '',
  tooltip,
  suffix,
  error,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  const [displayValue, setDisplayValue] = useState<string>(
    value !== null ? String(value) : ''
  );

  // Sync display value when external value changes
  React.useEffect(() => {
    setDisplayValue(value !== null ? String(value) : '');
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Allow empty input
    if (rawValue === '') {
      setDisplayValue('');
      onChange(null);
      return;
    }

    // Only allow digits
    const numericOnly = rawValue.replace(/[^0-9]/g, '');
    
    if (numericOnly === '') {
      setDisplayValue('');
      onChange(null);
      return;
    }

    const numValue = parseInt(numericOnly, 10);
    
    // Apply min/max constraints if provided
    let finalValue = numValue;
    if (min !== undefined && finalValue < min) {
      finalValue = min;
    }
    if (max !== undefined && finalValue > max) {
      finalValue = max;
    }

    setDisplayValue(String(finalValue));
    onChange(finalValue);
  }, [onChange, min, max]);

  const handleBlur = useCallback(() => {
    // Ensure display matches actual value on blur
    setDisplayValue(value !== null ? String(value) : '');
  }, [value]);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex items-center gap-1.5">
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`מידע נוסף על ${label}`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-right" dir="rtl">
                <p className="text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
      <div className="relative">
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`numeric-input ${error ? 'border-destructive ring-1 ring-destructive' : ''} ${className}`}
          autoComplete="off"
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {suffix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default NumericInput;
