/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * ADVANCED GEOSPATIAL GIS COMMAND MAP (STEP 10)
 * 
 * Architectural Purpose:
 * Enterprise spatial command interface supporting multi-layer rendering:
 * 1. High-Density Heatmap Halos
 * 2. Ward Boundaries & Chloropleth Health
 * 3. Live Worker Fleet Tracking with Heading & Speed
 * 4. Municipal Critical Infrastructure Nodes
 * 5. Dynamic Proximity & Dispatch Radius Tool
 * 6. Turn-by-Turn Route Navigation Polyline
 */

import React, { useState } from 'react';
import { CivicComplaint, ComplaintStatus, PriorityLevel, FieldWorker } from '../../../types';
import { GisLayerType, WardBoundary, InfrastructureAsset, WorkerFleetTelemetry, ProximityQueryResult } from '../../../types/gis';
import { MOCK_WARD_BOUNDARIES, MOCK_INFRASTRUCTURE_ASSETS, MOCK_FLEET_TELEMETRY } from '../../../data/gisMockData';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { Button } from '../../../components/ui/Button';
import { 
  MapPin, 
  Layers, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Truck, 
  Flame, 
  Building, 
  ShieldAlert, 
  Activity, 
  Navigation,
  CheckCircle2,
  Clock,
  Send
} from 'lucide-react';

interface AdvancedGisMapProps {
  complaints: CivicComplaint[];
  selectedComplaintId?: string | null;
  onSelectComplaint?: (complaint: CivicComplaint | null) => void;
  onDispatchWorker?: (complaintId: string, workerId: string) => void;
  height?: string;
  allowDispatch?: boolean;
}

