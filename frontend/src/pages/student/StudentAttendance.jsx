import { useEffect, useState } from 'react';
import { CalendarCheck, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { useToast } from '@/hooks/useToast';
import attendanceService from '@/services/attendanceService';

export function StudentAttendance() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await attendanceService.summary();
        setData(res);
      } catch (err) {
        toast.error(err?.message || 'Failed to load attendance summary');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const overall = data?.overall ?? 100;
  const minRequired = data?.minRequired ?? 75;
  const isDanger = overall < minRequired;

  return (
    <div>
      <PageHeader
        title="Attendance Tracking"
        description="Track your course-wise and overall class attendance records."
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : !data ? (
        <EmptyState
          icon={CalendarCheck}
          title="No attendance records"
          description="Attendance session data is not available yet."
        />
      ) : (
        <div className="space-y-6">
          <Card className={`p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-l-4 ${isDanger ? 'border-l-[var(--color-danger-500)]' : 'border-l-[var(--color-success-500)]'}`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-[var(--font-display)] font-semibold text-xl text-[var(--text-primary)]">
                  Overall Attendance Score
                </h2>
                {isDanger ? (
                  <Badge variant="danger" icon={AlertTriangle}>Below {minRequired}% threshold</Badge>
                ) : (
                  <Badge variant="success" icon={CheckCircle2}>Good Standing</Badge>
                )}
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                Minimum required attendance for exam eligibility is <strong>{minRequired}%</strong>.
              </p>
            </div>
            <div className="text-center sm:text-right">
              <span className={`text-4xl font-extrabold font-[var(--font-display)] ${isDanger ? 'text-[var(--color-danger-600)]' : 'text-[var(--color-success-600)]'}`}>
                {overall}%
              </span>
            </div>
          </Card>

          <Card>
            <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--text-primary)] mb-4">
              Subject-wise Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-medium uppercase text-xs">
                  <tr>
                    <th className="py-3 px-4">Subject Code</th>
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-4">Attended / Total</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {(data.perCourse || []).map((c) => {
                    const low = c.percentage < minRequired;
                    return (
                      <tr key={c.courseId} className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-[var(--text-primary)]">
                          {c.courseCode}
                        </td>
                        <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                          {c.courseName}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">
                          {c.present} / {c.total} Sessions
                        </td>
                        <td className="py-3 px-4 w-48">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                              <div
                                className={`h-full rounded-full ${low ? 'bg-[var(--color-danger-500)]' : 'bg-[var(--color-success-500)]'}`}
                                style={{ width: `${c.percentage}%` }}
                              />
                            </div>
                            <span className="font-semibold text-xs text-[var(--text-primary)] w-10 text-right">
                              {c.percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={low ? 'danger' : 'success'}>
                            {low ? 'Low Attendance' : 'Sufficient'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default StudentAttendance;
