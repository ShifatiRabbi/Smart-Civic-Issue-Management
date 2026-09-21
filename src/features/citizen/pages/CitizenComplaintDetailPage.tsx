/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * CITIZEN COMPLAINT DETAIL & PERSONAL TRACKING
 * 
 * Architectural Purpose:
 * Authenticated resident portal view for an individual grievance.
 * Displays milestone progression, field worker updates, resolution photo comparisons,
 * citizen follow-up remark form, and ticket reopening workflow.
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Send, 
  Printer, 
  RotateCcw, 
  ThumbsUp, 
  ShieldCheck, 
  Wrench,
  X,
  FileText
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ComplaintStatus, SlaStatus, Attachment, TimelineEntry } from '../../../types';

export const CitizenComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getComplaintById, reopenComplaint, addComment, toggleSupport } = useComplaints();

  const complaint = getComplaintById(id || '');

  const [commentText, setCommentText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  if (!complaint) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Complaint Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested complaint identifier does not exist or has been archived.
        </p>
        <Link to="/citizen/complaints">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to My Complaints
          </Button>
        </Link>
      </div>
    );
  }

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(complaint.id, commentText.trim());
      setCommentText('');
      setIsAddingComment(false);
    }
  };

  const handleConfirmReopen = () => {
    if (reopenReason.trim().length >= 10) {
      reopenComplaint(complaint.id, reopenReason);
      setReopenModalOpen(false);
      setReopenReason('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <Link to="/citizen/complaints" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grievance List</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-3.5 h-3.5" />}>
            Print Receipt
          </Button>

          <Button
            variant={complaint.hasSupported ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => toggleSupport(complaint.id)}
            leftIcon={<ThumbsUp className={`w-3.5 h-3.5 ${complaint.hasSupported ? 'fill-white' : ''}`} />}
          >
            {complaint.hasSupported ? 'Endorsed' : 'Endorse'} ({complaint.supportCount})
          </Button>

          {complaint.status === ComplaintStatus.RESOLVED && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setReopenModalOpen(true)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reopen Issue
            </Button>
          )}
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded text-slate-800">
              {complaint.referenceNumber}
            </span>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Logged on {new Date(complaint.createdAt).toLocaleString()}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {complaint.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-4 h-4 text-teal-600" />
            <span>{complaint.address}, {complaint.ward}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Assigned: <strong>{complaint.department.name}</strong></span>
          </div>
        </div>
      </div>

      {/* Split Grid: 2 Cols Main Details + 1 Col SLA/Dispatch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Details, Evidence, and Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Issue Observations */}
          <Card className="p-6 space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Reported Citizen Observations</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {complaint.description}
            </p>
          </Card>

          {/* Photographic Evidence Gallery */}
          {complaint.attachments.length > 0 && (
            <Card className="p-6 space-y-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Photographic Evidence</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {complaint.attachments.map((att: Attachment) => (
                  <div key={att.id} className="space-y-1.5">
                    <div className="relative group overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      <img
                        src={att.fileUrl}
                        alt={att.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase text-white shadow-xs"
                        style={{
                          backgroundColor: att.stage === 'RESOLUTION' ? '#16a34a' : '#1b3b57'
                        }}
                      >
                        {att.stage === 'RESOLUTION' ? 'Resolution Verification' : 'Submission Photo'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-mono truncate">{att.name}</span>
                      <span>{new Date(att.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Milestone Audit Timeline with Comment Form */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Municipal Milestone Timeline</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsAddingComment(!isAddingComment)}
                className="text-xs text-teal-700 font-semibold hover:underline"
              >
                {isAddingComment ? 'Cancel Note' : '+ Add Citizen Note'}
              </button>
            </div>

            {/* Optional Citizen Follow-up Remark Input */}
            {isAddingComment && (
              <form onSubmit={handlePostComment} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Citizen Follow-Up Remark / Additional Clue
                </label>
                <textarea
                  rows={2}
                  required
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="e.g. The leak worsened after heavy rain this morning..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-blue-600 bg-white"
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingComment(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" rightIcon={<Send className="w-3.5 h-3.5" />}>
                    Post Note
                  </Button>
                </div>
              </form>
            )}

            {/* Timeline Stream */}
            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {complaint.timeline.map((entry: TimelineEntry) => (
                <div key={entry.id} className="relative">
                  <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-white bg-teal-500 shadow-xs flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={entry.toStatus} size="sm" />
                        <span className="text-xs font-semibold text-slate-900">
                          {entry.actorName} ({entry.actorRole})
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>

                    {entry.notes && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                        "{entry.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Right 1 Col: SLA Status & Field Crew Card */}
        <div className="space-y-6">
          
          {/* SLA Statutory Commitment Card */}
          <Card className="p-5 space-y-3 border-t-4 border-t-teal-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Statutory SLA Target
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                complaint.slaStatus === SlaStatus.WITHIN_SLA 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : complaint.slaStatus === SlaStatus.AT_RISK 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {complaint.slaStatus.replace('_', ' ')}
              </span>
            </div>

            <div className="text-2xl font-black text-slate-900">
              {complaint.category.slaTargetHours} Hours
            </div>

            <div className="p-3 bg-slate-50 rounded text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Resolution:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {new Date(complaint.slaDeadline).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category Code:</span>
                <span className="font-mono font-semibold">{complaint.category.code}</span>
              </div>
            </div>
          </Card>

          {/* Field Dispatch Unit Card */}
          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>Assigned Field Operations Unit</span>
            </h3>

            {complaint.assignedWorkerName ? (
              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 space-y-2">
                <div className="text-xs font-bold text-slate-900">
                  {complaint.assignedWorkerName}
                </div>
                <div className="text-[11px] text-slate-600">
                  Unit: Roads & Infrastructure Field Team
                </div>
                <div className="text-[11px] text-teal-800 font-semibold flex items-center gap-1">
                  <span>Status: Active Dispatch In Progress</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Pending triage officer assignment to field crew.
              </p>
            )}

            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Department:</span>
                <span className="font-semibold text-slate-800">{complaint.department.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Helpline:</span>
                <span className="font-mono">{complaint.department.phone}</span>
              </div>
            </div>
          </Card>

          {/* Public Transparency Link */}
          <Card className="p-5 bg-slate-900 text-white space-y-3 border-none shadow-md">
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Open Civic Transparency</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              This grievance is published on the municipal open data explorer with all citizen PII sanitized.
            </p>
            <Link to={`/complaints/${complaint.referenceNumber}`} className="block">
              <Button variant="secondary" size="sm" className="w-full">
                View Public Web Page
              </Button>
            </Link>
          </Card>

        </div>

      </div>

      {/* Reopen Modal */}
      {reopenModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <RotateCcw className="w-4 h-4" />
                <span>Reopen Grievance</span>
              </div>
              <button
                onClick={() => setReopenModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please explain why the resolution was defective or unsatisfactory so the supervisor can reassign crew:
            </p>

            <textarea
              rows={3}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="State the observed issue defect..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-red-500 bg-white"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setReopenModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmReopen}>
                Reopen Ticket
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};
