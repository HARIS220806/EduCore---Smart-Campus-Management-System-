import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, Users, Building2, BookOpen, CalendarCheck,
  ClipboardList, FileText, Megaphone, BarChart3, ShieldCheck, Settings,
  UserCircle, Clock, LogOut, X, School,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';

const ICONS = {
  LayoutDashboard, GraduationCap, Users, Building2, BookOpen, CalendarCheck,
  ClipboardList, FileText, Megaphone, BarChart3, ShieldCheck, Settings,
  UserCircle, Clock,
};

export function Sidebar({ items, mobileOpen, onCloseMobile }) {
  const { logout } = useAuth();

  const navContent = (
    <>
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-accent-500)] p-1.5 text-[var(--color-primary-950)]">
          <School size={18} />
        </div>
        <span className="font-[var(--font-display)] text-lg font-semibold text-white">
          EduCore
        </span>
        <button
          onClick={onCloseMobile}
          className="ml-auto lg:hidden text-white/70 hover:text-white p-1"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-0.5" aria-label="Primary">
        {items.map((item) => {
          const Icon = ICONS[item.icon] || LayoutDashboard;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/65 hover:bg-white/5 hover:text-white'
                )
              }
            >
              <Icon size={17} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col w-64 shrink-0 h-screen sticky top-0 bg-gradient-to-b from-[var(--color-primary-950)] to-[var(--color-primary-900)] border-r border-white/5 relative overflow-hidden"
        aria-label="Sidebar navigation"
      >
        {/* Subtle glowing orb in sidebar */}
        <div className="absolute top-0 left-0 w-full h-48 bg-[var(--color-primary-600)] opacity-[0.15] blur-[60px] pointer-events-none rounded-b-full" />
        <div className="relative z-10 flex flex-col h-full">
          {navContent}
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside
            className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-[var(--bg-sidebar)] flex flex-col shadow-2xl"
            aria-label="Sidebar navigation"
          >
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}

export default Sidebar;
