import { useState } from 'react';
import { User, Mail, Phone, Building2, Shield, Lock, Save } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import Modal from '@/components/modals/Modal';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import authService from '@/services/authService';

export function FacultyProfile() {
  const { user } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await authService.updateProfile(form);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      setSavingPassword(true);
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Faculty Profile"
        description="View and manage your account profile and credentials."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 flex flex-col items-center text-center p-6">
          <div className="w-20 h-20 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] font-bold text-2xl flex items-center justify-center mb-4">
            {user?.name ? user.name.split(' ').map((n) => n[0]).join('') : 'FC'}
          </div>
          <h2 className="font-[var(--font-display)] font-semibold text-xl text-[var(--text-primary)]">
            {user?.name}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-3">{user?.designation || 'Faculty Member'}</p>

          <Badge variant="primary" className="mb-4 uppercase">
            {user?.role || 'FACULTY'}
          </Badge>

          <div className="w-full text-left space-y-3 pt-4 border-t border-[var(--border-subtle)] text-sm">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Mail className="w-4 h-4 text-[var(--text-subtle)]" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Phone className="w-4 h-4 text-[var(--text-subtle)]" />
              <span>{user?.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Building2 className="w-4 h-4 text-[var(--text-subtle)]" />
              <span>{user?.departmentName || 'Department Assigned'}</span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--text-primary)] mb-4">
            Edit Personal Details
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              leftIcon={User}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              leftIcon={Mail}
              required
            />
            <Input
              label="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              leftIcon={Phone}
              placeholder="+1 (555) 000-0000"
            />

            <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <Button type="button" variant="outline" icon={Lock} onClick={() => setShowPasswordModal(true)}>
                Change Password
              </Button>
              <Button type="submit" icon={Save} disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {showPasswordModal && (
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Change Account Password"
        >
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              type="password"
              label="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
            <Input
              type="password"
              label="New Password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
            />
            <Input
              type="password"
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default FacultyProfile;
