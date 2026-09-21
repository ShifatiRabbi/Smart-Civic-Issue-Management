/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * AI CIVIC INTELLIGENCE & TRIAGE PAGE (STEP 11)
 * 
 * Architectural Purpose:
 * Advanced intelligence suite featuring:
 * 1. AI Incident Diagnosis & Auto-Triage Terminal (Gemini API)
 * 2. Automated Severity Scoring & Crew Requisition
 * 3. Spatial Duplicate Detection & Clustering Engine
 * 4. Plain-Language Citizen Communication Generator
 */

import React, { useState, useEffect } from 'react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { analyzeIncidentWithAi, detectDuplicateIncidents, generateCitizenPlainSummary } from '../services/aiTriageService';
import { CivicComplaint, PriorityLevel } from '../../../types';
import { AiTriageDiagnosis, DuplicateClusterMatch, AiCitizenSummary } from '../../../types/intelligence';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { 
  Sparkles, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Wrench, 
  Copy, 
  Send, 
  Flame, 
  MessageSquare, 
  ArrowRight,
  RefreshCw,
  Search,
  Sliders
} from 'lucide-react';

export const CivicIntelligencePage: React.FC = () => {
  const { complaints, verifyComplaint, logAuditEvent } = useComplaints();
  
  // Active selected complaint for analysis
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>(complaints[0]?.id || '');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [customWard, setCustomWard] = useState<string>('Ward 1');

  // AI results
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<AiTriageDiagnosis | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateClusterMatch[]>([]);
  const [citizenSummary, setCitizenSummary] = useState<AiCitizenSummary | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const activeComplaint = complaints.find((c) => c.id === selectedComplaintId);

  // Run AI analysis when active complaint changes or on manual trigger
  const runAiAnalysis = async (complaint?: CivicComplaint) => {
    setIsAnalyzing(true);
    setAppliedSuccess(null);

    const title = complaint ? complaint.title : (customTitle || 'Major Water Pipeline Rupture');
    const desc = complaint ? complaint.description : (customDescription || 'Water gushing out of broken asphalt, flooding basement shops.');
    const ward = complaint ? complaint.ward : customWard;

    try {
      // 1. Diagnosis
      const diagResult = await analyzeIncidentWithAi(title, desc, ward);
      setDiagnosis(diagResult);

      // 2. Duplicate Detection
      const targetData = {
        title,
        description: desc,
        categoryCode: diagResult.predictedCategoryId,
        coordinates: complaint?.coordinates || { latitude: 23.812, longitude: 90.410 },
      };
      const dupMatches = detectDuplicateIncidents(
        targetData,
        complaints.filter((c) => c.id !== complaint?.id)
      );
      setDuplicates(dupMatches);

      // 3. Citizen Summary
      if (complaint) {
        const summary = await generateCitizenPlainSummary(complaint);
        setCitizenSummary(summary);
      } else {
        setCitizenSummary(null);
      }
    } catch (err) {
      console.error('Error during AI diagnosis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (activeComplaint) {
      runAiAnalysis(activeComplaint);
    }
  }, [selectedComplaintId]);

  const handleApplyAiRecommendation = () => {
    if (!activeComplaint || !diagnosis) return;

    // Apply priority override & verification notes
    verifyComplaint(
      activeComplaint.id,
      diagnosis.recommendedPriority,
      `AI Auto-Triage: Confidence ${Math.round(diagnosis.confidenceScore * 100)}%. ${diagnosis.triageExplanation}`
    );

    logAuditEvent({
      actorId: 'system-ai',
      actorName: 'Gemini Civic Intelligence Engine',
      actorRole: 'ADMIN' as any,
      action: 'AI_TRIAGE_APPLIED',
      entityType: 'COMPLAINT',
      entityId: activeComplaint.id,
      details: `Auto-triaged priority to ${diagnosis.recommendedPriority}, equipment: ${diagnosis.requiredEquipment.join(', ')}`,
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
    });

    setAppliedSuccess('AI Triage recommendation successfully applied and logged to security audit.');
    setTimeout(() => setAppliedSuccess(null), 4000);
  };

  const handleCopyCitizenText = () => {
    if (!citizenSummary) return;
    navigator.clipboard.writeText(
      `${citizenSummary.headline}\n\n${citizenSummary.plainLanguageSummary}\n\nExpected: ${citizenSummary.estimatedCompletionWindow}`
    );
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI CIVIC TRIAGE & INTELLIGENCE (STEP 11)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Municipal AI Intelligence & Automated Triage
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated issue classification, semantic duplicate clustering, and citizen plain-language synthesis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => runAiAnalysis(activeComplaint)}
            disabled={isAnalyzing}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />}
          >
            {isAnalyzing ? 'Running AI Engine...' : 'Re-run Analysis'}
          </Button>
        </div>
      </div>

      {appliedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-lg text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{appliedSuccess}</span>
          </div>
          <button onClick={() => setAppliedSuccess(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">✕</button>
        </div>
      )}

      {/* Main Analysis Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Complaint Selector / Raw Prompt Input */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>Select Grievance to Triage</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {complaints.length} in registry
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {complaints.map((c) => {
                const isSelected = c.id === selectedComplaintId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedComplaintId(c.id)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50/80 border-purple-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-slate-600">
                        {c.referenceNumber}
                      </span>
                      <PriorityBadge priority={c.priority} size="sm" />
                    </div>
                    <div className="font-semibold text-slate-900 mt-1 line-clamp-1">
                      {c.title}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{c.ward}</span>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Quick Sandbox Tester */}
          <Card className="p-5 space-y-3 bg-slate-50 border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>Freeform AI Simulation Sandbox</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Test how the AI engine classifies novel citizen complaints or emergency calls.
            </p>
            <input
              type="text"
              placeholder="e.g. Broken transformer emitting loud buzzing"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
            />
            <textarea
              placeholder="Describe symptoms, water leak, road hazard..."
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              rows={2}
              className="w-full text-xs p-2 rounded border border-slate-300 bg-white resize-none"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => runAiAnalysis()}
              disabled={isAnalyzing || !customTitle}
              className="w-full text-xs"
            >
              Analyze Custom Text
            </Button>
          </Card>
        </div>

        {/* Center & Right Columns: AI Diagnosis & Output Cockpit */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* AI Diagnosis Result Card */}
          {diagnosis ? (
            <Card className="p-6 space-y-5 border-t-4 border-t-purple-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Confidence: {Math.round(diagnosis.confidenceScore * 100)}%</span>
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Urgency Score: <strong>{diagnosis.urgencyIndex}/10</strong>
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-2">
                    Automated Triage Diagnosis & Classification
                  </h2>
                </div>

                {activeComplaint && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleApplyAiRecommendation}
                    leftIcon={<ShieldCheck className="w-4 h-4" />}
                  >
                    Apply Recommendations
                  </Button>
                )}
              </div>

              {/* Classification Matrix Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Target Department</span>
                  <strong className="text-slate-900 block mt-0.5 font-semibold">
                    {diagnosis.predictedDepartmentName}
                  </strong>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Recommended Priority</span>
                  <div className="mt-1">
                    <PriorityBadge priority={diagnosis.recommendedPriority} size="sm" />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Severity Assessment</span>
                  <span className={`inline-block mt-1 font-bold ${
                    diagnosis.severityAssessment === 'LIFE_SAFETY_CRITICAL'
                      ? 'text-red-600'
                      : diagnosis.severityAssessment === 'SEVERE'
                      ? 'text-amber-600'
                      : 'text-slate-700'
                  }`}>
                    {diagnosis.severityAssessment.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Target SLA Window</span>
                  <strong className="text-teal-700 block mt-0.5 font-mono">
                    {diagnosis.estimatedResolutionHours} Hours
                  </strong>
                </div>
              </div>

              {/* Triage Explanation */}
              <div className="p-3.5 rounded-lg bg-purple-50/50 border border-purple-100 text-xs text-purple-900">
                <span className="font-bold">AI Rationale: </span>
                <span>{diagnosis.triageExplanation}</span>
              </div>

              {/* Crew Specialization & Required Equipment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-teal-600" />
                    <span>Crew Specialization & Equipment</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="font-medium text-slate-800">
                      {diagnosis.recommendedCrewSpecialization}
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {diagnosis.requiredEquipment.map((eq, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700 font-mono">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Safety Protocols & Hazards</span>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 space-y-1 text-slate-700">
                    {diagnosis.safetyPrecautions.map((safe, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px]">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{safe}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center text-slate-500 text-xs">
              <Cpu className="w-8 h-8 mx-auto text-slate-400 mb-2 animate-pulse" />
              <p className="font-semibold text-slate-700">Processing Diagnostic Stream</p>
              <p className="mt-1">Analyzing municipal issue telemetry...</p>
            </Card>
          )}

          {/* Duplicate Detection & Semantic Clustering */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Search className="w-4 h-4 text-teal-600" />
                  <span>Semantic Duplicate Detection & Overlap Cluster</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Scans spatial radius and description embeddings to prevent double-dispatch of crews.
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                duplicates.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {duplicates.length} Potential Matches
              </span>
            </div>

            {duplicates.length > 0 ? (
              <div className="space-y-3">
                {duplicates.map((dup) => (
                  <div
                    key={dup.existingComplaint.id}
                    className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          {dup.existingComplaint.referenceNumber}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                          {Math.round(dup.similarityScore * 100)}% Similarity
                        </span>
                        <span className="text-[11px] text-slate-500">
                          ({dup.distanceKm} km away in {dup.existingComplaint.ward})
                        </span>
                      </div>
                      <div className="font-semibold text-slate-800">
                        {dup.existingComplaint.title}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Match Factors: {dup.matchReasons.join(' • ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                      >
                        {dup.recommendation === 'MERGE_INTO_MASTER' ? 'Merge Duplicate' : 'Link as Related'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero duplicate incidents detected within this municipal sector. Standalone work order confirmed.</span>
              </div>
            )}
          </Card>

          {/* Plain-Language Citizen Communicator */}
          {citizenSummary && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Citizen Plain-Language Communications Digest</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    AI-translated technical timeline into friendly, transparent updates for reporting citizens.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCitizenText}
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  {copiedNotification ? 'Copied to Clipboard!' : 'Copy Notice'}
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2 text-xs">
                <div className="font-bold text-sm text-blue-950">
                  {citizenSummary.headline}
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {citizenSummary.plainLanguageSummary}
                </p>
                
                <div className="pt-2 border-t border-blue-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-blue-800">
                  <span>Current Phase: <strong>{citizenSummary.currentPhaseText}</strong></span>
                  <span>Estimated Completion: <strong>{citizenSummary.estimatedCompletionWindow}</strong></span>
                </div>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};
