/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * AI CIVIC TRIAGE & INTELLIGENCE SERVICE (STEP 11)
 * 
 * Architectural Purpose:
 * Core intelligence service powered by Google Gemini API (@google/genai)
 * with robust client-safe heuristic fallbacks for:
 * 1. Automatic Category & Department Prediction
 * 2. Urgency & Priority Scoring (1 to 10 scale)
 * 3. Semantic Duplicate Detection & Cluster Analysis
 * 4. Citizen Plain-Language Progress Summarization
 * 5. Equipment & Crew Requirements Recommendations
 */

import { GoogleGenAI } from '@google/genai';
import { CivicComplaint, PriorityLevel, ComplaintCategory, Department } from '../../../types';
import { AiTriageDiagnosis, DuplicateClusterMatch, AiCitizenSummary, ExecutiveReportDigest } from '../../../types/intelligence';
import { MOCK_CATEGORIES, MOCK_DEPARTMENTS } from '../../../data/mockData';

// Safe lazy initialization of Gemini API Client
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    // Check environment variable safely
    const apiKey = typeof process !== 'undefined' && process.env?.GEMINI_API_KEY
      ? process.env.GEMINI_API_KEY
      : (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) || '';

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        geminiClient = new GoogleGenAI({ apiKey });
      } catch (err) {
        console.warn('Could not initialize Gemini Client:', err);
      }
    }
  }
  return geminiClient;
}

/**
 * 1. AI INCIDENT DIAGNOSIS & AUTOMATED TRIAGE
 */
export async function analyzeIncidentWithAi(
  title: string,
  description: string,
  ward?: string
): Promise<AiTriageDiagnosis> {
  const client = getGeminiClient();

  if (client) {
    try {
      const prompt = `You are a Municipal Civil Engineer and AI Triage System for a Smart City government.
Analyze this citizen-reported civic issue:
Title: "${title}"
Description: "${description}"
Ward: "${ward || 'Unknown'}"

Available Departments:
- Roads & Bridges Department (id: dept-roads)
- Waste Management & Sanitation (id: dept-sanitation)
- Water Supply & Sewerage Authority (id: dept-water)
- Electricity & Street Lighting (id: dept-electric)
- Parks, Recreation & Environment (id: dept-parks)

Return ONLY a valid JSON object matching this exact structure:
{
  "predictedDepartmentId": "dept-roads",
  "predictedDepartmentName": "Roads & Bridges Department",
  "predictedCategoryId": "cat-pothole",
  "predictedCategoryName": "Pothole & Road Damage",
  "confidenceScore": 0.95,
  "recommendedPriority": "HIGH",
  "urgencyIndex": 8,
  "severityAssessment": "SEVERE",
  "estimatedResolutionHours": 24,
  "recommendedCrewSpecialization": "Asphalt Repair & Heavy Roller Unit",
  "requiredEquipment": ["Cold-mix asphalt", "Compactor", "Safety cones"],
  "safetyPrecautions": ["Cordon off lane", "High-visibility warning signs"],
  "triageExplanation": "Deep crater on arterial roadway creates severe axle damage and accident hazard."
}`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return parsed as AiTriageDiagnosis;
      }
    } catch (e) {
      console.warn('Gemini API call returned error, switching to heuristic triage engine:', e);
    }
  }

  // Robust Heuristic Engine Fallback
  return fallbackHeuristicTriage(title, description, ward);
}

/**
 * Heuristic Triage Rule Matrix
 */
