import { useEffect, useState } from 'react';
import { ClipboardList, Save, Trash2, Check, Award, Download } from 'lucide-react';
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
import marksService from '@/services/marksService';
import { exportToCSV } from '@/utils/exportUtils';

const EXAM_TYPES = [
  { value: 'Internal 1', label: 'Internal Assessment 1' },
  { value: 'Internal 2', label: 'Internal Assessment 2' },
  { value: 'Midterm', label: 'Midterm Examination' },
  { value: 'Semester Final', label: 'Semester Final Exam' },
  { value: 'Assignment / Quiz', label: 'Assignment / Quiz' },
];

export function FacultyMarks() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [examType, setExamType] = useState('Internal 1');
  const [maxMarks, setMaxMarks] = useState(100);

  const [roster, setRoster] = useState([]);
  const [existingMarks, setExistingMarks] = useState([]);
  const [obtainedMap, setObtainedMap] = useState({}); // { studentId: number | '' }
  
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [savingStudentId, setSavingStudentId] = useState(null);
  const [savingAll, setSavingAll] = useState(false);

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
    if (!selectedCourseId) return;
    fetchRosterAndMarks();
  }, [selectedCourseId, examType]);

  const fetchRosterAndMarks = async () => {
    try {
      setLoadingRoster(true);
      const [students, marks] = await Promise.all([
        courseService.students(selectedCourseId),
        marksService.list({ courseId: selectedCourseId }),
      ]);

      setRoster(students);
      setExistingMarks(marks);

      const examMarks = marks.filter((m) => m.examType === examType);
      const map = {};
      students.forEach((s) => {
        const found = examMarks.find((m) => m.studentId === s.id);
        map[s.id] = found ? found.obtained : '';
      });
      setObtainedMap(map);

      if (examMarks.length > 0 && examMarks[0].maxMarks) {
        setMaxMarks(examMarks[0].maxMarks);
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to load marks');
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleScoreChange = (studentId, value) => {
    setObtainedMap((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSaveSingle = async (studentId) => {
    const val = obtainedMap[studentId];
    if (val === '' || val === undefined) {
      toast.error('Please enter obtained marks before saving');
      return;
    }
    const num = Number(val);
    if (isNaN(num) || num < 0 || num > maxMarks) {
      toast.error(`Marks must be a number between 0 and ${maxMarks}`);
      return;
    }

    try {
      setSavingStudentId(studentId);
      await marksService.save({
        courseId: selectedCourseId,
        studentId,
        examType,
        obtained: num,
        maxMarks: Number(maxMarks),
      });
      toast.success('Marks saved successfully');
      fetchRosterAndMarks();
    } catch (err) {
      toast.error(err?.message || 'Failed to save marks');
    } finally {
      setSavingStudentId(null);
    }
  };

  const handleSaveAll = async () => {
    const entriesToSave = roster.filter(
      (s) => obtainedMap[s.id] !== '' && obtainedMap[s.id] !== undefined
    );

    if (entriesToSave.length === 0) {
      toast.error('No marks entered to save');
      return;
    }

    for (const s of entriesToSave) {
      const num = Number(obtainedMap[s.id]);
      if (isNaN(num) || num < 0 || num > maxMarks) {
        toast.error(`Invalid marks for student ${s.name}`);
        return;
      }
    }

    try {
      setSavingAll(true);
      await Promise.all(
        entriesToSave.map((s) =>
          marksService.save({
            courseId: selectedCourseId,
            studentId: s.id,
            examType,
            obtained: Number(obtainedMap[s.id]),
            maxMarks: Number(maxMarks),
          })
        )
      );
      toast.success(`Saved marks for ${entriesToSave.length} students`);
      fetchRosterAndMarks();
    } catch (err) {
      toast.error(err?.message || 'Failed to save all marks');
    } finally {
      setSavingAll(false);
    }
  };

  const handleDeleteMark = async (markId) => {
    try {
      await marksService.remove(markId);
      toast.success('Marks entry deleted');
      fetchRosterAndMarks();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete marks entry');
    }
  };

  return (
    <div>
      <PageHeader
        title="Marks & Results Entry"
        description="Enter, view and publish student exam scores."
        actions={
          <Button variant="outline" icon={Download} disabled={roster.length === 0} onClick={() => {
            const data = roster.map(s => ({
              'Register Number': s.registerNumber || 'N/A',
              'Name': s.name,
              'Obtained Marks': obtainedMap[s.id] !== undefined && obtainedMap[s.id] !== '' ? obtainedMap[s.id] : 'Not Entered',
              'Max Marks': maxMarks
            }));
            exportToCSV(`Marks_${examType.replace(/\s+/g, '_')}.csv`, data);
          }}>
            Export Marks
          </Button>
        }
      />

      {loadingCourses ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assigned subjects"
          description="You are not assigned to any courses to enter marks."
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
                  label: `${c.code} — ${c.name}`,
                }))}
              />
            </div>
            <div>
              <Select
                label="Exam / Test Type"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                options={EXAM_TYPES}
              />
            </div>
            <div>
              <Input
                type="number"
                label="Max Marks"
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                min={1}
              />
            </div>
          </Card>

          {loadingRoster ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : roster.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No students found"
              description="No students are enrolled in this course."
            />
          ) : (
            <Card>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-[var(--border-subtle)]">
                <div>
                  <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--text-primary)]">
                    {examType} Scores ({roster.length} Students)
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Enter score out of {maxMarks} for each student.
                  </p>
                </div>
                <Button onClick={handleSaveAll} disabled={savingAll} icon={Save}>
                  {savingAll ? 'Saving All...' : 'Save All Marks'}
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-medium uppercase text-xs">
                    <tr>
                      <th className="py-3 px-4">Reg No</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Obtained Marks / {maxMarks}</th>
                      <th className="py-3 px-4">Percentage</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {roster.map((student) => {
                      const val = obtainedMap[student.id];
                      const num = Number(val);
                      const pct = val !== '' && !isNaN(num) ? Math.round((num / maxMarks) * 100) : null;
                      const isSaved = existingMarks.some(
                        (m) => m.studentId === student.id && m.examType === examType
                      );
                      const existingRecord = existingMarks.find(
                        (m) => m.studentId === student.id && m.examType === examType
                      );

                      return (
                        <tr key={student.id} className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-[var(--text-primary)]">
                            {student.registerNumber || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-[var(--text-primary)]">{student.name}</div>
                            <div className="text-xs text-[var(--text-muted)]">{student.email}</div>
                          </td>
                          <td className="py-3 px-4 w-48">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                max={maxMarks}
                                value={val}
                                onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                placeholder={`0 - ${maxMarks}`}
                                className="w-24 px-3 py-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                              />
                              <span className="text-xs text-[var(--text-muted)]">/ {maxMarks}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {pct !== null ? (
                              <Badge variant={pct >= 50 ? 'success' : 'danger'}>
                                {pct}%
                              </Badge>
                            ) : (
                              <span className="text-xs text-[var(--text-subtle)]">Not set</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSaveSingle(student.id)}
                                disabled={savingStudentId === student.id}
                              >
                                {savingStudentId === student.id ? 'Saving...' : isSaved ? 'Update' : 'Save'}
                              </Button>
                              {existingRecord && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMark(existingRecord.id)}
                                  className="p-1.5 rounded hover:bg-[var(--color-danger-100)] text-[var(--color-danger-600)] transition-colors"
                                  title="Delete mark entry"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default FacultyMarks;
