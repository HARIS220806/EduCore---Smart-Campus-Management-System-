import { useContext } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastContext } from '@/context/ToastContext';
import { cn } from '@/utils/cn';

const VARIANT_META = {
  success: { icon: CheckCircle2, cls: 'border-[var(--color-success-600)] text-[var(--color-success-600)]' },
  error: { icon: XCircle, cls: 'border-[var(--color-danger-600)] text-[var(--color-danger-600)]' },
  warning: { icon: AlertTriangle, cls: 'border-[var(--color-warning-600)] text-[var(--color-warning-600)]' },
  info: { icon: Info, cls: 'border-[var(--color-info-600)] text-[var(--color-info-600)]' },
};

export function ToastContainer() {
  const ctx = useContext(ToastContext);
  if (!ctx || ctx.toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
      {ctx.toasts.map((t) => {
        const meta = VARIANT_META[t.variant] || VARIANT_META.info;
        const Icon = meta.icon;
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'flex items-start gap-2.5 rounded-[var(--radius-md)] border-l-4 bg-[var(--bg-surface)]',
              'shadow-[var(--shadow-raised)] px-4 py-3 text-sm text-[var(--text-primary)] animate-[toast-in_0.2s_ease-out]',
              meta.cls
            )}
          >
            <Icon size={18} className="shrink-0 mt-0.5" />
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => ctx.dismiss(t.id)}
              aria-label="Dismiss notification"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default ToastContainer;
