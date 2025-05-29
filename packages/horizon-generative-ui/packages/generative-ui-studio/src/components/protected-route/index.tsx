// src/components/ProtectedRoute.tsx
import { useUserProfile } from '@/service/auth';
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation, useNavigate, Location } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectPath?: string;
  onAuthorized?: (location: Location) => void;
  onUnauthorized?: (location: Location) => void;
}

/**
 * 路由守卫组件
 * @param props 组件属性
 * @returns JSX.Element
 */
const ProtectedRoute = ({
  children,
  redirectPath = '/login',
  onAuthorized,
  onUnauthorized,
}: ProtectedRouteProps): JSX.Element => {
  const location = useLocation();
  
  const isAuthenticated = localStorage.getItem('authToken')

  useEffect(() => {
    if (isAuthenticated && onAuthorized) {
      onAuthorized(location);
    } else if (!isAuthenticated && onUnauthorized) {
      onUnauthorized(location);
    }
  }, [isAuthenticated, location, onAuthorized, onUnauthorized]);

  if (!isAuthenticated) {
    // 保存当前路径，登录后可以重定向回来
    return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;