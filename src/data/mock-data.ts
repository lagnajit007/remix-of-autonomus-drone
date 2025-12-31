import { 
  Drone, 
  Sensor, 
  DockStation, 
  Incident, 
  TimelineEvent, 
  EnvironmentalData,
  CommandCenterState 
} from '@/types/command-center';

// Los Angeles Foothills region coordinates
const LA_CENTER = { lat: 34.0522, lng: -118.2437 };

export const mockDrones: Drone[] = [
  {
    id: 'D-247',
    status: 'patrolling',
    battery: 85,
    location: { lat: 34.0495, lng: -118.2401 },
    task: 'Thermal reconnaissance',
    zone: 'Sector Alpha',
    signalStrength: 98,
  },
  {
    id: 'D-309',
    status: 'docked',
    battery: 100,
    location: { lat: 34.0550, lng: -118.2500 },
    zone: 'Dock Station 1',
    signalStrength: 100,
  },
  {
    id: 'D-118',
    status: 'patrolling',
    battery: 67,
    location: { lat: 34.0480, lng: -118.2350 },
    task: 'Perimeter patrol',
    zone: 'Sector Bravo',
    signalStrength: 92,
  },
  {
    id: 'D-422',
    status: 'docked',
    battery: 45,
    location: { lat: 34.0600, lng: -118.2550 },
    zone: 'Dock Station 2',
    signalStrength: 100,
  },
];

export const mockSensors: Sensor[] = [
  { id: 'S-001', type: 'thermal', location: { lat: 34.0510, lng: -118.2420 }, lastReading: '24°C', status: 'normal' },
  { id: 'S-002', type: 'thermal', location: { lat: 34.0530, lng: -118.2380 }, lastReading: '23°C', status: 'normal' },
  { id: 'S-003', type: 'smoke', location: { lat: 34.0490, lng: -118.2450 }, lastReading: 'Clear', status: 'normal' },
  { id: 'S-004', type: 'motion', location: { lat: 34.0520, lng: -118.2500 }, lastReading: 'No activity', status: 'normal' },
  { id: 'S-005', type: 'thermal', location: { lat: 34.0475, lng: -118.2400 }, lastReading: '25°C', status: 'normal' },
  { id: 'S-006', type: 'camera', location: { lat: 34.0545, lng: -118.2460 }, lastReading: 'Recording', status: 'normal' },
];

export const mockDockStations: DockStation[] = [
  { id: 'Dock-1', location: { lat: 34.0550, lng: -118.2500 }, dronesAvailable: 2, totalCapacity: 4, status: 'operational' },
  { id: 'Dock-2', location: { lat: 34.0600, lng: -118.2550 }, dronesAvailable: 1, totalCapacity: 4, status: 'operational' },
  { id: 'Dock-3', location: { lat: 34.0450, lng: -118.2350 }, dronesAvailable: 3, totalCapacity: 4, status: 'operational' },
];

export const mockEnvironmentalData: EnvironmentalData = {
  temperature: 28,
  humidity: 35,
  windSpeed: 18,
  windDirection: 'NE',
  visibility: 'Clear',
};

// Alert state incident
export const mockIncidentDetected: Incident = {
  id: 'INC-2847',
  type: 'thermal_anomaly',
  severity: 'high',
  location: { lat: 34.0522, lng: -118.2437 },
  address: 'Foothills Residential Area',
  detectedAt: new Date(),
  status: 'detected',
  threatAssessment: {
    heatSignature: 287,
    growthRate: '12m/min',
    windSpeed: '18mph',
    windDirection: 'NE',
    structuresAtRisk: 47,
    distanceToStructures: '50m',
  },
  assignedDrones: [],
  groundUnits: [],
  evacuationsSent: 0,
};

// Active incident with response in progress
export const mockActiveIncident: Incident = {
  id: 'INC-2847',
  type: 'fire',
  severity: 'critical',
  location: { lat: 34.0522, lng: -118.2437 },
  address: 'Foothills Residential Area',
  detectedAt: new Date(Date.now() - 120000), // 2 minutes ago
  status: 'active',
  threatAssessment: {
    heatSignature: 450,
    growthRate: '18m/min',
    windSpeed: '18mph',
    windDirection: 'NE',
    structuresAtRisk: 47,
    distanceToStructures: '30m',
  },
  assignedDrones: ['D-247', 'D-309'],
  groundUnits: ['Fire Unit 12', 'Fire Unit 7'],
  evacuationsSent: 47,
};

export const mockTimelineGreen: TimelineEvent[] = [
  { id: '1', timestamp: new Date(Date.now() - 3600000), type: 'detection', message: 'Routine patrol completed - Sector Alpha', severity: 'info' },
  { id: '2', timestamp: new Date(Date.now() - 2400000), type: 'dispatch', message: 'D-118 deployed for perimeter check', severity: 'info' },
  { id: '3', timestamp: new Date(Date.now() - 1200000), type: 'detection', message: 'All sensors reporting normal', severity: 'info' },
  { id: '4', timestamp: new Date(Date.now() - 600000), type: 'coordination', message: 'Shift change acknowledged', severity: 'info' },
  { id: '5', timestamp: new Date(Date.now() - 300000), type: 'detection', message: 'D-247 battery at 85%', severity: 'info' },
];

export const mockTimelineAmber: TimelineEvent[] = [
  { id: '1', timestamp: new Date(Date.now() - 15000), type: 'detection', message: 'Thermal anomaly detected by S-002', severity: 'warning' },
  { id: '2', timestamp: new Date(Date.now() - 12000), type: 'detection', message: 'AI analysis initiated', severity: 'info' },
  { id: '3', timestamp: new Date(Date.now() - 8000), type: 'confirmation', message: 'Threat validated - Heat signature 287°C', severity: 'warning' },
  { id: '4', timestamp: new Date(Date.now() - 5000), type: 'dispatch', message: 'D-247 dispatched from patrol route', severity: 'info' },
  { id: '5', timestamp: new Date(), type: 'coordination', message: 'ETA to incident: 27 seconds', severity: 'info' },
];

export const mockTimelineRed: TimelineEvent[] = [
  { id: '1', timestamp: new Date(Date.now() - 120000), type: 'detection', message: 'Thermal signature detected', severity: 'warning' },
  { id: '2', timestamp: new Date(Date.now() - 105000), type: 'confirmation', message: 'AI validated threat, D-247 dispatched', severity: 'warning' },
  { id: '3', timestamp: new Date(Date.now() - 78000), type: 'confirmation', message: 'Fire confirmed, 50m from residential', severity: 'critical' },
  { id: '4', timestamp: new Date(Date.now() - 65000), type: 'coordination', message: 'Fire department notified with coordinates', severity: 'info' },
  { id: '5', timestamp: new Date(Date.now() - 50000), type: 'evacuation', message: '47 households alerted via emergency system', severity: 'warning' },
  { id: '6', timestamp: new Date(Date.now() - 35000), type: 'dispatch', message: 'D-309 deployed for evacuation support', severity: 'info' },
  { id: '7', timestamp: new Date(Date.now() - 20000), type: 'coordination', message: 'Fire Unit 12 en route, ETA 4 minutes', severity: 'info' },
  { id: '8', timestamp: new Date(Date.now() - 5000), type: 'coordination', message: 'D-247 providing live thermal feed', severity: 'info' },
];

export const getInitialState = (): CommandCenterState => ({
  operationalState: 'green',
  drones: mockDrones,
  sensors: mockSensors,
  dockStations: mockDockStations,
  incidents: [],
  activeIncident: null,
  timeline: mockTimelineGreen,
  environmentalData: mockEnvironmentalData,
});
