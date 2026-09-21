/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * DOMAIN ENUMS & GLOBAL SYSTEM TYPES
 * 
 * Architectural Purpose:
 * Canonical domain definitions corresponding directly to future Spring Boot 
 * JPA / Domain entities and Java enums.
 * 
 * Future Spring Boot Entities:
 * - com.civic.domain.enums.UserRole
 * - com.civic.domain.enums.ComplaintStatus
 * - com.civic.domain.enums.PriorityLevel
 * - com.civic.domain.enums.NotificationType
 */

export enum UserRole {
  PUBLIC = 'PUBLIC',
  CITIZEN = 'CITIZEN',
  FIELD_WORKER = 'FIELD_WORKER',
  DEPARTMENT_STAFF = 'DEPARTMENT_STAFF',
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMIN',
}

export enum ComplaintStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
  CANCELLED = 'CANCELLED',
}

export enum PriorityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum NotificationType {
  COMPLAINT_CREATED = 'COMPLAINT_CREATED',
  COMPLAINT_VERIFIED = 'COMPLAINT_VERIFIED',
  COMPLAINT_ASSIGNED = 'COMPLAINT_ASSIGNED',
  COMPLAINT_STARTED = 'COMPLAINT_STARTED',
  COMPLAINT_RESOLVED = 'COMPLAINT_RESOLVED',
  COMPLAINT_REOPENED = 'COMPLAINT_REOPENED',
  SLA_WARNING = 'SLA_WARNING',
  SLA_BREACHED = 'SLA_BREACHED',
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION',
}

export enum SlaStatus {
  WITHIN_SLA = 'WITHIN_SLA',
  AT_RISK = 'AT_RISK',
  BREACHED = 'BREACHED',
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Attachment {
  id: string;
  name: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  stage: 'SUBMISSION' | 'RESOLUTION';
}

export interface TimelineEntry {
  id: string;
  fromStatus: ComplaintStatus | null;
  toStatus: ComplaintStatus;
  actorName: string;
  actorRole: UserRole;
  notes?: string;
  timestamp: string;
}

export interface ComplaintCategory {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  departmentName: string;
  iconName: string;
  slaTargetHours: number;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  contactEmail: string;
  phone: string;
  activeWorkersCount: number;
  openComplaintsCount: number;
}

export interface CivicComplaint {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: PriorityLevel;
  category: ComplaintCategory;
  department: Department;
  address: string;
  ward: string;
  coordinates: Coordinates;
  citizenId: string;
  citizenName?: string; // Masked for public views
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  supportCount: number;
  hasSupported?: boolean;
  slaStatus: SlaStatus;
  slaDeadline: string;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
  timeline: TimelineEntry[];
}
