/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * ADMIN MASTER COMPLAINTS REGISTRY
 * 
 * Architectural Purpose:
 * Unrestricted master database interface allowing system administrators
 * to view, search, export, override status, or force-reassign any municipal grievance.
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Building2, 
  ChevronRight, 
  SlidersHorizontal,
  CheckCircle2,
  Trash2,
  Edit,
  Download
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { ComplaintStatus, PriorityLevel, SlaStatus } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';

export const AdminComplaintsPage: React.FC = () => {
  const { complaints, departments, updateComplaintStatus } = useComplaints();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Override dialog
  const [editingComplaintId, setEditingComplaintId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(ComplaintStatus.IN_PROGRESS);
  const [statusNotes, setStatusNotes] = useState('');

  const filtered = complaints.filter(c => {
    if (selectedDept !== 'ALL' && c.department.id !== selectedDept) return false;
    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
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

  const handleStatusOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaintId) return;
    updateComplaintStatus(editingComplaintId, newStatus, statusNotes || 'Admin administrative override.');
    setEditingComplaintId(null);
    setStatusNotes('');
  };

  const handleExportCSV = () => {
    const headers = ['Reference Number', 'Title', 'Status', 'Priority', 'Department', 'Ward', 'Created At'];
    const rows = filtered.map(c => [
      c.referenceNumber,
      `"${c.title.replace(/"/g, '""')}"`,
      c.status,
      c.priority,
      `"${c.department.name}"`,
      `"${c.ward}"`,
      c.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `municipal_complaints_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Master Grievance Directory</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Complaints Registry</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            System-wide registry of all {complaints.length} municipal tickets with administrative status overrides.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExportCSV}
          leftIcon={<Download className="w-4 h-4" />}
          className="text-xs"
        >
          Export CSV ({filtered.length})
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets by ID, title, ward, citizen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-teal-600 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
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

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            {Object.values(ComplaintStatus).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Complaints Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ref Number</th>
                <th className="py-3 px-4">Title &amp; Ward</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">SLA Deadline</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No tickets found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-bold text-slate-900">
                      {c.referenceNumber}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">{c.title}</div>
                      <div className="text-xs text-slate-500 truncate">{c.ward} • {c.address}</div>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-600">
                      {c.department.code}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 font-mono">
                      {new Date(c.slaDeadline).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingComplaintId(c.id);
                          setNewStatus(c.status);
                        }}
                        className="text-xs"
                      >
                        Override Status
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Status Override Modal */}
      {editingComplaintId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Administrator Status Override</h3>
              <button 
                onClick={() => setEditingComplaintId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStatusOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-teal-600"
                >
                  {Object.values(ComplaintStatus).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrative Reason / Audit Note *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record mandatory administrative justification for audit trail..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md p-2.5 focus:outline-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingComplaintId(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Commit Status Override
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
};
