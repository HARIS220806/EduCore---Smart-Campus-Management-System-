import { useEffect, useState } from 'react';
import { BookOpen, UserCheck, Calendar, Award } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { useToast } from '@/hooks/useToast';
import courseService from '@/services/courseService';

export function StudentCourses() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await courseService.list();
        setCourses(data);
      } catch (err) {
        toast.error(err?.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader
        title="My Courses"
        description="Courses enrolled in for the current academic semester."
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses enrolled"
          description="You are not enrolled in any courses for this semester."
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
                <div className="space-y-2 text-sm text-[var(--text-muted)] mb-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[var(--text-subtle)]" />
                    <span>Instructor: <strong className="text-[var(--text-primary)]">{course.facultyName || 'TBA'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--text-subtle)]" />
                    <span>Year {course.year}, Semester {course.semester}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[var(--text-subtle)]" />
                    <span>Department: {course.departmentCode || course.departmentName || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentCourses;
