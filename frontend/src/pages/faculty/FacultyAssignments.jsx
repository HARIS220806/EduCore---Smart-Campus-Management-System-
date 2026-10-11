import { useEffect, useState } from 'react';
import { FileText, Plus, Calendar, CheckCircle2, Clock, Trash2, Eye, Award, ExternalLink } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import Modal from '@/components/modals/Modal';
import { useToast } from '@/hooks/useToast';
import courseService from '@/services/courseService';
import assignmentService from '@/services/assignmentService';

export function FacultyAssignments() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    courseId: '',
    title: '',
    description: '',
    dueDate: '',
    maxMarks: 100,
  });
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Submissions Modal
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Grade Modal
  const [gradingStudent, setGradingStudent] = useState(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
  const [submittingGrade, setSubmittingGrade] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [coursesData, assignmentsData] = await Promise.all([
        courseService.list(),
        assignmentService.list(),
      ]);
      setCourses(coursesData);
      setAssignments(assignmentsData);
      if (coursesData.length > 0) {
        setCreateForm((prev) => ({ ...prev, courseId: coursesData[0].id }));
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!createForm.courseId || !createForm.title || !createForm.dueDate) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setSubmittingCreate(true);
      await assignmentService.create(createForm);
      toast.success('Assignment created successfully!');
      setShowCreateModal(false);
      setCreateForm({
        courseId: courses[0]?.id || '',
        title: '',
        description: '',
        dueDate: '',
        maxMarks: 100,
      });
      fetchInitialData();
    } catch (err) {
      toast.error(err?.message || 'Failed to create assignment');
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await assignmentService.remove(id);
      toast.success('Assignment deleted');
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error(err?.message || 'Failed to delete assignment');
    }
  };

  const handleViewSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    try {
      setLoadingSubmissions(true);
      const data = await assignmentService.submissions(assignment.id);
      setSubmissions(data);
    } catch (err) {
      toast.error(err?.message || 'Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleOpenGradeModal = (subItem) => {
    setGradingStudent(subItem);
    setGradeForm({
      grade: subItem.submission?.grade !== null && subItem.submission?.grade !== undefined ? subItem.submission.grade : '',
      feedback: subItem.submission?.feedback || '',
    });
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (gradeForm.grade === '') {
      toast.error('Please enter a grade');
      return;
    }
    const numGrade = Number(gradeForm.grade);
    if (isNaN(numGrade) || numGrade < 0 || numGrade > selectedAssignment.maxMarks) {
      toast.error(`Grade must be between 0 and ${selectedAssignment.maxMarks}`);
      return;
    }

    try {
      setSubmittingGrade(true);
      await assignmentService.grade(selectedAssignment.id, gradingStudent.studentId, {
        grade: numGrade,
        feedback: gradeForm.feedback,
      });
      toast.success('Grade submitted successfully');
      setGradingStudent(null);
      // Refresh submissions
      const data = await assignmentService.submissions(selectedAssignment.id);
      setSubmissions(data);
    } catch (err) {
      toast.error(err?.message || 'Failed to grade submission');
    } finally {
      setSubmittingGrade(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Assignments"
        description="Create coursework tasks, track student submissions, and assign grades."
        actions={
          <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
            Create Assignment
          </Button>
        }
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No assignments created"
          description="Create your first coursework assignment for students."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="flex flex-col justify-between hover:border-[var(--color-primary-300)] transition-colors">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="primary">{assignment.courseCode || 'Subject'}</Badge>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                    Max Marks: {assignment.maxMarks}
                  </span>
                </div>

                <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--text-primary)] mb-2">
                  {assignment.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-4">
                  {assignment.description || 'No detailed instructions provided.'}
                </p>

                <div className="space-y-1.5 text-xs text-[var(--text-secondary)] mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
                    <span>Due: {assignment.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
                    <span>Submissions: {assignment.submissionCount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <Button size="sm" variant="outline" icon={Eye} onClick={() => handleViewSubmissions(assignment)}>
                  Submissions ({assignment.submissionCount || 0})
                </Button>
                <button
                  type="button"
                  onClick={() => handleDeleteAssignment(assignment.id)}
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

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Assignment"
        >
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <Select
              label="Select Course / Subject"
              value={createForm.courseId}
              onChange={(e) => setCreateForm({ ...createForm, courseId: e.target.value })}
              options={courses.map((c) => ({
                value: c.id,
                label: `${c.code} — ${c.name}`,
              }))}
              required
            />
            <Input
              label="Assignment Title"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="e.g. Lab Project 1: Data Structures"
              required
            />
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Description / Instructions
              </label>
              <textarea
                rows={3}
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Explain the assignment problem statement and requirements..."
                className="w-full px-3 py-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Due Date"
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                required
              />
              <Input
                type="number"
                label="Max Marks"
                value={createForm.maxMarks}
                onChange={(e) => setCreateForm({ ...createForm, maxMarks: Number(e.target.value) })}
                min={1}
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingCreate}>
                {submittingCreate ? 'Creating...' : 'Create Assignment'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Submissions Modal */}
      {selectedAssignment && (
        <Modal
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          title={`Submissions — ${selectedAssignment.title}`}
        >
          {loadingSubmissions ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : submissions.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-4 text-center">No students registered for this course.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-[var(--border-subtle)]">
              {submissions.map((item) => {
                const sub = item.submission;
                return (
                  <div key={item.studentId} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">{item.studentName}</div>
                      <div className="text-xs text-[var(--text-muted)]">Reg No: {item.registerNumber || 'N/A'}</div>
                      {sub ? (
                        <div className="mt-1 space-y-1 text-xs">
                          <p className="text-[var(--text-secondary)]">
                            <strong>Content:</strong> {sub.content || 'No text'}
                          </p>
                          {sub.link && (
                            <a
                              href={sub.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[var(--color-primary-600)] hover:underline inline-flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> View Attachment Link
                            </a>
                          )}
                          <div className="flex items-center gap-2">
                            <Badge variant={sub.status === 'on_time' ? 'success' : 'danger'}>
                              {sub.status === 'on_time' ? 'On Time' : 'Late'}
                            </Badge>
                            <span className="text-[var(--text-subtle)]">
                              Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-block mt-1 text-xs text-[var(--text-subtle)] font-medium">
                          No submission yet
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {sub ? (
                        sub.grade !== null && sub.grade !== undefined ? (
                          <div className="text-right">
                            <Badge variant="primary" className="text-xs">
                              Score: {sub.grade} / {selectedAssignment.maxMarks}
                            </Badge>
                            <Button size="xs" variant="outline" className="mt-1 block text-xs" onClick={() => handleOpenGradeModal(item)}>
                              Edit Grade
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" onClick={() => handleOpenGradeModal(item)}>
                            Grade Student
                          </Button>
                        )
                      ) : (
                        <span className="text-xs text-[var(--text-subtle)]">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      )}

      {/* Grade Modal */}
      {gradingStudent && (
        <Modal
          isOpen={!!gradingStudent}
          onClose={() => setGradingStudent(null)}
          title={`Grade ${gradingStudent.studentName}`}
        >
          <form onSubmit={handleGradeSubmit} className="space-y-4">
            <Input
              type="number"
              label={`Score (out of ${selectedAssignment.maxMarks})`}
              value={gradeForm.grade}
              onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
              min={0}
              max={selectedAssignment.maxMarks}
              required
            />
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Faculty Feedback / Remarks
              </label>
              <textarea
                rows={3}
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                placeholder="Good work! Needs improvement in..."
                className="w-full px-3 py-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <Button type="button" variant="outline" onClick={() => setGradingStudent(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingGrade}>
                {submittingGrade ? 'Submitting...' : 'Save Grade'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default FacultyAssignments;
