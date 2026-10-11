import DashboardShell from '@/components/layout/DashboardShell';
import { NAV_ITEMS } from '@/constants/navigation';
import { ROLES } from '@/constants/roles';

export function FacultyLayout() {
  return <DashboardShell navItems={NAV_ITEMS[ROLES.FACULTY]} />;
}

export default FacultyLayout;
