import { useEffect, useState } from 'react';
import { BarChart3, Users, BookOpen, CalendarCheck, TrendingUp, Download } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import StatCard from '@/components/cards/StatCard';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { useToast } from '@/hooks/useToast';
import reportService from '@/services/reportService';
import dashboardService from '@/services/dashboardService';

export function AdminReports() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [rawStudents, dash] = await Promise.all([
          reportService.academicSummary(),
          dashboardService.admin()
        ]);
        
        let totalAttendance = 0;
        let passCount = 0;
        const deptMap = {};

        rawStudents.forEach(student => {
          totalAttendance += student.attendancePercentage || 0;
          if (student.marksPercentage >= 40) passCount++;
          
          const dept = student.department || 'Unassigned';
          if (!deptMap[dept]) deptMap[dept] = 0;
          deptMap[dept]++;
        });

        const totalStudents = rawStudents.length;
        const overallAttendanceAvg = totalStudents ? Math.round(totalAttendance / totalStudents) : 0;
        const overallPassRate = totalStudents ? Math.round((passCount / totalStudents) * 100) : 0;
        
        const studentsByDepartment = Object.entries(deptMap).map(([dept, count]) => ({
           departmentCode: dept,
           departmentName: dept,
           count
        }));

        setData({
          totalStudents,
          totalCourses: dash.stats?.totalCourses || 0,
          overallAttendanceAvg,
          overallPassRate,
          studentsByDepartment,
          rows: rawStudents
        });
      } catch (err) {
        toast.error(err?.message || 'Failed to load academic report');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const exportCSV = () => {
    if (!data?.rows) return;
    const headers = ['Student ID', 'Name', 'Register Number', 'Department', 'Year', 'Attendance %', 'Marks %'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + '\n'
      + data.rows.map(r => `${r.studentId},${r.name},${r.registerNumber},${r.department},${r.year},${r.attendancePercentage},${r.marksPercentage}`).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "academic_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <PageHeader
        title="Academic Analytics & Reports"
        description="Campus performance metrics, attendance averages, and enrollment distributions."
        actions={
          <Button variant="accent" onClick={exportCSV} disabled={!data?.rows?.length}>
            <Download size={18} className="mr-2" />
            Export CSV
          </Button>
        }
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : !data ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics data"
          description="Unable to generate academic summary metrics."
        />
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total Enrolled Students" value={data.totalStudents} icon={Users} accent="primary" />
            <StatCard label="Active Courses" value={data.totalCourses} icon={BookOpen} accent="info" />
            <StatCard label="Campus Attendance Avg" value={`${data.overallAttendanceAvg}%`} icon={CalendarCheck} accent="accent" />
            <StatCard label="Academic Pass Rate" value={`${data.overallPassRate}%`} icon={TrendingUp} accent="success" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--text-primary)] mb-4">
                Enrollment by Department
              </h3>
              <div className="flex flex-col gap-3">
                {data.studentsByDepartment.length > 0 ? data.studentsByDepartment.map((dept) => (
                  <div key={dept.departmentCode} className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{dept.departmentName}</p>
                      <span className="text-xs text-[var(--text-muted)]">Department Code</span>
                    </div>
                    <span className="font-semibold text-lg text-[var(--color-primary-600)]">{dept.count}</span>
                  </div>
                )) : (
                  <p className="text-sm text-[var(--text-muted)]">No data available.</p>
                )}
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--text-primary)] mb-4">
                Student Roster Performance
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
                    <tr>
                      <th className="font-medium py-2 px-3">Name</th>
                      <th className="font-medium py-2 px-3">Reg No</th>
                      <th className="font-medium py-2 px-3">Dept</th>
                      <th className="font-medium py-2 px-3">Year</th>
                      <th className="font-medium py-2 px-3 text-right">Attendance</th>
                      <th className="font-medium py-2 px-3 text-right">Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {data.rows.length > 0 ? data.rows.map((row) => (
                      <tr key={row.studentId} className="hover:bg-[var(--bg-subtle)] transition-colors">
                        <td className="py-2.5 px-3 font-medium text-[var(--text-primary)]">{row.name}</td>
                        <td className="py-2.5 px-3 text-[var(--text-secondary)]">{row.registerNumber || '-'}</td>
                        <td className="py-2.5 px-3 text-[var(--text-secondary)]">{row.department || '-'}</td>
                        <td className="py-2.5 px-3 text-[var(--text-secondary)]">{row.year || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-medium text-[var(--color-primary-600)]">{row.attendancePercentage}%</td>
                        <td className="py-2.5 px-3 text-right font-medium text-[var(--color-success-600)]">{row.marksPercentage}%</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="py-4 text-center text-[var(--text-muted)]">No student records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReports;
