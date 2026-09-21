/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * FIELD WORKER WORK ORDER EXECUTION TERMINAL
 * 
 * Architectural Purpose:
 * In-depth mobile terminal for the field crew actively executing an assignment.
 * Features live navigation telemetry, status progression, resolution photo upload,
 * materials accounting, and official signoff.
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Navigation, 
  CheckCircle2, 
  Wrench, 
  Camera, 
  Upload, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  PhoneCall, 
  CheckSquare, 
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { useAuth } from '../../auth/context/AuthContext';
import { ComplaintStatus, PriorityLevel, SlaStatus } from '../../../types';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

// Preset realistic municipal resolution photos for quick simulation
const PRESET_RESOLUTION_PHOTOS = [
  {
    label: 'Road/Asphalt Repaved & Compacted',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
    description: 'Hot asphalt tamped, leveled with road surface, and painted with retroreflective curb paint.',
  },
  {
    label: 'Manhole / Culvert Lid Secured',
    url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    description: 'Cast iron frame seated on mortar bed, heavy grating secured with anti-theft locking bolts.',
  },
  {
    label: 'Sanitation / Debris Cleared & Sanitized',
    url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    description: '4.2 metric tons of refuse removed by compactor crew; site power-washed and lime powder sanitized.',
  },
  {
    label: 'Streetlight Luminaire Replaced & Tested',
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    description: '120W LED fixture hoisted, transformer tested at 220V, photocell sensor validated.',
  },
];

