import { useEffect, useState } from 'react';
import { BookOpen, Users, Calendar, Award } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import Modal from '@/components/modals/Modal';
import { useToast } from '@/hooks/useToast';
import courseService from '@/services/courseService';

export function FacultySubjects() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.list();
      setCourses(data);
    } catch (err) {
      toast.error(err?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRoster = async (course) => {
    setSelectedCourse(course);
    try {
      setLoadingRoster(true);
      const students = await courseService.students(course.id);
      setRoster(students);
    } catch (err) {
      toast.error(err?.message || 'Failed to load course roster');
    } finally {
      setLoadingRoster(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="My Subjects"
        description="Courses assigned to you for teaching this semester."
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses assigned"
          description="You are not currently assigned as an instructor to any active courses."
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
                <div className="space-y-1.5 text-sm text-[var(--text-muted)] mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--text-subtle)]" />
                    <span>Year {course.year}, Semester {course.semester}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[var(--text-subtle)]" />
                    <span>Dept: {course.departmentCode || course.departmentName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[var(--text-subtle)]" />
                    <span>{course.studentCount} Enrolled Students</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <Button size="sm" variant="outline" onClick={() => handleViewRoster(course)}>
                  View Roster ({course.studentCount})
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedCourse && (
        <Modal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          title={`Enrolled Students — ${selectedCourse.name} (${selectedCourse.code})`}
        >
          {loadingRoster ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : roster.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-4 text-center">No students currently enrolled in this department/year.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-[var(--border-subtle)]">
              {roster.map((student) => (
                <div key={student.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{student.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">Reg No: {student.registerNumber || 'N/A'} • {student.email}</p>
                  </div>
                  <Badge variant="secondary">Sec {student.section || 'A'}</Badge>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

export default FacultySubjects;
