import { useEffect, useState } from 'react';
import { Award, ClipboardList, TrendingUp, Download } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { useToast } from '@/hooks/useToast';
import marksService from '@/services/marksService';
import { exportToCSV } from '@/utils/exportUtils';

export function StudentMarks() {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [marksList, setMarksList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [sumData, listData] = await Promise.all([
          marksService.summary(),
          marksService.list(),
        ]);
        setSummary(sumData);
        setMarksList(listData);
      } catch (err) {
        toast.error(err?.message || 'Failed to load marks and CGPA');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader
        title="Marks & Results"
        description="View your exam performances, internal assessment marks, and cumulative GPA."
        actions={
          <Button variant="outline" icon={Download} disabled={marksList.length === 0} onClick={() => {
            const data = marksList.map(m => ({
              'Subject': `${m.courseName} (${m.courseCode})`,
              'Exam Type': m.examType,
              'Obtained': m.obtained,
              'Max': m.maxMarks,
              'Percentage': `${m.percentage || 0}%`
            }));
            exportToCSV('My_Marks.csv', data);
          }}>
            Download Results
          </Button>
        }
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : !summary ? (
        <EmptyState
          icon={ClipboardList}
          title="No marks published"
          description="Your examination scores have not been published yet."
        />
      ) : (
        <div className="space-y-6">
          <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-l-4 border-l-[var(--color-primary-500)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-[var(--font-display)] font-semibold text-xl text-[var(--text-primary)]">
                  Cumulative Grade Point Average (CGPA)
                </h2>
                <Badge variant="primary" icon={TrendingUp}>Updated Live</Badge>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                Average grade points across all published subject evaluations.
              </p>
            </div>
            <div className="text-center sm:text-right">
              <span className="text-4xl font-extrabold font-[var(--font-display)] text-[var(--color-primary-600)]">
                {summary.cgpa || '0.00'} / 10.0
              </span>
            </div>
          </Card>

          <Card>
            <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--text-primary)] mb-4">
              All Exam Marks
            </h3>

            {marksList.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-4">No exam entries found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-medium uppercase text-xs">
                    <tr>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Exam Type</th>
                      <th className="py-3 px-4">Obtained Marks</th>
                      <th className="py-3 px-4">Max Marks</th>
                      <th className="py-3 px-4">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {marksList.map((m) => {
                      const pct = m.percentage || 0;
                      return (
                        <tr key={m.id} className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                          <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                            {m.courseName} ({m.courseCode})
                          </td>
                          <td className="py-3 px-4 text-[var(--text-secondary)]">
                            {m.examType}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                            {m.obtained}
                          </td>
                          <td className="py-3 px-4 text-[var(--text-muted)]">
                            {m.maxMarks}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={pct >= 50 ? 'success' : 'danger'}>
                              {pct}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

export default StudentMarks;
