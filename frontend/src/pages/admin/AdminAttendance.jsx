import { useEffect, useState } from 'react';
import { CalendarCheck, Search } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { useToast } from '@/hooks/useToast';
import attendanceService from '@/services/attendanceService';

export function AdminAttendance() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await attendanceService.list();
        setList(data);
      } catch (err) {
        toast.error(err?.message || 'Failed to load attendance');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader
        title="Attendance Records"
        description="View campus-wide attendance logs marked by faculty."
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No attendance records"
          description="No attendance sessions have been logged yet."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-medium uppercase text-xs">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Marked By</th>
                <th className="py-3 px-4">Students Logged</th>
                <th className="py-3 px-4">Present</th>
                <th className="py-3 px-4">Absent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {list.map((item) => {
                const total = item.records?.length || 0;
                const present = item.records?.filter((r) => r.status === 'present').length || 0;
                const absent = total - present;

                return (
                  <tr key={item.id} className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-[var(--text-primary)]">
                      {item.date}
                    </td>
                    <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                      {item.courseName} ({item.courseCode})
                    </td>
                    <td className="py-3 px-4 text-[var(--text-primary)] font-medium">
                      {item.markedByName}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {total} Students
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="success">Present: {present}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="danger">Absent: {absent}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminAttendance;
