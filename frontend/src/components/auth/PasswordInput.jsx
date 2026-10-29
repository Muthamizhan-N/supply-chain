import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PasswordInput = React.forwardRef(
  (
    {
      label = 'Password',
      id,
      name = 'password',
      value,
      onChange,
      error,
      helperText,
      placeholder = '••••••••••••',
      required = false,
      autoComplete = 'current-password',
      className = '',
      showLockIcon = true,
      ...props
    },
    ref
  ) => {
    // Independent state for this password input instance
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || name || 'password-input';

    const toggleVisibility = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setShowPassword((prev) => !prev);
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-1.5"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-xs">
          {showLockIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
            className={cn(
              'block w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-content-primary placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors',
              showLockIcon ? 'pl-9' : 'pl-3',
              'pr-10', // Space for the eye toggle button
              error && 'border-red-400 focus:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={toggleVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

