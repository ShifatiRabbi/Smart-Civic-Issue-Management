/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * GEOSPATIAL & GIS COMMAND DOMAIN TYPES (STEP 10)
 * 
 * Architectural Purpose:
 * Defines geospatial layers, telemetry coordinates, ward boundaries,
 * spatial dispatch calculations, and fleet telemetry models.
 */

import { CivicComplaint, FieldWorker } from './index';

export type GisLayerType = 'INCIDENTS' | 'HEATMAP' | 'WARDS' | 'FLEET' | 'INFRASTRUCTURE';

export interface WardBoundary {
  id: string;
  wardNumber: string;
  name: string;
  councilor: string;
  population: number;
  areaKm2: number;
  centerCoordinates: { latitude: number; longitude: number };
  svgPolygon: string; // SVG path polygon representation
  incidentDensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  openIncidentsCount: number;
  slaComplianceRate: number;
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  type: 'WATER_MAIN' | 'POWER_SUBSTATION' | 'DRAINAGE_CANAL' | 'ARTERIAL_BRIDGE' | 'HOSPITAL';
  coordinates: { latitude: number; longitude: number };
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE_REQUIRED';
  capacityNotes: string;
}

export interface WorkerFleetTelemetry {
  worker: FieldWorker;
  coordinates: { latitude: number; longitude: number };
  heading: number; // 0-360 degrees
  speedKmh: number;
  batteryPercent: number;
  status: 'AVAILABLE' | 'EN_ROUTE' | 'ON_SITE' | 'OFF_DUTY';
  currentAssignedComplaintId?: string;
}

export interface ProximityQueryResult {
  worker: FieldWorker;
  distanceKm: number;
  estimatedTransitMinutes: number;
  coordinates: { latitude: number; longitude: number };
  isRecommended: boolean;
}
