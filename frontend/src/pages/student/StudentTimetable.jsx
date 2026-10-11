import { useEffect, useState } from 'react';
import {
  Clock,
  MapPin,
  UserCheck,
  Calendar,
  Grid,
  List,
  CalendarDays,
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { useToast } from '@/hooks/useToast';
import timetableService from '@/services/timetableService';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const STANDARD_PERIODS = [
  { id: 'p1', label: 'Period 1', time: '09:00 - 10:00', startTime: '09:00', endTime: '10:00' },
  { id: 'p2', label: 'Period 2', time: '10:00 - 11:00', startTime: '10:00', endTime: '11:00' },
  { id: 'p3', label: 'Period 3', time: '11:00 - 12:00', startTime: '11:00', endTime: '12:00' },
  { id: 'p4', label: 'Period 4', time: '12:00 - 13:00', startTime: '12:00', endTime: '13:00' },
  { id: 'lunch', label: 'Lunch Break', time: '13:00 - 14:00', isBreak: true },
  { id: 'p5', label: 'Period 5', time: '14:00 - 15:00', startTime: '14:00', endTime: '15:00' },
  { id: 'p6', label: 'Period 6', time: '15:00 - 16:00', startTime: '15:00', endTime: '16:00' },
];

export function StudentTimetable() {
  const toast = useToast();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await timetableService.list();
        setTimetable(data || []);
      } catch (err) {
        toast.error(err?.message || 'Failed to load timetable');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getClassesForSlot = (day, period) => {
    if (period.isBreak) return [];
    return timetable.filter((item) => {
      const itemDay = (item.day || item.dayOfWeek || '').toLowerCase();
      if (itemDay !== day.toLowerCase()) return false;
      if (item.startTime === period.startTime) return true;
      return item.startTime >= period.startTime && item.startTime < period.endTime;
    });
  };

  const hasSaturdayClasses = timetable.some(
    (t) => (t.day || t.dayOfWeek || '').toLowerCase() === 'saturday'
  );
  const activeDays = hasSaturdayClasses ? ALL_DAYS : WEEKDAYS;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Timetable"
        description="Weekly schedule of lectures, lab sessions, and classroom assignments in table format."
        actions={
          <div className="flex items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-[var(--color-primary-600)] text-white shadow-sm font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Table View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-[var(--color-primary-600)] text-white shadow-sm font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Day View
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : timetable.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No timetable scheduled"
          description="Your weekly schedule is not published yet."
        />
      ) : (
        <>
          {/* TABLE VIEW */}
          {viewMode === 'table' && (
            <Card className="p-0 overflow-hidden border border-[var(--border-subtle)] shadow-sm">
              <div className="p-4 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[var(--color-primary-600)]" />
                  <span className="font-semibold text-sm text-[var(--text-primary)]">
                    Weekly Class Timetable (Monday – {hasSaturdayClasses ? 'Saturday' : 'Friday'})
                  </span>
                </div>
                <div className="text-xs text-[var(--text-muted)] flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary-500)]"></span>
                    Scheduled Class
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    Lunch Break
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs min-w-[900px]">
                  <thead>
                    <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)]">
                      <th className="py-3.5 px-4 font-bold text-[var(--text-primary)] uppercase tracking-wider w-32 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                        Day / Hours
                      </th>
                      {STANDARD_PERIODS.map((period) => (
                        <th
                          key={period.id}
                          className={`py-3 px-3 text-center border-r border-[var(--border-subtle)] last:border-r-0 ${
                            period.isBreak
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 w-24'
                              : 'text-[var(--text-primary)] min-w-[140px]'
                          }`}
                        >
                          <div className="font-bold text-xs uppercase tracking-wide">
                            {period.label}
                          </div>
                          <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
                            {period.time}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {activeDays.map((day) => (
                      <tr key={day} className="hover:bg-[var(--bg-subtle)]/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-sm text-[var(--text-primary)] border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-primary-500)]"></span>
                            {day}
                          </div>
                        </td>

                        {STANDARD_PERIODS.map((period) => {
                          if (period.isBreak) {
                            return (
                              <td
                                key={`${day}-${period.id}`}
                                className="p-2 border-r border-[var(--border-subtle)] bg-amber-500/5 text-center text-[11px] font-semibold text-amber-600/80 dark:text-amber-400/80 select-none"
                              >
                                <span className="inline-block px-1.5 py-0.5 rounded bg-amber-500/10">
                                  Lunch
                                </span>
                              </td>
                            );
                          }

                          const matches = getClassesForSlot(day, period);

                          return (
                            <td
                              key={`${day}-${period.id}`}
                              className="p-2 border-r border-[var(--border-subtle)] last:border-r-0 align-top h-28"
                            >
                              {matches.length > 0 ? (
                                <div className="space-y-1.5 h-full flex flex-col justify-between">
                                  {matches.map((item) => (
                                    <div
                                      key={item.id}
                                      className="p-2.5 rounded-lg border border-[var(--color-primary-200)] dark:border-[var(--color-primary-800)] bg-[var(--color-primary-50)]/50 dark:bg-[var(--color-primary-950)]/30 flex flex-col justify-between h-full"
                                    >
                                      <div>
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                          <Badge variant="primary" className="text-[10px] px-1.5 py-0">
                                            {item.courseCode}
                                          </Badge>
                                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                                            {item.startTime}
                                          </span>
                                        </div>
                                        <h4 className="font-semibold text-[11px] text-[var(--text-primary)] line-clamp-2 leading-tight mb-1">
                                          {item.courseName}
                                        </h4>
                                      </div>

                                      <div className="space-y-0.5 text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]/50">
                                        {item.room && (
                                          <div className="flex items-center gap-1 font-medium text-[var(--text-secondary)]">
                                            <MapPin className="w-2.5 h-2.5 shrink-0 text-[var(--color-primary-600)]" />
                                            <span className="truncate">{item.room}</span>
                                          </div>
                                        )}
                                        {item.facultyName && (
                                          <div className="flex items-center gap-1 text-[var(--text-muted)]">
                                            <UserCheck className="w-2.5 h-2.5 shrink-0" />
                                            <span className="truncate">{item.facultyName}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="w-full h-full min-h-[70px] rounded-lg border border-dashed border-[var(--border-subtle)]/50 flex items-center justify-center text-[10px] text-[var(--text-muted)]/50 select-none">
                                  —
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* DAY CARDS VIEW */}
          {viewMode === 'cards' && (
            <div className="space-y-6">
              {activeDays.map((day) => {
                const dayClasses = timetable.filter(
                  (t) => (t.day || t.dayOfWeek)?.toLowerCase() === day.toLowerCase()
                );

                return (
                  <Card key={day}>
                    <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)] flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[var(--color-primary-500)]" /> {day}
                    </h3>

                    {dayClasses.length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)] italic py-2">No scheduled lectures</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {dayClasses.map((item) => (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <Badge variant="primary">{item.courseCode}</Badge>
                                <span className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[var(--color-primary-500)]" /> {item.startTime} – {item.endTime}
                                </span>
                              </div>
                              <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-1">
                                {item.courseName}
                              </h4>
                            </div>
                            <div className="pt-2.5 mt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[var(--color-primary-500)]" /> Room: {item.room || 'TBD'}
                              </span>
                              <span className="flex items-center gap-1">
                                <UserCheck className="w-3 h-3" /> {item.facultyName || 'Faculty'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StudentTimetable;
