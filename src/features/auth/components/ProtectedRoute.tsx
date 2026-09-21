/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * ROUTE PROTECTION & RBAC ACCESS GUARD
 * 
 * Architectural Purpose:
 * Guards protected routes against unauthenticated and unauthorized access.
 * Enforces UX authorization (while Spring Boot Security enforces actual resource protection).
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../../../types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission,
}) => {
  const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#1b3b57] mb-3" />
        <p className="text-sm text-slate-600 font-medium">Verifying Civic Security Credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
};
