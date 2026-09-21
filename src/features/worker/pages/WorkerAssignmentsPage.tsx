/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * FIELD WORKER ASSIGNED ORDERS QUEUE
 * 
 * Architectural Purpose:
 * Mobile-first operational work order queue for field crews.
 * Enables quick triage by proximity and urgency, rapid transit status logging,
 * and direct transition to work order execution and evidence submission.
 */

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Navigation, 
  CheckSquare, 
  Play, 
  AlertTriangle, 
  ChevronRight,
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { useAuth } from '../../auth/context/AuthContext';
import { ComplaintStatus, PriorityLevel, SlaStatus, CivicComplaint } from '../../../types';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

type FilterTab = 'ALL' | 'CRITICAL' | 'IN_PROGRESS' | 'ASSIGNED';

export const WorkerAssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { complaints, startJobRoute, markArrivedOnSite } = useComplaints();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState<string>('ALL');

  // Filter complaints assigned to this field worker
  const myAssignedComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Allow viewing complaints assigned to this worker, or fallback to worker-01 if in prototype session
      const isAssignedToMe = c.assignedWorkerId === (user?.id || 'usr-worker-01');
      return isAssignedToMe && (c.status === ComplaintStatus.ASSIGNED || c.status === ComplaintStatus.IN_PROGRESS);
    });
  }, [complaints, user]);

  const filteredComplaints = useMemo(() => {
    return myAssignedComplaints.filter((c) => {
      // Tab filter
      if (activeTab === 'CRITICAL' && c.priority !== PriorityLevel.CRITICAL && c.priority !== PriorityLevel.HIGH) {
        return false;
      }
      if (activeTab === 'IN_PROGRESS' && c.status !== ComplaintStatus.IN_PROGRESS) {
        return false;
      }
      if (activeTab === 'ASSIGNED' && c.status !== ComplaintStatus.ASSIGNED) {
        return false;
      }

      // Ward filter
      if (selectedWard !== 'ALL' && c.ward !== selectedWard) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesRef = c.referenceNumber.toLowerCase().includes(query);
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesAddress = c.address.toLowerCase().includes(query);
        return matchesRef || matchesTitle || matchesAddress;
      }

      return true;
    });
  }, [myAssignedComplaints, activeTab, selectedWard, searchTerm]);

  // Unique wards for filter
  const availableWards = Array.from(new Set(myAssignedComplaints.map((c) => c.ward)));

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-teal-700" />
            Field Dispatch Work Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Active service orders assigned to your field unit. Advance transit and submit resolution proofs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/worker/history">
            <Button variant="outline" size="sm" className="text-xs">
              Completed Jobs History
            </Button>
          </Link>
          <Link to="/worker">
            <Button variant="outline" size="sm" className="text-xs">
              Terminal Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Tab buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Active ({myAssignedComplaints.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('CRITICAL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'CRITICAL'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              High / Critical ({myAssignedComplaints.filter((c) => c.priority === PriorityLevel.CRITICAL || c.priority === PriorityLevel.HIGH).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('IN_PROGRESS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'IN_PROGRESS'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              On Site / In Progress ({myAssignedComplaints.filter((c) => c.status === ComplaintStatus.IN_PROGRESS).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ASSIGNED')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'ASSIGNED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pending Transit ({myAssignedComplaints.filter((c) => c.status === ComplaintStatus.ASSIGNED).length})
            </button>
          </div>

          {/* Ward filter if multi-ward */}
          {availableWards.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Ward:</span>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="rounded-lg border border-slate-300 text-xs px-2.5 py-1.5 bg-white text-slate-800"
              >
                <option value="ALL">All Wards</option>
                {availableWards.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by reference ID (#CMP-...), incident description, or street name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <Card className="p-8 text-center bg-white border border-slate-200">
            <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-slate-800">No matching assignments</h3>
            <p className="text-sm text-slate-500 mt-1">
              There are no active orders matching the selected filter criteria.
            </p>
          </Card>
        ) : (
          filteredComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all space-y-4"
            >
              {/* Top Meta Line */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                    {complaint.referenceNumber}
                  </span>
                  <PriorityBadge priority={complaint.priority} />
                  <StatusBadge status={complaint.status} />
                  <span className="text-xs text-slate-500 font-medium">
                    {complaint.category.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-slate-600 font-medium">
                    SLA Deadline: {new Date(complaint.slaDeadline).toLocaleDateString()} {new Date(complaint.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Main Content Body */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Photo thumbnail if available */}
                {complaint.attachments.length > 0 && (
                  <div className="relative h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                    <img
                      src={complaint.attachments[0].fileUrl}
                      alt="Incident before view"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-slate-900/80 text-[10px] text-white font-medium px-1.5 py-0.5 rounded">
                      Citizen Photo
                    </span>
                  </div>
                )}

                <div className={`${complaint.attachments.length > 0 ? 'md:col-span-2' : 'md:col-span-3'} space-y-2`}>
                  <h3 className="text-base font-bold text-slate-900 hover:text-teal-700 leading-snug">
                    <Link to={`/worker/assignments/${complaint.id}`}>
                      {complaint.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {complaint.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      {complaint.address} ({complaint.ward})
                    </span>
                    <span className="text-slate-400">•</span>
                    <span>Reported by {complaint.citizenName || 'Verified Citizen'}</span>
                  </div>
                </div>

                {/* Direct Action Control Buttons */}
                <div className="flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                  {complaint.status === ComplaintStatus.ASSIGNED && (
                    <Button
                      size="sm"
                      className="w-full justify-center bg-teal-700 hover:bg-teal-800 text-white text-xs"
                      onClick={() => startJobRoute(complaint.id)}
                    >
                      <Navigation className="w-3.5 h-3.5 mr-1.5" />
                      Mark En Route
                    </Button>
                  )}

                  {complaint.status === ComplaintStatus.ASSIGNED ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-center text-xs"
                      onClick={() => markArrivedOnSite(complaint.id)}
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                      Mark On Site
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                      onClick={() => navigate(`/worker/assignments/${complaint.id}`)}
                    >
                      <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                      Execute & Submit Proof
                    </Button>
                  )}

                  <Link to={`/worker/assignments/${complaint.id}`}>
                    <Button size="sm" variant="ghost" className="w-full justify-center text-xs text-slate-600 hover:text-slate-900">
                      Full Work Order <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
