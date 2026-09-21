/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * PUBLIC INCIDENT MAP EXPLORER PAGE
 * 
 * Architectural Purpose:
 * Dedicated GIS map interface displaying municipal complaints with viewport tracking,
 * category/status markers, and side-by-side incident inspection.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Filter, 
  Layers, 
  Eye, 
  PlusCircle, 
  ThumbsUp, 
  AlertCircle 
} from 'lucide-react';
import { CivicMapViewer } from '../../map/components/CivicMapViewer';
import { 
  MOCK_COMPLAINTS, 
  MOCK_CATEGORIES, 
  MOCK_WARDS 
} from '../../../data/mockData';
import { CivicComplaint, ComplaintStatus, PriorityLevel } from '../../../types';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export const PublicMapPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<CivicComplaint | null>(MOCK_COMPLAINTS[0]);

  // Filter complaints based on selection
  const visibleComplaints = MOCK_COMPLAINTS.filter((c) => {
    if (selectedCategory !== 'ALL' && c.category.code !== selectedCategory) return false;
    if (selectedWard !== 'ALL' && c.ward !== selectedWard) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 mb-1">
            <MapPin className="w-4 h-4" />
            <span>MUNICIPAL GIS SYSTEM</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Live Civic Complaint Map
          </h1>
          <p className="text-xs text-slate-500">
            Real-time geospatial telemetry of infrastructure defects and municipal work orders.
          </p>
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-medium focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">All City Wards</option>
            {MOCK_WARDS.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-medium focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">All Categories</option>
            {MOCK_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.code}>{cat.name}</option>
            ))}
          </select>

          <Link to="/citizen/complaints/new">
            <Button variant="secondary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Report at Location
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Map + Side Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Interactive Map Canvas */}
        <div className="lg:col-span-2 space-y-3">
          <CivicMapViewer
            complaints={visibleComplaints}
            selectedComplaintId={selectedComplaint?.id}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
            height="580px"
          />

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing <strong>{visibleComplaints.length}</strong> geolocated civic pins</span>
            <span>Click any pin to inspect sanitized public progress</span>
          </div>
        </div>

        {/* Right 1 Col: Selected Incident Card or Active Incident List */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Selected Issue Telemetry</span>
          </h3>

          {selectedComplaint ? (
            <Card className="p-5 space-y-4 border-l-4 border-l-teal-600 shadow-md">
              <div className="flex items-center justify-between gap-2">
                <StatusBadge status={selectedComplaint.status} size="sm" />
                <PriorityBadge priority={selectedComplaint.priority} size="sm" />
              </div>

              <div>
                <div className="text-[11px] font-mono text-slate-400 font-semibold mb-1">
                  {selectedComplaint.referenceNumber}
                </div>
                <h4 className="font-bold text-slate-900 text-base leading-snug">
                  {selectedComplaint.title}
                </h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedComplaint.description}
              </p>

              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-2 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-semibold text-slate-800">{selectedComplaint.department.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-semibold text-slate-800">{selectedComplaint.ward}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">SLA Target:</span>
                  <span className="font-semibold text-teal-700">{selectedComplaint.category.slaTargetHours} hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Coordinates:</span>
                  <span className="font-mono text-slate-600 text-[11px]">
                    {selectedComplaint.coordinates.latitude.toFixed(4)}, {selectedComplaint.coordinates.longitude.toFixed(4)}
                  </span>
                </div>
              </div>

              {selectedComplaint.attachments.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1.5">
                    Citizen Photo Evidence
                  </div>
                  <img
                    src={selectedComplaint.attachments[0].fileUrl}
                    alt="Citizen evidence"
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover rounded-lg border border-slate-200"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                  <ThumbsUp className="w-3.5 h-3.5 text-teal-600" />
                  <span>{selectedComplaint.supportCount} Endorsements</span>
                </div>
                <Link to={`/complaints/${selectedComplaint.referenceNumber}`}>
                  <Button variant="primary" size="sm" rightIcon={<Eye className="w-3.5 h-3.5" />}>
                    View Timeline
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-xs text-slate-500 space-y-2">
              <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
              <p>Click any map marker to view detailed incident status and resolution milestones.</p>
            </Card>
          )}

          {/* Incident Queue List */}
          <div className="pt-2 space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Other Incidents in View ({visibleComplaints.length})
            </h4>
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {visibleComplaints.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedComplaint(item)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                    selectedComplaint?.id === item.id 
                      ? 'bg-slate-100 border-teal-500 shadow-xs' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono font-semibold text-slate-700">{item.referenceNumber}</span>
                    <StatusBadge status={item.status} size="sm" showIcon={false} />
                  </div>
                  <div className="font-medium text-slate-900 line-clamp-1">{item.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{item.ward}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
