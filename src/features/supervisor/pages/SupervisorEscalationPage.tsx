/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * SUPERVISOR SLA ESCALATIONS MANAGEMENT
 * 
 * Architectural Purpose:
 * Dedicated management desk for all active grievances suffering SLA breaches or warnings.
 * Provides granular filtering by ward, priority, category, and direct supervisory override actions.
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  Filter, 
  Search, 
  ChevronRight, 
  ArrowUpDown,
  Building2,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { ComplaintStatus, PriorityLevel, SlaStatus } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';

export const SupervisorEscalationPage: React.FC = () => {
  const { complaints, departments, supervisorOverrideSla, supervisorEscalatePriority } = useComplaints();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'BREACHED' | 'AT_RISK'>('ALL');

  // Override dialog state
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [extensionHours, setExtensionHours] = useState(24);
  const [reason, setReason] = useState('');

  // Filter complaints
  const escalationItems = complaints.filter(c => {
    // Only open complaints
    if (c.status === ComplaintStatus.CLOSED || c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.REJECTED) {
      return false;
    }

    // Match SLA filter
    if (selectedFilter === 'BREACHED' && c.slaStatus !== SlaStatus.BREACHED) return false;
    if (selectedFilter === 'AT_RISK' && c.slaStatus !== SlaStatus.AT_RISK) return false;
    if (selectedFilter === 'ALL' && c.slaStatus === SlaStatus.WITHIN_SLA && c.priority !== PriorityLevel.CRITICAL) return false;

    // Match Department
    if (selectedDept !== 'ALL' && c.department.id !== selectedDept) return false;

    // Match Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        c.referenceNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.ward.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintId) return;
    supervisorOverrideSla(selectedComplaintId, extensionHours, reason || 'Supervisory extension granted to facilitate field crew completion.');
    setSelectedComplaintId(null);
    setReason('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>SLA Compliance Command</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active SLA Escalations</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Intervene on breached grievances, issue SLA deadline overrides, and re-prioritize bottlenecked work orders.
          </p>
        </div>

        {/* Tab Filter */}
        <div className="flex bg-slate-200 p-1 rounded-lg self-start">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              selectedFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Critical & At-Risk
          </button>
          <button
            onClick={() => setSelectedFilter('BREACHED')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              selectedFilter === 'BREACHED' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Breached Only
          </button>
          <button
            onClick={() => setSelectedFilter('AT_RISK')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              selectedFilter === 'AT_RISK' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            At Risk (&lt;4h)
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by reference number, title, ward, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-teal-600 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs font-medium border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-700"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Escalation Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ticket Ref</th>
                <th className="py-3 px-4">Issue Title & Ward</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">SLA Status</th>
                <th className="py-3 px-4">Assigned Crew</th>
                <th className="py-3 px-4 text-right">Supervisory Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {escalationItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No escalated grievances match criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Select another department filter or reset search term.</p>
                  </td>
                </tr>
              ) : (
                escalationItems.map((c) => {
                  const deadlineDate = new Date(c.slaDeadline);
                  const isBreached = c.slaStatus === SlaStatus.BREACHED;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-900">
                        {c.referenceNumber}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">{c.title}</div>
                        <div className="text-xs text-slate-500 truncate">{c.ward} • {c.address}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                        {c.department.code}
                      </td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={c.priority} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className={`inline-flex items-center text-xs font-bold ${
                            isBreached ? 'text-red-700' : 'text-amber-700'
                          }`}>
                            {isBreached ? 'BREACHED' : 'AT RISK'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Due: {deadlineDate.toLocaleDateString()} {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {c.assignedWorkerName ? (
                          <span className="font-medium text-slate-800">{c.assignedWorkerName}</span>
                        ) : (
                          <span className="text-red-600 font-semibold italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedComplaintId(c.id);
                              setExtensionHours(24);
                            }}
                            className="text-xs"
                          >
                            Extend SLA
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => supervisorEscalatePriority(c.id, PriorityLevel.CRITICAL, 'Priority elevated by Supervisor')}
                            disabled={c.priority === PriorityLevel.CRITICAL}
                            className="text-xs"
                          >
                            Escalate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Override Extension Modal */}
      {selectedComplaintId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Authorize SLA Extension</h3>
              </div>
              <button 
                onClick={() => setSelectedComplaintId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Extension Duration
                </label>
                <select
                  value={extensionHours}
                  onChange={(e) => setExtensionHours(Number(e.target.value))}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-teal-600"
                >
                  <option value={12}>+12 Hours (Minor Delay)</option>
                  <option value={24}>+24 Hours (Next Shift Window)</option>
                  <option value={48}>+48 Hours (Major Material Delay)</option>
                  <option value={72}>+72 Hours (Subcontractor Intervention)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Justification Note *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide audit justification for extending the mandated deadline..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md p-2.5 focus:outline-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedComplaintId(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Confirm Extension
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
};
