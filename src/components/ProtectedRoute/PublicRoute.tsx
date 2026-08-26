import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../../utils/auth-util';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  if (isLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  return <>{children ? children : null}</>;
};

export default PublicRoute;
