import { useEffect, useState } from 'react';
import { GraduationCap, Plus, Search, Trash2, Edit2, Mail, Phone, Download } from 'lucide-react';
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
import userService from '@/services/userService';
import departmentService from '@/services/departmentService';
import { exportToCSV } from '@/utils/exportUtils';

export function AdminStudents() {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    departmentId: '',
    year: 3,
    section: 'A',
    registerNumber: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uData, dData] = await Promise.all([
        userService.list({ role: 'student' }),
        departmentService.list(),
      ]);
      setStudents(uData);
      setDepartments(dData);
      if (dData.length > 0 && !form.departmentId) {
        setForm((prev) => ({ ...prev, departmentId: dData[0].id }));
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    const defaultDept = departments[0]?.id || '';
    const randomReg = `CSE2026${Math.floor(100 + Math.random() * 900)}`;
    setForm({
      name: '',
      email: '',
      password: '',
      departmentId: defaultDept,
      year: 3,
      section: 'A',
      registerNumber: randomReg,
      phone: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setForm({
      name: student.name || '',
      email: student.email || '',
      password: '',
      departmentId: student.departmentId || departments[0]?.id || '',
      year: student.year || 1,
      section: student.section || 'A',
      registerNumber: student.registerNumber || '',
      phone: student.phone || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingStudent) {
        await userService.update(editingStudent.id, form);
        toast.success('Student record updated successfully!');
      } else {
        if (!form.password) {
          toast.error('Password is required for new accounts');
          setSubmitting(false);
          return;
        }
        await userService.create({ ...form, role: 'student' });
        toast.success('Student account created successfully!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err?.message || 'Failed to save student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student account?')) return;
    try {
      await userService.remove(id);
      toast.success('Student account deleted');
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      toast.error(err?.message || 'Failed to delete student');
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
        title="Student Management"
        description="View, register, and edit student accounts."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={Download} onClick={() => {
              const data = filtered.map(s => ({
                'Register Number': s.registerNumber || 'N/A',
                'Name': s.name,
                'Email': s.email,
                'Department': s.departmentName || s.departmentId || 'N/A',
                'Year': s.year || 'N/A',
                'Section': s.section || 'N/A',
                'Phone': s.phone || 'N/A'
              }));
              exportToCSV('Students.csv', data);
            }}>
              Export
            </Button>
            <Button icon={Plus} onClick={handleOpenAddModal}>
              Add Student
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search student by name, reg no, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={Search}
          />
        </div>
        <div className="text-sm text-[var(--text-muted)] font-medium">
          Total Students: {students.length}
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
          description={search ? 'No student records match your search.' : 'No student accounts created yet.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-medium uppercase text-xs">
              <tr>
                <th className="py-3 px-4">Reg No</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Year & Sec</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
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
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(student)}
                        className="p-1.5 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] transition-colors"
                        title="Edit Student"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(student.id)}
                        className="p-1.5 rounded hover:bg-[var(--color-danger-100)] text-[var(--color-danger-600)] transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingStudent ? `Edit Student — ${editingStudent.name}` : 'Register New Student'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Register Number"
                value={form.registerNumber}
                onChange={(e) => setForm({ ...form, registerNumber: e.target.value })}
                placeholder="e.g. CSE2026001"
                required
              />
              <Input
                type="email"
                label="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="student@educore.edu"
                required
              />
            </div>

            {!editingStudent && (
              <Input
                type="password"
                label="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 6 characters"
                required
              />
            )}

            <Select
              label="Department"
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              options={departments.map((d) => ({
                value: d.id,
                label: `${d.name} (${d.code})`,
              }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Academic Year (1 - 4)"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                min={1}
                max={4}
              />
              <Input
                label="Section"
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                placeholder="A, B, C..."
              />
            </div>

            <Input
              label="Contact Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Create Account'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminStudents;
