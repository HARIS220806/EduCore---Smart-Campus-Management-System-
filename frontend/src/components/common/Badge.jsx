import { cn } from '@/utils/cn';

const VARIANT_CLASSES = {
  neutral: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]',
  success: 'bg-[var(--color-success-100)] text-[var(--color-success-600)]',
  warning: 'bg-[var(--color-warning-100)] text-[var(--color-warning-600)]',
  danger: 'bg-[var(--color-danger-100)] text-[var(--color-danger-600)]',
  info: 'bg-[var(--color-info-100)] text-[var(--color-info-600)]',
  accent: 'bg-[var(--color-accent-100)] text-[var(--color-accent-700)]',
};

export function Badge({ children, variant = 'neutral', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
