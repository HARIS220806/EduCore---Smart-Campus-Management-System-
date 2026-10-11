import { GraduationCap, Users, BookOpen, Building2, CalendarCheck, UserCheck, X } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/cards/StatCard';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import userService from '@/services/userService';
import departmentService from '@/services/departmentService';
import dashboardService from '@/services/dashboardService';

function buildStats(stats) {
  if (!stats) return [];
  return [
    { label: 'Total Students', value: stats.totalStudents, icon: GraduationCap, accent: 'primary' },
    { label: 'Total Faculty', value: stats.totalFaculty, icon: Users, accent: 'accent' },
    { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, accent: 'info' },
    { label: 'Departments', value: stats.totalDepartments, icon: Building2, accent: 'success' },
    { label: 'Overall Attendance', value: `${stats.overallAttendance}%`, icon: CalendarCheck, accent: 'warning' },
    { label: 'Active Users', value: stats.activeUsers, icon: UserCheck, accent: 'primary' },
  ];
}

export function AdminDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState(null);
  const [deptChart, setDeptChart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashLoading, setDashLoading] = useState(true);

  // Form states
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    password: '',
    registerNumber: '',
    departmentId: '',
    year: 3,
    section: 'A',
    phone: '',
  });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchDashboard();
    fetchDepartments();
  }, []);

  const fetchDashboard = async () => {
    setDashLoading(true);
    try {
      const data = await dashboardService.admin();
      setStats(data.stats);
      setDeptChart(data.studentsByDepartment || []);
      setAnnouncements(data.recentAnnouncements || []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setDashLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const depts = await departmentService.list();
      setDepartments(depts);
      if (depts.length > 0) {
        setStudentForm((prev) => ({ ...prev, departmentId: depts[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenStudentModal = () => {
    setStudentForm({
      name: '',
      email: '',
      password: '',
      registerNumber: `STU${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
      departmentId: departments[0]?.id || '',
      year: 3,
      section: 'A',
      phone: '',
    });
    setShowStudentModal(true);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.email || !studentForm.password) {
      toast.error('Name, Email, and Password are required');
      return;
    }

    setLoading(true);
    try {
      await userService.create({ ...studentForm, role: 'student' });
      toast.success('Student registered successfully!');
      setShowStudentModal(false);
      fetchDashboard();
    } catch (err) {
      toast.error(err?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/announcements', announcementForm);
      toast.success('Announcement created!');
      setShowAnnouncementModal(false);
      setAnnouncementForm({ title: '', content: '' });
      fetchDashboard();
    } catch (err) {
      toast.error(err?.message || 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] mb-6 shadow-lg bg-gradient-to-r from-[var(--color-primary-950)] to-[var(--color-primary-700)] p-6 sm:p-8 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-10 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop")' }}
        />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-white">
            <h1 className="font-[var(--font-display)] text-3xl font-bold mb-2 animate-slide-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
              Command Center — {user?.name?.split(' ')[0] || 'Admin'}
            </h1>
            <p className="text-white/70 text-sm sm:text-base animate-slide-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              Here's what's happening across campus today.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap animate-fade-in opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
            <Button variant="outline" size="sm" onClick={handleOpenStudentModal} className="border-white/20 text-white hover:bg-white/10 hover:border-white/30">
              Add Student
            </Button>
            <Button variant="accent" size="sm" onClick={() => setShowAnnouncementModal(true)}>
              Create Announcement
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {dashLoading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 rounded-[var(--radius-md)] bg-[var(--bg-subtle)] animate-pulse" />)
          : buildStats(stats).map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--text-primary)] mb-1">
            Student distribution by department
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Live counts from the backend, by department code.
          </p>
          <div className="flex items-end gap-4 h-56 px-2">
            {deptChart.map((d) => {
              const max = Math.max(1, ...deptChart.map((x) => x.students));
              const heightPct = Math.max(4, Math.round((d.students / max) * 100));
              return (
                <div key={d.name} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{d.students}</span>
                  <div className="w-full rounded-t-[var(--radius-sm)] bg-[var(--color-primary-700)]" style={{ height: `${heightPct}%`, minHeight: 4 }} />
                  <span className="text-xs text-[var(--text-muted)]">{d.name}</span>
                </div>
              );
            })}
            {!dashLoading && deptChart.length === 0 && (
              <p className="text-sm text-[var(--text-muted)] m-auto">No department data yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--text-primary)] mb-4">
            Recent activity & Announcements
          </h2>
          <ul className="flex flex-col gap-4">
            {announcements.length > 0 ? announcements.map((a) => (
              <li key={a.id} className="text-sm">
                <p className="font-medium text-[var(--text-primary)]">{a.title}</p>
                <p className="text-[var(--text-secondary)]">{a.content}</p>
                <span className="text-xs text-[var(--text-muted)]">By {a.authorName} • {new Date(a.createdAt).toLocaleDateString()}</span>
              </li>
            )) : (
              <li className="text-sm text-[var(--text-muted)]">No recent announcements.</li>
            )}
          </ul>
        </Card>
      </div>

      <Card className="mt-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Backend status</p>
          <p className="text-sm text-[var(--text-muted)]">
            Connected to Express REST API & MongoDB — live database state.
          </p>
        </div>
        <Badge variant="success">Connected to MongoDB</Badge>
      </Card>

      {/* Modals */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowStudentModal(false)} className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Register New Student</h2>
            <form onSubmit={handleAddStudent} className="flex flex-col gap-4">
              <Input
                label="Full Name"
                required
                value={studentForm.name}
                onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Register Number"
                  required
                  value={studentForm.registerNumber}
                  onChange={e => setStudentForm({ ...studentForm, registerNumber: e.target.value })}
                  placeholder="e.g. CSE2026001"
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={studentForm.email}
                  onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                  placeholder="student@educore.edu"
                />
              </div>
              <Input
                label="Temporary Password"
                type="password"
                required
                value={studentForm.password}
                onChange={e => setStudentForm({ ...studentForm, password: e.target.value })}
                placeholder="Minimum 6 characters"
              />
              <Select
                label="Department"
                value={studentForm.departmentId}
                onChange={e => setStudentForm({ ...studentForm, departmentId: e.target.value })}
                options={departments.map(d => ({
                  value: d.id,
                  label: `${d.name} (${d.code})`,
                }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Academic Year (1 - 4)"
                  value={studentForm.year}
                  onChange={e => setStudentForm({ ...studentForm, year: Number(e.target.value) })}
                  min={1}
                  max={4}
                />
                <Input
                  label="Section"
                  value={studentForm.section}
                  onChange={e => setStudentForm({ ...studentForm, section: e.target.value })}
                  placeholder="A, B, C..."
                />
              </div>
              <Input
                label="Contact Phone"
                value={studentForm.phone}
                onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
                <Button type="button" variant="outline" onClick={() => setShowStudentModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  Register Student
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md relative">
            <button onClick={() => setShowAnnouncementModal(false)} className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Create Announcement</h2>
            <form onSubmit={handleAddAnnouncement} className="flex flex-col gap-4">
              <Input label="Announcement Title" required value={announcementForm.title} onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[var(--text-primary)]">Content</label>
                <textarea 
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-transparent px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)]" 
                  rows="4" 
                  required 
                  value={announcementForm.content} 
                  onChange={e => setAnnouncementForm({...announcementForm, content: e.target.value})}
                ></textarea>
              </div>
              <Button type="submit" loading={loading} className="mt-2">Publish Announcement</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
