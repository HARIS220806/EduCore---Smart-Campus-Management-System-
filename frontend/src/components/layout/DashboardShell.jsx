import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export function DashboardShell({ navItems }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-canvas)]">
      <Sidebar items={navItems} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
        {/* Subtle background glow effect in dashboard */}
        <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-[var(--color-primary-500)] opacity-[0.03] blur-[100px] pointer-events-none z-0" />
        
        <div className="relative z-10 flex flex-col flex-1">
          <Navbar onOpenMobileMenu={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6" key={location.pathname}>
            <div className="animate-fade-in animate-slide-up" style={{ animationDuration: '0.4s' }}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardShell;
