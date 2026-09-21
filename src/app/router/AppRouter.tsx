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

// Citizen Portal Pages (Step 5)
import { CitizenDashboard } from '../../features/citizen/pages/CitizenDashboard';
import { CitizenComplaintsPage } from '../../features/citizen/pages/CitizenComplaintsPage';
import { CitizenReportWizardPage } from '../../features/citizen/pages/CitizenReportWizardPage';
import { CitizenComplaintDetailPage } from '../../features/citizen/pages/CitizenComplaintDetailPage';
import { CitizenNotificationsPage } from '../../features/citizen/pages/CitizenNotificationsPage';

// Field Worker Pages (Step 6)
import { WorkerDashboardPage } from '../../features/worker/pages/WorkerDashboardPage';
import { WorkerAssignmentsPage } from '../../features/worker/pages/WorkerAssignmentsPage';
import { WorkerWorkOrderDetailPage } from '../../features/worker/pages/WorkerWorkOrderDetailPage';
import { WorkerHistoryPage } from '../../features/worker/pages/WorkerHistoryPage';

// Department Staff Pages (Step 7)
import { StaffDashboardPage } from '../../features/staff/pages/StaffDashboardPage';
import { StaffComplaintsQueuePage } from '../../features/staff/pages/StaffComplaintsQueuePage';
import { StaffWorkloadDispatchPage } from '../../features/staff/pages/StaffWorkloadDispatchPage';
import { CitizenProfilePage } from '../../features/citizen/pages/CitizenProfilePage';

// Operations Supervisor Pages (Step 8)
import { SupervisorDashboardPage } from '../../features/supervisor/pages/SupervisorDashboardPage';
import { SupervisorEscalationPage } from '../../features/supervisor/pages/SupervisorEscalationPage';
import { SupervisorReviewsPage } from '../../features/supervisor/pages/SupervisorReviewsPage';
import { SupervisorReportsPage } from '../../features/supervisor/pages/SupervisorReportsPage';

// Municipal System Administration Pages (Step 9)
import { AdminDashboardPage } from '../../features/admin/pages/AdminDashboardPage';
import { AdminComplaintsPage } from '../../features/admin/pages/AdminComplaintsPage';
import { AdminUsersPage } from '../../features/admin/pages/AdminUsersPage';
import { AdminDepartmentsPage } from '../../features/admin/pages/AdminDepartmentsPage';
import { AdminSlaRulesPage } from '../../features/admin/pages/AdminSlaRulesPage';
import { AdminAuditLogsPage } from '../../features/admin/pages/AdminAuditLogsPage';

// Future Role Dashboards (Step 6, 7, 8, 9 shells)
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

        {/* CITIZEN PORTAL ROUTES (STEP 5 COMPLETE) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={[UserRole.CITIZEN, UserRole.ADMIN]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/citizen" element={<CitizenDashboard />} />
          <Route path="/citizen/complaints" element={<CitizenComplaintsPage />} />
          <Route path="/citizen/complaints/new" element={<CitizenReportWizardPage />} />
          <Route path="/citizen/complaints/:id" element={<CitizenComplaintDetailPage />} />
          <Route path="/citizen/notifications" element={<CitizenNotificationsPage />} />
          <Route path="/citizen/profile" element={<CitizenProfilePage />} />
        </Route>

        {/* FIELD WORKER TERMINAL ROUTES (STEP 6) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={[UserRole.FIELD_WORKER, UserRole.ADMIN]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/worker" element={<WorkerDashboardPage />} />
          <Route path="/worker/assignments" element={<WorkerAssignmentsPage />} />
          <Route path="/worker/assignments/:id" element={<WorkerWorkOrderDetailPage />} />
          <Route path="/worker/history" element={<WorkerHistoryPage />} />
        </Route>

        {/* DEPARTMENT STAFF TRIAGE ROUTES (STEP 7) */}
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
          <Route path="/staff" element={<StaffDashboardPage />} />
          <Route path="/staff/complaints" element={<StaffComplaintsQueuePage />} />
          <Route path="/staff/workload" element={<StaffWorkloadDispatchPage />} />
        </Route>

        {/* SUPERVISOR ESCALATION & COMMAND ROUTES (STEP 8) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={[UserRole.SUPERVISOR, UserRole.ADMIN]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/supervisor" element={<SupervisorDashboardPage />} />
          <Route path="/supervisor/dashboard" element={<SupervisorDashboardPage />} />
          <Route path="/supervisor/escalations" element={<SupervisorEscalationPage />} />
          <Route path="/supervisor/reviews" element={<SupervisorReviewsPage />} />
          <Route path="/supervisor/reports" element={<SupervisorReportsPage />} />
        </Route>

        {/* SYSTEM ADMINISTRATOR ROUTES (STEP 9) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
          <Route path="/admin/sla-rules" element={<AdminSlaRulesPage />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
        </Route>

        {/* Catch-all fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
