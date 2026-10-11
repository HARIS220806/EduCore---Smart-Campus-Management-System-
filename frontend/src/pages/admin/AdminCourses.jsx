import { useEffect, useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Users, Calendar } from 'lucide-react';
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
import departmentService from '@/services/departmentService';
import userService from '@/services/userService';

export function AdminCourses() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({
    code: '',
    name: '',
    departmentId: '',
    facultyId: '',
    year: 1,
    semester: 1,
    credits: 3,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cData, dData, fData] = await Promise.all([
        courseService.list(),
        departmentService.list(),
        userService.list({ role: 'faculty' }),
      ]);
      setCourses(cData);
      setDepartments(dData);
      setFaculty(fData);
      if (dData.length > 0) {
        setForm((prev) => ({ ...prev, departmentId: dData[0].id }));
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to load courses data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setForm({
      code: '',
      name: '',
      departmentId: departments[0]?.id || '',
      facultyId: faculty[0]?.id || '',
      year: 1,
      semester: 1,
      credits: 3,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setForm({
      code: course.code,
      name: course.name,
      departmentId: course.departmentId || departments[0]?.id || '',
      facultyId: course.facultyId || '',
      year: course.year || 1,
      semester: course.semester || 1,
      credits: course.credits || 3,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.name || !form.departmentId) {
      toast.error('Course code, name, and department are required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCourse) {
        await courseService.update(editingCourse.id, form);
        toast.success('Course updated!');
      } else {
        await courseService.create(form);
        toast.success('Course created!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err?.message || 'Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await courseService.remove(id);
      toast.success('Course deleted');
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error(err?.message || 'Failed to delete course');
    }
  };

  return (
    <div>
      <PageHeader
        title="Course Management"
        description="View and configure curriculum courses and faculty assignments."
        actions={
          <Button icon={Plus} onClick={handleOpenAddModal}>
            Add Course
          </Button>
        }
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Create your first subject course."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col justify-between hover:border-[var(--color-primary-300)] transition-colors">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="primary">{course.code}</Badge>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                    {course.credits} Credits
                  </span>
                </div>
                <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--text-primary)] mb-2">
                  {course.name}
                </h3>
                <div className="space-y-1 text-xs text-[var(--text-muted)] mb-4">
                  <p>Instructor: <strong className="text-[var(--text-primary)]">{course.facultyName || 'Unassigned'}</strong></p>
                  <p>Dept: {course.departmentCode || course.departmentName}</p>
                  <p>Year {course.year}, Semester {course.semester}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(course)}
                  className="p-1.5 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] transition-colors"
                  title="Edit Course"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(course.id)}
                  className="p-1.5 rounded hover:bg-[var(--color-danger-100)] text-[var(--color-danger-600)] transition-colors"
                  title="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingCourse ? `Edit Course — ${editingCourse.code}` : 'Create New Course'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Course Code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. CS101"
                required
              />
              <Input
                type="number"
                label="Credits"
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
                min={1}
                required
              />
            </div>
            <Input
              label="Course Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Data Structures and Algorithms"
              required
            />
            <Select
              label="Department"
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              options={departments.map((d) => ({
                value: d.id,
                label: `${d.name} (${d.code})`,
              }))}
            />
            <Select
              label="Assigned Faculty Instructor"
              value={form.facultyId}
              onChange={(e) => setForm({ ...form, facultyId: e.target.value })}
              options={[
                { value: '', label: 'Unassigned' },
                ...faculty.map((f) => ({ value: f.id, label: `${f.name} (${f.email})` })),
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Year (1 - 4)"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                min={1}
                max={4}
              />
              <Input
                type="number"
                label="Semester (1 - 8)"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                min={1}
                max={8}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminCourses;
