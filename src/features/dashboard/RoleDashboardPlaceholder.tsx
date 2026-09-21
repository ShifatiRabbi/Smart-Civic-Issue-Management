/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * ROLE DASHBOARD SHELL & PHASE PREVIEW
 * 
 * Architectural Purpose:
 * Renders the active portal workspace for each role while subsequent steps 
 * implement their specialized multi-step wizard, worker terminal, and triage dispatch tables.
 */

import React from 'react';
import { useAuth } from '../auth/context/AuthContext';
import { UserRole } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Building2, 
  Wrench, 
  ShieldCheck, 
  Users, 
  Layers, 
  PlusCircle, 
  ArrowRight,
  Clock,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_COMPLAINTS, MOCK_MUNICIPAL_STATS } from '../../data/mockData';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';

interface RoleDashboardPlaceholderProps {
  moduleTitle: string;
  moduleRole: UserRole;
  stepNumber: number;
}

export const RoleDashboardPlaceholder: React.FC<RoleDashboardPlaceholderProps> = ({
  moduleTitle,
  moduleRole,
  stepNumber,
}) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Role Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{moduleRole} WORKSPACE</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {moduleTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Logged in as: <strong className="text-slate-800">{user?.fullName}</strong> ({user?.email})
          </p>
        </div>

        {moduleRole === UserRole.CITIZEN && (
          <Link to="/citizen/complaints/new">
            <Button variant="secondary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Report Civic Problem
            </Button>
          </Link>
        )}
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase">Assigned In Queue</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">14</div>
          <div className="text-[11px] text-teal-600 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>All within SLA window</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase">Pending Triage</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">6</div>
          <div className="text-[11px] text-slate-500 mt-1">Requires staff verification</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase">SLA Warning / At Risk</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">2</div>
          <div className="text-[11px] text-amber-700 mt-1">Less than 4h remaining</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase">Resolved This Month</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">128</div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>96% Quality Sign-off</span>
          </div>
        </Card>
      </div>

      {/* Active Records Table Preview */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Active Municipal Workload
            </h2>
            <p className="text-xs text-slate-500">
              Recent incidents prioritized by statutory SLA urgency.
            </p>
          </div>
          <Link to="/explore">
            <Button variant="outline" size="sm">
              View All Records
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_COMPLAINTS.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                    {c.referenceNumber}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {c.category.name}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3 px-3">
                    <PriorityBadge priority={c.priority} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {c.ward}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link to={`/complaints/${c.referenceNumber}`}>
                      <Button variant="outline" size="sm">
                        Inspect
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Milestone Roadmap Indicator */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          <span>Next: Step {stepNumber} will expand this workspace with deep role-specific workflows.</span>
        </div>
        <div className="font-mono text-slate-500">
          SDLC Phase 3 & 4 Active
        </div>
      </div>
    </div>
  );
};
