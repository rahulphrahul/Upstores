import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) {
    return <Navigate to="/" replace />; // Not logged in
  }

  if (!allowedRoles.includes(user.role)) {
    // Role not allowed → redirect to their own dashboard home
    switch (user.role) {
      case 'admin':
        return <Navigate to="/dashboard/home" replace />;
      case 'executive':
        return <Navigate to="/dashboard/executive/home" replace />;
      case 'customer':
        return <Navigate to="/dashboard/customer/home" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default RoleProtectedRoute;
