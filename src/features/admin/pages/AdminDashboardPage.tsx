/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * MUNICIPAL SYSTEM ADMINISTRATION DASHBOARD
 * 
 * Architectural Purpose:
 * Central governance cockpit for City Administrators.
 * Monitors global infrastructure health, security audits, tenant departments,
 * user privileges, and SLA compliance policies.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Sliders, 
  History, 
  ShieldCheck, 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  TrendingUp,
  ChevronRight,
  Database,
  Lock,
  RefreshCw
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export const AdminDashboardPage: React.FC = () => {
  const { complaints, users, departments, slaRules, auditLogs } = useComplaints();

  // Metrics
  const totalComplaints = complaints.length;
  const totalUsers = users.length;
  const totalDepartments = departments.length;
  const activeSlaRules = slaRules.filter(r => r.isActive).length;
  const recentAuditEntries = auditLogs.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Enterprise System Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Municipal System Administration</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            System configuration, Role-Based Access Control (RBAC), departmental jurisdictions, and security audit log streams.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Municipal Node: ONLINE</span>
          </span>
        </div>
      </div>

      {/* Admin KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="p-4 border-l-4 border-l-[#1b3b57]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">System Users</span>
            <Users className="w-4 h-4 text-[#1b3b57]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{totalUsers}</span>
            <span className="text-xs text-slate-500 font-medium">accounts configured</span>
          </div>
          <Link to="/admin/users" className="text-xs text-teal-700 font-semibold hover:underline mt-2 inline-block">
            Manage directory &amp; roles →
          </Link>
        </Card>

        <Card className="p-4 border-l-4 border-l-teal-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Departments &amp; Wards</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{totalDepartments}</span>
            <span className="text-xs text-slate-500 font-medium">operating agencies</span>
          </div>
          <Link to="/admin/departments" className="text-xs text-teal-700 font-semibold hover:underline mt-2 inline-block">
            Configure agencies →
          </Link>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">SLA Policy Rules</span>
            <Sliders className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{activeSlaRules}</span>
            <span className="text-xs text-slate-500 font-medium">active matrix rules</span>
          </div>
          <Link to="/admin/sla-rules" className="text-xs text-teal-700 font-semibold hover:underline mt-2 inline-block">
            Configure target matrix →
          </Link>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Security Audit Events</span>
            <History className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{auditLogs.length}</span>
            <span className="text-xs text-slate-500 font-medium">events recorded</span>
          </div>
          <Link to="/admin/audit-logs" className="text-xs text-teal-700 font-semibold hover:underline mt-2 inline-block">
            Inspect audit trail →
          </Link>
        </Card>
      </div>

      {/* Main Admin Section: Navigation Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Module 1: Master Complaints */}
        <Card className="p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Master Grievances Registry</h3>
            <p className="text-xs text-slate-500 mt-1">
              Cross-departmental oversight of all {totalComplaints} civic grievances. Ability to force status transitions, archive, or reassign tickets.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">{totalComplaints} total records</span>
            <Link to="/admin/complaints">
              <Button size="sm" variant="outline" className="text-xs">
                Open Registry
              </Button>
            </Link>
          </div>
        </Card>

        {/* Module 2: User Directory & RBAC */}
        <Card className="p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">User Directory &amp; RBAC</h3>
            <p className="text-xs text-slate-500 mt-1">
              Manage accounts, alter user roles across Citizen, Field Worker, Department Staff, Supervisor, and Administrator.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">{totalUsers} accounts</span>
            <Link to="/admin/users">
              <Button size="sm" variant="outline" className="text-xs">
                Manage Users
              </Button>
            </Link>
          </div>
        </Card>

        {/* Module 3: SLA Rules Configuration */}
        <Card className="p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">SLA Policy Matrix</h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure target resolution deadlines, early warning thresholds, and mandatory supervisor sign-off requirements.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">{activeSlaRules} active policies</span>
            <Link to="/admin/sla-rules">
              <Button size="sm" variant="outline" className="text-xs">
                Edit Matrix
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Live Security Audit Log Stream */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Live Security Audit Log Stream</h2>
          </div>
          <Link to="/admin/audit-logs" className="text-xs font-semibold text-teal-700 hover:underline">
            View Complete Audit Trail ({auditLogs.length}) →
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentAuditEntries.map((log) => {
            const logDate = new Date(log.timestamp);
            return (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      log.status === 'SUCCESS' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : log.status === 'WARNING' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-700">{log.actorName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({log.actorRole})</span>
                  </div>
                  <p className="text-xs text-slate-600">{log.details}</p>
                </div>

                <div className="text-right text-[11px] text-slate-400 shrink-0 font-mono">
                  <div>{logDate.toLocaleDateString()}</div>
                  <div>{logDate.toLocaleTimeString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

    </div>
  );
};