export const WorkerWorkOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    complaints, 
    startJobRoute, 
    markArrivedOnSite, 
    submitResolutionProof 
  } = useComplaints();

  const complaint = complaints.find((c) => c.id === id);

  // Form states for resolution
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(PRESET_RESOLUTION_PHOTOS[0].url);
  const [selectedPresetLabel, setSelectedPresetLabel] = useState(PRESET_RESOLUTION_PHOTOS[0].label);
  const [materialsUsed, setMaterialsUsed] = useState('Cold mix asphalt (60kg), Tack coat emulsion, 4x reflective curb markers');
  const [safetySignoff, setSafetySignoff] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (!complaint) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Work Order Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested work order #{id} could not be located in your dispatch queue.
        </p>
        <Link to="/worker/assignments">
          <Button variant="outline" size="sm">Back to Assigned Orders</Button>
        </Link>
      </div>
    );
  }

  const beforeAttachments = complaint.attachments.filter((a) => a.stage === 'SUBMISSION' || !a.stage);
  const resolutionAttachments = complaint.attachments.filter((a) => a.stage === 'RESOLUTION');

  const handleStartRoute = () => {
    startJobRoute(complaint.id);
  };

  const handleArrived = () => {
    markArrivedOnSite(complaint.id);
  };

  const handleResolutionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetySignoff) return;

    setIsSubmitting(true);
    setTimeout(() => {
      submitResolutionProof({
        complaintId: complaint.id,
        notes: resolutionNotes || `Field repairs executed according to municipal standard. Verified by ${user?.fullName || 'Crew Lead'}.`,
        photoUrl: selectedPhotoUrl,
        photoName: `${selectedPresetLabel.toLowerCase().replace(/\s+/g, '_')}_verified.jpg`,
        materials: materialsUsed,
      });
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Status Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/worker/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Work Orders Queue
        </Link>

        <div className="flex items-center gap-2">
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {complaint.referenceNumber}
            </span>
            <span className="text-xs text-slate-500 ml-2">
              Assigned to: <strong className="text-slate-700">{complaint.assignedWorkerName || user?.fullName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Target: {new Date(complaint.slaDeadline).toLocaleDateString()} {new Date(complaint.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {complaint.title}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {complaint.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-600 pt-2 flex-wrap border-t border-slate-100">
          <span className="flex items-center gap-1 font-medium text-slate-800">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            {complaint.address} ({complaint.ward})
          </span>
          <span className="text-slate-300">•</span>
          <span>Department: <strong>{complaint.department.name}</strong></span>
          <span className="text-slate-300">•</span>
          <span>Citizen: <strong>{complaint.citizenName || 'Resident'}</strong></span>
        </div>
      </div>

      {/* Field Dispatch Lifecycle Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="space-y-1">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto font-bold text-xs">
              ✓
            </div>
            <span className="font-semibold text-slate-800 block text-[11px] sm:text-xs">1. Dispatched</span>
          </div>

          <div className="space-y-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto font-bold text-xs ${
              complaint.status === ComplaintStatus.IN_PROGRESS || complaint.status === ComplaintStatus.RESOLVED || complaint.status === ComplaintStatus.CLOSED
                ? 'bg-emerald-600 text-white'
                : 'bg-teal-600 text-white ring-4 ring-teal-100'
            }`}>
              {complaint.status === ComplaintStatus.IN_PROGRESS || complaint.status === ComplaintStatus.RESOLVED ? '✓' : '2'}
            </div>
            <span className="font-semibold text-slate-800 block text-[11px] sm:text-xs">2. En Route</span>
          </div>

          <div className="space-y-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto font-bold text-xs ${
              complaint.status === ComplaintStatus.RESOLVED || complaint.status === ComplaintStatus.CLOSED
                ? 'bg-emerald-600 text-white'
                : complaint.status === ComplaintStatus.IN_PROGRESS
                ? 'bg-amber-600 text-white ring-4 ring-amber-100 animate-pulse'
                : 'bg-slate-200 text-slate-500'
            }`}>
              {complaint.status === ComplaintStatus.RESOLVED ? '✓' : '3'}
            </div>
            <span className="font-semibold text-slate-800 block text-[11px] sm:text-xs">3. On Site Work</span>
          </div>

          <div className="space-y-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto font-bold text-xs ${
              complaint.status === ComplaintStatus.RESOLVED || complaint.status === ComplaintStatus.CLOSED
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-500'
            }`}>
              {complaint.status === ComplaintStatus.RESOLVED ? '✓' : '4'}
            </div>
            <span className="font-semibold text-slate-800 block text-[11px] sm:text-xs">4. Proof & Closed</span>
          </div>
        </div>
      </div>

      {/* Transit Control Bar (If not yet in progress) */}
      {complaint.status === ComplaintStatus.ASSIGNED && (
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-teal-700 animate-bounce" />
            <h3 className="font-bold text-teal-900 text-sm sm:text-base">
              Vehicle Transit Operations
            </h3>
          </div>
          <p className="text-xs text-teal-800">
            Signal the central triage desk and update citizen tracking status as your truck departs the municipal depot:
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <Button
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs justify-center"
              onClick={handleStartRoute}
            >
              <Navigation className="w-3.5 h-3.5 mr-1.5" />
              Log "En Route to Site" (Notify Citizen)
            </Button>
            <Button
              variant="outline"
              className="border-teal-300 text-teal-800 hover:bg-teal-100 text-xs justify-center"
              onClick={handleArrived}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Confirm "Arrived on Site" (Start Repair)
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid: Incident Details vs Execution & Evidence Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Citizen Evidence & Location Pin */}
        <div className="space-y-4">
          <Card className="p-5 bg-white border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-teal-700" />
              Citizen Reported Evidence (Before Condition)
            </h3>

            {beforeAttachments.length > 0 ? (
              <div className="space-y-2">
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video">
                  <img
                    src={beforeAttachments[0].fileUrl}
                    alt="Citizen damage evidence"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[11px] px-2 py-0.5 rounded font-mono">
                    Initial Report Submission
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>File: {beforeAttachments[0].name}</span>
                  <span>Uploaded: {new Date(beforeAttachments[0].uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                No initial photographs attached by citizen.
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="font-semibold text-slate-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Dispatch Location:
              </div>
              <div className="text-slate-600 pl-4.5">{complaint.address}</div>
              <div className="text-slate-500 pl-4.5 font-mono text-[11px]">
                Coordinates: {complaint.coordinates.latitude.toFixed(4)}° N, {complaint.coordinates.longitude.toFixed(4)}° E
              </div>
            </div>
          </Card>

          {/* Citizen Contact Card */}
          <Card className="p-4 bg-white border border-slate-200 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-slate-600" />
              Citizen Contact Information
            </h3>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Reported By:</span>
              <strong className="text-slate-800">{complaint.citizenName || 'Verified Resident'}</strong>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Contact Phone:</span>
              <span className="font-mono text-slate-700">+1 (555) 234-8901</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Field crew may contact resident only if exact obstruction location is inaccessible or gated.
            </p>
          </Card>
        </div>

        {/* Right Column: Work Execution Terminal & Resolution Proof Submission */}
        <div className="space-y-4">
          {complaint.status === ComplaintStatus.RESOLVED || complaint.status === ComplaintStatus.CLOSED ? (
            /* Already Resolved View */
            <Card className="p-5 bg-white border-2 border-emerald-500 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold text-base text-emerald-900">Work Order Resolved</h3>
              </div>
              <p className="text-xs text-slate-600">
                Resolution proof has been certified and submitted to the department triage log and citizen portal.
              </p>

              {resolutionAttachments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700">Certified After-Work Photograph:</span>
                  <div className="relative rounded-lg overflow-hidden border border-emerald-200 bg-slate-100 aspect-video">
                    <img
                      src={resolutionAttachments[0].fileUrl}
                      alt="Work resolution completion evidence"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-emerald-800 text-white text-[11px] px-2 py-0.5 rounded font-mono font-bold">
                      VERIFIED REPAIR
                    </div>
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-600 space-y-1 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">
                <div className="font-semibold text-emerald-900">Resolution Log Entry:</div>
                <p className="text-slate-700">
                  {complaint.timeline.find((t) => t.toStatus === ComplaintStatus.RESOLVED)?.notes || 'Work completed to standard.'}
                </p>
              </div>
            </Card>
          ) : (
            /* Interactive Resolution Proof Form */
            <Card className="p-5 bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-teal-700" />
                  Work Order Completion & Proof Submission
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload certified after-repair photographic proof to close this work order.
                </p>
              </div>

              <form onSubmit={handleResolutionSubmit} className="space-y-4">
                
                {/* Photo Preset Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>1. Certified "After Repair" Photographic Evidence:</span>
                    <span className="text-[11px] text-teal-700 font-normal">Select Simulation Preset</span>
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_RESOLUTION_PHOTOS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setSelectedPhotoUrl(preset.url);
                          setSelectedPresetLabel(preset.label);
                          if (!resolutionNotes) {
                            setResolutionNotes(preset.description);
                          }
                        }}
                        className={`p-2 rounded-lg border text-left text-xs transition-all ${
                          selectedPhotoUrl === preset.url
                            ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-600/20'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                        }`}
                      >
                        <div className="font-semibold text-slate-900 truncate">{preset.label}</div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">Municipal Crew Verified</div>
                      </button>
                    ))}
                  </div>

                  {/* Selected Photo Preview */}
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video mt-2">
                    <img
                      src={selectedPhotoUrl}
                      alt="Selected resolution proof preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-teal-700 text-white text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                      Proof Preview Ready
                    </div>
                  </div>
                </div>

                {/* Materials Used Log */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    2. Materials & Equipment Consumed:
                  </label>
                  <input
                    type="text"
                    value={materialsUsed}
                    onChange={(e) => setMaterialsUsed(e.target.value)}
                    placeholder="e.g. 2 bags asphalt cold mix, compactor, warning tape..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 text-slate-800"
                  />
                </div>

                {/* Work Description Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    3. Work Performed Notes & Technical Log:
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe specific actions taken to remedy the complaint..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 text-slate-800"
                    required
                  />
                </div>

                {/* Safety & Quality Signoff Checkbox */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={safetySignoff}
                      onChange={(e) => setSafetySignoff(e.target.checked)}
                      className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 w-4 h-4 shrink-0"
                    />
                    <span>
                      I certify under municipal field code that this site has been inspected, repaired according to engineering safety norms, and is safe for public access.
                    </span>
                  </label>
                </div>

                {/* Submit Action Button */}
                <Button
                  type="submit"
                  disabled={!safetySignoff || isSubmitting}
                  className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Verifying & Submitting Proof...' : 'Submit Certified Resolution Proof'}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Work Order Resolved</h3>
            <p className="text-xs text-slate-600">
              Evidence has been appended to the municipal audit ledger. The reporting citizen and dispatch supervisor have received immediate resolution notification.
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                className="w-full justify-center bg-teal-700 hover:bg-teal-800 text-white text-xs"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/worker/assignments');
                }}
              >
                Return to Orders Queue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
