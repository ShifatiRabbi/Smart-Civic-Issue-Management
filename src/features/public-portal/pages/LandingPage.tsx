/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * PUBLIC CIVIC LANDING PAGE
 * 
 * Architectural Purpose:
 * Primary public entry point presenting municipal transparency, real-time statistics,
 * reporting workflows, issue categories, and civic accountability standards.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Search, 
  PlusCircle, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  ThumbsUp, 
  FileText,
  Wrench,
  Camera,
  CheckCheck,
  TrendingUp,
  PhoneCall
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { 
  MOCK_CATEGORIES, 
  MOCK_MUNICIPAL_STATS 
} from '../../../data/mockData';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { CivicMapViewer } from '../../map/components/CivicMapViewer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { complaints } = useComplaints();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const faqs = [
    {
      q: 'How does the municipality track and assign reported issues?',
      a: 'Once submitted, a complaint is immediately time-stamped and assigned a unique Reference Number (e.g. CMP-2026-XXXX). Department triage staff verify the severity and location within 2 hours, routing it directly to the designated field worker unit with a strict Service Level Agreement (SLA) countdown timer.',
    },
    {
      q: 'Can I report a civic problem anonymously without an account?',
      a: 'Public users can browse all municipal issues, check the live map, and view resolution statistics without an account. However, to submit a complaint and receive real-time SMS/Email status milestones or reopen an issue, citizen verification is required to prevent fraudulent reports.',
    },
    {
      q: 'Is my personal citizen data visible to the public or field contractors?',
      a: 'No. All public portal views, maps, and search exports strictly sanitize Personally Identifiable Information (PII). Your name, contact number, and exact home unit are visible only to verified municipal department supervisors.',
    },
    {
      q: 'What happens if a field crew fails to resolve an issue within the SLA window?',
      a: 'The platform automatically triggers an SLA Escalation Alert to the Municipal Operations Supervisor and Department Chief. Breached issues receive heightened priority and are reviewed in weekly city accountability hearings.',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative bg-[#1b3b57] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-lg">
        {/* Subtle Civic Architectural Background Element */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,100 M100,0 L0,100" stroke="#ffffff" strokeWidth="0.3" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#0f2438] text-teal-300 border border-teal-500/30 tracking-wide uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Official Municipal Grievance & Infrastructure Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            Report Civic Problems. Track Real-Time Resolution. Build a Better City.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Directly connect with municipal departments, monitor field worker assignments, 
            and track public repairs with verified before-and-after photographic evidence.
          </p>

          {/* Search Bar Input */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-xl shadow-xl border border-slate-200">
              <div className="flex items-center gap-2 px-3 flex-1 w-full text-slate-800">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by complaint reference, road name, or category..."
                  className="w-full text-sm outline-none bg-transparent placeholder:text-slate-400"
                />
              </div>
              <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
                Search Issues
              </Button>
            </div>
          </form>

          {/* Quick Hero Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/citizen/complaints/new">
              <Button variant="secondary" size="lg" leftIcon={<PlusCircle className="w-5 h-5" />}>
                Report a Civic Problem
              </Button>
            </Link>
            <Link to="/map">
              <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/30" leftIcon={<MapPin className="w-5 h-5" />}>
                Open Live Incident Map
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Municipal Performance Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5 text-center bg-white border-slate-200 shadow-md">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1b3b57] tracking-tight">
              {MOCK_MUNICIPAL_STATS.totalReported.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Complaints Logged
            </div>
          </Card>
          <Card className="p-5 text-center bg-white border-slate-200 shadow-md">
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 tracking-tight">
              {MOCK_MUNICIPAL_STATS.resolvedThisMonth.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Resolved This Month
            </div>
          </Card>
          <Card className="p-5 text-center bg-white border-slate-200 shadow-md">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
              {MOCK_MUNICIPAL_STATS.avgResolutionHours}h
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Avg Resolution Time
            </div>
          </Card>
          <Card className="p-5 text-center bg-white border-slate-200 shadow-md">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
              {MOCK_MUNICIPAL_STATS.slaComplianceRate}%
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              SLA Compliance Rate
            </div>
          </Card>
        </div>
      </section>

      {/* How the Civic Platform Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How Municipal Resolution Works
          </h2>
          <p className="text-sm text-slate-600">
            From the moment an issue is flagged to verified photographic completion, every step is transparent and tracked.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <Card className="p-6 relative border-t-4 border-t-teal-500">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h3 className="font-semibold text-slate-900 text-base mb-1.5 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-teal-600" />
              <span>Report with GPS</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizens submit details, upload photos, and pin the exact municipal ward coordinates via the 6-step wizard.
            </p>
          </Card>

          {/* Step 2 */}
          <Card className="p-6 relative border-t-4 border-t-blue-500">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h3 className="font-semibold text-slate-900 text-base mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Staff Triage</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Department officers verify validity, detect duplicates, set priority level, and initiate the SLA countdown.
            </p>
          </Card>

          {/* Step 3 */}
          <Card className="p-6 relative border-t-4 border-t-amber-500">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm mb-4">
              03
            </div>
            <h3 className="font-semibold text-slate-900 text-base mb-1.5 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>Field Dispatch</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Field crews receive the work order on their mobile terminal, proceed to the location, and begin on-site repairs.
            </p>
          </Card>

          {/* Step 4 */}
          <Card className="p-6 relative border-t-4 border-t-emerald-500">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm mb-4">
              04
            </div>
            <h3 className="font-semibold text-slate-900 text-base mb-1.5 flex items-center gap-1.5">
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Closure</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Crews upload resolution evidence photos. The citizen is notified and can endorse the work or request a review.
            </p>
          </Card>
        </div>
      </section>

      {/* Municipal Categories & SLA Commitments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Grievance Categories & SLA Windows
            </h2>
            <p className="text-xs text-slate-600">
              Each civic category is bound by a legally mandated maximum response and resolution timeframe.
            </p>
          </div>
          <Link to="/explore" className="text-xs font-semibold text-[#1b3b57] hover:underline inline-flex items-center gap-1">
            <span>Browse All Categories</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_CATEGORIES.map((cat) => (
            <Card key={cat.id} variant="interactive" className="p-5 flex flex-col justify-between" onClick={() => navigate(`/explore?category=${cat.code}`)}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    {cat.code}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    <Clock className="w-3 h-3" />
                    <span>{cat.slaTargetHours}h SLA</span>
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Administered by: <strong>{cat.departmentName}</strong>
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-teal-700 font-semibold hover:underline">
                  File in this category →
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Interactive Map Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 mb-1">
              <MapPin className="w-4 h-4" />
              <span>GEOGRAPHIC INFORMATION SYSTEM (GIS)</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Live Civic Incident Map
            </h2>
            <p className="text-xs text-slate-600">
              Interactive municipal map displaying open and resolved incidents across city wards.
            </p>
          </div>
          <Link to="/map">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open Fullscreen Map View
            </Button>
          </Link>
        </div>

        <CivicMapViewer complaints={complaints} height="420px" />
      </section>

      {/* Recent Public Civic Issues */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Recent Verified Public Issues
            </h2>
            <p className="text-xs text-slate-600">
              Latest municipal incidents submitted by residents and validated by triage desks.
            </p>
          </div>
          <Link to="/explore">
            <Button variant="outline" size="sm">
              View All Complaints
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.slice(0, 3).map((complaint) => (
            <Card key={complaint.id} variant="interactive" className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <StatusBadge status={complaint.status} size="sm" />
                  <PriorityBadge priority={complaint.priority} size="sm" />
                </div>

                <div className="text-[11px] font-mono text-slate-400 mb-1 font-semibold">
                  {complaint.referenceNumber}
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 mb-2">
                  {complaint.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {complaint.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[180px] font-medium">{complaint.ward}</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <ThumbsUp className="w-3 h-3 text-teal-600" />
                    {complaint.supportCount}
                  </span>
                </div>

                <Link to={`/complaints/${complaint.referenceNumber}`} className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    Inspect Timeline & Progress
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions (Accordion) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-600">
            Answers regarding transparency, turnaround times, and civic accountability standards.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-left p-4 flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 hover:bg-slate-50 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Civic Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1b3b57] text-white rounded-2xl p-8 sm:p-12 shadow-lg border border-[#0f2438] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Notice an Issue in Your Neighborhood?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Help city crews respond faster. Snap a photo, drop a pin, and keep your community safe, clean, and functioning.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to="/citizen/complaints/new">
              <Button variant="secondary" size="lg" leftIcon={<PlusCircle className="w-5 h-5" />}>
                Submit a Report Now
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                Register Citizen Profile
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
