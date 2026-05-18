import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AppContext';
import { ADMIN_LOGIN } from '../../lib/adminPaths';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1C2D] flex items-center justify-center">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to={ADMIN_LOGIN} state={{ from: location }} replace />;
  }
  return children;
}
