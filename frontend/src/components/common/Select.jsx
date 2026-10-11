import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

const Select = forwardRef(function Select(
  { label, error, options = [], placeholder, className, containerClassName, required, id, ...rest },
  ref
) {
  const autoId = useId();
  const selectId = id || autoId;

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
          {required && <span className="text-[var(--color-danger-600)] ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          className={cn(
            'w-full appearance-none rounded-[var(--radius-sm)] border bg-[var(--bg-surface)] text-[var(--text-primary)]',
            'px-3.5 py-2.5 pr-9 text-sm outline-none transition-colors duration-150',
            'focus:border-[var(--color-accent-500)]',
            error ? 'border-[var(--color-danger-600)]' : 'border-[var(--border-default)]',
            className
          )}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
      </div>
      {error && <span className="text-xs text-[var(--color-danger-600)]">{error}</span>}
    </div>
  );
});

export default Select;
