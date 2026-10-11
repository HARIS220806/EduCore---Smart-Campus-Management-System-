import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export function LoadingSpinner({ label = 'Loading…', size = 20, className, fullPage = false }) {
  const content = (
    <div className={cn('flex items-center gap-2 text-[var(--text-secondary)] text-sm', className)}>
      <Loader2 size={size} className="animate-spin" />
      {label && <span>{label}</span>}
    </div>
  );

  if (fullPage) {
    return <div className="flex items-center justify-center py-24">{content}</div>;
  }

  return content;
}

export default LoadingSpinner;
