// routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet,useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
 const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) return <div>Loading...</div>;
  if (!user) {
    // preserve attempted location for post-login navigation
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalize roles to an array of strings
  const userRoles = Array.isArray(user?.roles)
    ? user.roles
    : user?.role
    ? [user.role]
    : [];

  const isAllowed =
    !allowedRoles.length || allowedRoles.some(r => userRoles.includes(r));

  if (!isAllowed) {
    // Optionally navigate to a dedicated Unauthorized page
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
