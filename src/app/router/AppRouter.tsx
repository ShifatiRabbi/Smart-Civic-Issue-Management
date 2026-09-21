/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * UNIFIED APPLICATION ROUTER
 * 
 * Architectural Purpose:
 * Core routing tree implementing RBAC protection, public portal layouts,
 * and authenticated dashboard layouts.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ProtectedRoute } from '../../features/auth/components/ProtectedRoute';
import { UserRole } from '../../types';

// Auth Pages
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '../../features/auth/pages/ForgotPasswordPage';
import { UnauthorizedPage } from '../../features/auth/pages/UnauthorizedPage';
import { ForbiddenPage } from '../../features/auth/pages/ForbiddenPage';

// Public Pages (Step 4)
import { LandingPage } from '../../features/public-portal/pages/LandingPage';
import { PublicExplorerPage } from '../../features/public-portal/pages/PublicExplorerPage';
import { PublicMapPage } from '../../features/public-portal/pages/PublicMapPage';
import { PublicComplaintDetailPage } from '../../features/public-portal/pages/PublicComplaintDetailPage';

// Role Dashboards (Step 3 & 4 shells)
import { RoleDashboardPlaceholder } from '../../features/dashboard/RoleDashboardPlaceholder';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* PUBLIC PORTAL ROUTES (WITH PUBLIC NAV & FOOTER) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<PublicExplorerPage />} />
          <Route path="/map" element={<PublicMapPage />} />
          <Route path="/complaints/:referenceNumber" element={<PublicComplaintDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
        </Route>

        {/* CITIZEN PORTAL ROUTES (PROTECTED) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={[UserRole.CITIZEN, UserRole.ADMIN]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/citizen"
            element={
              <RoleDashboardPlaceholder
                moduleTitle="Citizen Grievance & Tracking Portal"
                moduleRole={UserRole.CITIZEN}
                stepNumber={5}
              />
            }
          />
          <Route
            path="/citizen/*"
            element={
              <RoleDashboardPlaceholder
                moduleTitle="Citizen Grievance & Tracking Portal"
                moduleRole={UserRole.CITIZEN}
                stepNumber={5}
              />
            }
          />
        </Route>

        {/* FIELD WORKER TERMINAL ROUTES (PROTECTED) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={[UserRole.FIELD_WORKER, UserRole.ADMIN]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/worker"
            element={
              <RoleDashboardPlaceholder
                moduleTitle="Field Worker Mobile Dispatch Terminal"
                moduleRole={UserRole.FIELD_WORKER}
                stepNumber={6}
              />
            }
          />
          <Route
            path="/worker/*"
            element={
              <RoleDashboardPlaceholder
                moduleTitle="Field Worker Mobile Dispatch Terminal"
                moduleRole={UserRole.FIELD_WORKER}
                stepNumber={6}
              />
            }
          />
        </Route>

        {/* DEPARTMENT STAFF TRIAGE ROUTES (PROTECTED) */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                UserRole.DEPARTMENT_STAFF,
                UserRole.SUPERVISOR,
                UserRole.ADMIN,
              ]}
            >
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/staff"
            element={
              <RoleDashboardPlaceholder
                moduleTitle="Department Triage & Dispatch Desk"
                moduleRole={UserRole.DEPARTMENT_STAFF}
                stepNumber={7}
              />
            }
          />
          <Route
            path="/staff/*"
            element={
              <RoleDashboardPlaceholder
                moduleTitle="Department Triage & Dispatch Desk"
                moduleRole={UserRole.DEPARTMENT_STAFF}
                stepNumber={7}
              />
            }
          />
        </Route>

        {/* SUPERVISOR ESCALATION & COMMAND ROUTES (PROTECTED) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={[UserRole.SUPERVISOR, UserRole.ADMIN]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/supervisor"
            element={
              <RoleDashboardPlaceholder
                moduleTitle="Operations Supervisor SLA Command"
                moduleRole={UserRole.SUPERVISOR}
                stepNumber={8}
              />
            }
          />
          <Route
            path="/supervisor/*"
            element={
              <RoleDashboardPlaceholder
                moduleTitle="Operations Supervisor SLA Command"
                moduleRole={UserRole.SUPERVISOR}
                stepNumber={8}
              />
            }
          />
        </Route>

        {/* SYSTEM ADMINISTRATOR ROUTES (PROTECTED) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/admin"
            element={
              <RoleDashboardPlaceholder
                moduleTitle="Municipal System Administration"
                moduleRole={UserRole.ADMIN}
                stepNumber={9}
              />
            }
          />
          <Route
            path="/admin/*"
            element={
              <RoleDashboardPlaceholder
                moduleTitle="Municipal System Administration"
                moduleRole={UserRole.ADMIN}
                stepNumber={9}
              />
            }
          />
        </Route>

        {/* Catch-all fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
