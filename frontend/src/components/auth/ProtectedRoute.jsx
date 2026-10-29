import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const ProtectedRoute = () => {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect unauthenticated users to /signin while preserving target location
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

