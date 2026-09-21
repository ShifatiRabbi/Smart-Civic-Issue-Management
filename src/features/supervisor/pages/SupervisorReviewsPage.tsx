/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * SUPERVISOR RESOLUTION SIGN-OFFS
 * 
 * Architectural Purpose:
 * Quality assurance gate where field crew resolution photographic evidence
 * and completion notes are audited before permanent ticket closure.
 */

import React, { useState } from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Camera, 
  Building2, 
  User, 
  Clock, 
  ArrowRight,
  FileText
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { ComplaintStatus, PriorityLevel } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export const SupervisorReviewsPage: React.FC = () => {
  const { complaints, supervisorApproveResolution, supervisorRejectResolution } = useComplaints();

  // Dialog state
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [auditNotes, setAuditNotes] = useState('');

  // Resolved complaints awaiting audit sign-off
  const reviewQueue = complaints.filter(c => c.status === ComplaintStatus.RESOLVED);

  const handleProcessSignoff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintId) return;

    if (actionType === 'APPROVE') {
      supervisorApproveResolution(selectedComplaintId, auditNotes || 'Resolution certified and signed off.');
    } else {
      supervisorRejectResolution(selectedComplaintId, auditNotes || 'Remediation rejected. Crew ordered to rework.');
    }

    setSelectedComplaintId(null);
    setAuditNotes('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4 text-teal-600" />
            <span>Quality Audit & Assurance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resolution Sign-Offs</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit field worker photographic proof, verify remediation standards, and grant final municipal closure.
          </p>
        </div>

        <div className="bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-xs text-teal-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>{reviewQueue.length} jobs awaiting supervisory sign-off</span>
        </div>
      </div>

      {/* Review Queue Grid */}
      {reviewQueue.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">All Resolutions Audited</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            There are currently no resolved work orders waiting for supervisor certification. Completed field jobs will automatically appear here.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviewQueue.map((complaint) => {
            const initialPhoto = complaint.attachments.find(a => a.stage === 'SUBMISSION');
            const resolutionPhoto = complaint.attachments.find(a => a.stage === 'RESOLUTION');
            const latestTimeline = complaint.timeline[complaint.timeline.length - 1];

            return (
              <Card key={complaint.id} className="p-5 flex flex-col justify-between space-y-4 shadow-sm border border-slate-200">
                <div className="space-y-3">
                  {/* Top Meta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {complaint.referenceNumber}
                      </span>
                      <PriorityBadge priority={complaint.priority} size="sm" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      RESOLVED • PENDING AUDIT
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{complaint.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{complaint.ward} • {complaint.address}</p>
                  </div>

                  {/* Worker & Timeline Info */}
                  <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-500">Field Unit:</span>
                      <span className="font-semibold text-slate-900">{complaint.assignedWorkerName || 'Field Unit'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-500">Department:</span>
                      <span className="text-slate-800">{complaint.department.name}</span>
                    </div>
                    {latestTimeline?.notes && (
                      <div className="pt-1 mt-1 border-t border-slate-200 text-slate-600 italic">
                        "{latestTimeline.notes}"
                      </div>
                    )}
                  </div>

                  {/* Photographic Proof Comparison (Before vs After) */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-700 block">Photographic Inspection</span>
                    <div className="grid grid-cols-2 gap-2">
                      
                      {/* Before Photo */}
                      <div className="rounded border border-slate-200 p-2 bg-slate-50 text-center">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Citizen Submission</span>
                        {initialPhoto?.fileUrl ? (
                          <img 
                            src={initialPhoto.fileUrl} 
                            alt="Original citizen report" 
                            className="w-full h-28 object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-28 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs">
                            No Photo
                          </div>
                        )}
                      </div>

                      {/* After Photo */}
                      <div className="rounded border border-emerald-200 p-2 bg-emerald-50/40 text-center">
                        <span className="text-[10px] font-bold text-emerald-700 block uppercase mb-1">Field Remediation</span>
                        {resolutionPhoto?.fileUrl ? (
                          <img 
                            src={resolutionPhoto.fileUrl} 
                            alt="Worker resolution proof" 
                            className="w-full h-28 object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-28 bg-emerald-100/50 rounded flex items-center justify-center text-emerald-600 text-xs">
                            Proof on File
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Audit Actions Bar */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedComplaintId(complaint.id);
                      setActionType('REJECT');
                    }}
                    className="text-xs text-amber-700 hover:bg-amber-50"
                  >
                    Reject & Rework
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedComplaintId(complaint.id);
                      setActionType('APPROVE');
                    }}
                    className="text-xs"
                  >
                    Certify & Close
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selectedComplaintId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {actionType === 'APPROVE' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <h3 className="text-base font-bold text-slate-900">
                  {actionType === 'APPROVE' ? 'Supervisor Sign-Off & Closure' : 'Reject Resolution & Order Rework'}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedComplaintId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessSignoff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {actionType === 'APPROVE' ? 'Certification Audit Remarks' : 'Rework Directive (Sent to Field Crew) *'}
                </label>
                <textarea
                  rows={3}
                  required={actionType === 'REJECT'}
                  placeholder={
                    actionType === 'APPROVE'
                      ? 'Confirming photographic evidence passes municipal technical quality benchmarks.'
                      : 'Specify what remains deficient (e.g. edge not asphalt sealed, excess debris uncollected).'
                  }
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
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
                <Button 
                  type="submit" 
                  variant={actionType === 'APPROVE' ? 'secondary' : 'danger'}
                >
                  {actionType === 'APPROVE' ? 'Authorize Final Closure' : 'Dispatch Rework Order'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
};
