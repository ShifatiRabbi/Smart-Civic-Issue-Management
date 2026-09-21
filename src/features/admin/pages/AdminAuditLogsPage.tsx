/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * ADMIN SECURITY AUDIT LOGS TRAIL
 * 
 * Architectural Purpose:
 * Immutable compliance audit trail tracking all administrative elevations,
 * SLA overrides, department transfers, and user management events.
 */

import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ShieldAlert, 
  Download, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { AuditLogEntry } from '../../../types/admin';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export const AdminAuditLogsPage: React.FC = () => {
  const { auditLogs } = useComplaints();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'WARNING' | 'CRITICAL'>('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    if (statusFilter !== 'ALL' && log.status !== statusFilter) return false;
    if (entityFilter !== 'ALL' && log.entityType !== entityFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Actor Name', 'Role', 'Entity Type', 'Entity ID', 'Status', 'IP Address', 'Details'];
    const rows = filteredLogs.map(l => [
      l.timestamp,
      l.action,
      `"${l.actorName.replace(/"/g, '""')}"`,
      l.actorRole,
      l.entityType,
      l.entityId,
      l.status,
      l.ipAddress,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `security_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
            <History className="w-4 h-4 text-teal-600" />
            <span>Immutable Compliance Trail</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tamper-evident log trail of all municipal system operations, user role elevations, and SLA overrides.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExportCSV}
          leftIcon={<Download className="w-4 h-4" />}
          className="text-xs"
        >
          Export CSV ({filteredLogs.length})
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, actor, details, IP address, or entity ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-teal-600 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs font-medium border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success Only</option>
            <option value="WARNING">Warning Only</option>
            <option value="CRITICAL">Critical Only</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-700"
          >
            <option value="ALL">All Entity Types</option>
            <option value="COMPLAINT">Complaint</option>
            <option value="USER">User</option>
            <option value="DEPARTMENT">Department</option>
            <option value="SLA_RULE">SLA Rule</option>
            <option value="SECURITY">Security</option>
          </select>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Audit Details</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No audit records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const logDate = new Date(log.timestamp);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                        <div>{logDate.toLocaleDateString()}</div>
                        <div className="text-[11px] text-slate-400">{logDate.toLocaleTimeString()}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs font-bold text-slate-900">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="font-semibold text-slate-900">{log.actorName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.actorRole}</div>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="font-semibold text-slate-700">{log.entityType}</span>
                        <span className="block text-[11px] text-slate-400 font-mono">{log.entityId}</span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 max-w-md">
                        {log.details}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-400">
                        {log.ipAddress}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'WARNING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};
