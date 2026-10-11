import { useEffect, useState } from 'react';
import { Search, GraduationCap, Mail, Phone, BookOpen, Download } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { useToast } from '@/hooks/useToast';
import userService from '@/services/userService';
import { exportToCSV } from '@/utils/exportUtils';

export function FacultyStudents() {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await userService.list();
      setStudents(data);
    } catch (err) {
      toast.error(err?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.registerNumber || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="My Students"
        description="Students enrolled in courses taught by you."
        actions={
          <Button variant="outline" icon={Download} disabled={filtered.length === 0} onClick={() => {
            const data = filtered.map(s => ({
              'Register Number': s.registerNumber || 'N/A',
              'Name': s.name,
              'Email': s.email,
              'Department': s.departmentName || s.departmentId || 'N/A',
              'Year': s.year || 'N/A',
              'Section': s.section || 'N/A',
              'Phone': s.phone || 'N/A'
            }));
            exportToCSV('My_Students.csv', data);
          }}>
            Export
          </Button>
        }
      />

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by name, reg no, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={Search}
          />
        </div>
        <div className="text-sm text-[var(--text-muted)] font-medium">
          Showing {filtered.length} of {students.length} students
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students found"
          description={search ? 'No student matches your search query.' : 'No students found in your assigned courses.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-medium uppercase text-xs">
              <tr>
                <th className="py-3 px-4">Register No</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Year & Sec</th>
                <th className="py-3 px-4">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-[var(--text-primary)]">
                    {student.registerNumber || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-[var(--text-primary)]">{student.name}</div>
                    <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {student.email}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">
                    {student.departmentName || 'Computer Science'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">
                      Year {student.year || 1} • Sec {student.section || 'A'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-[var(--text-muted)]">
                    {student.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {student.phone}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default FacultyStudents;
