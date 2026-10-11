import { useEffect, useState } from 'react';
import { Clock, Plus, Trash2, CalendarDays } from 'lucide-react';
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
import timetableService from '@/services/timetableService';
import courseService from '@/services/courseService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function AdminTimetable() {
  const toast = useToast();
  const [timetable, setTimetable] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    courseId: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    room: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tData, cData] = await Promise.all([
        timetableService.list(),
        courseService.list(),
      ]);
      setTimetable(tData);
      setCourses(cData);
      if (cData.length > 0) {
        setForm((prev) => ({ ...prev, courseId: cData[0].id }));
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to load timetable data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setForm({
      courseId: courses[0]?.id || '',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      room: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.courseId || !form.day || !form.startTime || !form.endTime) {
      toast.error('Course, day, and timings are required');
      return;
    }
    if (form.startTime >= form.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      setSubmitting(true);
      await timetableService.create(form);
      toast.success('Timetable entry created!');
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err?.message || 'Failed to save timetable entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule entry?')) return;
    try {
      await timetableService.remove(id);
      toast.success('Timetable entry deleted');
      setTimetable((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      toast.error(err?.message || 'Failed to delete timetable entry');
    }
  };

  return (
    <div>
      <PageHeader
        title="Timetable Management"
        description="Schedule classes, manage timings, and assign rooms for courses."
        actions={
          <Button icon={Plus} onClick={handleOpenAddModal}>
            Schedule Class
          </Button>
        }
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : timetable.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No classes scheduled"
          description="Create your first timetable entry."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {timetable.map((item) => (
            <Card key={item.id} className="flex flex-col justify-between hover:border-[var(--color-primary-300)] transition-colors">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="primary">{item.day}</Badge>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                    {item.startTime} - {item.endTime}
                  </span>
                </div>
                <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--text-primary)] mb-1">
                  {item.courseName}
                </h3>
                <p className="text-sm font-medium text-[var(--text-muted)] mb-4">
                  {item.courseCode}
                </p>
                <div className="space-y-1 text-xs text-[var(--text-muted)] mb-4">
                  <p>Instructor: <strong className="text-[var(--text-primary)]">{item.facultyName || 'Unassigned'}</strong></p>
                  <p>Room: <strong className="text-[var(--text-primary)]">{item.room || 'TBD'}</strong></p>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded hover:bg-[var(--color-danger-100)] text-[var(--color-danger-600)] transition-colors"
                  title="Delete Entry"
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
          title="Schedule New Class"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Course"
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              options={courses.map((c) => ({
                value: c.id,
                label: `${c.code} - ${c.name}`,
              }))}
            />
            
            <Select
              label="Day of Week"
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value })}
              options={DAYS.map((d) => ({ value: d, label: d }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="time"
                label="Start Time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
              />
              <Input
                type="time"
                label="End Time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                required
              />
            </div>

            <Input
              label="Room / Location (Optional)"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              placeholder="e.g. Lecture Hall A, Lab 302"
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Add Schedule'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminTimetable;
