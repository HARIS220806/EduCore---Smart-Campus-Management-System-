import { cn } from '@/utils/cn';

const ACCENT_CLASSES = {
  primary: 'border-l-[var(--color-primary-700)]',
  accent: 'border-l-[var(--color-accent-500)]',
  success: 'border-l-[var(--color-success-600)]',
  warning: 'border-l-[var(--color-warning-600)]',
  danger: 'border-l-[var(--color-danger-600)]',
  info: 'border-l-[var(--color-info-600)]',
};

export function StatCard({ label, value, delta, icon: Icon, accent = 'primary', className }) {
  const isPositive = typeof delta === 'string' ? delta.trim().startsWith('+') : delta > 0;

  return (
    <div
      className={cn(
        'bg-[var(--bg-surface)] border border-[var(--border-default)] border-l-4 rounded-[var(--radius-md)]',
        'shadow-[var(--shadow-card)] p-5 flex items-start justify-between gap-3',
        ACCENT_CLASSES[accent],
        className
      )}
    >
      <div className="flex flex-col gap-1.5 min-w-0">
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        <span className="text-2xl font-semibold text-[var(--text-primary)] font-[var(--font-display)]">
          {value}
        </span>
        {delta !== undefined && delta !== null && (
          <span
            className={cn(
              'text-xs font-medium',
              isPositive ? 'text-[var(--color-success-600)]' : 'text-[var(--color-danger-600)]'
            )}
          >
            {delta}
          </span>
        )}
      </div>
      {Icon && (
        <div className="shrink-0 rounded-[var(--radius-sm)] bg-[var(--bg-subtle)] p-2.5 text-[var(--text-secondary)]">
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}

export default StatCard;
