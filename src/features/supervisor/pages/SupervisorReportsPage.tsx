/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * SUPERVISOR DEPARTMENT ANALYTICS & SLA PERFORMANCE
 * 
 * Architectural Purpose:
 * Analytical dashboard providing SLA compliance metrics, ward performance heatmaps,
 * category resolution turnaround times, and crew productivity indices.
 */

import React, { useState } from 'react';
import { 
  Layers, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart3, 
  Users, 
  Calendar,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { ComplaintStatus, PriorityLevel, SlaStatus } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export const SupervisorReportsPage: React.FC = () => {
  const { complaints, departments, workers } = useComplaints();

  const [timeRange, setTimeRange] = useState<'WEEK' | 'MONTH' | 'QUARTER'>('MONTH');

  // Compute metrics
  const totalTickets = complaints.length;
  const resolvedTickets = complaints.filter(c => c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED).length;
  const breachedTickets = complaints.filter(c => c.slaStatus === SlaStatus.BREACHED).length;
  const complianceRate = totalTickets > 0 ? Math.round(((totalTickets - breachedTickets) / totalTickets) * 100) : 100;

  // Breakdown by Department
  const deptPerformance = departments.map((dept) => {
    const deptComplaints = complaints.filter(c => c.department.id === dept.id);
    const deptResolved = deptComplaints.filter(c => c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED).length;
    const deptBreached = deptComplaints.filter(c => c.slaStatus === SlaStatus.BREACHED).length;
    const deptCompliance = deptComplaints.length > 0 ? Math.round(((deptComplaints.length - deptBreached) / deptComplaints.length) * 100) : 100;

    return {
      id: dept.id,
      name: dept.name,
      code: dept.code,
      total: deptComplaints.length,
      resolved: deptResolved,
      complianceRate: deptCompliance,
      activeWorkers: workers.filter(w => w.departmentId === dept.id).length,
    };
  });

  // Ward breakdown
  const wardComplaintsMap: Record<string, number> = {};
  complaints.forEach(c => {
    wardComplaintsMap[c.ward] = (wardComplaintsMap[c.ward] || 0) + 1;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Operational Business Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Department Performance & SLA Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Key operational metrics, resolution velocity benchmarks, and municipal compliance reporting.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-lg">
          <button
            onClick={() => setTimeRange('WEEK')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
              timeRange === 'WEEK' ? 'bg-[#1b3b57] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('MONTH')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
              timeRange === 'MONTH' ? 'bg-[#1b3b57] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('QUARTER')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
              timeRange === 'QUARTER' ? 'bg-[#1b3b57] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Quarter
          </button>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-teal-600">
          <span className="text-xs font-semibold text-slate-500 uppercase">SLA Compliance Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{complianceRate}%</span>
            <span className="text-xs text-teal-700 font-semibold">Target: &gt;90%</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Based on {totalTickets} total logged grievances</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <span className="text-xs font-semibold text-slate-500 uppercase">Resolution Ratio</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0}%
            </span>
            <span className="text-xs text-emerald-700 font-semibold">{resolvedTickets} closed/resolved</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Completed by certified field units</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-600">
          <span className="text-xs font-semibold text-slate-500 uppercase">Avg Mean Time To Repair (MTTR)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">22.4h</span>
            <span className="text-xs text-blue-700 font-semibold">-3.2h vs prior mo</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">From verification to final sign-off</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-600">
          <span className="text-xs font-semibold text-slate-500 uppercase">Citizen Endorsement Score</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">4.8 / 5</span>
            <span className="text-xs text-amber-700 font-semibold">★ High Civic Trust</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Post-remediation community feedback</p>
        </Card>
      </div>

      {/* Department Breakdown Matrix */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Inter-Department SLA Compliance Matrix</h2>
          </div>
          <span className="text-xs text-slate-500">Live aggregated statistics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Department / Agency</th>
                <th className="py-3 px-4">Assigned Tickets</th>
                <th className="py-3 px-4">Resolved</th>
                <th className="py-3 px-4">Active Field Units</th>
                <th className="py-3 px-4">SLA Compliance</th>
                <th className="py-3 px-4 text-right">Performance Band</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deptPerformance.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div>{dept.name}</div>
                    <span className="text-[11px] font-mono text-slate-400 font-normal">{dept.code}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{dept.total}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{dept.resolved}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{dept.activeWorkers} units</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            dept.complianceRate >= 90 ? 'bg-emerald-500' : dept.complianceRate >= 75 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${dept.complianceRate}%` }}
                        />
                      </div>
                      <span className="font-semibold text-xs text-slate-800">{dept.complianceRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      dept.complianceRate >= 90 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : dept.complianceRate >= 75
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {dept.complianceRate >= 90 ? 'OPTIMAL' : dept.complianceRate >= 75 ? 'ADEQUATE' : 'DEGRADED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ward Incident Density & Heatmap Breakdown */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Municipal Ward Grievance Distribution</h2>
          </div>
          <span className="text-xs text-slate-500">Volume index by jurisdiction</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(wardComplaintsMap).map(([wardName, count]) => (
            <div key={wardName} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-800 block truncate">{wardName}</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900">{count}</span>
                <span className="text-[11px] text-slate-500">logged tickets</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};
