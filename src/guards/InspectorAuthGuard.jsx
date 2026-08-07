import { Navigate } from 'react-router-dom';
import { useInspectorAuth } from '../contexts/InspectorAuthContext';

/**
 * Inspector auth guard — protects inspector routes.
 * If adminOnly=true, only admin/super_admin roles can access.
 */
export default function InspectorAuthGuard({ children, adminOnly = false }) {
  const { user, token } = useInspectorAuth();

  if (!token || !user) {
    return <Navigate to="/inspector/landing" replace />;
  }

  if (adminOnly) {
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.is_admin;
    if (!isAdmin) {
      return <Navigate to="/inspector" replace />;
    }
  }

  return children;
}
