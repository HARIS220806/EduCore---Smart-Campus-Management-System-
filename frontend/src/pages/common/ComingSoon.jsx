import PageHeader from '@/components/layout/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { Construction } from 'lucide-react';

export function ComingSoon({ title }) {
  return (
    <div>
      <PageHeader title={title} />
      <EmptyState
        icon={Construction}
        title="This page is coming in a later phase"
        description="This route is wired up and role-protected already — the full feature UI will be built in its dedicated phase."
      />
    </div>
  );
}

export default ComingSoon;
