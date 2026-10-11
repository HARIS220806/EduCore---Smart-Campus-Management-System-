import { useEffect, useState } from 'react';
import { Megaphone, Calendar, UserCheck } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { useToast } from '@/hooks/useToast';
import announcementService from '@/services/announcementService';

export function StudentAnnouncements() {
  const toast = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await announcementService.list();
        setAnnouncements(data);
      } catch (err) {
        toast.error(err?.message || 'Failed to load announcements');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader
        title="Campus Announcements"
        description="Official updates, exam notices, and campus news."
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements"
          description="There are no active notices for you right now."
        />
      ) : (
        <div className="space-y-4 max-w-4xl">
          {announcements.map((a) => (
            <Card key={a.id} className="hover:border-[var(--color-primary-300)] transition-colors">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Badge variant="primary">{a.audience.toUpperCase()}</Badge>
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> By {a.authorName || 'Campus Administration'}
                </span>
                <span className="text-xs text-[var(--text-subtle)] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {new Date(a.createdAt).toLocaleDateString()}
                </span>
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
    </div>
  );
}

export default StudentAnnouncements;
