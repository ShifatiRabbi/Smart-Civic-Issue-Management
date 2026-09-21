/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * CENTRALIZED API ENDPOINT REGISTRY
 * 
 * Architectural Purpose:
 * Single source of truth for all backend Spring Boot endpoints.
 * Versioned under /api/v1 to allow future backend migrations.
 */

export const API_ENDPOINTS = {
  // Authentication & Session
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  // Public non-PII Endpoints
  PUBLIC: {
    COMPLAINTS: '/public/complaints',
    COMPLAINT_DETAIL: (ref: string) => `/public/complaints/${ref}`,
    MAP_PINS: '/public/complaints/map',
    STATS: '/public/stats',
  },
  // Citizen Workflows
  CITIZEN: {
    COMPLAINTS: '/complaints',
    MY_COMPLAINTS: '/complaints/my',
    COMPLAINT_BY_ID: (id: string) => `/complaints/${id}`,
    SUPPORT: (id: string) => `/complaints/${id}/support`,
    REOPEN: (id: string) => `/complaints/${id}/reopen`,
  },
  // Field Worker Operations
  WORKER: {
    ASSIGNMENTS: '/worker/assignments',
    UPDATE_STATUS: (id: string) => `/worker/assignments/${id}/status`,
    SUBMIT_EVIDENCE: (id: string) => `/worker/assignments/${id}/evidence`,
  },
  // Department Staff Triage
  STAFF: {
    QUEUE: '/staff/complaints',
    VERIFY: (id: string) => `/staff/complaints/${id}/verify`,
    REJECT: (id: string) => `/staff/complaints/${id}/reject`,
    ASSIGN: (id: string) => `/staff/complaints/${id}/assign`,
    WORKERS: '/staff/workers',
  },
  // Supervisor Operations
  SUPERVISOR: {
    ESCALATIONS: '/supervisor/escalations',
    REVIEW_RESOLUTION: (id: string) => `/supervisor/reviews/${id}`,
    METRICS: '/supervisor/metrics',
  },
  // System Administration
  ADMIN: {
    USERS: '/admin/users',
    DEPARTMENTS: '/admin/departments',
    CATEGORIES: '/admin/categories',
    SLA_RULES: '/admin/sla-rules',
    AUDIT_LOGS: '/admin/audit-logs',
  },
  // File Handling (Object Storage Proxy)
  FILES: {
    UPLOAD: '/files/upload',
  },
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
} as const;
