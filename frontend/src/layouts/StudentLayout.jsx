import DashboardShell from '@/components/layout/DashboardShell';
import { NAV_ITEMS } from '@/constants/navigation';
import { ROLES } from '@/constants/roles';

export function StudentLayout() {
  return <DashboardShell navItems={NAV_ITEMS[ROLES.STUDENT]} />;
}

export default StudentLayout;
