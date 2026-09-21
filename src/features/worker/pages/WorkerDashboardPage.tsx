/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * FIELD WORKER MOBILE DISPATCH TERMINAL - DASHBOARD
 * 
 * Architectural Purpose:
 * Provides field crews with a streamlined, mobile-optimized command center.
 * Features live duty toggles, active work order metrics, priority dispatch alerts,
 * interactive route radar, and rapid task advancement.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  MapPin, 
  Clock, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  CheckSquare, 
  ShieldCheck, 
  Radio, 
  PhoneCall, 
  ChevronRight,
  TrendingUp,
  Truck
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { useAuth } from '../../auth/context/AuthContext';
import { ComplaintStatus, PriorityLevel, SlaStatus } from '../../../types';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export const WorkerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { complaints, workers, updateWorkerStatus, startJobRoute, markArrivedOnSite } = useComplaints();
  const navigate = useNavigate();

  // Find worker profile
  const currentWorker = workers.find((w) => w.id === user?.id) || workers[0];
  const [dutyStatus, setDutyStatus] = useState<string>(currentWorker.status || 'ON_DUTY');

  // Filter complaints assigned to this worker
  const myAssignedComplaints = complaints.filter(
    (c) => c.assignedWorkerId === (user?.id || 'usr-worker-01')
  );

  const activeJobs = myAssignedComplaints.filter(
    (c) => c.status === ComplaintStatus.ASSIGNED || c.status === ComplaintStatus.IN_PROGRESS
  );

  const inProgressJobs = myAssignedComplaints.filter(
    (c) => c.status === ComplaintStatus.IN_PROGRESS
  );

  const completedTodayJobs = myAssignedComplaints.filter(
    (c) => c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED
  );

  const criticalJobs = activeJobs.filter(
    (c) => c.priority === PriorityLevel.CRITICAL || c.priority === PriorityLevel.HIGH
  );

  // The primary active job (first in progress or first assigned)
  const primaryTask = inProgressJobs[0] || activeJobs[0] || null;

  const handleDutyChange = (newStatus: 'ON_DUTY' | 'ON_BREAK' | 'OFF_DUTY') => {
    setDutyStatus(newStatus);
    if (user?.id) {
      updateWorkerStatus(user.id, newStatus);
    }
  };

  // Checklist state for shift readiness
  const [equipmentChecked, setEquipmentChecked] = useState({
    cones: true,
    safetyVests: true,
    repairKit: true,
    gpsTelemetry: true,
  });

  return (
    <div className="space-y-6">
      {/* Field Worker Header Card */}
      <div className="rounded-xl bg-gradient-to-r from-[#0d233a] via-[#1b3b57] to-[#0f2d4a] text-white p-5 sm:p-6 shadow-md border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <Radio className="w-3 h-3 animate-pulse text-teal-400" />
                Mobile Dispatch Terminal
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {currentWorker.vehicleNumber}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {user?.fullName || currentWorker.fullName}
            </h1>
            <p className="text-sm text-slate-300 flex items-center gap-2 flex-wrap">
              <span>{user?.departmentName || currentWorker.departmentName}</span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-teal-400" />
                Vehicle: {currentWorker.vehicleNumber}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Stationed: {currentWorker.currentLocation}</span>
            </p>
          </div>

          {/* Duty Status Control */}
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-300 px-1">Shift Status:</span>
            <div className="inline-flex rounded-md shadow-xs bg-slate-800 p-0.5">
              <button
                type="button"
                onClick={() => handleDutyChange('ON_DUTY')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                  dutyStatus === 'ON_DUTY'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                On Duty
              </button>
              <button
                type="button"
                onClick={() => handleDutyChange('ON_BREAK')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                  dutyStatus === 'ON_BREAK'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Break
              </button>
              <button
                type="button"
                onClick={() => handleDutyChange('OFF_DUTY')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                  dutyStatus === 'OFF_DUTY'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Off Duty
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Active Orders</span>
            <span className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Wrench className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeJobs.length}</span>
            <span className="text-xs text-slate-500 font-medium">in queue</span>
          </div>
          <div className="mt-1 text-[11px] text-teal-700 font-medium">
            {inProgressJobs.length} actively in progress
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">High / Critical</span>
            <span className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{criticalJobs.length}</span>
            <span className="text-xs text-slate-500 font-medium">urgent</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Requires swift dispatch</div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Completed Today</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{completedTodayJobs.length}</span>
            <span className="text-xs text-slate-500 font-medium">jobs closed</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">Resolution evidence verified</div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">SLA Target Met</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">100%</span>
            <span className="text-xs text-emerald-600 font-medium">On-Time</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Zero SLA breaches recorded</div>
        </Card>
      </div>

      {/* Active High-Priority Dispatch Callout */}
      {primaryTask ? (
        <div className="bg-white rounded-xl border-2 border-teal-600 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-600"></span>
              </span>
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                Active Priority Dispatch Work Order
              </span>
              <span className="text-xs font-mono text-slate-500">#{primaryTask.referenceNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={primaryTask.priority} />
              <StatusBadge status={primaryTask.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {primaryTask.title}
              </h3>
              <p className="text-sm text-slate-600 line-clamp-2">
                {primaryTask.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-600 pt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  {primaryTask.address} ({primaryTask.ward})
                </span>
                <span className="flex items-center gap-1 font-mono text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  SLA Target: {new Date(primaryTask.slaDeadline).toLocaleDateString()} {new Date(primaryTask.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Quick Action Navigation Card */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between gap-3">
              <div className="text-xs space-y-1">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Simulated Distance:</span>
                  <span className="font-bold text-slate-800">1.4 km (Est. 6 min)</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Reported By:</span>
                  <span className="font-semibold text-slate-700">{primaryTask.citizenName || 'Resident'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {primaryTask.status === ComplaintStatus.ASSIGNED && (
                  <Button
                    size="sm"
                    className="w-full justify-center bg-teal-700 hover:bg-teal-800 text-white"
                    onClick={() => startJobRoute(primaryTask.id)}
                  >
                    <Navigation className="w-3.5 h-3.5 mr-1.5" />
                    Mark En Route to Site
                  </Button>
                )}

                {primaryTask.status === ComplaintStatus.IN_PROGRESS ? (
                  <Button
                    size="sm"
                    className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => navigate(`/worker/assignments/${primaryTask.id}`)}
                  >
                    <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                    Submit Resolution Proof
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => markArrivedOnSite(primaryTask.id)}
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                    Confirm Arrived On Site
                  </Button>
                )}

                <Link to={`/worker/assignments/${primaryTask.id}`}>
                  <Button size="sm" variant="ghost" className="w-full justify-center text-xs text-slate-600 hover:text-slate-900">
                    Open Execution Terminal <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Card className="p-6 text-center bg-white border border-slate-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-900">All Assigned Jobs Cleared</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            No active work orders currently require field deployment. Keep your terminal active for automatic dispatches from the triage desk.
          </p>
        </Card>
      )}

      {/* Two Column Layout: Assigned Jobs List & Equipment/Route Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Assigned Orders List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-teal-700" />
              Assigned Work Orders Queue ({activeJobs.length})
            </h2>
            <Link to="/worker/assignments" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
              View All Orders &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {activeJobs.map((complaint) => (
              <div
                key={complaint.id}
                className="bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {complaint.referenceNumber}
                      </span>
                      <PriorityBadge priority={complaint.priority} />
                      <StatusBadge status={complaint.status} />
                    </div>
                    <h4 className="font-semibold text-sm text-slate-900 hover:text-teal-700">
                      <Link to={`/worker/assignments/${complaint.id}`}>
                        {complaint.title}
                      </Link>
                    </h4>
                  </div>
                  
                  <Link to={`/worker/assignments/${complaint.id}`}>
                    <Button size="sm" variant="outline" className="text-xs shrink-0">
                      Work Order
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2 flex-wrap gap-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {complaint.address}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Due: {new Date(complaint.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {activeJobs.length === 0 && (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm">
                Queue is clear. New dispatch notifications will alert here in real-time.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Shift Equipment Checklist & Quick Route Telemetry */}
        <div className="space-y-5">
          
          {/* Shift Equipment Checklist */}
          <Card className="p-4 bg-white border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Safety & Equipment Inspection
            </h3>
            <p className="text-xs text-slate-500">
              Verify standard departmental truck inventory before field deployment:
            </p>

            <div className="space-y-2.5 pt-1">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipmentChecked.cones}
                  onChange={(e) => setEquipmentChecked({ ...equipmentChecked, cones: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>4x Heavy Reflective Traffic Cones</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipmentChecked.safetyVests}
                  onChange={(e) => setEquipmentChecked({ ...equipmentChecked, safetyVests: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>Crew Class-3 High-Visibility Vests</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipmentChecked.repairKit}
                  onChange={(e) => setEquipmentChecked({ ...equipmentChecked, repairKit: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>Rapid Repair Material / Compaction Kit</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipmentChecked.gpsTelemetry}
                  onChange={(e) => setEquipmentChecked({ ...equipmentChecked, gpsTelemetry: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>Vehicle GPS Telemetry Active</span>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Inspection Status:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Shift Verified
              </span>
            </div>
          </Card>

          {/* Quick Dispatch Support Desk Contact */}
          <Card className="p-4 bg-slate-900 text-white border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-teal-400" />
              Depot Dispatch Radio
            </h3>
            <p className="text-xs text-slate-300">
              For roadblocks, equipment breakdowns, or police traffic assistance:
            </p>
            <div className="bg-slate-800/80 p-2.5 rounded text-xs font-mono text-slate-200 flex justify-between items-center">
              <span>Central Radio Ch: 14</span>
              <span className="text-teal-400 font-bold">+1 (555) 019-2831</span>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};
