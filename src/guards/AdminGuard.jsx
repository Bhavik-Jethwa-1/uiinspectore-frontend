import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protects admin routes — redirects to /app/dashboard if not an admin.
 * Super admins (role === 'super_admin' || role === 'admin') can access.
 * Regular users are redirected to the user panel.
 */
export default function AdminGuard({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a1a]">
        <div className="flex gap-1.5">
          {[0, 150, 300].map(delay => (
            <span
              key={delay}
              className="w-2.5 h-2.5 rounded-full bg-red-500 animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  const role = user?.role || user?.user_role || 'user';
  const isAdmin = ['admin', 'super_admin'].includes(role?.toLowerCase());

  if (!isAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}
