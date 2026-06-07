import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../store';

export default function ProtectedRoute() {
  const { user, isAuthReady } = useStore();

  // Show nothing while Firebase figures out who the user is
  if (!isAuthReady) return null;

  // Kick out anyone who isn't an admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}