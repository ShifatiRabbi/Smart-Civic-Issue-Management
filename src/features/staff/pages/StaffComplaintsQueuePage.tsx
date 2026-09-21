/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * DEPARTMENT INTAKE & COMPLAINT TRIAGE QUEUE
 * 
 * Architectural Purpose:
 * High-density municipal intake queue for department triage officers.
 * Offers rich tabular and card views, multi-criteria filtering, and an interactive
 * triage modal supporting verification, priority overrides, re-allocations, and worker dispatch.
 */

import React, { useState, useMemo } from 'react';
import { 
  Inbox, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Send, 
  ArrowRightLeft, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  ChevronRight,
  Eye,
  Building2,
  PhoneCall
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { useAuth } from '../../auth/context/AuthContext';
import { 
  ComplaintStatus, 
  PriorityLevel, 
  SlaStatus, 
  CivicComplaint,
  Department
} from '../../../types';
import { MOCK_DEPARTMENTS } from '../../../data/mockData';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export const StaffComplaintsQueuePage: React.FC = () => {
  const { user } = useAuth();
  const { 
    complaints, 
    workers, 
    verifyComplaint, 
    rejectComplaint, 
    assignComplaintToWorker, 
    reallocateDepartment 
  } = useComplaints();

  // View mode: 'table' or 'cards'
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filters
  const [selectedDeptId, setSelectedDeptId] = useState<string>(user?.departmentId || 'dept-roads');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [slaFilter, setSlaFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Active Triage Modal State
  const [activeComplaint, setActiveComplaint] = useState<CivicComplaint | null>(null);
  const [triageAction, setTriageAction] = useState<'VERIFY' | 'REJECT' | 'DISPATCH' | 'REALLOCATE'>('VERIFY');

  // Modal form fields
  const [verifyPriority, setVerifyPriority] = useState<PriorityLevel>(PriorityLevel.MEDIUM);
  const [verifyNotes, setVerifyNotes] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('Duplicate report already being tracked under another reference ticket.');
  const [dispatchWorkerId, setDispatchWorkerId] = useState<string>('');
  const [dispatchInstructions, setDispatchInstructions] = useState<string>('');
  const [reallocateDeptId, setReallocateDeptId] = useState<string>('dept-water');
  const [reallocateReason, setReallocateReason] = useState<string>('');

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Department filter
      if (selectedDeptId !== 'ALL' && c.department.id !== selectedDeptId) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && c.status !== statusFilter) {
        return false;
      }
      // Priority filter
      if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) {
        return false;
      }
      // SLA filter
      if (slaFilter !== 'ALL' && c.slaStatus !== slaFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesRef = c.referenceNumber.toLowerCase().includes(q);
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesCitizen = (c.citizenName || '').toLowerCase().includes(q);
        const matchesAddress = c.address.toLowerCase().includes(q);
        return matchesRef || matchesTitle || matchesCitizen || matchesAddress;
      }
      return true;
    });
  }, [complaints, selectedDeptId, statusFilter, priorityFilter, slaFilter, searchTerm]);

  // Open triage modal and populate fields
  const openTriageModal = (complaint: CivicComplaint, initialAction: 'VERIFY' | 'REJECT' | 'DISPATCH' | 'REALLOCATE' = 'VERIFY') => {
    setActiveComplaint(complaint);
    setTriageAction(initialAction);
    setVerifyPriority(complaint.priority);
    setVerifyNotes(`Verified on-site validity. Priority set to ${complaint.priority}.`);
    setDispatchWorkerId('');
    setDispatchInstructions('');
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;

    if (triageAction === 'VERIFY') {
      verifyComplaint(activeComplaint.id, verifyPriority, verifyNotes);
    } else if (triageAction === 'REJECT') {
      rejectComplaint(activeComplaint.id, rejectReason);
    } else if (triageAction === 'DISPATCH') {
      if (!dispatchWorkerId) return;
      assignComplaintToWorker(activeComplaint.id, dispatchWorkerId, dispatchInstructions, verifyPriority);
    } else if (triageAction === 'REALLOCATE') {
      reallocateDepartment(activeComplaint.id, reallocateDeptId, reallocateReason || 'Reallocated to proper jurisdiction department.');
    }

    setActiveComplaint(null);
  };

  // Workers for the current complaint department
  const currentDeptWorkers = workers.filter((w) => {
    if (!activeComplaint) return true;
    return w.departmentId === activeComplaint.department.id;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-teal-700" />
            Department Intake & Grievance Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review incoming citizen reports, verify engineering severity, and dispatch field units.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Department Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Department
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-800"
            >
              <option value="dept-roads">Roads & Bridges</option>
              <option value="dept-sanitation">Waste Management & Sanitation</option>
              <option value="dept-water">Water Supply & Sewerage</option>
              <option value="dept-electric">Electricity & Lighting</option>
              <option value="ALL">All Departments</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value={ComplaintStatus.SUBMITTED}>Submitted (Intake)</option>
              <option value={ComplaintStatus.UNDER_REVIEW}>Under Review</option>
              <option value={ComplaintStatus.VERIFIED}>Verified (Pending Dispatch)</option>
              <option value={ComplaintStatus.ASSIGNED}>Assigned to Crew</option>
              <option value={ComplaintStatus.IN_PROGRESS}>In Progress On Site</option>
              <option value={ComplaintStatus.RESOLVED}>Resolved</option>
              <option value={ComplaintStatus.REJECTED}>Rejected</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-800"
            >
              <option value="ALL">All Priorities</option>
              <option value={PriorityLevel.CRITICAL}>Critical</option>
              <option value={PriorityLevel.HIGH}>High</option>
              <option value={PriorityLevel.MEDIUM}>Medium</option>
              <option value={PriorityLevel.LOW}>Low</option>
            </select>
          </div>

          {/* SLA Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              SLA Risk Status
            </label>
            <select
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-800"
            >
              <option value="ALL">All SLAs</option>
              <option value={SlaStatus.WITHIN_SLA}>Within SLA</option>
              <option value={SlaStatus.AT_RISK}>At Risk (&lt; 6h)</option>
              <option value={SlaStatus.BREACHED}>SLA Breached</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search grievances by reference number, title, resident name, or street location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
          />
        </div>
      </div>

      {/* Queue Counter Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing <strong>{filteredComplaints.length}</strong> complaints</span>
        <span>Click any complaint row to open the full Triage & Dispatch terminal</span>
      </div>

      {/* Table Mode */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Grievance Title & Location</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Crew</th>
                  <th className="py-3 px-4">SLA Deadline</th>
                  <th className="py-3 px-4 text-right">Triage Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No complaints found matching the active filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <tr 
                      key={complaint.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => openTriageModal(complaint, 'VERIFY')}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-teal-800 whitespace-nowrap">
                        {complaint.referenceNumber}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {complaint.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {complaint.address}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {complaint.category.name}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <PriorityBadge priority={complaint.priority} />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={complaint.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {complaint.assignedWorkerName ? (
                          <span className="font-medium text-slate-900">
                            {complaint.assignedWorkerName.split('(')[0]}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {new Date(complaint.slaDeadline).toLocaleDateString()} {new Date(complaint.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2"
                            onClick={() => openTriageModal(complaint, 'VERIFY')}
                          >
                            Triage
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs px-2 bg-teal-700 hover:bg-teal-800 text-white"
                            onClick={() => openTriageModal(complaint, 'DISPATCH')}
                          >
                            Dispatch
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComplaints.map((complaint) => (
            <Card
              key={complaint.id}
              className="p-4 bg-white border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs space-y-3 cursor-pointer"
              onClick={() => openTriageModal(complaint, 'VERIFY')}
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  {complaint.referenceNumber}
                </span>
                <div className="flex items-center gap-1.5">
                  <PriorityBadge priority={complaint.priority} />
                  <StatusBadge status={complaint.status} />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {complaint.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {complaint.description}
                </p>
              </div>

              <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{complaint.address}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Crew: <strong>{complaint.assignedWorkerName ? complaint.assignedWorkerName.split('(')[0] : 'Unassigned'}</strong></span>
                  <span className="font-mono text-slate-600">Due: {new Date(complaint.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => openTriageModal(complaint, 'VERIFY')}
                >
                  Triage
                </Button>
                <Button
                  size="sm"
                  className="w-full text-xs bg-teal-700 hover:bg-teal-800 text-white"
                  onClick={() => openTriageModal(complaint, 'DISPATCH')}
                >
                  Dispatch
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Interactive Triage & Dispatch Modal */}
      {activeComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded">
                    {activeComplaint.referenceNumber}
                  </span>
                  <PriorityBadge priority={activeComplaint.priority} />
                  <StatusBadge status={activeComplaint.status} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-2">
                  {activeComplaint.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reported by <strong>{activeComplaint.citizenName || 'Resident'}</strong> • {activeComplaint.address} ({activeComplaint.ward})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveComplaint(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Description & Citizen Photo Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
              {activeComplaint.attachments.length > 0 && (
                <div className="rounded-md overflow-hidden border border-slate-200 bg-slate-100 aspect-video sm:aspect-square">
                  <img
                    src={activeComplaint.attachments[0].fileUrl}
                    alt="Citizen evidence photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className={`${activeComplaint.attachments.length > 0 ? 'sm:col-span-2' : 'sm:col-span-3'} space-y-2`}>
                <div className="font-semibold text-slate-800">Incident Narrative:</div>
                <p className="text-slate-600 leading-relaxed">
                  {activeComplaint.description}
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  Department: <strong>{activeComplaint.department.name}</strong> • Category: <strong>{activeComplaint.category.name}</strong>
                </div>
              </div>
            </div>

            {/* Triage Mode Tabs */}
            <div className="flex border-b border-slate-200 gap-2">
              <button
                type="button"
                onClick={() => setTriageAction('VERIFY')}
                className={`pb-2 text-xs font-bold transition-colors border-b-2 ${
                  triageAction === 'VERIFY'
                    ? 'border-teal-700 text-teal-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Verify & Set Priority
              </button>
              <button
                type="button"
                onClick={() => setTriageAction('DISPATCH')}
                className={`pb-2 text-xs font-bold transition-colors border-b-2 ${
                  triageAction === 'DISPATCH'
                    ? 'border-teal-700 text-teal-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Dispatch Field Crew
              </button>
              <button
                type="button"
                onClick={() => setTriageAction('REALLOCATE')}
                className={`pb-2 text-xs font-bold transition-colors border-b-2 ${
                  triageAction === 'REALLOCATE'
                    ? 'border-teal-700 text-teal-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                3. Reallocate Dept
              </button>
              <button
                type="button"
                onClick={() => setTriageAction('REJECT')}
                className={`pb-2 text-xs font-bold transition-colors border-b-2 ${
                  triageAction === 'REJECT'
                    ? 'border-rose-600 text-rose-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                4. Reject Grievance
              </button>
            </div>

            {/* Tab Form Contents */}
            <form onSubmit={handleModalSubmit} className="space-y-4">
              
              {/* 1. VERIFY ACTION */}
              {triageAction === 'VERIFY' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Assessed Engineering Priority:
                    </label>
                    <select
                      value={verifyPriority}
                      onChange={(e) => setVerifyPriority(e.target.value as PriorityLevel)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                    >
                      <option value={PriorityLevel.CRITICAL}>CRITICAL (Direct life/safety hazard)</option>
                      <option value={PriorityLevel.HIGH}>HIGH (Severe traffic obstruction / axle hazard)</option>
                      <option value={PriorityLevel.MEDIUM}>MEDIUM (Standard municipal repair SLA)</option>
                      <option value={PriorityLevel.LOW}>LOW (Cosmetic / routine scheduled maintenance)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Staff Verification Triage Notes:
                    </label>
                    <textarea
                      rows={2}
                      value={verifyNotes}
                      onChange={(e) => setVerifyNotes(e.target.value)}
                      placeholder="Add assessment remarks for dispatch log..."
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* 2. DISPATCH ACTION */}
              {triageAction === 'DISPATCH' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Select Field Crew Unit ({currentDeptWorkers.length} available in this department):
                    </label>
                    <select
                      value={dispatchWorkerId}
                      onChange={(e) => setDispatchWorkerId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                      required
                    >
                      <option value="">-- Choose Field Crew --</option>
                      {currentDeptWorkers.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.fullName} ({w.vehicleNumber}) - {w.activeAssignmentsCount}/{w.maxCapacity} Active Jobs [{w.status}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Specific Instructions for Crew Lead:
                    </label>
                    <textarea
                      rows={2}
                      value={dispatchInstructions}
                      onChange={(e) => setDispatchInstructions(e.target.value)}
                      placeholder="e.g. Carry hydraulic cutter and cold mix; coordinate with traffic constable..."
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* 3. REALLOCATE ACTION */}
              {triageAction === 'REALLOCATE' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Transfer Grievance to Proper Department:
                    </label>
                    <select
                      value={reallocateDeptId}
                      onChange={(e) => setReallocateDeptId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                    >
                      {MOCK_DEPARTMENTS.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Reallocation Reason:
                    </label>
                    <input
                      type="text"
                      value={reallocateReason}
                      onChange={(e) => setReallocateReason(e.target.value)}
                      placeholder="e.g. Issue involves storm drainage pipeline, outside road surface scope."
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* 4. REJECT ACTION */}
              {triageAction === 'REJECT' && (
                <div className="space-y-3">
                  <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-800">
                    Warning: Rejecting a grievance formally notifies the citizen with the provided justification and permanently closes the report ticket.
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Charter Rejection Grounds:
                    </label>
                    <select
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                    >
                      <option value="Duplicate report already being tracked under another reference ticket.">
                        Duplicate report (already in progress)
                      </option>
                      <option value="Incident is located on private residential property outside municipal jurisdiction.">
                        Private property (Outside city jurisdiction)
                      </option>
                      <option value="Insufficient photographic evidence or location coordinates provided.">
                        Insufficient location detail
                      </option>
                      <option value="Frivolous or invalid report upon physical inspection.">
                        Invalid condition upon physical inspection
                      </option>
                    </select>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveComplaint(null)}
                >
                  Cancel
                </Button>

                {triageAction === 'VERIFY' && (
                  <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white font-semibold">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Verify Complaint
                  </Button>
                )}

                {triageAction === 'DISPATCH' && (
                  <Button type="submit" size="sm" disabled={!dispatchWorkerId} className="bg-teal-700 hover:bg-teal-800 text-white font-semibold">
                    <Send className="w-4 h-4 mr-1.5" />
                    Dispatch Unit Now
                  </Button>
                )}

                {triageAction === 'REALLOCATE' && (
                  <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                    <ArrowRightLeft className="w-4 h-4 mr-1.5" />
                    Transfer Jurisdiction
                  </Button>
                )}

                {triageAction === 'REJECT' && (
                  <Button type="submit" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                    <XCircle className="w-4 h-4 mr-1.5" />
                    Confirm Official Rejection
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
