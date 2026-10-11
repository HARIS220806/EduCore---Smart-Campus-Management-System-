import { useEffect, useState } from 'react';
import { FileText, Calendar, CheckCircle2, Clock, Send, ExternalLink, Award } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import Modal from '@/components/modals/Modal';
import { useToast } from '@/hooks/useToast';
import assignmentService from '@/services/assignmentService';

export function StudentAssignments() {
  const toast = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submit Modal
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submitForm, setSubmitForm] = useState({ content: '', link: '' });
  const [submitting, setSubmitting] = useState(false);

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

  const handleOpenSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    const existing = assignment.mySubmission;
    setSubmitForm({
      content: existing?.content || '',
      link: existing?.link || '',
    });
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submitForm.content && !submitForm.link) {
      toast.error('Please enter response text or attach a link');
      return;
    }

    try {
      setSubmitting(true);
      await assignmentService.submit(selectedAssignment.id, submitForm);
      toast.success(selectedAssignment.mySubmission ? 'Submission updated!' : 'Assignment submitted successfully!');
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (err) {
      toast.error(err?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="My Assignments"
        description="View assigned coursework, submit your solutions, and review grades."
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No assignments"
          description="You currently have no pending or past assignments."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignments.map((assignment) => {
            const sub = assignment.mySubmission;
            const isOverdue = new Date() > new Date(assignment.dueDate) && !sub;

            return (
              <Card key={assignment.id} className="flex flex-col justify-between hover:border-[var(--color-primary-300)] transition-colors">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="primary">{assignment.courseCode || 'Subject'}</Badge>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                      Max: {assignment.maxMarks} pts
                    </span>
                  </div>

                  <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--text-primary)] mb-2">
                    {assignment.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] line-clamp-3 mb-4">
                    {assignment.description || 'No detailed instructions.'}
                  </p>

                  <div className="space-y-1.5 text-xs text-[var(--text-secondary)] mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
                      <span>Due Date: {assignment.dueDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {sub ? (
                        sub.grade !== null && sub.grade !== undefined ? (
                          <Badge variant="success" icon={Award}>
                            Graded: {sub.grade} / {assignment.maxMarks}
                          </Badge>
                        ) : (
                          <Badge variant="info" icon={CheckCircle2}>
                            Submitted ({sub.status === 'on_time' ? 'On Time' : 'Late'})
                          </Badge>
                        )
                      ) : isOverdue ? (
                        <Badge variant="danger" icon={Clock}>Overdue</Badge>
                      ) : (
                        <Badge variant="warning" icon={Clock}>Pending Submission</Badge>
                      )}
                    </div>

                    {sub?.feedback && (
                      <div className="p-2 rounded bg-[var(--bg-subtle)] text-xs text-[var(--text-secondary)] mt-2">
                        <strong>Faculty Feedback:</strong> {sub.feedback}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <Button
                    size="sm"
                    variant={sub ? 'outline' : 'primary'}
                    icon={Send}
                    onClick={() => handleOpenSubmitModal(assignment)}
                  >
                    {sub ? 'Edit Submission' : 'Submit Work'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submit Modal */}
      {selectedAssignment && (
        <Modal
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          title={`Submit Assignment — ${selectedAssignment.title}`}
        >
          <form onSubmit={handleSubmitAssignment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Written Response / Text Answer
              </label>
              <textarea
                rows={4}
                value={submitForm.content}
                onChange={(e) => setSubmitForm({ ...submitForm, content: e.target.value })}
                placeholder="Type your response, write-up, or submission notes here..."
                className="w-full px-3 py-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
              />
            </div>
            <Input
              label="Project / Document Link (URL)"
              type="url"
              value={submitForm.link}
              onChange={(e) => setSubmitForm({ ...submitForm, link: e.target.value })}
              placeholder="https://github.com/... or Google Drive URL"
              leftIcon={ExternalLink}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <Button type="button" variant="outline" onClick={() => setSelectedAssignment(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : selectedAssignment.mySubmission ? 'Update Submission' : 'Submit Work'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default StudentAssignments;
