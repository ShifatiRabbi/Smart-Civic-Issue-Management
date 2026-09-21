/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * AUDIT LOGS & SLA CONFIGURATION DOMAIN MODELS
 * 
 * Architectural Purpose:
 * Enterprise security, compliance tracking, and configurable SLA rule models
 * corresponding to future Spring Boot AuditEntity and SlaRuleConfig tables.
 */

import { PriorityLevel, UserRole } from './index';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'COMPLAINT' | 'USER' | 'DEPARTMENT' | 'SLA_RULE' | 'SYSTEM' | 'SECURITY';
  entityId: string;
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

export interface SlaRuleConfig {
  id: string;
  categoryId: string;
  categoryName: string;
  departmentId: string;
  departmentName: string;
  priority: PriorityLevel;
  targetHours: number;
  escalationWarningHours: number;
  requiresSupervisorSignoff: boolean;
  autoEscalateOnBreach: boolean;
  isActive: boolean;
}
