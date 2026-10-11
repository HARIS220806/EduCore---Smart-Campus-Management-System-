import { useEffect, useState } from 'react';
import { ClipboardList, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { useToast } from '@/hooks/useToast';
import marksService from '@/services/marksService';

export function AdminMarks() {
  const toast = useToast();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const data = await marksService.list();
      setMarks(data);
    } catch (err) {
      toast.error(err?.message || 'Failed to load marks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this marks entry?')) return;
    try {
      await marksService.remove(id);
      toast.success('Marks entry deleted');
      setMarks((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      toast.error(err?.message || 'Failed to delete marks entry');
    }
  };

  return (
    <div>
      <PageHeader
        title="Marks & Exam Results"
        description="View all published test scores and exam marks across courses."
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : marks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No marks entries found"
          description="No examination marks have been posted yet."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-medium uppercase text-xs">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Exam Type</th>
                <th className="py-3 px-4">Obtained</th>
                <th className="py-3 px-4">Max Marks</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {marks.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                    {item.studentName || 'Student'}
                  </td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">
                    {item.courseName} ({item.courseCode})
                  </td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">
                    {item.examType}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                    {item.obtained}
                  </td>
                  <td className="py-3 px-4 text-[var(--text-muted)]">
                    {item.maxMarks}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={item.percentage >= 50 ? 'success' : 'danger'}>
                      {item.percentage}%
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded hover:bg-[var(--color-danger-100)] text-[var(--color-danger-600)] transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminMarks;