export const AdvancedGisMap: React.FC<AdvancedGisMapProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  onDispatchWorker,
  height = '620px',
  allowDispatch = true,
}) => {
  // Layer toggles
  const [activeLayers, setActiveLayers] = useState<Record<GisLayerType, boolean>>({
    INCIDENTS: true,
    HEATMAP: true,
    WARDS: true,
    FLEET: true,
    INFRASTRUCTURE: true,
  });

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedIncident, setSelectedIncident] = useState<CivicComplaint | null>(
    complaints.find((c) => c.id === selectedComplaintId) || complaints[0] || null
  );
  const [selectedWorker, setSelectedWorker] = useState<WorkerFleetTelemetry | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardBoundary | null>(null);
  
  // Dispatch radius query (in kilometers)
  const [dispatchRadiusKm, setDispatchRadiusKm] = useState<number>(2.0);

  const toggleLayer = (layer: GisLayerType) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // SVG coordinate transformation
  // City viewport bounding box: lat 23.8000 - 23.8250, lng 90.3950 - 90.4250
  const projectCoordinates = (lat: number, lng: number) => {
    const minLat = 23.8000;
    const maxLat = 23.8250;
    const minLng = 90.3950;
    const maxLng = 90.4250;

    const x = ((lng - minLng) / (maxLng - minLng)) * 600;
    const y = 420 - ((lat - minLat) / (maxLat - minLat)) * 420;

    return {
      x: Math.max(30, Math.min(570, x)),
      y: Math.max(30, Math.min(390, y)),
    };
  };

  // Calculate approximate distance between two lat/lng in kilometers
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  };

  // Convert distance in km to SVG pixel radius
  const kmToSvgRadius = (km: number) => {
    // 600px width represents ~3.2 km (from lng 90.3950 to 90.4250)
    return (km / 3.2) * 600;
  };

  // Nearby workers based on selected incident and dispatch radius
  const nearbyWorkers: ProximityQueryResult[] = selectedIncident
    ? MOCK_FLEET_TELEMETRY.map((item) => {
        const dist = calculateDistanceKm(
          selectedIncident.coordinates.latitude,
          selectedIncident.coordinates.longitude,
          item.coordinates.latitude,
          item.coordinates.longitude
        );
        // Estimate transit minutes assuming average city transit speed of 20 km/h
        const transitMins = Math.max(2, Math.round((dist / 20) * 60));
        return {
          worker: item.worker,
          distanceKm: dist,
          estimatedTransitMinutes: transitMins,
          coordinates: item.coordinates,
          isRecommended: dist <= dispatchRadiusKm && item.status === 'AVAILABLE',
        };
      }).sort((a, b) => a.distanceKm - b.distanceKm)
    : [];

  const handleIncidentSelect = (complaint: CivicComplaint) => {
    setSelectedIncident(complaint);
    setSelectedWorker(null);
    if (onSelectComplaint) {
      onSelectComplaint(complaint);
    }
  };

  const handleWorkerSelect = (telemetry: WorkerFleetTelemetry) => {
    setSelectedWorker(telemetry);
  };

  // Active route polyline between selected incident and its assigned worker
  const activeRouteCoordinates = selectedIncident && selectedIncident.assignedWorkerId
    ? (() => {
        const assignedTelemetry = MOCK_FLEET_TELEMETRY.find(
          (t) => t.worker.id === selectedIncident.assignedWorkerId
        );
        if (!assignedTelemetry) return null;

        const start = projectCoordinates(
          assignedTelemetry.coordinates.latitude,
          assignedTelemetry.coordinates.longitude
        );
        const end = projectCoordinates(
          selectedIncident.coordinates.latitude,
          selectedIncident.coordinates.longitude
        );

        // Calculate intermediate waypoint along road grid
        const midX = start.x;
        const midY = end.y;

        return { start, mid: { x: midX, y: midY }, end, worker: assignedTelemetry.worker };
      })()
    : null;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* Left: GIS Map Viewport & Overlays */}
      <div className="flex-1 space-y-3">
        
        {/* Layer Control Strip */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>GIS Map Layers:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => toggleLayer('INCIDENTS')}
              className={`px-2.5 py-1 rounded-md font-medium border flex items-center gap-1.5 transition cursor-pointer ${
                activeLayers.INCIDENTS
                  ? 'bg-blue-50 border-blue-300 text-blue-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Incidents ({complaints.length})</span>
            </button>

            <button
              onClick={() => toggleLayer('HEATMAP')}
              className={`px-2.5 py-1 rounded-md font-medium border flex items-center gap-1.5 transition cursor-pointer ${
                activeLayers.HEATMAP
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>SLA Density Heatmap</span>
            </button>

            <button
              onClick={() => toggleLayer('WARDS')}
              className={`px-2.5 py-1 rounded-md font-medium border flex items-center gap-1.5 transition cursor-pointer ${
                activeLayers.WARDS
                  ? 'bg-teal-50 border-teal-300 text-teal-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Ward Boundaries</span>
            </button>

            <button
              onClick={() => toggleLayer('FLEET')}
              className={`px-2.5 py-1 rounded-md font-medium border flex items-center gap-1.5 transition cursor-pointer ${
                activeLayers.FLEET
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Field Fleet ({MOCK_FLEET_TELEMETRY.length})</span>
            </button>

            <button
              onClick={() => toggleLayer('INFRASTRUCTURE')}
              className={`px-2.5 py-1 rounded-md font-medium border flex items-center gap-1.5 transition cursor-pointer ${
                activeLayers.INFRASTRUCTURE
                  ? 'bg-purple-50 border-purple-300 text-purple-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Key Assets</span>
            </button>
          </div>
        </div>

        {/* The SVG GIS Stage */}
        <div 
          className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-[#091522] shadow-inner"
          style={{ height }}
        >
          {/* Zoom and Stage Controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-[#0f2438]/90 p-1.5 rounded-lg border border-slate-700 shadow-md backdrop-blur-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.min(2, z + 0.2))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setSelectedWard(null);
              }}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
              title="Reset Viewport"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Compass Rose */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#0f2438]/90 px-2.5 py-1 rounded-md border border-slate-700 text-[11px] text-teal-400 font-mono">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>MUNICIPAL GIS COORDINATE SYSTEM (WGS84)</span>
          </div>

          <svg
            viewBox="0 0 600 420"
            className="w-full h-full select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Municipal Base Grid Pattern */}
              <pattern id="advanced-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#172e48" strokeWidth="0.8" />
              </pattern>

              {/* Heatmap radial gradient */}
              <radialGradient id="heat-halo-critical" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.65" />
                <stop offset="50%" stopColor="#f97316" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="heat-halo-high" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.55" />
                <stop offset="60%" stopColor="#eab308" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>

              {/* Waterway / River gradient */}
              <linearGradient id="river-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0369a1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0891b2" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* Base Background */}
            <rect width="600" height="420" fill="#0b1726" />
            <rect width="600" height="420" fill="url(#advanced-grid)" />

            {/* River Geographic Feature */}
            <path
              d="M 0 210 Q 180 160 300 230 T 600 190"
              fill="none"
              stroke="url(#river-gradient)"
              strokeWidth="28"
            />

            {/* LAYER: WARD BOUNDARIES & CHLOROPLETH OVERLAY */}
            {activeLayers.WARDS && (
              <g id="gis-layer-wards">
                {MOCK_WARD_BOUNDARIES.map((ward) => {
                  const isWardSelected = selectedWard?.id === ward.id;
                  let fillColor = 'rgba(15, 36, 56, 0.4)';
                  if (ward.incidentDensity === 'CRITICAL') fillColor = 'rgba(239, 68, 68, 0.08)';
                  else if (ward.incidentDensity === 'HIGH') fillColor = 'rgba(249, 115, 22, 0.07)';
                  else if (ward.incidentDensity === 'MEDIUM') fillColor = 'rgba(59, 130, 246, 0.06)';

                  return (
                    <g 
                      key={ward.id}
                      onClick={() => setSelectedWard(ward)}
                      className="cursor-pointer transition-opacity hover:opacity-90"
                    >
                      <path
                        d={ward.svgPolygon}
                        fill={fillColor}
                        stroke={isWardSelected ? '#2dd4bf' : '#274b70'}
                        strokeWidth={isWardSelected ? 2.5 : 1.2}
                        strokeDasharray={isWardSelected ? 'none' : '4,4'}
                      />
                      {/* Ward centroid label */}
                      <text
                        x={projectCoordinates(ward.centerCoordinates.latitude, ward.centerCoordinates.longitude).x}
                        y={projectCoordinates(ward.centerCoordinates.latitude, ward.centerCoordinates.longitude).y - 12}
                        textAnchor="middle"
                        fill="#7dd3fc"
                        fontSize="9"
                        fontWeight="700"
                        letterSpacing="1"
                      >
                        {ward.wardNumber.toUpperCase()}
                      </text>
                      <text
                        x={projectCoordinates(ward.centerCoordinates.latitude, ward.centerCoordinates.longitude).x}
                        y={projectCoordinates(ward.centerCoordinates.latitude, ward.centerCoordinates.longitude).y}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="7.5"
                      >
                        SLA: {ward.slaComplianceRate}% ({ward.openIncidentsCount} active)
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* Major Arterial Road Network */}
            <g stroke="#1d3f66" strokeWidth="3" fill="none">
              <path d="M 300 0 L 300 420" />
              <path d="M 0 210 L 600 210" />
              <circle cx="300" cy="210" r="16" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2,2" />
            </g>

            {/* LAYER: HEATMAP DENSITY OVERLAY */}
            {activeLayers.HEATMAP && (
              <g id="gis-layer-heatmap" pointerEvents="none">
                {complaints.map((c) => {
                  const { x, y } = projectCoordinates(c.coordinates.latitude, c.coordinates.longitude);
                  const isCritical = c.priority === PriorityLevel.CRITICAL || c.slaStatus === 'BREACHED';
                  const radius = isCritical ? 55 : 40;
                  const gradient = isCritical ? 'url(#heat-halo-critical)' : 'url(#heat-halo-high)';

                  return (
                    <circle
                      key={`heat-${c.id}`}
                      cx={x}
                      cy={y}
                      r={radius}
                      fill={gradient}
                    />
                  );
                })}
              </g>
            )}

            {/* LAYER: DISPATCH PROXIMITY RADIUS CIRCLE (Around Selected Incident) */}
            {selectedIncident && (
              <g id="gis-layer-dispatch-radius" pointerEvents="none">
                {(() => {
                  const center = projectCoordinates(
                    selectedIncident.coordinates.latitude,
                    selectedIncident.coordinates.longitude
                  );
                  const radiusPx = kmToSvgRadius(dispatchRadiusKm);
                  return (
                    <g>
                      <circle
                        cx={center.x}
                        cy={center.y}
                        r={radiusPx}
                        fill="rgba(13, 148, 136, 0.12)"
                        stroke="#14b8a6"
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                      />
                      {/* Radius indicator tag */}
                      <text
                        x={center.x}
                        y={center.y - radiusPx - 6}
                        textAnchor="middle"
                        fill="#2dd4bf"
                        fontSize="9"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        {dispatchRadiusKm.toFixed(1)} km Dispatch Radius
                      </text>
                    </g>
                  );
                })()}
              </g>
            )}

            {/* LAYER: ROUTE POLYLINE (From Assigned Worker to Incident) */}
            {activeRouteCoordinates && (
              <g id="gis-layer-active-route">
                <path
                  d={`M ${activeRouteCoordinates.start.x} ${activeRouteCoordinates.start.y} L ${activeRouteCoordinates.mid.x} ${activeRouteCoordinates.mid.y} L ${activeRouteCoordinates.end.x} ${activeRouteCoordinates.end.y}`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="5,3"
                  className="animate-pulse"
                />
                {/* Waypoint midpoint label */}
                <circle
                  cx={activeRouteCoordinates.mid.x}
                  cy={activeRouteCoordinates.mid.y}
                  r="3.5"
                  fill="#38bdf8"
                />
                <text
                  x={activeRouteCoordinates.mid.x + 8}
                  y={activeRouteCoordinates.mid.y - 4}
                  fill="#7dd3fc"
                  fontSize="8"
                  fontWeight="600"
                >
                  ETA ~4m (In-Transit)
                </text>
              </g>
            )}

            {/* LAYER: CRITICAL INFRASTRUCTURE ASSETS */}
            {activeLayers.INFRASTRUCTURE && (
              <g id="gis-layer-infrastructure">
                {MOCK_INFRASTRUCTURE_ASSETS.map((asset) => {
                  const { x, y } = projectCoordinates(asset.coordinates.latitude, asset.coordinates.longitude);
                  return (
                    <g
                      key={asset.id}
                      transform={`translate(${x}, ${y})`}
                      className="cursor-pointer group"
                    >
                      {/* Node square */}
                      <rect
                        x="-7"
                        y="-7"
                        width="14"
                        height="14"
                        rx="3"
                        fill="#7e22ce"
                        stroke="#c084fc"
                        strokeWidth="1.2"
                      />
                      <circle cx="0" cy="0" r="2" fill="#ffffff" />
                      {/* Hover text label */}
                      <text
                        x="10"
                        y="3"
                        fill="#e9d5ff"
                        fontSize="7.5"
                        fontWeight="600"
                        className="opacity-80 group-hover:opacity-100"
                      >
                        {asset.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* LAYER: FIELD WORKER FLEET VEHICLES */}
            {activeLayers.FLEET && (
              <g id="gis-layer-fleet">
                {MOCK_FLEET_TELEMETRY.map((item) => {
                  const { x, y } = projectCoordinates(item.coordinates.latitude, item.coordinates.longitude);
                  const isSelected = selectedWorker?.worker.id === item.worker.id;
                  
                  let badgeColor = '#10b981'; // Available
                  if (item.status === 'EN_ROUTE') badgeColor = '#06b6d4';
                  if (item.status === 'ON_SITE') badgeColor = '#f59e0b';

                  return (
                    <g
                      key={item.worker.id}
                      transform={`translate(${x}, ${y})`}
                      onClick={() => handleWorkerSelect(item)}
                      className="cursor-pointer transition-transform hover:scale-125"
                    >
                      {/* Vehicle beacon ping */}
                      <circle
                        r="11"
                        fill={badgeColor}
                        opacity="0.25"
                        className="animate-ping"
                      />

                      {/* Heading direction arrow notch */}
                      <circle
                        r={isSelected ? "8" : "6.5"}
                        fill={badgeColor}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />

                      {/* Small Vehicle icon representation */}
                      <rect
                        x="-3"
                        y="-3"
                        width="6"
                        height="6"
                        rx="1"
                        fill="#ffffff"
                      />

                      {/* Worker identifier tag */}
                      <text
                        x="0"
                        y="14"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="7"
                        fontWeight="700"
                        className="bg-slate-900"
                      >
                        {item.worker.fullName.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* LAYER: CIVIC COMPLAINT PINS */}
            {activeLayers.INCIDENTS && (
              <g id="gis-layer-incidents">
                {complaints.map((c) => {
                  const { x, y } = projectCoordinates(c.coordinates.latitude, c.coordinates.longitude);
                  const isSelected = selectedIncident?.id === c.id;

                  let pinColor = '#3b82f6';
                  if (c.status === ComplaintStatus.RESOLVED) pinColor = '#22c55e';
                  else if (c.status === ComplaintStatus.IN_PROGRESS) pinColor = '#06b6d4';
                  else if (c.status === ComplaintStatus.UNDER_REVIEW) pinColor = '#eab308';
                  else if (c.priority === PriorityLevel.CRITICAL) pinColor = '#ef4444';

                  return (
                    <g
                      key={c.id}
                      transform={`translate(${x}, ${y})`}
                      onClick={() => handleIncidentSelect(c)}
                      className="cursor-pointer transition-transform hover:scale-125"
                    >
                      {/* Highlight ring for selected incident */}
                      {isSelected && (
                        <circle
                          r="16"
                          fill="none"
                          stroke="#2dd4bf"
                          strokeWidth="2.5"
                          strokeDasharray="3,3"
                        />
                      )}

                      {/* Ping ripple for critical SLA breaches */}
                      {c.slaStatus === 'BREACHED' && (
                        <circle
                          r="14"
                          fill="#ef4444"
                          opacity="0.4"
                          className="animate-ping"
                        />
                      )}

                      {/* Base pin drop shadow */}
                      <ellipse cx="0" cy="2" rx="5" ry="2" fill="#000000" opacity="0.6" />

                      {/* Main Pin Circle */}
                      <circle
                        r={isSelected ? "9" : "7"}
                        fill={pinColor}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />

                      {/* Pin Inner Dot */}
                      <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
                    </g>
                  );
                })}
              </g>
            )}
          </svg>

          {/* Map Footer Telemetry HUD */}
          <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between bg-[#0f2438]/90 px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-slate-300 backdrop-blur-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Active GIS Stream: <strong>Online</strong></span>
              </span>
              <span className="hidden sm:inline text-slate-400">|</span>
              <span className="hidden sm:inline text-slate-400">
                Centroid: 23.812° N, 90.410° E
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-teal-400 font-mono">
                {complaints.length} Geolocated Incidents
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Spatial Inspector & Dispatch Calculator */}
      <div className="w-full lg:w-88 space-y-4">
        
        {/* Selected Incident Telemetry Card */}
        {selectedIncident ? (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="text-[11px] font-mono font-semibold text-slate-500">
                  {selectedIncident.referenceNumber}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">
                  {selectedIncident.title}
                </h3>
              </div>
              <StatusBadge status={selectedIncident.status} size="sm" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-800">{selectedIncident.category.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-800">{selectedIncident.ward}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Priority:</span>
                <PriorityBadge priority={selectedIncident.priority} size="sm" />
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">GPS Coordinates:</span>
                <span className="font-mono text-slate-700">
                  {selectedIncident.coordinates.latitude.toFixed(4)}, {selectedIncident.coordinates.longitude.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Assigned Worker:</span>
                <span className="font-semibold text-teal-700">
                  {selectedIncident.assignedWorkerName || 'Unassigned (Pending)'}
                </span>
              </div>
            </div>

            {/* Dispatch Radius Controller Slider */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Dispatch Search Radius</span>
                <span className="font-mono font-bold text-teal-600">{dispatchRadiusKm.toFixed(1)} km</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={dispatchRadiusKm}
                onChange={(e) => setDispatchRadiusKm(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.5 km (Walking)</span>
                <span>2.0 km (Standard)</span>
                <span>5.0 km (Citywide)</span>
              </div>
            </div>

            {/* Nearby Field Workers List */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Nearby Fleet Response Units</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {nearbyWorkers.filter((w) => w.isRecommended).length} Available
                </span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {nearbyWorkers.map((result) => (
                  <div
                    key={result.worker.id}
                    className={`p-2.5 rounded-lg border text-xs transition ${
                      result.isRecommended
                        ? 'bg-teal-50/60 border-teal-200'
                        : 'bg-slate-50 border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-900">
                        {result.worker.fullName}
                      </div>
                      <span className="font-mono text-[11px] text-teal-700 font-bold">
                        {result.distanceKm} km (~{result.estimatedTransitMinutes}m)
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                      <span>{result.worker.specialization}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        result.worker.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {result.worker.status}
                      </span>
                    </div>

                    {allowDispatch && onDispatchWorker && selectedIncident.status !== ComplaintStatus.RESOLVED && (
                      <div className="mt-2 pt-1 border-t border-teal-100/80 flex justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onDispatchWorker(selectedIncident.id, result.worker.id)}
                          className="w-full text-[11px] py-1"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Dispatch Unit ({result.distanceKm} km away)
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
            <MapPin className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-slate-700">No Incident Selected</p>
            <p className="mt-1">Click on any map pin to activate the proximity dispatch calculator.</p>
          </div>
        )}

        {/* Selected Ward Detail Card */}
        {selectedWard && (
          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-bold text-teal-400 uppercase tracking-wider">
                {selectedWard.wardNumber}: {selectedWard.name}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono">
                {selectedWard.areaKm2} km²
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <div className="text-slate-400">Councilor</div>
                <div className="font-semibold text-slate-200">{selectedWard.councilor}</div>
              </div>
              <div>
                <div className="text-slate-400">Population</div>
                <div className="font-semibold text-slate-200">{selectedWard.population.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-400">SLA Compliance</div>
                <div className="font-bold text-emerald-400">{selectedWard.slaComplianceRate}%</div>
              </div>
              <div>
                <div className="text-slate-400">Open Backlog</div>
                <div className="font-bold text-amber-400">{selectedWard.openIncidentsCount} Incidents</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
