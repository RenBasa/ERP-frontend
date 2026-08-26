import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin } from '../../utils/auth-util';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  if (!isAdmin()) {
    return <Navigate to="/order" replace />;
  }
  return <>{children ? children : null}</>;
};

export default AdminRoute;
