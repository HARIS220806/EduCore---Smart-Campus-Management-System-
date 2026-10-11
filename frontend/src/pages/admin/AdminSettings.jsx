import { useState } from 'react';
import { Settings, Save, Shield } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useToast } from '@/hooks/useToast';

export function AdminSettings() {
  const toast = useToast();
  const [form, setForm] = useState({
    academicYear: '2026–2027',
    currentSemester: 'Odd Semester (Fall)',
    minAttendance: 75,
    systemName: 'EduCore Management System',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('System settings saved successfully!');
    }, 400);
  };

  return (
    <div>
      <PageHeader
        title="System Settings"
        description="Configure academic parameters, attendance thresholds, and system preferences."
      />

      <Card className="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="System Platform Title"
            value={form.systemName}
            onChange={(e) => setForm({ ...form, systemName: e.target.value })}
            required
          />
          <Input
            label="Academic Year"
            value={form.academicYear}
            onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
            required
          />
          <Input
            label="Active Term / Semester"
            value={form.currentSemester}
            onChange={(e) => setForm({ ...form, currentSemester: e.target.value })}
            required
          />
          <Input
            type="number"
            label="Minimum Required Attendance (%)"
            value={form.minAttendance}
            onChange={(e) => setForm({ ...form, minAttendance: Number(e.target.value) })}
            min={50}
            max={100}
            required
          />

          <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end">
            <Button type="submit" icon={Save} disabled={saving}>
              {saving ? 'Saving Settings...' : 'Save System Settings'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default AdminSettings;
