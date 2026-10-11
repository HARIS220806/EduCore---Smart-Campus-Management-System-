import { useEffect, useState } from 'react';
import { CalendarCheck, Award, ClipboardList, Clock } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/cards/StatCard';
import Card from '@/components/common/Card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import dashboardService from '@/services/dashboardService';

function buildStats(stats) {
  if (!stats) return [];
  return [
    { label: 'Attendance', value: `${stats.attendance}%`, icon: CalendarCheck, accent: 'success' },
    { label: 'CGPA', value: stats.cgpa, icon: Award, accent: 'accent' },
    { label: 'Pending Assignments', value: stats.pendingAssignments, icon: ClipboardList, accent: 'warning' },
    { label: 'Upcoming Classes', value: stats.upcomingClasses, icon: Clock, accent: 'info' },
  ];
}

export function StudentDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setData(await dashboardService.student());
      } catch (err) {
        toast.error(err?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxPct = Math.max(1, ...(data?.performanceByCourse || []).map((c) => c.percentage));

  return (
    <div>
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] mb-6 shadow-lg bg-gradient-to-r from-[var(--color-primary-800)] to-[var(--color-info-600)] p-6 sm:p-8 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-20 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop")' }}
        />
        <div className="relative z-10 text-white">
          <h1 className="font-[var(--font-display)] text-3xl font-bold mb-2 animate-slide-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-white/80 text-sm sm:text-base animate-slide-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            Here's a quick look at your semester so far. Keep up the great work!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-[var(--radius-md)] bg-[var(--bg-subtle)] animate-pulse" />)
          : buildStats(data?.stats).map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <Card>
        <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--text-primary)] mb-1">
          Performance overview
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">Marks percentage by course, computed from entered marks.</p>
        <div className="flex flex-col gap-3">
          {(data?.performanceByCourse || []).map((c) => (
            <div key={c.courseName} className="flex items-center gap-3">
              <span className="w-16 text-xs text-[var(--text-secondary)]">{c.courseName}</span>
              <div className="flex-1 h-2.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--color-primary-700)]" style={{ width: `${(c.percentage / maxPct) * 100}%` }} />
              </div>
              <span className="w-10 text-right text-xs font-medium text-[var(--text-primary)]">{c.percentage}%</span>
            </div>
          ))}
          {!loading && (data?.performanceByCourse || []).length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">No marks recorded yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

export default StudentDashboard;
