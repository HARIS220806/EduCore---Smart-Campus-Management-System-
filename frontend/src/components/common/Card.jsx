import { cn } from '@/utils/cn';

export function Card({ children, className, padded = true, ...rest }) {
  return (
    <div
      className={cn(
        'bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)]',
        'shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-raised)] hover:-translate-y-1',
        padded && 'p-5',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
