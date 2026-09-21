/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * CITIZEN COMPLAINT MANAGEMENT PAGE
 * 
 * Architectural Purpose:
 * Personal portal view allowing residents to track all submitted complaints,
 * filter by status, inspect timeline updates, and initiate ticket reopening if unresolved.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  PlusCircle, 
  Search, 
  Clock, 
  RotateCcw, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  X,
  MessageSquare
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { useAuth } from '../../auth/context/AuthContext';
import { ComplaintStatus, SlaStatus, CivicComplaint } from '../../../types';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export const CitizenComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const { complaints, reopenComplaint } = useComplaints();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  
  // Reopening modal state
  const [reopenModalComplaint, setReopenModalComplaint] = useState<CivicComplaint | null>(null);
  const [reopenReason, setReopenReason] = useState('');
  const [reopenError, setReopenError] = useState<string | null>(null);

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchRef = c.referenceNumber.toLowerCase().includes(q);
      const matchCat = c.category.name.toLowerCase().includes(q);
      if (!matchTitle && !matchRef && !matchCat) return false;
    }

    // Tabs
    if (activeTab === 'ACTIVE') {
      return (
        c.status === ComplaintStatus.SUBMITTED ||
        c.status === ComplaintStatus.UNDER_REVIEW ||
        c.status === ComplaintStatus.VERIFIED ||
        c.status === ComplaintStatus.ASSIGNED ||
        c.status === ComplaintStatus.IN_PROGRESS ||
        c.status === ComplaintStatus.REOPENED
      );
    }
    if (activeTab === 'RESOLVED') {
      return c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED;
    }

    return true;
  });

  const handleConfirmReopen = () => {
    if (!reopenReason.trim() || reopenReason.length < 10) {
      setReopenError('Please state the specific reason why the issue remains unresolved (min 10 chars).');
      return;
    }

    if (reopenModalComplaint) {
      reopenComplaint(reopenModalComplaint.id, reopenReason);
      setReopenModalComplaint(null);
      setReopenReason('');
      setReopenError(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Civic Grievance History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track status milestones, inspect worker resolution photos, and escalate unresolved reports.
          </p>
        </div>

        <Link to="/citizen/complaints/new">
          <Button variant="secondary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Report New Issue
          </Button>
        </Link>
      </div>

      {/* Tabs & Search Bar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records ({complaints.length})
            </button>
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === 'ACTIVE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active / In Progress
            </button>
            <button
              onClick={() => setActiveTab('RESOLVED')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === 'RESOLVED'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved & Closed
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference or title..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
          </div>

        </div>
      </Card>

      {/* Complaints Table Display */}
      {filteredComplaints.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Complaints Match</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You currently have no complaints matching the selected tab or search query.
          </p>
          <div className="pt-2">
            <Link to="/citizen/complaints/new">
              <Button variant="outline" size="sm">
                Submit a Report
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Issue Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA Window</th>
                  <th className="py-3 px-4">Reported</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    
                    {/* Reference & Category */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      <div>{c.referenceNumber}</div>
                      <div className="text-[10px] text-slate-400 font-sans font-normal mt-0.5">{c.ward}</div>
                    </td>

                    {/* Title & Observations */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">{c.title}</div>
                      <div className="text-slate-500 text-[11px] truncate mt-0.5">{c.category.name}</div>
                    </td>

                    {/* Status & Priority */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <StatusBadge status={c.status} size="sm" />
                        <PriorityBadge priority={c.priority} size="sm" />
                      </div>
                    </td>

                    {/* SLA Status */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className={`font-semibold ${
                          c.slaStatus === SlaStatus.WITHIN_SLA 
                            ? 'text-emerald-700' 
                            : c.slaStatus === SlaStatus.AT_RISK 
                            ? 'text-amber-700' 
                            : 'text-red-700'
                        }`}>
                          {c.slaStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Due: {new Date(c.slaDeadline).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Reported Date */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <Link to={`/citizen/complaints/${c.id}`}>
                        <Button variant="outline" size="sm" rightIcon={<Eye className="w-3.5 h-3.5" />}>
                          Track
                        </Button>
                      </Link>

                      {/* Reopen button for resolved issues */}
                      {c.status === ComplaintStatus.RESOLVED && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setReopenModalComplaint(c);
                            setReopenReason('');
                            setReopenError(null);
                          }}
                          leftIcon={<RotateCcw className="w-3 h-3" />}
                        >
                          Reopen
                        </Button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Reopen Modal */}
      {reopenModalComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <RotateCcw className="w-4 h-4" />
                <span>Reopen Unresolved Complaint</span>
              </div>
              <button
                onClick={() => setReopenModalComplaint(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                You are requesting to reopen <strong>{reopenModalComplaint.referenceNumber}</strong> ({reopenModalComplaint.title}).
              </p>
              <p className="text-slate-500">
                Municipal policy requires stating specifically why the work done by the field crew was defective, incomplete, or recurrent.
              </p>
            </div>

            {reopenError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                {reopenError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Citizen Justification / Defect Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="e.g. The pothole was filled with loose gravel which washed away during yesterday's rain..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReopenModalComplaint(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmReopen}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Confirm Reopening
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};
