/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * MUNICIPAL GIS & GEOSPATIAL COMMAND CENTER (STEP 10)
 * 
 * Architectural Purpose:
 * Central operations room map combining live incidents, SLA heatmaps,
 * ward boundaries, and live fleet response dispatch.
 */

import React, { useState } from 'react';
import { useComplaints } from '../../complaints/context/ComplaintContext';
import { AdvancedGisMap } from '../components/AdvancedGisMap';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { 
  MapPin, 
  Layers, 
  ShieldAlert, 
  Truck, 
  Compass, 
  Filter, 
  Flame, 
  Building, 
  RefreshCw,
  Clock,
  Radio
} from 'lucide-react';
import { MOCK_WARDS, MOCK_CATEGORIES } from '../../../data/mockData';
import { MOCK_WARD_BOUNDARIES } from '../../../data/gisMockData';
import { PriorityLevel } from '../../../types';

export const GisCommandCenterPage: React.FC = () => {
  const { complaints, assignComplaintToWorker } = useComplaints();
  const [wardFilter, setWardFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Apply filters to active complaints
  const filteredComplaints = complaints.filter((c) => {
    if (wardFilter !== 'ALL' && c.ward !== wardFilter) return false;
    if (categoryFilter !== 'ALL' && c.category.code !== categoryFilter) return false;
    if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;
    return true;
  });

  const criticalCount = complaints.filter((c) => c.priority === PriorityLevel.CRITICAL || c.slaStatus === 'BREACHED').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS').length;

  const handleDispatchWorker = (complaintId: string, workerId: string) => {
    assignComplaintToWorker(complaintId, workerId, 'Dispatched via GIS Proximity Command Center');
    setNotificationMsg(`Field Response Unit assigned to complaint ${complaintId}. Telemetry route generated.`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleManualRefresh = () => {
    const timeStr = new Date().toLocaleTimeString();
    setLastRefreshed(`At ${timeStr}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Telemetry Summary */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-teal-600" />
            <span>CIVIC GIS COMMAND & CONTROL (STEP 10)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Geospatial Intelligence & Fleet Dispatch Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time coordinate monitoring, SLA density heatmaps, and proximity-based dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-slate-400">Telemetry Stream</div>
            <div className="text-xs font-mono font-semibold text-teal-700">{lastRefreshed}</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Poll GIS Feed
          </Button>
        </div>
      </div>

      {/* Dispatched Notification Toast Banner */}
      {notificationMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-lg text-xs flex items-center justify-between shadow-xs">
          <span className="font-semibold">{notificationMsg}</span>
          <button onClick={() => setNotificationMsg(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* High-Level Spatial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase">Geolocated Backlog</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{complaints.length} Incidents</div>
          <div className="text-[11px] text-teal-600 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>100% Ward Coverage</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase">Critical / SLA Hotspots</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{criticalCount} Nodes</div>
          <div className="text-[11px] text-red-700 mt-1 flex items-center gap-1">
            <Flame className="w-3 h-3" />
            <span>High Density in Ward 1 Core</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase">Active Units On-Site</div>
          <div className="text-2xl font-bold text-cyan-600 mt-1">{inProgressCount} Crews</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            <span>GPS Beacon Connected</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase">Avg Response Radius</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">1.8 km</div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>~14 min Arrival Window</span>
          </div>
        </Card>
      </div>

      {/* Main Interactive GIS Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Filter className="w-4 h-4 text-teal-600" />
          <span>Spatial View Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Ward Select */}
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-medium focus:ring-1 focus:ring-teal-600"
          >
            <option value="ALL">All City Wards</option>
            {MOCK_WARDS.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>

          {/* Category Select */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-medium focus:ring-1 focus:ring-teal-600"
          >
            <option value="ALL">All Categories</option>
            {MOCK_CATEGORIES.map((c) => (
              <option key={c.id} value={c.code}>{c.name}</option>
            ))}
          </select>

          {/* Priority Select */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-medium focus:ring-1 focus:ring-teal-600"
          >
            <option value="ALL">All Priorities</option>
            <option value={PriorityLevel.CRITICAL}>Critical Only</option>
            <option value={PriorityLevel.HIGH}>High Priority</option>
            <option value={PriorityLevel.MEDIUM}>Medium Priority</option>
            <option value={PriorityLevel.LOW}>Low Priority</option>
          </select>

          {(wardFilter !== 'ALL' || categoryFilter !== 'ALL' || priorityFilter !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setWardFilter('ALL');
                setCategoryFilter('ALL');
                setPriorityFilter('ALL');
              }}
              className="text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Advanced GIS Map Component */}
      <AdvancedGisMap
        complaints={filteredComplaints}
        onDispatchWorker={handleDispatchWorker}
        height="640px"
        allowDispatch={true}
      />

      {/* Ward Telemetry Breakdown Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Municipal Ward Spatial Health & SLA Compliance
            </h2>
            <p className="text-xs text-slate-500">
              Ward-by-ward breakdown of incident density, councilor jurisdiction, and resolution index.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {MOCK_WARD_BOUNDARIES.length} Administrative Zones
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Ward Zone</th>
                <th className="py-2.5 px-3">Councilor</th>
                <th className="py-2.5 px-3">Population</th>
                <th className="py-2.5 px-3">Area (km²)</th>
                <th className="py-2.5 px-3">Active Backlog</th>
                <th className="py-2.5 px-3">Density Rating</th>
                <th className="py-2.5 px-3">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_WARD_BOUNDARIES.map((ward) => (
                <tr key={ward.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {ward.wardNumber}: {ward.name}
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {ward.councilor}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {ward.population.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {ward.areaKm2}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {ward.openIncidentsCount} Incidents
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ward.incidentDensity === 'CRITICAL'
                        ? 'bg-red-100 text-red-800'
                        : ward.incidentDensity === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {ward.incidentDensity}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${
                            ward.slaComplianceRate >= 95
                              ? 'bg-emerald-500'
                              : ward.slaComplianceRate >= 90
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${ward.slaComplianceRate}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-800">
                        {ward.slaComplianceRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
