import { useEffect, useState } from 'react';
import { FileText, Trash2, Calendar, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { useToast } from '@/hooks/useToast';
import assignmentService from '@/services/assignmentService';

export function AdminAssignments() {
  const toast = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await assignmentService.list();
      setAssignments(data);
    } catch (err) {
      toast.error(err?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await assignmentService.remove(id);
      toast.success('Assignment deleted');
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error(err?.message || 'Failed to delete assignment');
    }
  };

  return (
    <div>
      <PageHeader
        title="Campus Assignments"
        description="Monitor all course assignments created by faculty."
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No assignments found"
          description="No assignments have been created by faculty yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignments.map((a) => (
            <Card key={a.id} className="flex flex-col justify-between hover:border-[var(--color-primary-300)] transition-colors">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="primary">{a.courseCode || 'Subject'}</Badge>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                    Max: {a.maxMarks} pts
                  </span>
                </div>

                <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--text-primary)] mb-2">
                  {a.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-4">
                  {a.description || 'No description provided.'}
                </p>

                <div className="space-y-1.5 text-xs text-[var(--text-secondary)] mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
                    <span>Due: {a.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
                    <span>Submissions: {a.submissionCount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
                  className="p-1.5 rounded hover:bg-[var(--color-danger-100)] text-[var(--color-danger-600)] transition-colors"
                  title="Delete assignment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminAssignments;
