import { useEffect, useState } from 'react';
import { BookOpen, Users, CalendarCheck, ClipboardList } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/cards/StatCard';
import Card from '@/components/common/Card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import dashboardService from '@/services/dashboardService';

function buildStats(stats) {
  if (!stats) return [];
  return [
    { label: 'Assigned Subjects', value: stats.assignedSubjects, icon: BookOpen, accent: 'primary' },
    { label: 'Total Students', value: stats.totalStudents, icon: Users, accent: 'accent' },
    { label: "Today's Classes", value: stats.todaysClasses, icon: CalendarCheck, accent: 'info' },
    { label: 'Pending Assignments', value: stats.pendingAssignments, icon: ClipboardList, accent: 'warning' },
  ];
}

export function FacultyDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setData(await dashboardService.faculty());
      } catch (err) {
        toast.error(err?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxAttendance = Math.max(1, ...(data?.attendanceByCourse || []).map((c) => c.percentage));

  return (
    <div>
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] mb-6 shadow-lg bg-gradient-to-r from-[var(--color-accent-700)] to-[var(--color-warning-600)] p-6 sm:p-8 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-15 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop")' }}
        />
        <div className="relative z-10 text-white">
          <h1 className="font-[var(--font-display)] text-3xl font-bold mb-2 animate-slide-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Professor'}! 📚
          </h1>
          <p className="text-white/90 text-sm sm:text-base animate-slide-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            Your classes, students, and academic responsibilities at a glance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-[var(--radius-md)] bg-[var(--bg-subtle)] animate-pulse" />)
          : buildStats(data?.stats).map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--text-primary)] mb-1">
            Attendance by subject
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">Live, computed from marked attendance sessions.</p>
          <div className="flex flex-col gap-3">
            {(data?.attendanceByCourse || []).map((c) => (
              <div key={c.courseName} className="flex items-center gap-3">
                <span className="w-16 text-xs text-[var(--text-secondary)]">{c.courseName}</span>
                <div className="flex-1 h-2.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--color-accent-500)]" style={{ width: `${(c.percentage / maxAttendance) * 100}%` }} />
                </div>
                <span className="w-10 text-right text-xs font-medium text-[var(--text-primary)]">{c.percentage}%</span>
              </div>
            ))}
            {!loading && (data?.attendanceByCourse || []).length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">No attendance marked yet.</p>
            )}
          </div>
        </Card>
        <Card>
          <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--text-primary)] mb-1">
            Today's classes
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">From your timetable.</p>
          <ul className="flex flex-col gap-3">
            {(data?.todaysClasses || []).map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{t.courseName}</p>
                  <p className="text-xs text-[var(--text-muted)]">{t.room}</p>
                </div>
                <span className="text-xs text-[var(--text-secondary)]">{t.startTime} – {t.endTime}</span>
              </li>
            ))}
            {!loading && (data?.todaysClasses || []).length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">No classes scheduled today.</p>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default FacultyDashboard;