function fallbackHeuristicTriage(
  title: string,
  description: string,
  ward?: string
): AiTriageDiagnosis {
  const combined = `${title.toLowerCase()} ${description.toLowerCase()}`;

  // Water & Drainage
  if (combined.includes('water') || combined.includes('pipe') || combined.includes('leak') || combined.includes('drain') || combined.includes('sewer') || combined.includes('flood')) {
    const isCritical = combined.includes('burst') || combined.includes('flood') || combined.includes('contamination') || combined.includes('main');
    return {
      predictedDepartmentId: 'dept-water',
      predictedDepartmentName: 'Water Supply & Sewerage Authority',
      predictedCategoryId: 'cat-waterleak',
      predictedCategoryName: 'Main Pipeline Burst & Water Leakage',
      confidenceScore: 0.94,
      recommendedPriority: isCritical ? PriorityLevel.CRITICAL : PriorityLevel.HIGH,
      urgencyIndex: isCritical ? 9 : 7,
      severityAssessment: isCritical ? 'LIFE_SAFETY_CRITICAL' : 'SEVERE',
      estimatedResolutionHours: isCritical ? 12 : 24,
      recommendedCrewSpecialization: 'Hydraulic Pipeline & De-watering Specialists',
      requiredEquipment: ['High-volume submersed pump', 'Replacement PVC sleeve', 'Pressure valve'],
      safetyPrecautions: ['Isolate water main valve', 'Install trench shoring', 'Test water purity post-repair'],
      triageExplanation: 'Hydraulic failure detected with potential property inundation and utility pressure loss.',
    };
  }

  // Garbage & Waste
  if (combined.includes('garbage') || combined.includes('trash') || combined.includes('dump') || combined.includes('waste') || combined.includes('smell') || combined.includes('debris')) {
    const isSevere = combined.includes('toxic') || combined.includes('medical') || combined.includes('block');
    return {
      predictedDepartmentId: 'dept-sanitation',
      predictedDepartmentName: 'Waste Management & Sanitation',
      predictedCategoryId: 'cat-garbage',
      predictedCategoryName: 'Uncollected Garbage & Illegal Dumping',
      confidenceScore: 0.92,
      recommendedPriority: isSevere ? PriorityLevel.HIGH : PriorityLevel.MEDIUM,
      urgencyIndex: isSevere ? 7 : 5,
      severityAssessment: isSevere ? 'SEVERE' : 'MODERATE',
      estimatedResolutionHours: 24,
      recommendedCrewSpecialization: 'Solid Waste Compactor & Sanitation Fleet',
      requiredEquipment: ['Rear-loading compactor truck', 'Disinfectant spray rig', 'Protective biohazard PPE'],
      safetyPrecautions: ['Traffic cone buffer', 'Chemical bleaching of runoff site'],
      triageExplanation: 'Accumulated municipal solid waste identified causing public health nuisance and pest vector hazard.',
    };
  }

  // Electricity & Streetlight
  if (combined.includes('light') || combined.includes('electric') || combined.includes('dark') || combined.includes('wire') || combined.includes('pole') || combined.includes('transformer')) {
    const isWireHazard = combined.includes('spark') || combined.includes('live wire') || combined.includes('fallen');
    return {
      predictedDepartmentId: 'dept-electric',
      predictedDepartmentName: 'Electricity & Street Lighting',
      predictedCategoryId: 'cat-streetlight',
      predictedCategoryName: 'Broken / Non-functional Streetlight',
      confidenceScore: 0.91,
      recommendedPriority: isWireHazard ? PriorityLevel.CRITICAL : PriorityLevel.LOW,
      urgencyIndex: isWireHazard ? 10 : 4,
      severityAssessment: isWireHazard ? 'LIFE_SAFETY_CRITICAL' : 'ROUTINE',
      estimatedResolutionHours: isWireHazard ? 6 : 48,
      recommendedCrewSpecialization: 'High-Voltage Utility Bucket Truck Crew',
      requiredEquipment: ['Bucket crane truck', '1000V Insulated toolkit', 'LED Luminaire replacement'],
      safetyPrecautions: ['Verify breaker isolation', 'Ground line before ascension', 'Pedestrian perimeter barrier'],
      triageExplanation: 'Electrical infrastructure defect detected affecting pedestrian visibility and night-time transit safety.',
    };
  }

  // Roads & Potholes (Default)
  const isCraters = combined.includes('deep') || combined.includes('accident') || combined.includes('highway') || combined.includes('collapse');
  return {
    predictedDepartmentId: 'dept-roads',
    predictedDepartmentName: 'Roads & Bridges Department',
    predictedCategoryId: 'cat-pothole',
    predictedCategoryName: 'Pothole & Road Damage',
    confidenceScore: 0.89,
    recommendedPriority: isCraters ? PriorityLevel.HIGH : PriorityLevel.MEDIUM,
    urgencyIndex: isCraters ? 8 : 6,
    severityAssessment: isCraters ? 'SEVERE' : 'MODERATE',
    estimatedResolutionHours: 36,
    recommendedCrewSpecialization: 'Asphalt Repair & Road Maintenance Unit',
    requiredEquipment: ['Cold-mix polymer asphalt', 'Vibratory plate compactor', 'Thermal road cutter'],
    safetyPrecautions: ['Deploy luminous traffic cones 50m upstream', 'Flagger stationed for single-lane flow'],
    triageExplanation: 'Pavement surface deformation detected requiring mechanical excavation and hot/cold asphalt compaction.',
  };
}

/**
 * 2. SEMANTIC DUPLICATE DETECTION & CLUSTER MATCHING
 */
