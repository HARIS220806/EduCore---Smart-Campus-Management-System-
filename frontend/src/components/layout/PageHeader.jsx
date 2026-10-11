import { useLocation } from 'react-router-dom';

export function PageHeader({ title, description, actions }) {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin');
  const isFaculty = location.pathname.includes('/faculty');
  
  // Set theme colors based on role (defaults to Student)
  let gradient = "from-[var(--color-primary-800)] to-[var(--color-info-600)]";
  if (isAdmin) gradient = "from-[var(--color-primary-950)] to-[var(--color-primary-700)]";
  if (isFaculty) gradient = "from-[var(--color-accent-700)] to-[var(--color-warning-600)]";

  return (
    <div className={`relative overflow-hidden rounded-[var(--radius-lg)] mb-6 shadow-md bg-gradient-to-r ${gradient} p-5 sm:p-6 animate-slide-up opacity-0`} style={{ animationFillMode: 'forwards' }}>
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-15 mix-blend-overlay"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop")' }}
      />
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-white">
          <h1 className="font-[var(--font-display)] text-2xl font-bold mb-1 animate-slide-right opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            {title}
          </h1>
          {description && (
            <p className="text-white/90 text-sm animate-slide-right opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-wrap animate-fade-in opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
