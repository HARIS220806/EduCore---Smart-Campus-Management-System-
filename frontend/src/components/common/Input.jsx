import { forwardRef, useId } from 'react';
import { cn } from '@/utils/cn';

const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, className, containerClassName, required, id, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--text-secondary)]"
        >
          {label}
          {required && <span className="text-[var(--color-danger-600)] ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            'w-full rounded-[var(--radius-sm)] border bg-[var(--bg-surface)] text-[var(--text-primary)]',
            'px-3.5 py-2.5 text-sm placeholder:text-[var(--text-muted)]',
            'transition-colors duration-150 outline-none',
            'focus:border-[var(--color-accent-500)]',
            error ? 'border-[var(--color-danger-600)]' : 'border-[var(--border-default)]',
            Icon && 'pl-9',
            className
          )}
          {...rest}
        />
      </div>
      {error && (
        <span id={`${inputId}-error`} className="text-xs text-[var(--color-danger-600)]">
          {error}
        </span>
      )}
      {!error && hint && (
        <span id={`${inputId}-hint`} className="text-xs text-[var(--text-muted)]">
          {hint}
        </span>
      )}
    </div>
  );
});

export default Input;
