import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: ReactNode;
  id: string;
}

export function FormField({ label, required, error, helpText, children, id }: FormFieldProps) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="form-required" aria-hidden="true">*</span>}
        {required && <span className="sr-only">(שדה חובה)</span>}
      </label>
      {children}
      {helpText && !error && (
        <p className="mt-1.5 text-sm text-muted-foreground" id={`${id}-help`}>
          {helpText}
        </p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-destructive" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
