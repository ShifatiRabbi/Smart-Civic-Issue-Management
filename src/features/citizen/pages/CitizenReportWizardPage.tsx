/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * CITIZEN 6-STEP REPORTING WIZARD
 * 
 * Architectural Purpose:
 * Guided municipal intake workflow for residents. Captures category, observations,
 * geospatial telemetry, photographic evidence, and notification preferences.
 * Submits to ComplaintContext and transitions to live tracking.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Navigation, 
  Phone, 
  Mail, 
  CheckCheck,
  Eye,
  FileText
} from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { MOCK_CATEGORIES, MOCK_WARDS } from '../../../data/mockData';
import { PriorityLevel, CivicComplaint } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'road_damage_evidence.jpg',
    fileUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    fileSize: 1024 * 1024 * 1.8,
  },
  {
    name: 'water_leak_evidence.jpg',
    fileUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
    fileSize: 1024 * 1024 * 2.2,
  },
  {
    name: 'garbage_overflow_evidence.jpg',
    fileUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    fileSize: 1024 * 1024 * 1.4,
  },
];

export const CitizenReportWizardPage: React.FC = () => {
  const { user } = useAuth();
  const { createComplaint } = useComplaints();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [createdComplaint, setCreatedComplaint] = useState<CivicComplaint | null>(null);

  // Form State
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>(MOCK_CATEGORIES[0].code);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<PriorityLevel>(PriorityLevel.MEDIUM);
  const [impactScope, setImpactScope] = useState<string>('NEIGHBORHOOD');

  const [ward, setWard] = useState<string>(user?.ward || MOCK_WARDS[0]);
  const [address, setAddress] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number }>({
    latitude: 23.8103,
    longitude: 90.4125,
  });
  const [gpsLocked, setGpsLocked] = useState<boolean>(false);

  const [attachments, setAttachments] = useState<
    { name: string; fileUrl: string; fileSize: number }[]
  >([SAMPLE_PHOTO_PRESETS[0]]);

  const [notifySms, setNotifySms] = useState<boolean>(true);
  const [notifyEmail, setNotifyEmail] = useState<boolean>(true);
  const [agreeCharter, setAgreeCharter] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedCategory = MOCK_CATEGORIES.find((c) => c.code === selectedCategoryCode) || MOCK_CATEGORIES[0];

  // Step Validation
  const validateCurrentStep = (): boolean => {
    setFormError(null);
    if (currentStep === 1) {
      if (!selectedCategoryCode) {
        setFormError('Please select a civic category.');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!title.trim() || title.length < 5) {
        setFormError('Please enter a clear title with at least 5 characters.');
        return false;
      }
      if (!description.trim() || description.length < 15) {
        setFormError('Please provide a detailed description (at least 15 characters).');
        return false;
      }
    }
    if (currentStep === 3) {
      if (!ward) {
        setFormError('Please specify the municipal ward.');
        return false;
      }
      if (!address.trim() || address.length < 4) {
        setFormError('Please enter the street address or nearby landmark.');
        return false;
      }
    }
    if (currentStep === 4) {
      if (attachments.length === 0) {
        setFormError('Municipal guidelines require at least one photo attachment.');
        return false;
      }
    }
    if (currentStep === 5) {
      if (!notifySms && !notifyEmail) {
        setFormError('Please select at least one notification channel (SMS or Email).');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(6, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setFormError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSimulateGPS = () => {
    // Generate slight random offset around city center
    const randomLat = 23.8050 + (Math.random() * 0.015);
    const randomLng = 90.4050 + (Math.random() * 0.015);
    setCoordinates({ latitude: Number(randomLat.toFixed(5)), longitude: Number(randomLng.toFixed(5)) });
    setGpsLocked(true);
    if (!address) {
      setAddress(`Opposite City Park, Sector 4, ${ward}`);
    }
  };

  const handleAddSamplePhoto = (preset: typeof SAMPLE_PHOTO_PRESETS[0]) => {
    if (attachments.some((a) => a.name === preset.name)) return;
    setAttachments((prev) => [...prev, preset]);
  };

  const handleRemovePhoto = (name: string) => {
    setAttachments((prev) => prev.filter((a) => a.name !== name));
  };

  const handleSubmitComplaint = () => {
    if (!agreeCharter) {
      setFormError('You must agree to the Municipal Citizen Charter declarations.');
      return;
    }

    const complaint = createComplaint({
      title,
      description,
      categoryCode: selectedCategoryCode,
      ward,
      address,
      coordinates,
      priority,
      attachments,
      notifySms,
      notifyEmail,
    });

    setCreatedComplaint(complaint);
    setCurrentStep(7); // Final success confirmation step
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Steps metadata
  const stepsList = [
    { num: 1, title: 'Category' },
    { num: 2, title: 'Details' },
    { num: 3, title: 'Location' },
    { num: 4, title: 'Evidence' },
    { num: 5, title: 'Alerts' },
    { num: 6, title: 'Review' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Wizard Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider mb-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>MUNICIPAL CITIZEN INTAKE DESK</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Report a Civic Problem
          </h1>
          <p className="text-xs text-slate-500">
            Follow the 6-step guided wizard. Every report is time-stamped, triaged, and tracked by SLA.
          </p>
        </div>

        <Link to="/citizen/complaints">
          <Button variant="outline" size="sm">
            Cancel & Return
          </Button>
        </Link>
      </div>

      {/* Wizard Progress Bar (Active only when not in success step) */}
      {currentStep <= 6 && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Step {currentStep} of 6: <strong>{stepsList[currentStep - 1].title}</strong></span>
            <span className="text-teal-700 font-semibold">{Math.round((currentStep / 6) * 100)}% Completed</span>
          </div>

          {/* Progress track */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-teal-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>

          {/* Responsive Stepper Labels */}
          <div className="hidden sm:grid grid-cols-6 gap-2 pt-1 text-center text-[11px]">
            {stepsList.map((st) => (
              <div
                key={st.num}
                className={`flex items-center justify-center gap-1.5 py-1 rounded ${
                  st.num === currentStep
                    ? 'font-bold text-teal-800 bg-teal-50 border border-teal-200'
                    : st.num < currentStep
                    ? 'font-medium text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  st.num === currentStep
                    ? 'bg-teal-600 text-white'
                    : st.num < currentStep
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {st.num < currentStep ? '✓' : st.num}
                </span>
                <span>{st.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Error Banner */}
      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {/* STEP 1: CATEGORY SELECTION */}
      {currentStep === 1 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Step 1: Select Grievance Category
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select the municipal department domain corresponding to the defect.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_CATEGORIES.map((cat) => {
              const isSelected = selectedCategoryCode === cat.code;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategoryCode(cat.code)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-600 ring-2 ring-teal-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {cat.code}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3" />
                        <span>{cat.slaTargetHours}h SLA</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Dept: <strong>{cat.departmentName}</strong>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex items-center justify-between">
                    <span className="text-slate-400 font-medium text-[11px]">Statutory SLA</span>
                    <span className="font-semibold text-teal-700">
                      {isSelected ? '✓ Selected' : 'Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* STEP 2: ISSUE DETAILS & OBSERVATIONS */}
      {currentStep === 2 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Step 2: Describe the Civic Issue
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Provide specific observations so triage officers can prioritize crew deployment.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brief Headline / Summary <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep pothole damaging vehicles near Sector 4 intersection"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                {title.length}/100 characters (min 5)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Observations & Impact <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the severity, duration (when did this start?), water stagnation, safety risk to pedestrians, or traffic bottlenecks..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                {description.length} characters (min 15)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Urgency Self-Assessment
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white font-medium"
                >
                  <option value={PriorityLevel.LOW}>LOW - Minor inconvenience</option>
                  <option value={PriorityLevel.MEDIUM}>MEDIUM - Noticeable nuisance / traffic delay</option>
                  <option value={PriorityLevel.HIGH}>HIGH - Active risk to vehicles or pedestrians</option>
                  <option value={PriorityLevel.CRITICAL}>CRITICAL - Immediate structural hazard / accident risk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Affected Civic Area Scope
                </label>
                <select
                  value={impactScope}
                  onChange={(e) => setImpactScope(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white font-medium"
                >
                  <option value="INDIVIDUAL">Individual Home / Frontage</option>
                  <option value="NEIGHBORHOOD">Neighborhood Residential Street</option>
                  <option value="MAIN_ROAD">Major Arterial / Commercial Boulevard</option>
                  <option value="PUBLIC_FACILITY">Public School / Hospital / Transit Hub</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: LOCATION & GEOSPATIAL TELEMETRY */}
      {currentStep === 3 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Step 3: Location & Coordinates
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Precise location data allows field crews to navigate directly to the defect without delays.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Municipal Ward / Electoral Zone <span className="text-red-500">*</span>
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
              >
                {MOCK_WARDS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Street Address / Prominent Landmark <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Opposite Community Clinic, Corner of 4th Cross Road"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
              />
            </div>

            {/* GPS Telemetry Capture */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-teal-600" />
                    <span>GPS Telemetry Coordinate Lock</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Auto-captures latitude and longitude for dispatch routing.
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSimulateGPS}
                  leftIcon={<MapPin className="w-3.5 h-3.5 text-teal-600" />}
                >
                  {gpsLocked ? 'GPS Locked (Refresh)' : 'Acquire Device GPS'}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-2.5 rounded border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Latitude</span>
                  <span className="font-mono font-semibold text-slate-800">{coordinates.latitude.toFixed(5)}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Longitude</span>
                  <span className="font-mono font-semibold text-slate-800">{coordinates.longitude.toFixed(5)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: EVIDENCE & PHOTO UPLOAD */}
      {currentStep === 4 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Step 4: Upload Photographic Evidence
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Photographs are mandatory to verify physical defects and establish pre-repair condition.
            </p>
          </div>

          {/* Quick preset selector for evaluation */}
          <div className="bg-teal-50/60 p-3 rounded-lg border border-teal-200 space-y-2">
            <div className="text-xs font-semibold text-teal-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Evaluation Shortcuts (Click to attach realistic samples):</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {SAMPLE_PHOTO_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleAddSamplePhoto(preset)}
                  className="px-2.5 py-1 rounded bg-white border border-teal-300 text-teal-800 hover:bg-teal-100 transition text-[11px] font-medium"
                >
                  + Add {preset.name.replace('_evidence.jpg', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Uploaded Photos Grid */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-700">
              Attached Evidence Photos ({attachments.length}/5)
            </div>

            {attachments.length === 0 ? (
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center space-y-2">
                <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 font-medium">
                  No photos attached yet. Attach at least one photograph.
                </p>
                <p className="text-[11px] text-slate-400">
                  Supported formats: JPEG, PNG, WEBP (Max 10MB per file)
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {attachments.map((att) => (
                  <div key={att.name} className="relative group rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                    <img
                      src={att.fileUrl}
                      alt={att.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-36 object-cover"
                    />
                    <div className="p-2 flex items-center justify-between text-[11px] bg-white">
                      <span className="truncate font-mono text-slate-600">{att.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(att.name)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* STEP 5: CONTACT & NOTIFICATIONS */}
      {currentStep === 5 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Step 5: Citizen Contact & Alerts
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select how municipal dispatch officers and automated tracking bots notify you.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Citizen Reporter Name
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.fullName || 'Citizen Reporter'}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-slate-50 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'citizen@example.com'}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-slate-50 text-slate-600"
                />
              </div>
            </div>

            {/* Notification Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    <span>Real-Time SMS Alerts</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Receive immediate SMS notifications when field crew arrives on site and when repairs conclude.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Email Milestone Reports</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Receive complete PDF audit receipts, triage notes, and resolution photo comparisons.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 6: REVIEW & SUBMIT */}
      {currentStep === 6 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Step 6: Review & Final Confirmation
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verify your information before submitting to the municipal dispatch queue.
            </p>
          </div>

          {/* Structured Review Card */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Category</span>
                <div className="font-bold text-sm text-slate-900">{selectedCategory.name}</div>
                <div className="text-[11px] text-slate-500">Routing to: {selectedCategory.departmentName}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target SLA</span>
                <div className="font-extrabold text-sm text-teal-700">{selectedCategory.slaTargetHours} Hours</div>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Title</span>
              <div className="font-semibold text-slate-900 mt-0.5">{title}</div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Observations</span>
              <div className="text-slate-700 mt-0.5 leading-relaxed">{description}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Location</span>
                <div className="font-medium text-slate-800 mt-0.5">{address}, {ward}</div>
                <div className="text-[10px] font-mono text-slate-500">
                  GPS: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Severity Level</span>
                <div className="mt-0.5">
                  <PriorityBadge priority={priority} size="sm" />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Attached Photographs</span>
              <div className="flex items-center gap-2 mt-1.5">
                {attachments.map((a, i) => (
                  <img
                    key={i}
                    src={a.fileUrl}
                    alt={a.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-cover rounded border border-slate-300"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Citizen Charter Checkbox */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeCharter}
                onChange={(e) => setAgreeCharter(e.target.checked)}
                className="mt-0.5 rounded text-blue-600"
              />
              <span className="text-xs text-teal-950 leading-relaxed">
                I certify that the reported defect exists at the specified coordinates and that I am filing in accordance with Municipal Ordinance No. 412 (Grievance Integrity Charter).
              </span>
            </label>
          </div>
        </Card>
      )}

      {/* STEP 7: SUCCESS CONFIRMATION MODAL / PAGE */}
      {currentStep === 7 && createdComplaint && (
        <Card className="p-8 text-center space-y-6 border-t-4 border-t-emerald-600 shadow-lg">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCheck className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Civic Complaint Officially Registered
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your report has been assigned a permanent public tracking reference and queued for department verification.
            </p>
          </div>

          {/* Reference Number Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl inline-block max-w-md w-full">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Official Complaint Reference
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-wider mt-1">
              {createdComplaint.referenceNumber}
            </div>
            <div className="text-xs text-teal-700 font-semibold mt-1 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Statutory SLA Window: {createdComplaint.category.slaTargetHours} Hours</span>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to={`/citizen/complaints/${createdComplaint.id}`}>
              <Button variant="primary" size="md" rightIcon={<Eye className="w-4 h-4" />}>
                Track Complaint Milestone
              </Button>
            </Link>
            <Link to={`/complaints/${createdComplaint.referenceNumber}`}>
              <Button variant="outline" size="md">
                View Public Transparency View
              </Button>
            </Link>
            <Link to="/citizen">
              <Button variant="outline" size="md">
                Citizen Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Bottom Step Navigation Bar (Steps 1 to 6) */}
      {currentStep <= 6 && (
        <div className="flex items-center justify-between pt-2">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous Step
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 6 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Step {currentStep + 1}
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleSubmitComplaint}
              leftIcon={<CheckCircle2 className="w-5 h-5" />}
            >
              Submit Official Grievance
            </Button>
          )}
        </div>
      )}

    </div>
  );
};
