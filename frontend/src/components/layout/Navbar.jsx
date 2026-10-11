import { useState, useEffect, useCallback } from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { ROLE_LABELS } from '@/constants/roles';
import notificationService from '@/services/notificationService';

export function Navbar({ onOpenMobileMenu }) {
  const { user, role } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(async () => {
    try {
      setNotifications(await notificationService.list());
    } catch {
      // Silent: the bell is a convenience, not critical path.
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const id = setInterval(loadNotifications, 30000);
    return () => clearInterval(id);
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleOpenNotifications() {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next && unreadCount > 0) {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  const initials = user?.name
    ?.split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)]/90 backdrop-blur px-4 sm:px-6 py-3">
      <button
        onClick={onOpenMobileMenu}
        className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 -ml-1.5 rounded"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="hidden sm:flex items-center gap-2 flex-1 max-w-sm">
        <div className="relative w-full">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="search"
            placeholder="Search…"
            aria-label="Search"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-canvas)] pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--color-accent-500)]"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />

        <div className="relative">
          <button
            onClick={handleOpenNotifications}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            className="relative rounded-[var(--radius-sm)] p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-accent-500)]" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-raised)] py-2 text-sm">
              <div className="px-4 py-2 font-medium text-[var(--text-primary)] border-b border-[var(--border-default)]">
                Notifications
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-[var(--text-muted)]">
                  No new notifications yet.
                </div>
              ) : (
                <ul>
                  {notifications.slice(0, 8).map((n) => (
                    <li key={n.id} className="px-4 py-2.5 border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-subtle)]">
                      <p className="font-medium text-[var(--text-primary)]">{n.title}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{n.body}</p>
                      <span className="text-[10px] text-[var(--text-muted)]">{new Date(n.createdAt).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 pl-2 ml-1 border-l border-[var(--border-default)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-800)] text-xs font-semibold text-white">
            {initials || 'U'}
          </div>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-sm font-medium text-[var(--text-primary)]">{user?.name}</span>
            <span className="text-xs text-[var(--text-muted)]">{ROLE_LABELS[role]}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
