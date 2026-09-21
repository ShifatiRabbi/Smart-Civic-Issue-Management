/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * MUNICIPAL GIS & SPATIAL TELEMETRY MOCK DATA (STEP 10)
 */

import { WardBoundary, InfrastructureAsset, WorkerFleetTelemetry } from '../types/gis';
import { MOCK_FIELD_WORKERS } from './mockData';

export const MOCK_WARD_BOUNDARIES: WardBoundary[] = [
  {
    id: 'ward-01',
    wardNumber: 'Ward 1',
    name: 'Downtown Commercial Core',
    councilor: 'Adv. Farhan Chowdhury',
    population: 85200,
    areaKm2: 4.8,
    centerCoordinates: { latitude: 23.815, longitude: 90.405 },
    svgPolygon: 'M 40 40 L 220 30 L 250 180 L 30 150 Z',
    incidentDensity: 'CRITICAL',
    openIncidentsCount: 14,
    slaComplianceRate: 91.5,
  },
  {
    id: 'ward-02',
    wardNumber: 'Ward 2',
    name: 'Riverside & Maritime Port',
    councilor: 'Begum Salma Khatun',
    population: 62400,
    areaKm2: 6.2,
    centerCoordinates: { latitude: 23.818, longitude: 90.418 },
    svgPolygon: 'M 220 30 L 460 50 L 470 170 L 250 180 Z',
    incidentDensity: 'HIGH',
    openIncidentsCount: 9,
    slaComplianceRate: 94.0,
  },
  {
    id: 'ward-03',
    wardNumber: 'Ward 3',
    name: 'Industrial Sector & Logistics Hub',
    councilor: 'Engr. Mahbubur Rahman',
    population: 48000,
    areaKm2: 8.5,
    centerCoordinates: { latitude: 23.805, longitude: 90.400 },
    svgPolygon: 'M 30 150 L 250 180 L 240 330 L 40 310 Z',
    incidentDensity: 'MEDIUM',
    openIncidentsCount: 6,
    slaComplianceRate: 96.2,
  },
  {
    id: 'ward-04',
    wardNumber: 'Ward 4',
    name: 'Green Valley Residential Township',
    councilor: 'Dr. Nasreen Akhtar',
    population: 112000,
    areaKm2: 7.1,
    centerCoordinates: { latitude: 23.808, longitude: 90.420 },
    svgPolygon: 'M 250 180 L 470 170 L 460 330 L 240 330 Z',
    incidentDensity: 'LOW',
    openIncidentsCount: 4,
    slaComplianceRate: 98.1,
  },
];

export const MOCK_INFRASTRUCTURE_ASSETS: InfrastructureAsset[] = [
  {
    id: 'infra-1',
    name: 'Central Water Treatment Plant & Reservoir',
    type: 'WATER_MAIN',
    coordinates: { latitude: 23.819, longitude: 90.412 },
    status: 'OPERATIONAL',
    capacityNotes: 'Supplies 14M Gallons/Day across Wards 1, 2, and 4',
  },
  {
    id: 'infra-2',
    name: 'Metro Grid 132kV Primary Substation',
    type: 'POWER_SUBSTATION',
    coordinates: { latitude: 23.811, longitude: 90.402 },
    status: 'OPERATIONAL',
    capacityNotes: 'Feeds downtown street lighting and municipal pumps',
  },
  {
    id: 'infra-3',
    name: 'Riverside Canal Sluice Gate & Drainage Lock',
    type: 'DRAINAGE_CANAL',
    coordinates: { latitude: 23.816, longitude: 90.422 },
    status: 'DEGRADED',
    capacityNotes: 'Silt accumulation reducing flow capacity by 20%',
  },
  {
    id: 'infra-4',
    name: 'Buriganga North Arterial Flyover',
    type: 'ARTERIAL_BRIDGE',
    coordinates: { latitude: 23.812, longitude: 90.410 },
    status: 'OPERATIONAL',
    capacityNotes: 'Critical emergency vehicle corridor connecting East & West',
  },
  {
    id: 'infra-5',
    name: 'City Central General Hospital & Emergency Ward',
    type: 'HOSPITAL',
    coordinates: { latitude: 23.814, longitude: 90.407 },
    status: 'OPERATIONAL',
    capacityNotes: 'Designated quiet zone; priority zero-downtime utility status',
  },
];

export const MOCK_FLEET_TELEMETRY: WorkerFleetTelemetry[] = [
  {
    worker: MOCK_FIELD_WORKERS[0], // Unit 4 (Kabir Hossain)
    coordinates: { latitude: 23.813, longitude: 90.409 },
    heading: 85,
    speedKmh: 24,
    batteryPercent: 92,
    status: 'EN_ROUTE',
    currentAssignedComplaintId: 'cmp-1001',
  },
  {
    worker: MOCK_FIELD_WORKERS[1], // Unit 9 (Shafiqul Islam)
    coordinates: { latitude: 23.819, longitude: 90.414 },
    heading: 190,
    speedKmh: 0,
    batteryPercent: 78,
    status: 'ON_SITE',
    currentAssignedComplaintId: 'cmp-1002',
  },
  {
    worker: MOCK_FIELD_WORKERS[2], // Unit 2 (Abdul Malek)
    coordinates: { latitude: 23.807, longitude: 90.418 },
    heading: 0,
    speedKmh: 0,
    batteryPercent: 88,
    status: 'AVAILABLE',
  },
  {
    worker: MOCK_FIELD_WORKERS[3], // Unit 14 (Zahirul Haque)
    coordinates: { latitude: 23.817, longitude: 90.403 },
    heading: 270,
    speedKmh: 35,
    batteryPercent: 64,
    status: 'EN_ROUTE',
    currentAssignedComplaintId: 'cmp-1004',
  },
  {
    worker: MOCK_FIELD_WORKERS[4], // Unit 8 (Kamal Uddin)
    coordinates: { latitude: 23.806, longitude: 90.402 },
    heading: 120,
    speedKmh: 12,
    batteryPercent: 95,
    status: 'AVAILABLE',
  },
];
