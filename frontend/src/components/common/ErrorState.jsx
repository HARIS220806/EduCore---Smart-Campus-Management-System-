import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export function ErrorState({
  title = 'Unable to load this data.',
  description,
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
      <div className="rounded-full bg-[var(--color-danger-100)] p-4 text-[var(--color-danger-600)]">
        <AlertTriangle size={28} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
        {description && (
          <p className="text-sm text-[var(--text-muted)] max-w-sm">{description}</p>
        )}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          Try again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
