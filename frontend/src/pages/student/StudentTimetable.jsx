import { useEffect, useState } from 'react';
import { Clock, MapPin, UserCheck, Calendar } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { useToast } from '@/hooks/useToast';
import timetableService from '@/services/timetableService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function StudentTimetable() {
  const toast = useToast();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await timetableService.list();
        setTimetable(data);
      } catch (err) {
        toast.error(err?.message || 'Failed to load timetable');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader
        title="Class Timetable"
        description="Weekly schedule of lectures, lab sessions, and classroom assignments."
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : timetable.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No timetable scheduled"
          description="Your weekly schedule is not published yet."
        />
      ) : (
        <div className="space-y-6">
          {DAYS.map((day) => {
            const dayClasses = timetable.filter(
              (t) => (t.day || t.dayOfWeek)?.toLowerCase() === day.toLowerCase()
            );

            return (
              <Card key={day}>
                <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[var(--color-primary-500)]" /> {day}
                </h3>

                {dayClasses.length === 0 ? (
                  <p className="text-xs text-[var(--text-subtle)] italic py-2">No scheduled lectures</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dayClasses.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <Badge variant="primary">{item.courseCode}</Badge>
                            <span className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[var(--text-subtle)]" /> {item.startTime} – {item.endTime}
                            </span>
                          </div>
                          <h4 className="font-medium text-sm text-[var(--text-primary)] mb-1">
                            {item.courseName}
                          </h4>
                        </div>
                        <div className="pt-2 border-t border-[var(--border-subtle)]/60 text-xs text-[var(--text-muted)] flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[var(--text-subtle)]" /> Room: {item.room}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-[var(--text-subtle)]" /> {item.facultyName || 'Faculty'}
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
    </div>
  );
}

export default StudentTimetable;
