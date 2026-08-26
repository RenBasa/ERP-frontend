import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn, logoutAuth } from '../../utils/auth-util';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const authenticated = isLoggedIn();

  if (!authenticated) {
    logoutAuth();
    return <Navigate to="/login" replace />;
  }
  return <>{children ? children : null}</>;
};

export default ProtectedRoute;
