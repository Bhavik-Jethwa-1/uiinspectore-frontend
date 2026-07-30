import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guest Guard — redirects authenticated users away from public pages.
 * If user is already logged in, send them to /app/dashboard.
 * Use on: /auth/login, /auth/register, landing page.
 */
export default function AuthGuard({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg)]">
        <div className="flex gap-1.5">
          {[0, 150, 300].map(delay => (
            <span
              key={delay}
              className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" state={{ from: location }} replace />;
  }

  return children;
}
