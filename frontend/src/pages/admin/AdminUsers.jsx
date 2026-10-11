import { useEffect, useState } from 'react';
import { ShieldCheck, Plus, Search, Trash2, Edit2, Mail, ShieldAlert, CheckCircle } from 'lucide-react';
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

export function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    departmentId: '',
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uData, dData] = await Promise.all([
        userService.list(),
        departmentService.list(),
      ]);
      setUsers(uData);
      setDepartments(dData);
    } catch (err) {
      toast.error(err?.message || 'Failed to load system users');
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
      role: 'student',
      departmentId: departments[0]?.id || '',
      active: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (userItem) => {
    setEditingUser(userItem);
    setForm({
      name: userItem.name,
      email: userItem.email,
      password: '',
      role: userItem.role,
      departmentId: userItem.departmentId || departments[0]?.id || '',
      active: userItem.active !== false,
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
        toast.success('User account updated!');
      } else {
        if (!form.password) {
          toast.error('Password is required for new accounts');
          setSubmitting(false);
          return;
        }
        await userService.create(form);
        toast.success('User account created!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err?.message || 'Failed to save user account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user account?')) return;
    try {
      await userService.remove(id);
      toast.success('User account deleted');
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      toast.error(err?.message || 'Failed to delete user');
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesQuery = (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <div>
      <PageHeader
        title="User & Access Management"
        description="Manage all admin, faculty, and student user credentials."
        actions={
          <Button icon={Plus} onClick={handleOpenAddModal}>
            Add User Account
          </Button>
        }
      />

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={Search}
            />
          </div>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'admin', label: 'Admin' },
              { value: 'faculty', label: 'Faculty' },
              { value: 'student', label: 'Student' },
            ]}
          />
        </div>
        <div className="text-sm text-[var(--text-muted)] font-medium">
          Showing {filtered.length} of {users.length} accounts
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No users found"
          description="No user accounts match the selected criteria."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-medium uppercase text-xs">
              <tr>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Account Status</th>
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
                    <Badge variant={item.role === 'admin' ? 'danger' : item.role === 'faculty' ? 'primary' : 'secondary'} className="uppercase">
                      {item.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">
                    {item.departmentName || 'Campus Wide'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={item.active !== false ? 'success' : 'danger'}>
                      {item.active !== false ? 'Active' : 'Deactivated'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded hover:bg-[var(--color-danger-100)] text-[var(--color-danger-600)] transition-colors"
                        title="Delete User"
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
          title={editingUser ? `Edit Account — ${editingUser.name}` : 'Create New Account'}
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

            <Select
              label="Account Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={[
                { value: 'student', label: 'Student' },
                { value: 'faculty', label: 'Faculty' },
                { value: 'admin', label: 'Administrator' },
              ]}
            />

            <Select
              label="Department"
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              options={[
                { value: '', label: 'Campus Wide / None' },
                ...departments.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` })),
              ]}
            />

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="accountActive"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4 text-[var(--color-primary-600)] rounded border-[var(--border-subtle)]"
              />
              <label htmlFor="accountActive" className="text-sm text-[var(--text-primary)] font-medium cursor-pointer">
                Account Active (Allowed to sign in)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingUser ? 'Update Account' : 'Create Account'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminUsers;
