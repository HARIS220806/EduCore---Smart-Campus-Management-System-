import { useEffect, useState } from 'react';
import { Users, Plus, Search, Trash2, Edit2, Mail, Phone, Building2, Download } from 'lucide-react';
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

export function AdminFaculty() {
  const toast = useToast();
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    designation: 'Assistant Professor',
    departmentId: '',
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
        userService.list({ role: 'faculty' }),
        departmentService.list(),
      ]);
      setFaculty(uData);
      setDepartments(dData);
      if (dData.length > 0) {
        setForm((prev) => ({ ...prev, departmentId: dData[0].id }));
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to load faculty members');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setForm({
      name: '',
      email: '',
      password: '',
      designation: 'Assistant Professor',
      departmentId: departments[0]?.id || '',
      phone: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (userItem) => {
    setEditingUser(userItem);
    setForm({
      name: userItem.name,
      email: userItem.email,
      password: '',
      designation: userItem.designation || 'Assistant Professor',
      departmentId: userItem.departmentId || departments[0]?.id || '',
      phone: userItem.phone || '',
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
      if (editingUser) {
        await userService.update(editingUser.id, form);
        toast.success('Faculty updated successfully!');
      } else {
        if (!form.password) {
          toast.error('Password is required for new accounts');
          setSubmitting(false);
          return;
        }
        await userService.create({ ...form, role: 'faculty' });
        toast.success('Faculty account created successfully!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err?.message || 'Failed to save faculty account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty account?')) return;
    try {
      await userService.remove(id);
      toast.success('Faculty account deleted');
      setFaculty((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      toast.error(err?.message || 'Failed to delete faculty member');
    }
  };

  const filtered = faculty.filter((f) => {
    const q = search.toLowerCase();
    return (
      (f.name || '').toLowerCase().includes(q) ||
      (f.email || '').toLowerCase().includes(q) ||
      (f.designation || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Faculty Management"
        description="View, onboard, and manage teaching staff."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={Download} onClick={() => {
              const data = filtered.map(f => ({
                'Name': f.name,
                'Email': f.email,
                'Designation': f.designation || 'N/A',
                'Department': f.departmentName || f.departmentId || 'N/A',
                'Phone': f.phone || 'N/A'
              }));
              exportToCSV('Faculty.csv', data);
            }}>
              Export
            </Button>
            <Button icon={Plus} onClick={handleOpenAddModal}>
              Add Faculty
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search faculty by name, email, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={Search}
          />
        </div>
        <div className="text-sm text-[var(--text-muted)] font-medium">
          Total Faculty: {faculty.length}
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No faculty found"
          description={search ? 'No faculty members match your search.' : 'No faculty accounts onboarded yet.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-medium uppercase text-xs">
              <tr>
                <th className="py-3 px-4">Faculty Name</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-[var(--text-primary)]">{item.name}</div>
                    <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {item.email}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="primary">{item.designation || 'Assistant Professor'}</Badge>
                  </td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">
                    {item.departmentName || 'Computer Science'}
                  </td>
                  <td className="py-3 px-4 text-xs text-[var(--text-muted)]">
                    {item.phone || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] transition-colors"
                        title="Edit Faculty"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded hover:bg-[var(--color-danger-100)] text-[var(--color-danger-600)] transition-colors"
                        title="Delete Faculty"
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

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingUser ? `Edit Faculty — ${editingUser.name}` : 'Onboard New Faculty Member'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              type="email"
              label="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            {!editingUser && (
              <Input
                type="password"
                label="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 6 characters"
                required
              />
            )}

            <Input
              label="Designation"
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              placeholder="e.g. Associate Professor / HOD"
            />

            <Select
              label="Assigned Department"
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              options={departments.map((d) => ({
                value: d.id,
                label: `${d.name} (${d.code})`,
              }))}
            />

            <Input
              label="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingUser ? 'Update Faculty' : 'Create Account'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminFaculty;
