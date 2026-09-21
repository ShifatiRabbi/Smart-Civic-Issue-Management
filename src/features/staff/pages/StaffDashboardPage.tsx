/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * DEPARTMENT STAFF TRIAGE & DISPATCH DESK - DASHBOARD
 * 
 * Architectural Purpose:
 * Central operations center for municipal department intake officers and dispatch staff.
 * Monitors incoming citizen grievances, SLA escalation risks, and field crew capacity.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Clock, 
  ArrowRight, 
  Wrench, 
  ShieldAlert, 
  Search, 
  ChevronRight, 
  Building2, 
  Send,
  Radio,
  BarChart3,
  Truck
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { useAuth } from '../../auth/context/AuthContext';
import { ComplaintStatus, PriorityLevel, SlaStatus, Department } from '../../../types';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export const StaffDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { complaints, workers, verifyComplaint, assignComplaintToWorker } = useComplaints();
  const navigate = useNavigate();

  // Selected department filter (defaults to user's department, or 'ALL')
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    user?.departmentId || 'dept-roads'
  );

  // Quick dispatch modal state
  const [quickDispatchComplaintId, setQuickDispatchComplaintId] = useState<string | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [dispatchNote, setDispatchNote] = useState<string>('');

  // Filter complaints by selected department
  const deptComplaints = complaints.filter((c) => {
    if (selectedDeptId === 'ALL') return true;
    return c.department.id === selectedDeptId;
  });

  // Calculate operational stats
  const pendingTriage = deptComplaints.filter(
    (c) => c.status === ComplaintStatus.SUBMITTED || c.status === ComplaintStatus.UNDER_REVIEW
  );

  const verifiedAwaitingDispatch = deptComplaints.filter(
    (c) => c.status === ComplaintStatus.VERIFIED
  );

  const activeInField = deptComplaints.filter(
    (c) => c.status === ComplaintStatus.ASSIGNED || c.status === ComplaintStatus.IN_PROGRESS
  );

  const slaAlerts = deptComplaints.filter(
    (c) => (c.slaStatus === SlaStatus.AT_RISK || c.slaStatus === SlaStatus.BREACHED) &&
           c.status !== ComplaintStatus.RESOLVED &&
           c.status !== ComplaintStatus.CLOSED
  );

  const resolvedCount = deptComplaints.filter(
    (c) => c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED
  );

  // Department workers
  const deptWorkers = workers.filter((w) => {
    if (selectedDeptId === 'ALL') return true;
    return w.departmentId === selectedDeptId;
  });

  // Oldest pending complaint for priority callout
  const urgentIntakeItem = pendingTriage.find((c) => c.priority === PriorityLevel.HIGH || c.priority === PriorityLevel.CRITICAL) || pendingTriage[0];

  const handleQuickDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDispatchComplaintId || !selectedWorkerId) return;
    assignComplaintToWorker(quickDispatchComplaintId, selectedWorkerId, dispatchNote);
    setQuickDispatchComplaintId(null);
    setSelectedWorkerId('');
    setDispatchNote('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Department Switcher */}
      <div className="rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#102a45] text-white p-5 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <Building2 className="w-3 h-3 text-teal-400" />
                Department Dispatch & Triage Desk
              </span>
              <span className="text-xs text-slate-400 font-mono">Shift Lead: {user?.fullName || 'Nusrat Jahan'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {user?.departmentName || 'Roads & Bridges Department'} Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Live citizen complaint verification desk, SLA compliance monitoring, and field crew deployment.
            </p>
          </div>

          {/* Department Filter Switcher */}
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-300">View Dept:</span>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="dept-roads">Roads & Bridges</option>
              <option value="dept-sanitation">Waste Management & Sanitation</option>
              <option value="dept-water">Water Supply & Sewerage</option>
              <option value="dept-electric">Electricity & Lighting</option>
              <option value="ALL">All Municipal Departments</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Pending Triage</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Inbox className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{pendingTriage.length}</span>
            <span className="text-xs text-slate-500 font-medium">unassigned</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">Requires staff review</div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Ready for Dispatch</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600">{verifiedAwaitingDispatch.length}</span>
            <span className="text-xs text-slate-500 font-medium">verified</span>
          </div>
          <div className="mt-1 text-[11px] text-blue-700 font-medium">Ready for crew assign</div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Active in Field</span>
            <span className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Wrench className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeInField.length}</span>
            <span className="text-xs text-slate-500 font-medium">crews deployed</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Live on municipal routes</div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">SLA Escalations</span>
            <span className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{slaAlerts.length}</span>
            <span className="text-xs text-slate-500 font-medium">at risk</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-700 font-medium">Prioritize dispatch</div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Resolved This Mo.</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{resolvedCount.length + 142}</span>
            <span className="text-xs text-emerald-600 font-medium">96.4% on-time</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Audited with proof</div>
        </Card>
      </div>

      {/* Urgent Intake Callout */}
      {urgentIntakeItem && (
        <div className="bg-amber-50/70 rounded-xl border border-amber-300 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Action Required: Urgent Citizen Intake Grievance
              </span>
              <span className="text-xs font-mono text-slate-600">#{urgentIntakeItem.referenceNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={urgentIntakeItem.priority} />
              <StatusBadge status={urgentIntakeItem.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2 space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {urgentIntakeItem.title}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-2">
                {urgentIntakeItem.description}
              </p>
              <div className="text-xs text-slate-500 pt-1 flex items-center gap-3">
                <span>Location: <strong>{urgentIntakeItem.address}</strong></span>
                <span>•</span>
                <span>Ward: <strong>{urgentIntakeItem.ward}</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2">
              <Button
                size="sm"
                className="w-full justify-center bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold"
                onClick={() => {
                  verifyComplaint(urgentIntakeItem.id, urgentIntakeItem.priority);
                  setQuickDispatchComplaintId(urgentIntakeItem.id);
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Verify & Open Dispatch
              </Button>

              <Link to="/staff/complaints">
                <Button size="sm" variant="outline" className="w-full justify-center text-xs">
                  Review in Intake Queue
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Pending Intake Queue & Live Field Crew Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Triage Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Inbox className="w-4 h-4 text-teal-700" />
              Recent Intake Grievances Awaiting Action ({pendingTriage.length})
            </h2>
            <Link to="/staff/complaints" className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1">
              Full Intake Queue <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingTriage.slice(0, 5).map((complaint) => (
              <div
                key={complaint.id}
                className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {complaint.referenceNumber}
                      </span>
                      <PriorityBadge priority={complaint.priority} />
                      <StatusBadge status={complaint.status} />
                      <span className="text-xs text-slate-500 font-medium">
                        {complaint.category.name}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-slate-900">
                      {complaint.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2.5"
                      onClick={() => verifyComplaint(complaint.id)}
                    >
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs h-7 px-2.5 bg-teal-700 hover:bg-teal-800 text-white"
                      onClick={() => setQuickDispatchComplaintId(complaint.id)}
                    >
                      Dispatch
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2 flex-wrap gap-2">
                  <span>{complaint.address} ({complaint.ward})</span>
                  <span className="font-mono text-[11px]">
                    Due: {new Date(complaint.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {pendingTriage.length === 0 && (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm">
                No unassigned grievances pending triage. All incoming items are processed.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Field Crew Availability & Workload Matrix */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-700" />
              Field Crews Roster ({deptWorkers.length})
            </h2>
            <Link to="/staff/workload" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
              Workload Matrix &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {deptWorkers.map((worker) => {
              const capacityPercentage = Math.round((worker.activeAssignmentsCount / worker.maxCapacity) * 100);
              const isAvailable = worker.status === 'AVAILABLE' || worker.status === 'ON_DUTY';

              return (
                <Card key={worker.id} className="p-3.5 bg-white border border-slate-200 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{worker.fullName}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Truck className="w-3 h-3 text-teal-600" />
                        <span>{worker.vehicleNumber}</span>
                        <span>•</span>
                        <span>{worker.currentLocation}</span>
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                      worker.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : worker.status === 'ON_DUTY'
                        ? 'bg-teal-100 text-teal-800'
                        : worker.status === 'BUSY'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {worker.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>Workload Capacity</span>
                      <span>{worker.activeAssignmentsCount} / {worker.maxCapacity} Active Orders</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          capacityPercentage > 80
                            ? 'bg-rose-500'
                            : capacityPercentage > 50
                            ? 'bg-amber-500'
                            : 'bg-teal-600'
                        }`}
                        style={{ width: `${Math.min(100, capacityPercentage)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                    <span>Specialty: {worker.specialization.split('&')[0]}</span>
                    <span className="font-semibold text-slate-700">★ {worker.rating}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Dispatch Modal */}
      {quickDispatchComplaintId && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-slate-900 text-base">Quick Dispatch Field Crew</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickDispatchComplaintId(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickDispatch} className="space-y-4">
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span>Dispatching Grievance: </span>
                <strong className="text-slate-900 font-mono">
                  #{complaints.find((c) => c.id === quickDispatchComplaintId)?.referenceNumber}
                </strong>
                <p className="font-semibold text-slate-800 mt-1">
                  {complaints.find((c) => c.id === quickDispatchComplaintId)?.title}
                </p>
              </div>

              {/* Worker select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Select Assigned Field Unit:
                </label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 text-slate-800"
                  required
                >
                  <option value="">-- Choose Field Crew / Unit --</option>
                  {deptWorkers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.fullName} ({w.vehicleNumber}) - {w.activeAssignmentsCount}/{w.maxCapacity} Active Jobs
                    </option>
                  ))}
                </select>
              </div>

              {/* Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Dispatcher Priority Instructions (Optional):
                </label>
                <textarea
                  rows={2}
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  placeholder="e.g. Bring asphalt tamper, place barricades around crossing..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickDispatchComplaintId(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!selectedWorkerId}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                >
                  Confirm & Dispatch Unit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
