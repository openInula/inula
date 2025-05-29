import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  redirectPath?: string;
}

/**
 * A wrapper component that redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ redirectPath = '/login' }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading indicator while checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Render children routes if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
