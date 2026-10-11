import { useEffect, useState } from 'react';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import Modal from '@/components/modals/Modal';
import { useToast } from '@/hooks/useToast';
import departmentService from '@/services/departmentService';

export function AdminDepartments() {
  const toast = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form, setForm] = useState({ name: '', code: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentService.list();
      setDepartments(data);
    } catch (err) {
      toast.error(err?.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingDept(null);
    setForm({ name: '', code: '' });
    setShowModal(true);
  };

  const handleOpenEditModal = (dept) => {
    setEditingDept(dept);
    setForm({ name: dept.name, code: dept.code });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code) {
      toast.error('Department name and code are required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingDept) {
        await departmentService.update(editingDept.id, form);
        toast.success('Department updated!');
      } else {
        await departmentService.create(form);
        toast.success('Department created!');
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err?.message || 'Failed to save department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await departmentService.remove(id);
      toast.success('Department deleted');
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      toast.error(err?.message || 'Failed to delete department');
    }
  };

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Manage academic departments and faculties."
        actions={
          <Button icon={Plus} onClick={handleOpenAddModal}>
            Add Department
          </Button>
        }
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : departments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments found"
          description="Create your first academic department."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <Card key={dept.id} className="flex flex-col justify-between hover:border-[var(--color-primary-300)] transition-colors">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="primary">{dept.code}</Badge>
                </div>
                <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--text-primary)] mb-2">
                  {dept.name}
                </h3>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(dept)}
                  className="p-1.5 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] transition-colors"
                  title="Edit Department"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(dept.id)}
                  className="p-1.5 rounded hover:bg-[var(--color-danger-100)] text-[var(--color-danger-600)] transition-colors"
                  title="Delete Department"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingDept ? `Edit Department — ${editingDept.code}` : 'Create Department'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Department Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Computer Science & Engineering"
              required
            />
            <Input
              label="Department Code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="e.g. CSE"
              required
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminDepartments;
