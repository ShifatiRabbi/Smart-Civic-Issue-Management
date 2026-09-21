/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * FIELD CREW WORKLOAD & DISPATCH MATRIX
 * 
 * Architectural Purpose:
 * Roster and capacity balancing matrix for department dispatch officers.
 * Visualizes crew capacity loads, active vehicle locations, and supports quick dispatch
 * directly from an unassigned grievances dock.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Truck, 
  MapPin, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  Send, 
  AlertTriangle, 
  PlusCircle, 
  Wrench, 
  ShieldCheck, 
  Star,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { useAuth } from '../../auth/context/AuthContext';
import { ComplaintStatus, PriorityLevel, FieldWorker } from '../../../types';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export const StaffWorkloadDispatchPage: React.FC = () => {
  const { user } = useAuth();
  const { complaints, workers, assignComplaintToWorker } = useComplaints();

  const [selectedDeptId, setSelectedDeptId] = useState<string>(user?.departmentId || 'dept-roads');
  const [assigningComplaintId, setAssigningComplaintId] = useState<string | null>(null);

  // Filter workers
  const deptWorkers = workers.filter((w) => {
    if (selectedDeptId === 'ALL') return true;
    return w.departmentId === selectedDeptId;
  });

  // Filter unassigned complaints eligible for dispatch
  const unassignedComplaints = complaints.filter((c) => {
    const isMatchingDept = selectedDeptId === 'ALL' || c.department.id === selectedDeptId;
    const isUnassigned = !c.assignedWorkerId && (
      c.status === ComplaintStatus.SUBMITTED ||
      c.status === ComplaintStatus.UNDER_REVIEW ||
      c.status === ComplaintStatus.VERIFIED
    );
    return isMatchingDept && isUnassigned;
  });

  const handleQuickAssignToWorker = (workerId: string) => {
    if (!assigningComplaintId) return;
    assignComplaintToWorker(assigningComplaintId, workerId, 'Dispatched via central workload matrix.');
    setAssigningComplaintId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-teal-700" />
            Field Crew Workload & Dispatch Matrix
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor real-time crew capacity, active assignments, and balance field deployment loads.
          </p>
        </div>

        {/* Dept Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Department:</span>
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-800"
          >
            <option value="dept-roads">Roads & Bridges</option>
            <option value="dept-sanitation">Waste Management & Sanitation</option>
            <option value="dept-water">Water Supply & Sewerage</option>
            <option value="dept-electric">Electricity & Lighting</option>
            <option value="ALL">All Departments</option>
          </select>
        </div>
      </div>

      {/* Unassigned Work Orders Quick Dock */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-teal-400" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Pending Dispatch Dock ({unassignedComplaints.length} Unassigned Orders)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {assigningComplaintId 
              ? 'Select a field crew below to complete dispatch' 
              : 'Click "Select to Dispatch" on any ticket below to assign'}
          </span>
        </div>

        {unassignedComplaints.length === 0 ? (
          <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 text-center text-xs text-slate-400">
            No unassigned complaints in this department. All verified orders are currently assigned to field crews.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {unassignedComplaints.map((c) => {
              const isSelected = assigningComplaintId === c.id;

              return (
                <div
                  key={c.id}
                  className={`p-3 rounded-lg border transition-all text-xs space-y-2 cursor-pointer ${
                    isSelected
                      ? 'bg-teal-950/80 border-teal-400 ring-2 ring-teal-400/30'
                      : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => setAssigningComplaintId(isSelected ? null : c.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-teal-300">
                      {c.referenceNumber}
                    </span>
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <h4 className="font-semibold text-white truncate">{c.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">{c.ward}</span>
                    <button
                      type="button"
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isSelected
                          ? 'bg-teal-500 text-slate-950'
                          : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      }`}
                    >
                      {isSelected ? '✓ Selected' : 'Dispatch'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Worker Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {deptWorkers.map((worker) => {
          // Complaints assigned to this worker
          const workerComplaints = complaints.filter(
            (c) => 
              c.assignedWorkerId === worker.id &&
              (c.status === ComplaintStatus.ASSIGNED || c.status === ComplaintStatus.IN_PROGRESS)
          );

          const loadPercent = Math.round((workerComplaints.length / worker.maxCapacity) * 100);
          const hasCapacity = workerComplaints.length < worker.maxCapacity;

          return (
            <Card
              key={worker.id}
              className={`p-5 bg-white border transition-all space-y-4 ${
                assigningComplaintId && hasCapacity
                  ? 'border-teal-400 ring-2 ring-teal-100'
                  : 'border-slate-200'
              }`}
            >
              {/* Top Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{worker.fullName}</h3>
                    <span className="text-xs text-amber-500 font-semibold flex items-center">
                      ★ {worker.rating}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-teal-600" />
                    <span>{worker.vehicleNumber}</span>
                    <span>•</span>
                    <span>{worker.specialization}</span>
                  </p>
                </div>

                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase shrink-0 ${
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

              {/* Workload Capacity Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Capacity Load:</span>
                  <span className="font-bold text-slate-800">
                    {workerComplaints.length} / {worker.maxCapacity} Active Jobs ({loadPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      loadPercent >= 100
                        ? 'bg-rose-500'
                        : loadPercent >= 50
                        ? 'bg-amber-500'
                        : 'bg-teal-600'
                    }`}
                    style={{ width: `${Math.min(100, loadPercent)}%` }}
                  />
                </div>
              </div>

              {/* Proximity Location & Phone */}
              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {worker.currentLocation}
                </span>
                <span className="font-mono text-[11px] text-slate-700">{worker.phone}</span>
              </div>

              {/* Active Jobs in Flight */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Active Dispatched Orders ({workerComplaints.length}):
                </span>
                {workerComplaints.length === 0 ? (
                  <div className="p-3 text-center bg-slate-50 border border-slate-200 rounded text-xs text-slate-500 italic">
                    Unit is currently idle and ready for new assignment.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {workerComplaints.map((job) => (
                      <div
                        key={job.id}
                        className="p-2 rounded border border-slate-200 bg-slate-50/70 text-xs flex items-center justify-between gap-2"
                      >
                        <div className="truncate space-y-0.5">
                          <span className="font-mono text-[10px] font-bold text-slate-700">
                            {job.referenceNumber}
                          </span>
                          <p className="font-medium text-slate-900 truncate">{job.title}</p>
                        </div>
                        <StatusBadge status={job.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign Button if ticket is selected in dock */}
              {assigningComplaintId && (
                <div className="pt-2">
                  <Button
                    size="sm"
                    disabled={!hasCapacity}
                    className="w-full justify-center bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold"
                    onClick={() => handleQuickAssignToWorker(worker.id)}
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {hasCapacity ? `Assign to ${worker.fullName}` : 'Unit at Max Capacity'}
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
