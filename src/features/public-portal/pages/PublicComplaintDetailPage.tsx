/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * PUBLIC COMPLAINT DETAIL & TIMELINE PAGE
 * 
 * Architectural Purpose:
 * Sanitized public view of an individual complaint (/complaints/:referenceNumber).
 * Displays full milestone timeline, photographic before/after evidence, 
 * SLA compliance indicator, and community endorsement upvote.
 * 
 * Future Spring Boot Endpoint:
 * - GET /api/v1/public/complaints/{referenceNumber}
 */

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ThumbsUp, 
  ShieldCheck, 
  Building2, 
  FileText, 
  Camera, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  UserCheck
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ComplaintStatus, SlaStatus, Attachment, TimelineEntry } from '../../../types';

export const PublicComplaintDetailPage: React.FC = () => {
  const { referenceNumber } = useParams<{ referenceNumber: string }>();
  const { getComplaintByReference, toggleSupport } = useComplaints();

  // Find complaint by reference number
  const complaint = getComplaintByReference(referenceNumber || '');

  const [hasSupported, setHasSupported] = useState(complaint?.hasSupported || false);
  const [supportCount, setSupportCount] = useState(complaint?.supportCount || 0);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!complaint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Complaint Reference Not Found
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No public municipal complaint matches reference "{referenceNumber}". Please verify the number from your confirmation SMS or email.
        </p>
        <Link to="/explore">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Public Explorer
          </Button>
        </Link>
      </div>
    );
  }

  const handleSupportToggle = () => {
    if (hasSupported) {
      setSupportCount((c: number) => c - 1);
      setHasSupported(false);
    } else {
      setSupportCount((c: number) => c + 1);
      setHasSupported(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation & Share Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <Link to="/explore" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Issue Explorer</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            leftIcon={copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          >
            {copiedLink ? 'Link Copied!' : 'Share Issue'}
          </Button>

          {/* Citizen Endorse Action */}
          <Button
            variant={hasSupported ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleSupportToggle}
            leftIcon={<ThumbsUp className={`w-4 h-4 ${hasSupported ? 'fill-white' : ''}`} />}
          >
            {hasSupported ? 'Endorsed' : 'Endorse Issue'} ({supportCount})
          </Button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
          <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-mono font-semibold border border-slate-200">
            {complaint.referenceNumber}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Reported {new Date(complaint.createdAt).toLocaleDateString()}</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {complaint.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
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

      {/* Grid: 2 Cols Detail + 1 Col SLA/Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Description, Timeline, Evidence */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Issue Description Card */}
          <Card className="p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Incident Description & Citizen Observations</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {complaint.description}
            </p>
          </Card>

          {/* Photographic Evidence Gallery */}
          {complaint.attachments.length > 0 && (
            <Card className="p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Verified Photographic Evidence</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {complaint.attachments.map((att: Attachment) => (
                  <div key={att.id} className="space-y-1.5">
                    <div className="relative group overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      <img
                        src={att.fileUrl}
                        alt={att.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase text-white shadow-xs"
                        style={{
                          backgroundColor: att.stage === 'RESOLUTION' ? '#16a34a' : '#1b3b57'
                        }}
                      >
                        {att.stage === 'RESOLUTION' ? 'Resolution Verification' : 'Initial Citizen Report'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                      <span className="truncate font-mono">{att.name}</span>
                      <span>{(att.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Data-Driven Milestone Timeline */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Lifecycle Progress & Audit Timeline</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {complaint.timeline.length} Recorded Milestones
              </span>
            </div>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {complaint.timeline.map((entry: TimelineEntry, idx: number) => (
                <div key={entry.id} className="relative group">
                  {/* Timeline Dot Indicator */}
                  <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-white bg-teal-500 shadow-xs flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  {/* Milestone Card */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={entry.toStatus} size="sm" />
                        <span className="text-xs font-semibold text-slate-900">
                          {entry.actorName} ({entry.actorRole})
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
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

        {/* Right 1 Col: SLA Status, Department Card, Map Coordinate Box */}
        <div className="space-y-6">
          
          {/* SLA Performance Card */}
          <Card className="p-5 space-y-3 border-t-4 border-t-teal-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Service Level Agreement
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

            <div className="space-y-1">
              <div className="text-2xl font-black text-slate-900">
                {complaint.category.slaTargetHours} Hours
              </div>
              <div className="text-xs text-slate-500">
                Statutory resolution deadline for {complaint.category.name}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-md text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Date:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {new Date(complaint.slaDeadline).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department SLA Rate:</span>
                <span className="font-semibold text-emerald-700">94.2% On-Time</span>
              </div>
            </div>
          </Card>

          {/* Department Responsible Card */}
          <Card className="p-5 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Responsible Municipal Department
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {complaint.department.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Division Code: {complaint.department.code}
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Direct Contact:</span>
                <span className="font-medium text-slate-800">{complaint.department.contactEmail}</span>
              </div>
              <div className="flex justify-between">
                <span>Helpline:</span>
                <span className="font-medium text-slate-800">{complaint.department.phone}</span>
              </div>
              {complaint.assignedWorkerName && (
                <div className="flex justify-between pt-1 text-teal-700">
                  <span>Assigned Unit:</span>
                  <span className="font-semibold">{complaint.assignedWorkerName}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Citizen Privacy Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Sanitized Public Civic Record</span>
            </div>
            <p className="text-blue-800/80 leading-relaxed text-[11px]">
              This complaint view is sanitized according to municipal open-data laws. The citizen's private phone number and home unit remain encrypted.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
