import { Navigate } from 'react-router-dom';
import { useInspectorAuth } from '../contexts/InspectorAuthContext';

export default function InspectorAuthGuard({ children }) {
  const { user, token } = useInspectorAuth();

  if (!token || !user) {
    return <Navigate to="/inspector/login" replace />;
  }

  return children;
}
