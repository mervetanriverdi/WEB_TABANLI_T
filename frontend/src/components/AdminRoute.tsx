import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../state/auth';

export default function AdminRoute({ children }: { children: React.ReactElement }) {
  const { token, role } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'ADMIN') {
    return <Navigate to="/events" replace />;
  }
  return children;
}
