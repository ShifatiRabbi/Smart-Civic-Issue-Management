/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * AI CIVIC INTELLIGENCE & SLA ANALYTICS DOMAIN TYPES (STEP 11)
 * 
 * Architectural Purpose:
 * Defines AI triage diagnosis results, duplicate matching criteria,
 * citizen explanatory summaries, and executive SLA benchmarking structures.
 */

import { CivicComplaint, ComplaintCategory, Department, PriorityLevel, UserRole } from './index';

export interface AiTriageDiagnosis {
  predictedDepartmentId: string;
  predictedDepartmentName: string;
  predictedCategoryId: string;
  predictedCategoryName: string;
  confidenceScore: number; // 0.0 - 1.0 (e.g. 0.94 = 94%)
  recommendedPriority: PriorityLevel;
  urgencyIndex: number; // 1 to 10
  severityAssessment: 'ROUTINE' | 'MODERATE' | 'SEVERE' | 'LIFE_SAFETY_CRITICAL';
  estimatedResolutionHours: number;
  recommendedCrewSpecialization: string;
  requiredEquipment: string[];
  safetyPrecautions: string[];
  triageExplanation: string;
}

export interface DuplicateClusterMatch {
  existingComplaint: CivicComplaint;
  similarityScore: number; // 0.0 - 1.0 (e.g. 0.88 = 88%)
  distanceKm: number;
  sharedCategory: boolean;
  matchReasons: string[];
  recommendation: 'MERGE_INTO_MASTER' | 'LINK_AS_RELATED' | 'STANDALONE_INCIDENT';
}

export interface AiCitizenSummary {
  headline: string;
  plainLanguageSummary: string;
  currentPhaseText: string;
  expectedNextSteps: string[];
  estimatedCompletionWindow: string;
  citizenActionItems?: string[];
}

export interface DepartmentSlaPerformance {
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  totalAssigned: number;
  resolvedWithinSla: number;
  breachedCount: number;
  atRiskCount: number;
  complianceRate: number; // e.g. 94.5%
  avgResolutionHours: number;
  targetResolutionHours: number;
  activeWorkforce: number;
  workloadPerWorker: number;
  satisfactionRating: number; // e.g. 4.6
}

export interface WardSlaBenchmark {
  ward: string;
  totalComplaints: number;
  resolvedRate: number;
  avgTurnaroundHours: number;
  criticalIncidentCount: number;
  dominantCategory: string;
  slaHealthScore: number; // 0 - 100
}

export interface ExecutiveReportDigest {
  generatedAt: string;
  period: string;
  executiveSummary: string;
  overallComplianceRate: number;
  totalVolume: number;
  resolvedVolume: number;
  activeBacklog: number;
  criticalBacklog: number;
  topPerformingDepartment: string;
  bottleneckDepartment: string;
  strategicRecommendations: string[];
}
