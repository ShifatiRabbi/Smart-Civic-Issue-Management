/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * COMPLAINT & CIVIC LIFECYCLE CONTEXT
 * 
 * Architectural Purpose:
 * Central reactive state store managing complaints, timeline events, evidence photos,
 * endorsements, and municipal notifications across Citizen, Field Worker, Staff, and Admin views.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CivicComplaint, 
  ComplaintStatus, 
  PriorityLevel, 
  SlaStatus, 
  TimelineEntry, 
  Attachment,
  ComplaintCategory,
  Department,
  FieldWorker,
  UserRole
} from '../../../types';
import { 
  MOCK_COMPLAINTS, 
  MOCK_CATEGORIES, 
  MOCK_DEPARTMENTS, 
  MOCK_FIELD_WORKERS,
  MOCK_SLA_RULES,
  MOCK_AUDIT_LOGS,
  MOCK_USERS
} from '../../../data/mockData';
import { User } from '../../../types/auth';
import { AuditLogEntry, SlaRuleConfig } from '../../../types/admin';
import { useAuth } from '../../auth/context/AuthContext';

export interface CitizenNotification {
  id: string;
  complaintId: string;
  referenceNumber: string;
  title: string;
  message: string;
  type: 'STATUS_CHANGE' | 'WORKER_ASSIGNED' | 'RESOLUTION' | 'SLA_ALERT';
  timestamp: string;
  isRead: boolean;
}

interface NewComplaintInput {
  title: string;
  description: string;
  categoryCode: string;
  ward: string;
  address: string;
  coordinates: { latitude: number; longitude: number };
  priority: PriorityLevel;
  attachments: { name: string; fileUrl: string; fileSize: number }[];
  notifySms: boolean;
  notifyEmail: boolean;
}

export interface ResolutionInput {
  complaintId: string;
  notes: string;
  photoUrl: string;
  photoName?: string;
  materials?: string;
}

interface ComplaintContextType {
  complaints: CivicComplaint[];
  workers: FieldWorker[];
  notifications: CitizenNotification[];
  unreadNotificationCount: number;
  getComplaintById: (id: string) => CivicComplaint | undefined;
  getComplaintByReference: (ref: string) => CivicComplaint | undefined;
  createComplaint: (input: NewComplaintInput) => CivicComplaint;
  reopenComplaint: (id: string, reason: string) => void;
  toggleSupport: (id: string) => void;
  addComment: (id: string, commentText: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  // Field Worker Operations
  updateWorkerStatus: (workerId: string, status: FieldWorker['status']) => void;
  startJobRoute: (complaintId: string) => void;
  markArrivedOnSite: (complaintId: string) => void;
  submitResolutionProof: (input: ResolutionInput) => void;
  // Staff Triage & Dispatch Operations
  verifyComplaint: (complaintId: string, verifiedPriority?: PriorityLevel, notes?: string) => void;
  rejectComplaint: (complaintId: string, reason: string) => void;
  assignComplaintToWorker: (complaintId: string, workerId: string, instructions?: string, priorityOverride?: PriorityLevel) => void;
  reallocateDepartment: (complaintId: string, departmentId: string, notes: string) => void;
  // Step 8: Operations Supervisor Methods
  supervisorApproveResolution: (complaintId: string, approvalNotes?: string) => void;
  supervisorRejectResolution: (complaintId: string, reworkNotes: string) => void;
  supervisorOverrideSla: (complaintId: string, additionalHours: number, justification: string) => void;
  supervisorEscalatePriority: (complaintId: string, newPriority: PriorityLevel, notes: string) => void;
  // Step 9: System Administrator State & Methods
  users: User[];
  departments: Department[];
  slaRules: SlaRuleConfig[];
  auditLogs: AuditLogEntry[];
  createUser: (userData: Partial<User>) => void;
  updateUserRole: (userId: string, newRole: UserRole, departmentId?: string) => void;
  deleteUser: (userId: string) => void;
  createDepartment: (dept: Partial<Department>) => void;
  updateDepartment: (deptId: string, data: Partial<Department>) => void;
  updateSlaRule: (ruleId: string, data: Partial<SlaRuleConfig>) => void;
  createSlaRule: (rule: Partial<SlaRuleConfig>) => void;
  logAuditEvent: (event: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  // Legacy helpers
  updateComplaintStatus: (id: string, newStatus: ComplaintStatus, notes: string) => void;
  assignWorker: (id: string, workerId: string, workerName: string) => void;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

const STORAGE_KEY_COMPLAINTS = 'civic_complaints_v1';
const STORAGE_KEY_NOTIFS = 'civic_notifications_v1';

const INITIAL_NOTIFICATIONS: CitizenNotification[] = [
  {
    id: 'notif-1',
    complaintId: 'cmp-102',
    referenceNumber: 'CMP-2026-0892',
    title: 'Resolution Evidence Submitted',
    message: 'Field Crew Alpha completed storm debris clearing at Elm Street. Verification photos are available for review.',
    type: 'RESOLUTION',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    isRead: false,
  },
  {
    id: 'notif-2',
    complaintId: 'cmp-101',
    referenceNumber: 'CMP-2026-0891',
    title: 'Field Worker Assigned',
    message: 'Your report on Main Street pothole has been assigned to Tariq Rahman (Roads Dept). ETA: 24h.',
    type: 'WORKER_ASSIGNED',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    isRead: false,
  },
  {
    id: 'notif-3',
    complaintId: 'cmp-104',
    referenceNumber: 'CMP-2026-0894',
    title: 'Triage Verification Completed',
    message: 'Streetlight outage report at Green Valley was verified and prioritized as HIGH severity.',
    type: 'STATUS_CHANGE',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
    isRead: true,
  },
];

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState<CivicComplaint[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_COMPLAINTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cached complaints', e);
    }
    return MOCK_COMPLAINTS;
  });

