import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_HOME_ROUTE } from '@/constants/roles';

// NOTE: Same caveat as ProtectedRoute — this only controls what the
// UI navigates to. The backend must enforce real authorization on
// every endpoint regardless of what the frontend allows to render.
export function RoleRoute({ role }) {
  const { role: currentRole } = useAuth();

  if (currentRole !== role) {
    return <Navigate to={ROLE_HOME_ROUTE[currentRole] || '/login'} replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
