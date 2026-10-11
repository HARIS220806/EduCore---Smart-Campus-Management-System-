import { useEffect, useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  CalendarDays,
  Grid,
  List,
  MapPin,
  UserCheck,
  BookOpen,
  Calendar,
} from 'lucide-react';
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

export function AdminTimetable() {
  const toast = useToast();
  const [timetable, setTimetable] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [selectedDayFilter, setSelectedDayFilter] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedPeriodPreset, setSelectedPeriodPreset] = useState('p1');
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

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [tData, cData] = await Promise.all([
        timetableService.list(),
        courseService.list(),
      ]);
      setTimetable((prev) => {
        const serverIds = new Set(tData.map((t) => t.id));
        const pendingNew = prev.filter((p) => !serverIds.has(p.id));
        return [...pendingNew, ...tData];
      });
      setCourses(cData);
      if (cData.length > 0 && !form.courseId) {
        setForm((prev) => ({ ...prev, courseId: cData[0].id }));
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to load timetable data');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleOpenAddModal = (preset = null) => {
    const defaultCourse = courses[0]?.id || '';
    if (preset) {
      setForm({
        courseId: defaultCourse,
        day: preset.day || 'Monday',
        startTime: preset.startTime || '09:00',
        endTime: preset.endTime || '10:00',
        room: '',
      });
      setSelectedPeriodPreset(preset.periodId || 'custom');
    } else {
      setForm({
        courseId: defaultCourse,
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        room: '',
      });
      setSelectedPeriodPreset('p1');
    }
    setShowModal(true);
  };

  const handlePeriodChange = (periodId) => {
    setSelectedPeriodPreset(periodId);
    const p = STANDARD_PERIODS.find((sp) => sp.id === periodId);
    if (p && !p.isBreak) {
      setForm((prev) => ({
        ...prev,
        startTime: p.startTime,
        endTime: p.endTime,
      }));
    }
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
      const created = await timetableService.create(form);
      toast.success('Class scheduled successfully!');
      setTimetable((prev) => [...prev, created]);
      setShowModal(false);
      await fetchData(true);
    } catch (err) {
      toast.error(err?.message || 'Failed to save timetable entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule entry?')) return;
    try {
      setTimetable((prev) => prev.filter((t) => t.id !== id));
      await timetableService.remove(id);
      toast.success('Timetable entry deleted');
    } catch (err) {
      toast.error(err?.message || 'Failed to delete timetable entry');
      fetchData(true);
    }
  };

  // Find classes scheduled for a specific day and period slot
  const getClassesForSlot = (day, period) => {
    if (period.isBreak) return [];
    return timetable.filter((item) => {
      const itemDay = (item.day || item.dayOfWeek || '').toLowerCase();
      if (itemDay !== day.toLowerCase()) return false;
      // Exact start time match or falls in period range
      if (item.startTime === period.startTime) return true;
      return item.startTime >= period.startTime && item.startTime < period.endTime;
    });
  };

  // Check if Saturday has any classes
  const hasSaturdayClasses = timetable.some(
    (t) => (t.day || t.dayOfWeek || '').toLowerCase() === 'saturday'
  );
  const activeDays = hasSaturdayClasses ? ALL_DAYS : WEEKDAYS;

  // Filtered timetable for card view
  const displayDays = selectedDayFilter === 'All' ? activeDays : [selectedDayFilter];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable Management"
        description="Schedule classes with period hours from Monday to Friday in standard timetable table format."
        actions={
          <div className="flex items-center gap-3">
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
                Cards View
              </button>
            </div>

            <Button icon={Plus} onClick={() => handleOpenAddModal()}>
              Schedule Class
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* WEEKLY TABLE VIEW (PRIMARY FORMAT) */}
          {viewMode === 'table' && (
            <Card className="p-0 overflow-hidden border border-[var(--border-subtle)] shadow-sm">
              <div className="p-4 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[var(--color-primary-600)]" />
                  <span className="font-semibold text-sm text-[var(--text-primary)]">
                    Weekly Schedule Matrix (Monday – {hasSaturdayClasses ? 'Saturday' : 'Friday'})
                  </span>
                </div>
                <div className="text-xs text-[var(--text-muted)] flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary-500)]"></span>
                    Scheduled Period
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    Lunch Break
                  </span>
                  <span className="text-[var(--text-secondary)] italic">
                    Tip: Click any (+) cell to schedule for that slot
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
                        {/* DAY ROW HEADER */}
                        <td className="py-3 px-4 font-bold text-sm text-[var(--text-primary)] border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-primary-500)]"></span>
                            {day}
                          </div>
                        </td>

                        {/* PERIOD CELLS */}
                        {STANDARD_PERIODS.map((period) => {
                          if (period.isBreak) {
                            return (
                              <td
                                key={`${day}-${period.id}`}
                                className="p-2 border-r border-[var(--border-subtle)] bg-amber-500/5 text-center text-[11px] font-semibold text-amber-600/80 dark:text-amber-400/80 select-none"
                              >
                                <span className="rotate-0 inline-block px-1.5 py-0.5 rounded bg-amber-500/10">
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
                                      className="group relative p-2.5 rounded-lg border border-[var(--color-primary-200)] dark:border-[var(--color-primary-800)] bg-[var(--color-primary-50)]/50 dark:bg-[var(--color-primary-950)]/30 hover:shadow-md transition-all flex flex-col justify-between"
                                    >
                                      <div>
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                          <Badge variant="primary" className="text-[10px] px-1.5 py-0">
                                            {item.courseCode}
                                          </Badge>
                                          <button
                                            type="button"
                                            onClick={() => handleDelete(item.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-100 text-rose-600 transition-opacity"
                                            title="Delete slot"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
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
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenAddModal({
                                      day,
                                      startTime: period.startTime,
                                      endTime: period.endTime,
                                      periodId: period.id,
                                    })
                                  }
                                  className="w-full h-full min-h-[70px] rounded-lg border border-dashed border-transparent hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]/30 text-transparent hover:text-[var(--color-primary-600)] transition-all flex flex-col items-center justify-center gap-1 group"
                                  title={`Schedule for ${day} ${period.label}`}
                                >
                                  <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    Add Class
                                  </span>
                                </button>
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

          {/* CARDS / DAY VIEW */}
          {viewMode === 'cards' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Button
                  size="sm"
                  variant={selectedDayFilter === 'All' ? 'primary' : 'outline'}
                  onClick={() => setSelectedDayFilter('All')}
                >
                  All Days
                </Button>
                {activeDays.map((d) => (
                  <Button
                    key={d}
                    size="sm"
                    variant={selectedDayFilter === d ? 'primary' : 'outline'}
                    onClick={() => setSelectedDayFilter(d)}
                  >
                    {d}
                  </Button>
                ))}
              </div>

              {timetable.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="No classes scheduled"
                  description="Use 'Schedule Class' to add lectures to the timetable."
                />
              ) : (
                <div className="space-y-6">
                  {displayDays.map((day) => {
                    const dayClasses = timetable
                      .filter((t) => (t.day || t.dayOfWeek || '').toLowerCase() === day.toLowerCase())
                      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

                    return (
                      <Card key={day}>
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-subtle)]">
                          <h3 className="font-[var(--font-display)] font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[var(--color-primary-500)]" />
                            {day}
                          </h3>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                            {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                          </span>
                        </div>

                        {dayClasses.length === 0 ? (
                          <div className="py-6 text-center text-xs text-[var(--text-muted)] italic">
                            No classes scheduled for {day}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {dayClasses.map((item) => (
                              <div
                                key={item.id}
                                className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex flex-col justify-between hover:border-[var(--color-primary-300)] transition-colors"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <Badge variant="primary">{item.courseCode}</Badge>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-primary)] flex items-center gap-1 border border-[var(--border-subtle)]">
                                      <Clock className="w-3 h-3 text-[var(--color-primary-500)]" />
                                      {item.startTime} – {item.endTime}
                                    </span>
                                  </div>
                                  <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-1">
                                    {item.courseName}
                                  </h4>
                                </div>

                                <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                                  <div className="space-y-0.5">
                                    <p className="flex items-center gap-1 text-[var(--text-secondary)] font-medium">
                                      <MapPin className="w-3 h-3 text-[var(--color-primary-500)]" />
                                      {item.room || 'Room TBD'}
                                    </p>
                                    <p className="flex items-center gap-1">
                                      <UserCheck className="w-3 h-3" />
                                      {item.facultyName || 'Unassigned'}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(item.id)}
                                    className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors"
                                    title="Delete class"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
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
          )}
        </>
      )}

      {/* SCHEDULE CLASS MODAL */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Schedule Class"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Select Course"
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              options={courses.map((c) => ({
                value: c.id,
                label: `${c.code} — ${c.name}`,
              }))}
              required
            />

            <Select
              label="Day of Week"
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value })}
              options={ALL_DAYS.map((d) => ({ value: d, label: d }))}
              required
            />

            <Select
              label="Period Slot Preset"
              value={selectedPeriodPreset}
              onChange={(e) => handlePeriodChange(e.target.value)}
              options={[
                ...STANDARD_PERIODS.filter((p) => !p.isBreak).map((p) => ({
                  value: p.id,
                  label: `${p.label} (${p.time})`,
                })),
                { value: 'custom', label: 'Custom Timing...' },
              ]}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="time"
                label="Start Time"
                value={form.startTime}
                onChange={(e) => {
                  setForm({ ...form, startTime: e.target.value });
                  setSelectedPeriodPreset('custom');
                }}
                required
              />
              <Input
                type="time"
                label="End Time"
                value={form.endTime}
                onChange={(e) => {
                  setForm({ ...form, endTime: e.target.value });
                  setSelectedPeriodPreset('custom');
                }}
                required
              />
            </div>

            <Input
              label="Room / Hall / Lab"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              placeholder="e.g. Hall A, Lab 302, Seminar Hall 1"
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Add to Timetable'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminTimetable;
