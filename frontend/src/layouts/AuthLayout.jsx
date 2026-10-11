import { Outlet } from 'react-router-dom';
import { School } from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--bg-canvas)] relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-primary-500)] opacity-20 blur-[100px] animate-float z-0 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--color-accent-500)] opacity-20 blur-[120px] animate-float-delayed z-0 pointer-events-none" />

      {/* Left / brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-[var(--color-primary-950)] p-12 overflow-hidden z-10 shadow-2xl">
        {/* Campus background image with overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-950)]/90 via-[var(--color-primary-900)]/80 to-[var(--color-accent-700)]/60 z-0" />
        
        <div className="relative z-10 flex items-center gap-3 animate-slide-right opacity-0" style={{ animationDelay: '0.1s' }}>
          <div className="rounded-[var(--radius-md)] bg-gradient-to-tr from-[var(--color-accent-600)] to-[var(--color-accent-400)] p-2 text-[var(--color-primary-950)] shadow-lg shadow-[var(--color-accent-500)]/30">
            <School size={24} strokeWidth={2.5} />
          </div>
          <span className="font-[var(--font-display)] text-2xl font-bold text-white tracking-tight">
            EduCore
          </span>
        </div>

        <div className="relative z-10 max-w-md animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
          <div className="inline-block mb-4 px-3 py-1 rounded-full glass border border-white/10 text-white/80 text-xs font-semibold uppercase tracking-widest">
            Welcome to the future
          </div>
          <h1 className="font-[var(--font-display)] text-5xl leading-[1.1] text-white font-bold">
            One campus, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-300)] to-[var(--color-accent-500)]">
              infinite possibilities.
            </span>
          </h1>
          <p className="mt-6 text-white/70 text-base leading-relaxed font-medium">
            Experience a seamless academic journey. Attendance, marks, assignments and announcements — all beautifully managed in one place.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between animate-fade-in opacity-0" style={{ animationDelay: '0.5s' }}>
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider">
            Powered by modern tech
          </p>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-500)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-500)]/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-500)]/20" />
          </div>
        </div>

        {/* decorative accent shapes */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full"
          style={{ background: 'radial-gradient(circle, var(--color-accent-500) 0%, transparent 60%)', opacity: 0.15 }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-1/4 h-64 w-64 rounded-full"
          style={{ background: 'radial-gradient(circle, var(--color-primary-500) 0%, transparent 60%)', opacity: 0.2 }}
        />
      </div>

      {/* Right / form panel */}
      <div className="flex flex-col z-10 relative animate-fade-in">
        <div className="flex justify-end p-6">
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card p-8 md:p-10 shadow-2xl">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
