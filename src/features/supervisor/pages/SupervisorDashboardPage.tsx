/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * SUPERVISOR ESCALATION & COMMAND DASHBOARD
 * 
 * Architectural Purpose:
 * High-level operations cockpit for Municipal Supervisors and Operations Leads.
 * Enables live SLA breach management, real-time resolution verification sign-offs,
 * workforce utilization oversight, and priority escalation interventions.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  CheckSquare, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Building2, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  SlidersHorizontal,
  ChevronRight,
  Filter,
  FileCheck
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { useAuth } from '../../auth/context/AuthContext';
import { ComplaintStatus, PriorityLevel, SlaStatus } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';

export const SupervisorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    complaints, 
    workers, 
    departments,
    supervisorApproveResolution, 
    supervisorRejectResolution,
    supervisorOverrideSla,
    supervisorEscalatePriority
  } = useComplaints();

  // Selected department scope
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    user?.departmentId || 'ALL'
  );

  // Modal states for SLA override and sign-off
  const [activeOverrideComplaintId, setActiveOverrideComplaintId] = useState<string | null>(null);
  const [overrideHours, setOverrideHours] = useState<number>(24);
  const [overrideJustification, setOverrideJustification] = useState<string>('');

  const [activeSignoffComplaintId, setActiveSignoffComplaintId] = useState<string | null>(null);
  const [signoffAction, setSignoffAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [signoffNotes, setSignoffNotes] = useState<string>('');

  // Filter complaints according to department scope
  const scopedComplaints = complaints.filter(c => {
    if (selectedDeptId === 'ALL') return true;
    return c.department.id === selectedDeptId;
  });

  // Critical operational queues
  const breachedComplaints = scopedComplaints.filter(
    c => c.slaStatus === SlaStatus.BREACHED && c.status !== ComplaintStatus.RESOLVED && c.status !== ComplaintStatus.CLOSED
  );

  const atRiskComplaints = scopedComplaints.filter(
    c => c.slaStatus === SlaStatus.AT_RISK && c.status !== ComplaintStatus.RESOLVED && c.status !== ComplaintStatus.CLOSED
  );

  const pendingReviewComplaints = scopedComplaints.filter(
    c => c.status === ComplaintStatus.RESOLVED
  );

  const criticalComplaints = scopedComplaints.filter(
    c => c.priority === PriorityLevel.CRITICAL && c.status !== ComplaintStatus.CLOSED
  );

  // Department workers
  const scopedWorkers = workers.filter(w => {
    if (selectedDeptId === 'ALL') return true;
    return w.departmentId === selectedDeptId;
  });

  const activeWorkersCount = scopedWorkers.filter(w => w.status === 'ON_DUTY' || w.status === 'BUSY').length;
  const totalCapacity = scopedWorkers.reduce((acc, w) => acc + w.maxCapacity, 0);
  const currentAssignedLoad = scopedWorkers.reduce((acc, w) => acc + w.activeAssignmentsCount, 0);
  const crewUtilizationPct = totalCapacity > 0 ? Math.round((currentAssignedLoad / totalCapacity) * 100) : 0;

  // Handlers
  const handleExecuteSlaOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOverrideComplaintId) return;
    supervisorOverrideSla(activeOverrideComplaintId, overrideHours, overrideJustification || 'Operational delay mitigation approved by supervisor.');
    setActiveOverrideComplaintId(null);
    setOverrideJustification('');
  };

  const handleExecuteSignoff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSignoffComplaintId) return;
    if (signoffAction === 'APPROVE') {
      supervisorApproveResolution(activeSignoffComplaintId, signoffNotes || 'Field verification verified compliant.');
    } else {
      supervisorRejectResolution(activeSignoffComplaintId, signoffNotes || 'Substandard remediation. Crew dispatched for rework.');
    }
    setActiveSignoffComplaintId(null);
    setSignoffNotes('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header & Department Scope Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 text-teal-600" />
            <span>Operations Command & SLA Escalation Center</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Supervisor Incident Control</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Supervisory command oversight, SLA breach mitigation, and official closure certifications.
          </p>
        </div>

        {/* Scope Selector */}
        <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">Department Scope:</span>
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Municipal Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary KPI Command Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* SLA Breached */}
        <Card className={`p-4 border-l-4 ${breachedComplaints.length > 0 ? 'border-l-red-600 bg-red-50/20' : 'border-l-slate-300'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">SLA Breached (Action Req.)</span>
            <span className="p-2 rounded-md bg-red-100 text-red-700">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{breachedComplaints.length}</span>
            <span className="text-xs text-red-600 font-medium">Critical attention</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Requires emergency re-assignment or time extension</p>
        </Card>

        {/* SLA At-Risk */}
        <Card className="p-4 border-l-4 border-l-amber-500 bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">SLA At-Risk (&lt; 4h)</span>
            <span className="p-2 rounded-md bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{atRiskComplaints.length}</span>
            <span className="text-xs text-amber-700 font-medium">Imminent breach</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Active jobs nearing deadline expiration</p>
        </Card>

        {/* Pending Sign-Offs */}
        <Card className="p-4 border-l-4 border-l-emerald-600 bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Pending Sign-Off</span>
            <span className="p-2 rounded-md bg-emerald-100 text-emerald-700">
              <FileCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{pendingReviewComplaints.length}</span>
            <span className="text-xs text-emerald-700 font-medium">Resolved by crews</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Require supervisor audit before final closure</p>
        </Card>

        {/* Crew Utilization */}
        <Card className="p-4 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Crew Capacity Load</span>
            <span className="p-2 rounded-md bg-blue-100 text-blue-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{crewUtilizationPct}%</span>
            <span className="text-xs text-slate-500 font-medium">({currentAssignedLoad}/{totalCapacity} slots)</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{activeWorkersCount} field units active on shift</p>
        </Card>
      </div>

      {/* Main Command Split: SLA Breaches & Pending Review Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: SLA Escalation & Overdue Incidents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold text-slate-900">Immediate SLA Escalations</h2>
            </div>
            <Link 
              to="/supervisor/escalations" 
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <span>View All ({breachedComplaints.length + atRiskComplaints.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="divide-y divide-slate-100 overflow-hidden">
            {breachedComplaints.length === 0 && atRiskComplaints.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-800">No Imminent SLA Breaches</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  All active field work orders across this department are operating within safe compliance thresholds.
                </p>
              </div>
            ) : (
              [...breachedComplaints, ...atRiskComplaints].slice(0, 5).map((complaint) => (
                <div key={complaint.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {complaint.referenceNumber}
                        </span>
                        <PriorityBadge priority={complaint.priority} size="sm" />
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          complaint.slaStatus === SlaStatus.BREACHED 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {complaint.slaStatus === SlaStatus.BREACHED ? 'EXPIRED' : 'EXPIRING SOON'}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-slate-900 line-clamp-1">{complaint.title}</h4>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{complaint.ward}</span>
                        <span>•</span>
                        <span>Assigned: {complaint.assignedWorkerName || 'Unassigned'}</span>
                      </div>
                    </div>

                    {/* Quick Command Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveOverrideComplaintId(complaint.id);
                          setOverrideHours(24);
                        }}
                        className="text-xs"
                      >
                        Override SLA
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => supervisorEscalatePriority(complaint.id, PriorityLevel.CRITICAL, 'Supervisor urgent escalation')}
                        disabled={complaint.priority === PriorityLevel.CRITICAL}
                        className="text-xs"
                      >
                        Escalate
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>

        {/* Section 2: Quality & Resolution Sign-Off Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-bold text-slate-900">Resolution Sign-Off Queue</h2>
            </div>
            <Link 
              to="/supervisor/reviews" 
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <span>Audit Queue ({pendingReviewComplaints.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="divide-y divide-slate-100 overflow-hidden">
            {pendingReviewComplaints.length === 0 ? (
              <div className="p-8 text-center">
                <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-800">No Resolutions Awaiting Sign-Off</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Field workers have not submitted any completed work orders requiring supervisor sign-off at this time.
                </p>
              </div>
            ) : (
              pendingReviewComplaints.slice(0, 5).map((complaint) => {
                const resolutionProof = complaint.attachments.find(a => a.stage === 'RESOLUTION');
                return (
                  <div key={complaint.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {complaint.referenceNumber}
                          </span>
                          <StatusBadge status={complaint.status} size="sm" />
                          {resolutionProof && (
                            <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200">
                              Evidence Attached
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-slate-900 line-clamp-1">{complaint.title}</h4>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>Resolved by: {complaint.assignedWorkerName || 'Field Unit'}</span>
                          <span>•</span>
                          <span>{complaint.ward}</span>
                        </div>
                      </div>

                      {/* Sign-off Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setActiveSignoffComplaintId(complaint.id);
                            setSignoffAction('APPROVE');
                          }}
                          className="text-xs"
                        >
                          Sign-Off
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveSignoffComplaintId(complaint.id);
                            setSignoffAction('REJECT');
                          }}
                          className="text-xs text-amber-700 hover:bg-amber-50"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </Card>
        </div>
      </div>

      {/* Field Force Capacity Matrix Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-900">Field Crew Live Deployment Matrix</h2>
          </div>
          <span className="text-xs text-slate-500">
            {scopedWorkers.length} total units configured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scopedWorkers.map((worker) => {
            const loadPercent = Math.round((worker.activeAssignmentsCount / worker.maxCapacity) * 100);
            return (
              <Card key={worker.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{worker.fullName}</h4>
                    <p className="text-xs text-slate-500">{worker.specialization}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    worker.status === 'AVAILABLE' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : worker.status === 'BUSY'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {worker.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Active Workload</span>
                    <span className="font-semibold">{worker.activeAssignmentsCount} / {worker.maxCapacity} Orders</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        loadPercent >= 100 ? 'bg-red-500' : loadPercent >= 75 ? 'bg-amber-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.min(loadPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
                  <span>Loc: {worker.currentLocation?.split('-')[0] || 'Base'}</span>
                  <span>Veh: {worker.vehicleNumber}</span>
                  <span className="font-semibold text-slate-700">★ {worker.rating.toFixed(1)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* MODAL: SLA Extension Override */}
      {activeOverrideComplaintId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Authorize SLA Extension</h3>
              </div>
              <button 
                onClick={() => setActiveOverrideComplaintId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteSlaOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Extension Duration (Hours)
                </label>
                <select
                  value={overrideHours}
                  onChange={(e) => setOverrideHours(Number(e.target.value))}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-teal-600"
                >
                  <option value={12}>+12 Hours (Half-Day Extension)</option>
                  <option value={24}>+24 Hours (Full-Day Standard)</option>
                  <option value={48}>+48 Hours (Weekend / Heavy Works)</option>
                  <option value={72}>+72 Hours (Material Procurement Delay)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supervisory Justification & Audit Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Inclement weather prohibited hot mix bitumen curing; replacement parts en route from central municipal depot."
                  value={overrideJustification}
                  onChange={(e) => setOverrideJustification(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md p-2.5 focus:outline-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveOverrideComplaintId(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Approve Extension
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: Resolution Sign-Off */}
      {activeSignoffComplaintId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {signoffAction === 'APPROVE' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <h3 className="text-base font-bold text-slate-900">
                  {signoffAction === 'APPROVE' ? 'Certify & Close Grievance' : 'Reject Resolution & Order Rework'}
                </h3>
              </div>
              <button 
                onClick={() => setActiveSignoffComplaintId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteSignoff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {signoffAction === 'APPROVE' ? 'Audit Certification Notes (Optional)' : 'Rework Instructions (Required) *'}
                </label>
                <textarea
                  rows={3}
                  required={signoffAction === 'REJECT'}
                  placeholder={
                    signoffAction === 'APPROVE'
                      ? 'e.g. Work verified in accordance with municipal standards. Ticket finalized.'
                      : 'e.g. Concrete mix incomplete; debris remained on roadway shoulder. Resend crew.'
                  }
                  value={signoffNotes}
                  onChange={(e) => setSignoffNotes(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md p-2.5 focus:outline-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveSignoffComplaintId(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant={signoffAction === 'APPROVE' ? 'secondary' : 'danger'}
                >
                  {signoffAction === 'APPROVE' ? 'Certify Closure' : 'Submit Rework Order'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
};
