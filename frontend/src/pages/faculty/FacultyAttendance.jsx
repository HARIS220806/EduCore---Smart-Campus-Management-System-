import { useEffect, useState } from 'react';
import { CalendarCheck, CheckCircle2, XCircle, Save, Users, Filter, Download } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { useToast } from '@/hooks/useToast';
import courseService from '@/services/courseService';
import attendanceService from '@/services/attendanceService';
import { exportToCSV } from '@/utils/exportUtils';

export function FacultyAttendance() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [roster, setRoster] = useState([]);
  const [records, setRecords] = useState({}); // { studentId: 'present' | 'absent' }
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isExisting, setIsExisting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingCourses(true);
        const data = await courseService.list();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourseId(data[0].id);
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to load courses');
      } finally {
        setLoadingCourses(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedCourseId || !date) return;
    fetchRosterAndSession();
  }, [selectedCourseId, date]);

  const fetchRosterAndSession = async () => {
    try {
      setLoadingRoster(true);
      const [students, attendanceList] = await Promise.all([
        courseService.students(selectedCourseId),
        attendanceService.list({ courseId: selectedCourseId, date }),
      ]);

      setRoster(students);

      const existingSession = attendanceList.find((a) => a.courseId === selectedCourseId && a.date === date);
      setIsExisting(!!existingSession);

      const initialMap = {};
      if (existingSession && existingSession.records) {
        existingSession.records.forEach((r) => {
          initialMap[r.studentId] = r.status;
        });
      } else {
        students.forEach((s) => {
          initialMap[s.id] = 'present'; // default present
        });
      }
      setRecords(initialMap);
    } catch (err) {
      toast.error(err?.message || 'Failed to load attendance session');
    } finally {
      setLoadingRoster(false);
    }
  };

  const toggleStatus = (studentId) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }));
  };

  const markAll = (status) => {
    const updated = {};
    roster.forEach((s) => {
      updated[s.id] = status;
    });
    setRecords(updated);
  };

  const handleSave = async () => {
    if (!selectedCourseId || !date || roster.length === 0) return;
    try {
      setSaving(true);
      const payloadRecords = roster.map((s) => ({
        studentId: s.id,
        status: records[s.id] || 'present',
      }));

      await attendanceService.mark({
        courseId: selectedCourseId,
        date,
        records: payloadRecords,
      });

      toast.success(isExisting ? 'Attendance session updated successfully!' : 'Attendance marked successfully!');
      setIsExisting(true);
    } catch (err) {
      toast.error(err?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(records).filter((v) => v === 'present').length;
  const absentCount = Object.values(records).filter((v) => v === 'absent').length;

  return (
    <div>
      <PageHeader
        title="Mark Attendance"
        description="Select a subject and date to record or update student attendance."
        actions={
          <Button variant="outline" icon={Download} disabled={roster.length === 0} onClick={() => {
            const data = roster.map(s => ({
              'Register Number': s.registerNumber || 'N/A',
              'Name': s.name,
              'Section': s.section || 'A',
              'Status': records[s.id] || 'present'
            }));
            exportToCSV(`Attendance_${date}.csv`, data);
          }}>
            Export Attendance
          </Button>
        }
      />

      {loadingCourses ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No assigned subjects"
          description="You are not assigned to any courses to mark attendance."
        />
      ) : (
        <div className="space-y-6">
          <Card className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Select
                label="Select Subject / Course"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                options={courses.map((c) => ({
                  value: c.id,
                  label: `${c.code} — ${c.name} (Year ${c.year})`,
                }))}
              />
            </div>
            <div>
              <Input
                type="date"
                label="Attendance Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => markAll('present')} disabled={roster.length === 0}>
                Mark All Present
              </Button>
              <Button size="sm" variant="outline" onClick={() => markAll('absent')} disabled={roster.length === 0}>
                Mark All Absent
              </Button>
            </div>
          </Card>

          {loadingRoster ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : roster.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No students found"
              description="No students are currently enrolled in this subject's department and year."
            />
          ) : (
            <Card>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-[var(--border-subtle)]">
                <div>
                  <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--text-primary)]">
                    Student Roster ({roster.length})
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {isExisting ? 'Existing attendance session loaded.' : 'New attendance session.'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="success" className="text-xs">Present: {presentCount}</Badge>
                  <Badge variant="danger" className="text-xs">Absent: {absentCount}</Badge>
                  <Button onClick={handleSave} disabled={saving} icon={Save}>
                    {saving ? 'Saving...' : 'Save Attendance'}
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-medium uppercase text-xs">
                    <tr>
                      <th className="py-3 px-4">Reg No</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Section</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {roster.map((student) => {
                      const isPresent = records[student.id] === 'present';
                      return (
                        <tr key={student.id} className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-[var(--text-primary)]">
                            {student.registerNumber || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-[var(--text-primary)]">{student.name}</div>
                            <div className="text-xs text-[var(--text-muted)]">{student.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary">Sec {student.section || 'A'}</Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleStatus(student.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                isPresent
                                  ? 'bg-[var(--color-success-100)] text-[var(--color-success-700)] hover:bg-[var(--color-success-200)]'
                                  : 'bg-[var(--color-danger-100)] text-[var(--color-danger-700)] hover:bg-[var(--color-danger-200)]'
                              }`}
                            >
                              {isPresent ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4" /> Present
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4" /> Absent
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} disabled={saving} icon={Save}>
                  {saving ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default FacultyAttendance;
