import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // Redirect based on role
  if (user?.role === 'super_admin') {
    return <Navigate to="/super-admin" replace />;
  } else if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (user?.role === 'brand_head') {
    return <Navigate to="/brand-head" replace />;
  } else if (user?.role === 'trainer') {
    return <Navigate to="/crew" replace />;
  } else {
    return <Navigate to="/student-dashboard" replace />;
  }
};

export default RoleBasedRedirect;