  const [notifications, setNotifications] = useState<CitizenNotification[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_NOTIFS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cached notifications', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [workers, setWorkers] = useState<FieldWorker[]>(() => {
    try {
      const saved = sessionStorage.getItem('civic_workers_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cached workers', e);
    }
    return MOCK_FIELD_WORKERS;
  });

  // Step 9: System Admin & Supervisor persistent state
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = sessionStorage.getItem('civic_users_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cached users', e);
    }
    return Object.values(MOCK_USERS);
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    try {
      const saved = sessionStorage.getItem('civic_departments_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cached departments', e);
    }
    return MOCK_DEPARTMENTS;
  });

  const [slaRules, setSlaRules] = useState<SlaRuleConfig[]>(() => {
    try {
      const saved = sessionStorage.getItem('civic_sla_rules_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cached sla rules', e);
    }
    return MOCK_SLA_RULES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = sessionStorage.getItem('civic_audit_logs_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cached audit logs', e);
    }
    return MOCK_AUDIT_LOGS;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('civic_users_v1', JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save users', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      sessionStorage.setItem('civic_departments_v1', JSON.stringify(departments));
    } catch (e) {
      console.warn('Failed to save departments', e);
    }
  }, [departments]);

  useEffect(() => {
    try {
      sessionStorage.setItem('civic_sla_rules_v1', JSON.stringify(slaRules));
    } catch (e) {
      console.warn('Failed to save sla rules', e);
    }
  }, [slaRules]);

  useEffect(() => {
    try {
      sessionStorage.setItem('civic_audit_logs_v1', JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('Failed to save audit logs', e);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      sessionStorage.setItem('civic_workers_v1', JSON.stringify(workers));
    } catch (e) {
      console.warn('Failed to save workers to storage', e);
    }
  }, [workers]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
    } catch (e) {
      console.warn('Failed to save complaints to storage', e);
    }
  }, [complaints]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notifications to storage', e);
    }
  }, [notifications]);

  const getComplaintById = (id: string) => {
    return complaints.find((c) => c.id === id);
  };

  const getComplaintByReference = (ref: string) => {
    return complaints.find((c) => c.referenceNumber.toLowerCase() === ref.toLowerCase());
  };

  const createComplaint = (input: NewComplaintInput): CivicComplaint => {
    const category = MOCK_CATEGORIES.find((c: ComplaintCategory) => c.code === input.categoryCode) || MOCK_CATEGORIES[0];
    const department = MOCK_DEPARTMENTS.find((d: Department) => d.id === category.departmentId) || MOCK_DEPARTMENTS[0];

    // Generate random 4-digit code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `CMP-2026-${randomSuffix}`;
    const newId = `cmp-${Date.now()}`;
    const now = new Date().toISOString();
    const slaDeadline = new Date(Date.now() + category.slaTargetHours * 60 * 60 * 1000).toISOString();

    const createdAttachments: Attachment[] = input.attachments.map((att, idx) => ({
      id: `att-${Date.now()}-${idx}`,
      name: att.name,
      fileUrl: att.fileUrl,
      fileSize: att.fileSize,
      mimeType: 'image/jpeg',
      uploadedAt: now,
      stage: 'SUBMISSION',
    }));

    const initialTimeline: TimelineEntry[] = [
      {
        id: `tl-${Date.now()}`,
        fromStatus: null,
        toStatus: ComplaintStatus.SUBMITTED,
        timestamp: now,
        actorName: user?.fullName || 'Citizen Reporter',
        actorRole: user?.role || UserRole.CITIZEN,
        notes: 'Civic grievance registered via citizen reporting wizard.',
      },
    ];

    const newComplaint: CivicComplaint = {
      id: newId,
      referenceNumber,
      title: input.title,
      description: input.description,
      status: ComplaintStatus.SUBMITTED,
      priority: input.priority,
      category,
      department,
      ward: input.ward,
      address: input.address,
      coordinates: input.coordinates,
      citizenId: user?.id || 'usr-citizen-1',
      citizenName: user?.fullName || 'Citizen Reporter',
      slaStatus: SlaStatus.WITHIN_SLA,
      slaDeadline,
      createdAt: now,
      updatedAt: now,
      supportCount: 1,
      hasSupported: true,
      timeline: initialTimeline,
      attachments: createdAttachments,
    };

    setComplaints((prev) => [newComplaint, ...prev]);

    // Generate a confirmation notification for the citizen
    const newNotif: CitizenNotification = {
      id: `notif-${Date.now()}`,
      complaintId: newId,
      referenceNumber,
      title: 'Report Successfully Registered',
      message: `Your grievance ${referenceNumber} has been logged and forwarded to ${department.name}. Statutory SLA: ${category.slaTargetHours}h.`,
      type: 'STATUS_CHANGE',
      timestamp: now,
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newComplaint;
  };

  const reopenComplaint = (id: string, reason: string) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newTimelineEvent: TimelineEntry = {
          id: `tl-${Date.now()}`,
          fromStatus: c.status,
          toStatus: ComplaintStatus.REOPENED,
          timestamp: now,
          actorName: user?.fullName || 'Citizen Reporter',
          actorRole: user?.role || UserRole.CITIZEN,
          notes: `Citizen requested reopening: "${reason}"`,
        };
        return {
          ...c,
          status: ComplaintStatus.REOPENED,
          slaStatus: SlaStatus.AT_RISK,
          updatedAt: now,
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );

    const complaint = complaints.find((c) => c.id === id);
    if (complaint) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          complaintId: id,
          referenceNumber: complaint.referenceNumber,
          title: 'Grievance Reopened for Department Review',
          message: `Complaint ${complaint.referenceNumber} was marked as reopened with reason: "${reason}". An escalations supervisor has been notified.`,
          type: 'STATUS_CHANGE',
          timestamp: now,
          isRead: false,
        },
        ...prev,
      ]);
    }
  };

  const toggleSupport = (id: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const willSupport = !c.hasSupported;
        return {
          ...c,
          hasSupported: willSupport,
          supportCount: willSupport ? c.supportCount + 1 : Math.max(0, c.supportCount - 1),
        };
      })
    );
  };

  const addComment = (id: string, commentText: string) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newTimelineEvent: TimelineEntry = {
          id: `tl-${Date.now()}`,
          fromStatus: c.status,
          toStatus: c.status,
          timestamp: now,
          actorName: user?.fullName || 'Citizen Commenter',
          actorRole: user?.role || UserRole.CITIZEN,
          notes: `Citizen Comment: "${commentText}"`,
        };
        return {
          ...c,
          updatedAt: now,
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );
  };

  const updateComplaintStatus = (id: string, newStatus: ComplaintStatus, notes: string) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newTimelineEvent: TimelineEntry = {
          id: `tl-${Date.now()}`,
          fromStatus: c.status,
          toStatus: newStatus,
          timestamp: now,
          actorName: user?.fullName || 'Municipal Officer',
          actorRole: user?.role || UserRole.DEPARTMENT_STAFF,
          notes,
        };
        return {
          ...c,
          status: newStatus,
          updatedAt: now,
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );
  };

  const assignWorker = (id: string, workerId: string, workerName: string) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newTimelineEvent: TimelineEntry = {
          id: `tl-${Date.now()}`,
          fromStatus: c.status,
          toStatus: ComplaintStatus.ASSIGNED,
          timestamp: now,
          actorName: user?.fullName || 'Dispatch Officer',
          actorRole: user?.role || UserRole.DEPARTMENT_STAFF,
          notes: `Assigned work order to field worker: ${workerName}`,
        };
        return {
          ...c,
          status: ComplaintStatus.ASSIGNED,
          assignedWorkerId: workerId,
          assignedWorkerName: workerName,
          updatedAt: now,
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );
  };

  // Field Worker Operations
  const updateWorkerStatus = (workerId: string, status: FieldWorker['status']) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === workerId ? { ...w, status } : w))
    );
  };

  const startJobRoute = (complaintId: string) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        const newTimelineEvent: TimelineEntry = {
          id: `tl-${Date.now()}`,
          fromStatus: c.status,
          toStatus: c.status,
          timestamp: now,
          actorName: user?.fullName || 'Field Worker',
          actorRole: UserRole.FIELD_WORKER,
          notes: 'Field crew has departed depot and is currently en route to incident site.',
        };
        return {
          ...c,
          updatedAt: now,
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );

    // Push notification to citizen
    const target = complaints.find((c) => c.id === complaintId);
    if (target) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          complaintId: target.id,
          referenceNumber: target.referenceNumber,
          title: 'Field Crew En Route',
          message: `Crew assigned to "${target.title.slice(0, 45)}..." is en route with equipment.`,
          type: 'STATUS_CHANGE',
          timestamp: now,
          isRead: false,
        },
        ...prev,
      ]);
    }
  };

  const markArrivedOnSite = (complaintId: string) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        const newTimelineEvent: TimelineEntry = {
          id: `tl-${Date.now()}`,
          fromStatus: c.status,
          toStatus: ComplaintStatus.IN_PROGRESS,
          timestamp: now,
          actorName: user?.fullName || 'Field Worker',
          actorRole: UserRole.FIELD_WORKER,
          notes: 'Field crew has arrived on site. Safety perimeter set; repair work actively in progress.',
        };
        return {
          ...c,
          status: ComplaintStatus.IN_PROGRESS,
          updatedAt: now,
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );

    const target = complaints.find((c) => c.id === complaintId);
    if (target) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          complaintId: target.id,
          referenceNumber: target.referenceNumber,
          title: 'Work In Progress on Site',
          message: `Work order for ${target.referenceNumber} has commenced on site.`,
          type: 'STATUS_CHANGE',
          timestamp: now,
          isRead: false,
        },
        ...prev,
      ]);
    }
  };

  const submitResolutionProof = (input: ResolutionInput) => {
    const now = new Date().toISOString();
    const resolutionAttachment: Attachment = {
      id: `att-res-${Date.now()}`,
      name: input.photoName || 'resolution_completion_proof.jpg',
      fileUrl: input.photoUrl,
      fileSize: 2150000,
      mimeType: 'image/jpeg',
      uploadedAt: now,
      stage: 'RESOLUTION',
    };

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== input.complaintId) return c;
        const newTimelineEvent: TimelineEntry = {
          id: `tl-${Date.now()}`,
          fromStatus: c.status,
          toStatus: ComplaintStatus.RESOLVED,
          timestamp: now,
          actorName: user?.fullName || 'Field Worker',
          actorRole: UserRole.FIELD_WORKER,
          notes: `Resolution Completed: ${input.notes}${input.materials ? ` | Materials used: ${input.materials}` : ''}`,
        };
        return {
          ...c,
          status: ComplaintStatus.RESOLVED,
          updatedAt: now,
          attachments: [...c.attachments, resolutionAttachment],
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );

    // Update worker active count
    if (user?.id) {
      setWorkers((prev) =>
        prev.map((w) =>
          w.id === user.id
            ? { ...w, activeAssignmentsCount: Math.max(0, w.activeAssignmentsCount - 1) }
            : w
        )
      );
    }

    const target = complaints.find((c) => c.id === input.complaintId);
    if (target) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          complaintId: target.id,
          referenceNumber: target.referenceNumber,
          title: 'Issue Resolved & Evidence Submitted',
          message: `Field crew resolved "${target.title.slice(0, 40)}...". Verification photos are now available in your portal.`,
          type: 'RESOLUTION',
          timestamp: now,
          isRead: false,
        },
        ...prev,
      ]);
    }
  };

  // Staff Triage Operations
  const verifyComplaint = (complaintId: string, verifiedPriority?: PriorityLevel, notes?: string) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        const newPriority = verifiedPriority || c.priority;
        const newTimelineEvent: TimelineEntry = {
          id: `tl-${Date.now()}`,
          fromStatus: c.status,
          toStatus: ComplaintStatus.VERIFIED,
          timestamp: now,
          actorName: user?.fullName || 'Triage Officer',
          actorRole: UserRole.DEPARTMENT_STAFF,
          notes: notes || `Complaint verified by department triage. Priority confirmed as ${newPriority}. Ready for crew dispatch.`,
        };
        return {
          ...c,
          status: ComplaintStatus.VERIFIED,
          priority: newPriority,
          updatedAt: now,
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );

    const target = complaints.find((c) => c.id === complaintId);
    if (target) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          complaintId: target.id,
          referenceNumber: target.referenceNumber,
          title: 'Report Verified by Municipal Staff',
          message: `Your grievance ${target.referenceNumber} has been verified and queued for field worker dispatch.`,
          type: 'STATUS_CHANGE',
          timestamp: now,
          isRead: false,
        },
        ...prev,
      ]);
    }
  };

  const rejectComplaint = (complaintId: string, reason: string) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        const newTimelineEvent: TimelineEntry = {
          id: `tl-${Date.now()}`,
          fromStatus: c.status,
          toStatus: ComplaintStatus.REJECTED,
          timestamp: now,
          actorName: user?.fullName || 'Triage Officer',
          actorRole: UserRole.DEPARTMENT_STAFF,
          notes: `Complaint Rejected: ${reason}`,
        };
        return {
          ...c,
          status: ComplaintStatus.REJECTED,
          updatedAt: now,
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );

    const target = complaints.find((c) => c.id === complaintId);
    if (target) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          complaintId: target.id,
          referenceNumber: target.referenceNumber,
          title: 'Complaint Closure Notice',
          message: `Grievance ${target.referenceNumber} could not be approved: ${reason}`,
          type: 'STATUS_CHANGE',
          timestamp: now,
          isRead: false,
        },
        ...prev,
      ]);
    }
  };

  const assignComplaintToWorker = (
    complaintId: string,
    workerId: string,
    instructions?: string,
    priorityOverride?: PriorityLevel
  ) => {
    const now = new Date().toISOString();
    const assignedWorker = workers.find((w) => w.id === workerId);
    const workerName = assignedWorker?.fullName || 'Field Unit';

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        const newPriority = priorityOverride || c.priority;
        const newTimelineEvent: TimelineEntry = {
          id: `tl-${Date.now()}`,
          fromStatus: c.status,
          toStatus: ComplaintStatus.ASSIGNED,
          timestamp: now,
          actorName: user?.fullName || 'Dispatch Officer',
          actorRole: UserRole.DEPARTMENT_STAFF,
          notes: `Dispatched to ${workerName}.${instructions ? ` Instructions: "${instructions}"` : ''}`,
        };
        return {
          ...c,
          status: ComplaintStatus.ASSIGNED,
          assignedWorkerId: workerId,
          assignedWorkerName: workerName,
          priority: newPriority,
          updatedAt: now,
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );

    // Increment worker's load
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === workerId
          ? {
              ...w,
              activeAssignmentsCount: w.activeAssignmentsCount + 1,
              status: w.status === 'AVAILABLE' ? 'ON_DUTY' : w.status,
            }
          : w
      )
    );

    const target = complaints.find((c) => c.id === complaintId);
    if (target) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          complaintId: target.id,
          referenceNumber: target.referenceNumber,
          title: 'Field Crew Dispatched',
          message: `Your grievance ${target.referenceNumber} has been assigned to ${workerName}.`,
          type: 'WORKER_ASSIGNED',
          timestamp: now,
          isRead: false,
        },
        ...prev,
      ]);
    }
  };

  const reallocateDepartment = (complaintId: string, departmentId: string, notes: string) => {
    const now = new Date().toISOString();
    const newDept = MOCK_DEPARTMENTS.find((d) => d.id === departmentId) || MOCK_DEPARTMENTS[0];

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        const newTimelineEvent: TimelineEntry = {
          id: `tl-${Date.now()}`,
          fromStatus: c.status,
          toStatus: ComplaintStatus.UNDER_REVIEW,
          timestamp: now,
          actorName: user?.fullName || 'Triage Officer',
          actorRole: UserRole.DEPARTMENT_STAFF,
          notes: `Reallocated jurisdiction to ${newDept.name}. Reason: ${notes}`,
        };
        return {
          ...c,
          department: newDept,
          status: ComplaintStatus.UNDER_REVIEW,
          assignedWorkerId: undefined,
          assignedWorkerName: undefined,
          updatedAt: now,
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  // Step 8: Supervisor Operations
  const supervisorApproveResolution = (complaintId: string, approvalNotes?: string) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        const newTimelineEvent: TimelineEntry = {
          id: `tl-${Date.now()}`,
          fromStatus: c.status,
          toStatus: ComplaintStatus.CLOSED,
          timestamp: now,
          actorName: user?.fullName || 'Operations Lead',
          actorRole: UserRole.SUPERVISOR,
          notes: approvalNotes ? `Resolution Certified & Closed: ${approvalNotes}` : 'Resolution Certified by Supervisor. Ticket permanently closed.',
        };
        return {
          ...c,
          status: ComplaintStatus.CLOSED,
          updatedAt: now,
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );

    logAuditEvent({
      actorId: user?.id || 'usr-supervisor-01',
      actorName: user?.fullName || 'Operations Supervisor',
      actorRole: UserRole.SUPERVISOR,
      action: 'RESOLUTION_APPROVED',
      entityType: 'COMPLAINT',
      entityId: complaintId,
      details: approvalNotes || 'Resolution work order verified and closed.',
      ipAddress: '10.0.12.44',
      status: 'SUCCESS',
    });
  };

  const supervisorRejectResolution = (complaintId: string, reworkNotes: string) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        const newTimelineEvent: TimelineEntry = {
          id: `tl-${Date.now()}`,
          fromStatus: c.status,
          toStatus: ComplaintStatus.IN_PROGRESS,
          timestamp: now,
          actorName: user?.fullName || 'Operations Lead',
          actorRole: UserRole.SUPERVISOR,
          notes: `Resolution Sign-Off Rejected: Rework required - ${reworkNotes}`,
        };
        return {
          ...c,
          status: ComplaintStatus.IN_PROGRESS,
          updatedAt: now,
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );

    logAuditEvent({
      actorId: user?.id || 'usr-supervisor-01',
      actorName: user?.fullName || 'Operations Supervisor',
      actorRole: UserRole.SUPERVISOR,
      action: 'RESOLUTION_REJECTED',
      entityType: 'COMPLAINT',
      entityId: complaintId,
      details: `Resolution rejected: ${reworkNotes}`,
      ipAddress: '10.0.12.44',
      status: 'WARNING',
    });
  };

  const supervisorOverrideSla = (complaintId: string, additionalHours: number, justification: string) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        const currentDeadline = new Date(c.slaDeadline).getTime();
        const extendedDeadline = new Date(currentDeadline + additionalHours * 3600 * 1000).toISOString();
        const newTimelineEvent: TimelineEntry = {
          id: `tl-${Date.now()}`,
          fromStatus: c.status,
          toStatus: c.status,
          timestamp: now,
          actorName: user?.fullName || 'Operations Lead',
          actorRole: UserRole.SUPERVISOR,
          notes: `SLA Deadline Override (+${additionalHours}h granted): ${justification}`,
        };
        return {
          ...c,
          slaDeadline: extendedDeadline,
          slaStatus: SlaStatus.WITHIN_SLA,
          updatedAt: now,
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );

    logAuditEvent({
      actorId: user?.id || 'usr-supervisor-01',
      actorName: user?.fullName || 'Operations Supervisor',
      actorRole: UserRole.SUPERVISOR,
      action: 'SLA_OVERRIDE_EXTENDED',
      entityType: 'COMPLAINT',
      entityId: complaintId,
      details: `Granted +${additionalHours}h SLA extension. Justification: ${justification}`,
      ipAddress: '10.0.12.44',
      status: 'WARNING',
    });
  };

  const supervisorEscalatePriority = (complaintId: string, newPriority: PriorityLevel, notes: string) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        const newTimelineEvent: TimelineEntry = {
          id: `tl-${Date.now()}`,
          fromStatus: c.status,
          toStatus: c.status,
          timestamp: now,
          actorName: user?.fullName || 'Operations Lead',
          actorRole: UserRole.SUPERVISOR,
          notes: `Priority Escalated from ${c.priority} to ${newPriority}. Order: ${notes}`,
        };
        return {
          ...c,
          priority: newPriority,
          slaStatus: SlaStatus.AT_RISK,
          updatedAt: now,
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );

    logAuditEvent({
      actorId: user?.id || 'usr-supervisor-01',
      actorName: user?.fullName || 'Operations Supervisor',
      actorRole: UserRole.SUPERVISOR,
      action: 'PRIORITY_ESCALATED',
      entityType: 'COMPLAINT',
      entityId: complaintId,
      details: `Escalated to ${newPriority}. Notes: ${notes}`,
      ipAddress: '10.0.12.44',
      status: 'WARNING',
    });
  };

  // Step 9: System Admin Operations
  const createUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: userData.email || 'user@citygov.org',
      fullName: userData.fullName || 'New User',
      phone: userData.phone || '+1 (555) 000-0000',
      role: userData.role || UserRole.DEPARTMENT_STAFF,
      departmentId: userData.departmentId,
      departmentName: departments.find(d => d.id === userData.departmentId)?.name,
      ward: userData.ward,
      permissions: ['COMPLAINT_VIEW', 'TICKET_TRIAGE'],
    };
    setUsers((prev) => [newUser, ...prev]);

    logAuditEvent({
      actorId: user?.id || 'usr-admin-01',
      actorName: user?.fullName || 'System Administrator',
      actorRole: UserRole.ADMIN,
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: newUser.id,
      details: `Created new user ${newUser.fullName} with role ${newUser.role}`,
      ipAddress: '10.0.1.5',
      status: 'SUCCESS',
    });
  };

  const updateUserRole = (userId: string, newRole: UserRole, departmentId?: string) => {
    const dept = departments.find(d => d.id === departmentId);
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        return {
          ...u,
          role: newRole,
          departmentId: departmentId ?? u.departmentId,
          departmentName: dept ? dept.name : u.departmentName,
        };
      })
    );

    logAuditEvent({
      actorId: user?.id || 'usr-admin-01',
      actorName: user?.fullName || 'System Administrator',
      actorRole: UserRole.ADMIN,
      action: 'USER_ROLE_MODIFIED',
      entityType: 'USER',
      entityId: userId,
      details: `Role updated to ${newRole}${dept ? ` in department ${dept.name}` : ''}`,
      ipAddress: '10.0.1.5',
      status: 'CRITICAL',
    });
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    logAuditEvent({
      actorId: user?.id || 'usr-admin-01',
      actorName: user?.fullName || 'System Administrator',
      actorRole: UserRole.ADMIN,
      action: 'USER_DELETED',
      entityType: 'USER',
      entityId: userId,
      details: `Removed user account from system directory`,
      ipAddress: '10.0.1.5',
      status: 'WARNING',
    });
  };

  const createDepartment = (deptData: Partial<Department>) => {
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      code: deptData.code || 'DEPT',
      name: deptData.name || 'New Municipal Department',
      contactEmail: deptData.contactEmail || 'contact@citygov.org',
      phone: deptData.phone || '+1 (555) 000-0000',
      activeWorkersCount: 0,
      openComplaintsCount: 0,
    };
    setDepartments((prev) => [...prev, newDept]);

    logAuditEvent({
      actorId: user?.id || 'usr-admin-01',
      actorName: user?.fullName || 'System Administrator',
      actorRole: UserRole.ADMIN,
      action: 'DEPARTMENT_CREATED',
      entityType: 'DEPARTMENT',
      entityId: newDept.id,
      details: `Provisioned municipal agency: ${newDept.name} (${newDept.code})`,
      ipAddress: '10.0.1.5',
      status: 'SUCCESS',
    });
  };

  const updateDepartment = (deptId: string, data: Partial<Department>) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === deptId ? { ...d, ...data } : d))
    );

    logAuditEvent({
      actorId: user?.id || 'usr-admin-01',
      actorName: user?.fullName || 'System Administrator',
      actorRole: UserRole.ADMIN,
      action: 'DEPARTMENT_UPDATED',
      entityType: 'DEPARTMENT',
      entityId: deptId,
      details: `Updated agency configuration for ID ${deptId}`,
      ipAddress: '10.0.1.5',
      status: 'SUCCESS',
    });
  };

  const updateSlaRule = (ruleId: string, data: Partial<SlaRuleConfig>) => {
    setSlaRules((prev) =>
      prev.map((rule) => (rule.id === ruleId ? { ...rule, ...data } : rule))
    );

    logAuditEvent({
      actorId: user?.id || 'usr-admin-01',
      actorName: user?.fullName || 'System Administrator',
      actorRole: UserRole.ADMIN,
      action: 'SLA_CONFIG_UPDATED',
      entityType: 'SLA_RULE',
      entityId: ruleId,
      details: `Updated SLA rule parameters (targetHours: ${data.targetHours ?? 'unchanged'})`,
      ipAddress: '10.0.1.5',
      status: 'SUCCESS',
    });
  };

  const createSlaRule = (ruleData: Partial<SlaRuleConfig>) => {
    const newRule: SlaRuleConfig = {
      id: `sla-rule-${Date.now()}`,
      categoryId: ruleData.categoryId || 'cat-pothole',
      categoryName: ruleData.categoryName || 'General Issue',
      departmentId: ruleData.departmentId || 'dept-roads',
      departmentName: ruleData.departmentName || 'Roads & Bridges Department',
      priority: ruleData.priority || PriorityLevel.MEDIUM,
      targetHours: ruleData.targetHours || 48,
      escalationWarningHours: ruleData.escalationWarningHours || 12,
      requiresSupervisorSignoff: ruleData.requiresSupervisorSignoff ?? false,
      autoEscalateOnBreach: ruleData.autoEscalateOnBreach ?? true,
      isActive: true,
    };
    setSlaRules((prev) => [...prev, newRule]);

    logAuditEvent({
      actorId: user?.id || 'usr-admin-01',
      actorName: user?.fullName || 'System Administrator',
      actorRole: UserRole.ADMIN,
      action: 'SLA_RULE_CREATED',
      entityType: 'SLA_RULE',
      entityId: newRule.id,
      details: `Configured new SLA rule for ${newRule.categoryName} (${newRule.priority} Priority)`,
      ipAddress: '10.0.1.5',
      status: 'SUCCESS',
    });
  };

  const logAuditEvent = (event: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...event,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        workers,
        notifications,
        unreadNotificationCount,
        getComplaintById,
        getComplaintByReference,
        createComplaint,
        reopenComplaint,
        toggleSupport,
        addComment,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        updateWorkerStatus,
        startJobRoute,
        markArrivedOnSite,
        submitResolutionProof,
        verifyComplaint,
        rejectComplaint,
        assignComplaintToWorker,
        reallocateDepartment,
        supervisorApproveResolution,
        supervisorRejectResolution,
        supervisorOverrideSla,
        supervisorEscalatePriority,
        users,
        departments,
        slaRules,
        auditLogs,
        createUser,
        updateUserRole,
        deleteUser,
        createDepartment,
        updateDepartment,
        updateSlaRule,
        createSlaRule,
        logAuditEvent,
        updateComplaintStatus,
        assignWorker,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};
