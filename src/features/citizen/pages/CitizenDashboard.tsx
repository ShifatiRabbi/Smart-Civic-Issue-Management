/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * CITIZEN DASHBOARD HOME
 * 
 * Architectural Purpose:
 * Primary landing overview for logged-in citizens.
 * Displays resident metric KPIs, active work orders, recent notification feed,
 * and quick-action access to the 6-step reporting wizard.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  PlusCircle, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Bell, 
  MapPin, 
  RotateCcw,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { ComplaintStatus, SlaStatus } from '../../../types';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const { complaints, notifications } = useComplaints();

  const totalSubmitted = complaints.length;
  const activeCount = complaints.filter(
    (c) =>
      c.status === ComplaintStatus.SUBMITTED ||
      c.status === ComplaintStatus.UNDER_REVIEW ||
      c.status === ComplaintStatus.ASSIGNED ||
      c.status === ComplaintStatus.IN_PROGRESS
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED
  ).length;
  const reopenedCount = complaints.filter(
    (c) => c.status === ComplaintStatus.REOPENED
  ).length;

  return (
    <div className="space-y-6">
      
      {/* Resident Welcome Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Citizen Resident</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2">
            <span>Residential Ward: <strong>{user?.ward || 'Ward 4 (Green Valley)'}</strong></span>
            <span>•</span>
            <span>Account: <span className="font-mono">{user?.email}</span></span>
          </p>
        </div>

        <Link to="/citizen/complaints/new">
          <Button variant="secondary" size="lg" leftIcon={<PlusCircle className="w-5 h-5" />}>
            Report a Civic Problem
          </Button>
        </Link>
      </div>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-600">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Logged</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalSubmitted}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>Lifetime resident reports</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-teal-500">
          <div className="text-xs font-semibold text-slate-500 uppercase">In Active Resolution</div>
          <div className="text-2xl font-extrabold text-teal-600 mt-1">{activeCount}</div>
          <div className="text-[11px] text-teal-700 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Crews dispatched / on site</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold text-slate-500 uppercase">Resolved & Verified</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{resolvedCount}</div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>With photo verification</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="text-xs font-semibold text-slate-500 uppercase">Reopened / Under Review</div>
          <div className="text-2xl font-extrabold text-red-600 mt-1">{reopenedCount}</div>
          <div className="text-[11px] text-red-700 mt-1 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            <span>Escalated to supervisor</span>
          </div>
        </Card>
      </div>

      {/* Grid: 2 Cols Recent Issues + 1 Col Notification Alert Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Complaints List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Civic Reports
              </h2>
              <p className="text-xs text-slate-500">
                Latest grievances submitted through your citizen profile.
              </p>
            </div>
            <Link to="/citizen/complaints" className="text-xs text-teal-700 font-semibold hover:underline">
              View All ({complaints.length}) →
            </Link>
          </div>

          <div className="space-y-3">
            {complaints.slice(0, 4).map((c) => (
              <Card key={c.id} variant="interactive" className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={c.status} size="sm" />
                    <PriorityBadge priority={c.priority} size="sm" />
                    <span className="font-mono text-[11px] font-semibold text-slate-500">{c.referenceNumber}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm truncate">
                    {c.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="truncate">{c.ward}</span>
                    <span>•</span>
                    <span className="truncate">{c.category.name}</span>
                    <span>•</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Link to={`/citizen/complaints/${c.id}`}>
                    <Button variant="outline" size="sm" rightIcon={<Eye className="w-3.5 h-3.5" />}>
                      Track Progress
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Live Notification Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-600" />
              <span>Municipal Alerts</span>
            </h2>
            <Link to="/citizen/notifications" className="text-xs text-teal-700 font-semibold hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-2.5">
            {notifications.slice(0, 4).map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-lg border text-xs space-y-1 transition ${
                  notif.isRead 
                    ? 'bg-white border-slate-200 text-slate-700' 
                    : 'bg-teal-50/70 border-teal-300 text-teal-950 font-medium'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-teal-800">{notif.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">
                  {notif.message}
                </p>
                <div className="pt-1 text-[10px] font-mono text-slate-400">
                  Ref: {notif.referenceNumber}
                </div>
              </div>
            ))}
          </div>

          {/* Quick SLA Commitment Reminder Box */}
          <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>Statutory SLA Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              If an issue is not triaged within 24 hours or resolved within its statutory window, automatic escalation notifies the Ward Councilor.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
