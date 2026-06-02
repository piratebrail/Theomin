// src/components/ui/Select.tsx
import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className, id, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    
    return (
      <div className={`input-group ${className || ''}`}>
        {label && <label htmlFor={selectId} className="input-label">{label}</label>}
        <select
          ref={ref}
          id={selectId}
          className={`input-field select-field ${error ? 'input-field--error' : ''}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="input-error">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