export function detectDuplicateIncidents(
  target: { title: string; description: string; categoryCode: string; coordinates?: { latitude: number; longitude: number } },
  existingComplaints: CivicComplaint[]
): DuplicateClusterMatch[] {
  const matches: DuplicateClusterMatch[] = [];

  const targetWords = new Set(
    `${target.title} ${target.description}`
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );

  for (const c of existingComplaints) {
    const existingWords = new Set(
      `${c.title} ${c.description}`
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3)
    );

    // Compute Jaccard word overlap
    let intersection = 0;
    targetWords.forEach((word) => {
      if (existingWords.has(word)) intersection++;
    });

    const union = targetWords.size + existingWords.size - intersection;
    const wordSimilarity = union > 0 ? intersection / union : 0;

    // Geographic distance
    let distKm = 999;
    if (target.coordinates && c.coordinates) {
      const R = 6371;
      const dLat = ((c.coordinates.latitude - target.coordinates.latitude) * Math.PI) / 180;
      const dLon = ((c.coordinates.longitude - target.coordinates.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((target.coordinates.latitude * Math.PI) / 180) *
          Math.cos((c.coordinates.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      distKm = Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
    }

    const sameCategory = c.category.code === target.categoryCode;
    const matchReasons: string[] = [];

    if (sameCategory) matchReasons.push('Identical municipal category');
    if (distKm < 0.8) matchReasons.push(`Geospatial proximity (${distKm} km radius)`);
    if (wordSimilarity > 0.3) matchReasons.push(`Lexical topic match (${Math.round(wordSimilarity * 100)}% similarity)`);

    // Weighted similarity calculation
    let compositeScore = wordSimilarity * 0.45;
    if (sameCategory) compositeScore += 0.25;
    if (distKm <= 0.5) compositeScore += 0.30;
    else if (distKm <= 1.2) compositeScore += 0.15;

    compositeScore = Math.min(0.99, Number(compositeScore.toFixed(2)));

    if (compositeScore >= 0.55 || (sameCategory && distKm <= 0.6)) {
      let recommendation: DuplicateClusterMatch['recommendation'] = 'STANDALONE_INCIDENT';
      if (compositeScore >= 0.8) recommendation = 'MERGE_INTO_MASTER';
      else if (compositeScore >= 0.6) recommendation = 'LINK_AS_RELATED';

      matches.push({
        existingComplaint: c,
        similarityScore: compositeScore,
        distanceKm: distKm,
        sharedCategory: sameCategory,
        matchReasons,
        recommendation,
      });
    }
  }

  return matches.sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * 3. CITIZEN PLAIN-LANGUAGE PROGRESS SUMMARIZER
 */
export async function generateCitizenPlainSummary(complaint: CivicComplaint): Promise<AiCitizenSummary> {
  const client = getGeminiClient();

  if (client) {
    try {
      const prompt = `Translate this technical municipal work order into an empathetic, reassuring, plain-language update for the reporting citizen:
Reference: ${complaint.referenceNumber}
Title: ${complaint.title}
Status: ${complaint.status}
Priority: ${complaint.priority}
Department: ${complaint.department.name}
Assigned Worker: ${complaint.assignedWorkerName || 'Queued for dispatch'}
SLA Deadline: ${complaint.slaDeadline}

Return ONLY valid JSON:
{
  "headline": "Road Crew Assigned & On Schedule",
  "plainLanguageSummary": "Your complaint has been verified by the Department and assigned to Unit 4. Repairs will be conducted promptly.",
  "currentPhaseText": "Field Unit En Route",
  "expectedNextSteps": ["Site inspection", "Compacting asphalt", "Before/after photo audit"],
  "estimatedCompletionWindow": "Within 18 hours"
}`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      if (response.text) {
        return JSON.parse(response.text) as AiCitizenSummary;
      }
    } catch (e) {
      console.warn('Gemini summary error, falling back to template engine:', e);
    }
  }

  // Template-based fallback
  const isResolved = complaint.status === 'RESOLVED' || complaint.status === 'CLOSED';
  const isInProgress = complaint.status === 'IN_PROGRESS' || complaint.status === 'ASSIGNED';

  if (isResolved) {
    return {
      headline: 'Resolution Verified & Complete',
      plainLanguageSummary: `The ${complaint.department.name} has completed work on "${complaint.title}". Photographic proof has been signed off by the Operations Supervisor.`,
      currentPhaseText: 'Completed & Verified',
      expectedNextSteps: ['Citizen quality survey', 'Long-term infrastructure re-inspection'],
      estimatedCompletionWindow: 'Work Finished',
      citizenActionItems: ['Endorse resolution in portal', 'File a reopen request if issue persists'],
    };
  }

  if (isInProgress) {
    return {
      headline: 'Field Unit Assigned & Mobilized',
      plainLanguageSummary: `Your report has been verified by municipal dispatch. ${complaint.assignedWorkerName ? `${complaint.assignedWorkerName} is actively handling this task.` : 'A crew is on route.'}`,
      currentPhaseText: 'On-Site Operation Underway',
      expectedNextSteps: ['Safety perimeter setup', 'Material application', 'Post-completion verification'],
      estimatedCompletionWindow: 'Expected within statutory SLA target',
    };
  }

  return {
    headline: 'Grievance Registered in Intake Queue',
    plainLanguageSummary: `Your report has been officially logged in the ${complaint.ward} municipal registry and is undergoing staff triage.`,
    currentPhaseText: 'Triage & Verification',
    expectedNextSteps: ['Triage staff review', 'Priority confirmation', 'Field worker assignment'],
    estimatedCompletionWindow: 'Triage within 4 hours',
  };
}
