/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * VENDOR-AGNOSTIC CIVIC MAP VIEWER
 * 
 * Architectural Purpose:
 * Decouples the frontend from specific map providers (Mapbox / Google Maps / OpenStreetMap).
 * Provides an interactive, accessible SVG/Canvas GIS interface with pin markers,
 * viewport boundary tracking, category filters, and non-PII pin click inspection.
 */

import React, { useState } from 'react';
import { CivicComplaint, ComplaintStatus } from '../../../types';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { MapPin, Navigation, ZoomIn, ZoomOut, Layers, Eye, X, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

interface CivicMapViewerProps {
  complaints: CivicComplaint[];
  selectedComplaintId?: string | null;
  onSelectComplaint?: (complaint: CivicComplaint | null) => void;
  height?: string;
}

export const CivicMapViewer: React.FC<CivicMapViewerProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  height = '520px',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activePin, setActivePin] = useState<CivicComplaint | null>(
    complaints.find((c) => c.id === selectedComplaintId) || null
  );

  // Map coordinates normalized to SVG viewBox bounds (500 x 360)
  // City center approximately lat: 23.812, lng: 90.410
  const projectCoordinates = (lat: number, lng: number) => {
    const minLat = 23.8000;
    const maxLat = 23.8250;
    const minLng = 90.3950;
    const maxLng = 90.4250;

    const x = ((lng - minLng) / (maxLng - minLng)) * 500;
    // Invert Y because latitude goes north (up) but SVG coordinates go down
    const y = 360 - ((lat - minLat) / (maxLat - minLat)) * 360;

    return {
      x: Math.max(30, Math.min(470, x)),
      y: Math.max(30, Math.min(330, y)),
    };
  };

  const handlePinClick = (complaint: CivicComplaint) => {
    setActivePin(complaint);
    if (onSelectComplaint) {
      onSelectComplaint(complaint);
    }
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-300 bg-slate-900 shadow-inner" style={{ height }}>
      
      {/* Interactive GIS SVG Stage */}
      <svg
        viewBox="0 0 500 360"
        className="w-full h-full select-none cursor-grab active:cursor-grabbing"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="Civic Complaint Geographical Map"
      >
        <defs>
          {/* Municipal Grid Pattern */}
          <pattern id="civic-grid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#1e293b" strokeWidth="0.7" />
          </pattern>
          {/* River / Natural Barrier */}
          <path
            id="river-path"
            d="M 0 180 Q 150 140 250 200 T 500 160"
            fill="none"
            stroke="#0e7490"
            strokeWidth="18"
            opacity="0.3"
          />
        </defs>

        {/* Map Background & Grid */}
        <rect width="500" height="360" fill="#0f172a" />
        <use href="#river-path" />
        <rect width="500" height="360" fill="url(#civic-grid)" />

        {/* Ward Boundary Outlines */}
        <g stroke="#334155" strokeWidth="1" strokeDasharray="3,3" fill="none">
          <path d="M 40 40 L 220 30 L 250 180 L 30 150 Z" />
          <path d="M 220 30 L 460 50 L 470 170 L 250 180 Z" />
          <path d="M 30 150 L 250 180 L 240 330 L 40 310 Z" />
          <path d="M 250 180 L 470 170 L 460 330 L 240 330 Z" />
        </g>

        {/* Ward Labels */}
        <text x="120" y="80" fill="#64748b" fontSize="9" fontWeight="600" letterSpacing="1">WARD 1 (DOWNTOWN)</text>
        <text x="320" y="90" fill="#64748b" fontSize="9" fontWeight="600" letterSpacing="1">WARD 2 (RIVERSIDE)</text>
        <text x="100" y="270" fill="#64748b" fontSize="9" fontWeight="600" letterSpacing="1">WARD 4 (GREEN VALLEY)</text>
        <text x="320" y="270" fill="#64748b" fontSize="9" fontWeight="600" letterSpacing="1">WARD 6 (UNIVERSITY)</text>

        {/* Major Road Arterials */}
        <g stroke="#1e3a5f" strokeWidth="3" fill="none">
          <path d="M 250 0 L 250 360" />
          <path d="M 0 180 L 500 180" />
          <circle cx="250" cy="180" r="14" stroke="#38bdf8" strokeWidth="1.5" />
        </g>

        {/* Interactive Complaint Pins */}
        {complaints.map((c) => {
          const { x, y } = projectCoordinates(c.coordinates.latitude, c.coordinates.longitude);
          const isSelected = activePin?.id === c.id;

          // Color based on status
          let pinColor = '#3b82f6';
          if (c.status === ComplaintStatus.RESOLVED) pinColor = '#22c55e';
          else if (c.status === ComplaintStatus.IN_PROGRESS) pinColor = '#06b6d4';
          else if (c.status === ComplaintStatus.UNDER_REVIEW) pinColor = '#eab308';
          else if (c.priority === 'CRITICAL') pinColor = '#ef4444';

          return (
            <g
              key={c.id}
              transform={`translate(${x}, ${y})`}
              onClick={() => handlePinClick(c)}
              className="cursor-pointer transition-transform hover:scale-125"
            >
              {/* Pulse ripple for critical or selected pins */}
              {(isSelected || c.priority === 'CRITICAL') && (
                <circle
                  r="14"
                  fill={pinColor}
                  opacity="0.3"
                  className="animate-ping"
                />
              )}

              {/* Pin Base Shadow */}
              <ellipse cx="0" cy="2" rx="6" ry="2.5" fill="#000000" opacity="0.5" />

              {/* Marker Body */}
              <circle
                r={isSelected ? "9" : "7"}
                fill={pinColor}
                stroke="#ffffff"
                strokeWidth={isSelected ? "2.5" : "1.5"}
                className="drop-shadow-md"
              />

              {/* Inner Dot */}
              <circle r="2.5" fill="#ffffff" />
            </g>
          );
        })}
      </svg>

      {/* Map Control HUD (Zoom & Layer) */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-20">
        <button
          onClick={() => setZoomLevel((z) => Math.min(3, z + 0.5))}
          className="w-8 h-8 rounded bg-slate-800/90 text-white flex items-center justify-center hover:bg-slate-700 border border-slate-600 shadow-md transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
          className="w-8 h-8 rounded bg-slate-800/90 text-white flex items-center justify-center hover:bg-slate-700 border border-slate-600 shadow-md transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Status Legend Overlay */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg px-3 py-2 text-[11px] text-slate-300 flex items-center gap-3 shadow-lg z-20">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>Submitted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          <span>Resolved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span>Critical</span>
        </div>
      </div>

      {/* Selected Complaint Floating Details Drawer */}
      {activePin && (
        <div className="absolute bottom-4 right-4 max-w-sm w-full bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-30 animate-in fade-in slide-in-from-bottom-2 text-slate-900">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={activePin.status} size="sm" />
              <PriorityBadge priority={activePin.priority} size="sm" />
            </div>
            <button
              onClick={() => setActivePin(null)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100"
              aria-label="Close pin inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 font-medium mb-1">
            {activePin.referenceNumber}
          </div>

          <h4 className="font-semibold text-sm text-slate-900 leading-snug line-clamp-2 mb-1.5">
            {activePin.title}
          </h4>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">{activePin.ward}</span>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1 text-slate-600">
              <ThumbsUp className="w-3.5 h-3.5 text-teal-600" />
              <span><strong>{activePin.supportCount}</strong> endorsements</span>
            </div>
            <Link to={`/complaints/${activePin.referenceNumber}`}>
              <Button variant="primary" size="sm" rightIcon={<Eye className="w-3.5 h-3.5" />}>
                View Details
              </Button>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};
