import { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, Calendar, UserCheck } from 'lucide-react';
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
import announcementService from '@/services/announcementService';
import departmentService from '@/services/departmentService';

export function AdminAnnouncements() {
  const toast = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    audience: 'all',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [annData, deptData] = await Promise.all([
        announcementService.list(),
        departmentService.list(),
      ]);
      setAnnouncements(annData);
      setDepartments(deptData);
    } catch (err) {
      toast.error(err?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!createForm.title || !createForm.content) {
      toast.error('Title and Content are required');
      return;
    }

    try {
      setSubmitting(true);
      await announcementService.create(createForm);
      toast.success('Announcement published!');
      setShowCreateModal(false);
      setCreateForm({ title: '', content: '', audience: 'all' });
      fetchData();
    } catch (err) {
      toast.error(err?.message || 'Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await announcementService.remove(id);
      toast.success('Announcement deleted');
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error(err?.message || 'Failed to delete announcement');
    }
  };

  const audienceOptions = [
    { value: 'all', label: 'All Campus (Students & Faculty)' },
    { value: 'students', label: 'Students Only' },
    { value: 'faculty', label: 'Faculty Only' },
    ...departments.map((d) => ({ value: d.id, label: `Dept: ${d.name} (${d.code})` })),
  ];

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Broadcast official announcements and notices."
        actions={
          <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
            New Announcement
          </Button>
        }
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements"
          description="There are no active notices."
        />
      ) : (
        <div className="space-y-4 max-w-4xl">
          {announcements.map((a) => (
            <Card key={a.id} className="relative hover:border-[var(--color-primary-300)] transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="primary">{a.audience.toUpperCase()}</Badge>
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> By {a.authorName || 'Admin'}
                  </span>
                  <span className="text-xs text-[var(--text-subtle)] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAnnouncement(a.id)}
                  className="p-1 rounded hover:bg-[var(--color-danger-100)] text-[var(--color-danger-600)] transition-colors self-end sm:self-center"
                  title="Delete announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--text-primary)] mb-2">
                {a.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                {a.content}
              </p>
            </Card>
          ))}
        </div>
      )}

      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Campus Announcement"
        >
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <Input
              label="Announcement Title"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="e.g. Semester Registration Reminder"
              required
            />
            <Select
              label="Target Audience"
              value={createForm.audience}
              onChange={(e) => setCreateForm({ ...createForm, audience: e.target.value })}
              options={audienceOptions}
            />
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Announcement Message
              </label>
              <textarea
                rows={4}
                value={createForm.content}
                onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                placeholder="Enter full notice content..."
                className="w-full px-3 py-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Publishing...' : 'Publish Announcement'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminAnnouncements;
