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

// Helper to format time
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

export const mockDrones: Drone[] = [
  {
    id: 'D-247',
    status: 'patrolling',
    battery: 85,
    location: { lat: 34.0495, lng: -118.2401 },
    position: [34.0495, -118.2401],
    task: 'Thermal reconnaissance',
    zone: 'Sector Alpha',
    signalStrength: 98,
  },
  {
    id: 'D-309',
    status: 'docked',
    battery: 100,
    location: { lat: 34.0550, lng: -118.2500 },
    position: [34.0550, -118.2500],
    zone: 'Dock Station 1',
    signalStrength: 100,
  },
  {
    id: 'D-118',
    status: 'patrolling',
    battery: 67,
    location: { lat: 34.0480, lng: -118.2350 },
    position: [34.0480, -118.2350],
    task: 'Perimeter patrol',
    zone: 'Sector Bravo',
    signalStrength: 92,
  },
  {
    id: 'D-422',
    status: 'docked',
    battery: 45,
    location: { lat: 34.0600, lng: -118.2550 },
    position: [34.0600, -118.2550],
    zone: 'Dock Station 2',
    signalStrength: 100,
  },
  {
    id: 'D-621',
    status: 'returning',
    battery: 23,
    location: { lat: 34.0510, lng: -118.2430 },
    position: [34.0510, -118.2430],
    task: 'RTH - Low battery',
    zone: 'En route to Dock 1',
    signalStrength: 88,
  },
  {
    id: 'D-734',
    status: 'offline',
    battery: 0,
    location: { lat: 34.0600, lng: -118.2550 },
    position: [34.0600, -118.2550],
    zone: 'Dock Station 2',
    signalStrength: 0,
  },
];

export const mockSensors: Sensor[] = [
  { id: 'S-001', type: 'thermal', location: { lat: 34.0510, lng: -118.2420 }, position: [34.0510, -118.2420], temperature: 24, lastReading: '24°C', status: 'normal' },
  { id: 'S-002', type: 'thermal', location: { lat: 34.0530, lng: -118.2380 }, position: [34.0530, -118.2380], temperature: 23, lastReading: '23°C', status: 'normal' },
  { id: 'S-003', type: 'smoke', location: { lat: 34.0490, lng: -118.2450 }, position: [34.0490, -118.2450], lastReading: 'Clear', status: 'normal' },
  { id: 'S-004', type: 'motion', location: { lat: 34.0520, lng: -118.2500 }, position: [34.0520, -118.2500], lastReading: 'No activity', status: 'normal' },
  { id: 'S-005', type: 'thermal', location: { lat: 34.0475, lng: -118.2400 }, position: [34.0475, -118.2400], temperature: 25, lastReading: '25°C', status: 'normal' },
  { id: 'S-006', type: 'camera', location: { lat: 34.0545, lng: -118.2460 }, position: [34.0545, -118.2460], lastReading: 'Recording', status: 'normal' },
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
  coordinates: [34.0522, -118.2437],
  address: 'Foothills Residential Area',
  title: 'THERMAL ANOMALY DETECTED',
  priority: 1,
  confidence: 92,
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
  dronesAssigned: [],
  groundUnits: [],
  evacuationsSent: 0,
};

// Active incident with response in progress
export const mockActiveIncident: Incident = {
  id: 'INC-2847',
  type: 'fire',
  severity: 'critical',
  location: { lat: 34.0522, lng: -118.2437 },
  coordinates: [34.0522, -118.2437],
  address: 'Foothills Residential Area',
  title: 'WILDFIRE - ACTIVE RESPONSE',
  priority: 1,
  confidence: 98,
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
  dronesAssigned: ['D-247', 'D-309'],
  groundUnits: ['Fire Unit 12', 'Fire Unit 7'],
  evacuationsSent: 47,
};

// Helper to create timeline events with formatted time
const createTimelineEvent = (
  id: string, 
  timestamp: Date, 
  type: TimelineEvent['type'], 
  message: string, 
  severity: TimelineEvent['severity']
): TimelineEvent => ({
  id,
  timestamp,
  time: formatTime(timestamp),
  type,
  message,
  description: message,
  severity,
});

export const mockTimelineGreen: TimelineEvent[] = [
  createTimelineEvent('1', new Date(Date.now() - 3600000), 'detection', 'Routine patrol completed - Sector Alpha', 'info'),
  createTimelineEvent('2', new Date(Date.now() - 2400000), 'dispatch', 'D-118 deployed for perimeter check', 'info'),
  createTimelineEvent('3', new Date(Date.now() - 1200000), 'detection', 'All sensors reporting normal', 'info'),
  createTimelineEvent('4', new Date(Date.now() - 600000), 'coordination', 'Shift change acknowledged', 'info'),
  createTimelineEvent('5', new Date(Date.now() - 300000), 'detection', 'D-247 battery at 85%', 'info'),
];

export const mockTimelineAmber: TimelineEvent[] = [
  createTimelineEvent('1', new Date(Date.now() - 15000), 'detection', 'Thermal anomaly detected by S-002', 'warning'),
  createTimelineEvent('2', new Date(Date.now() - 12000), 'detection', 'AI analysis initiated', 'info'),
  createTimelineEvent('3', new Date(Date.now() - 8000), 'confirmation', 'Threat validated - Heat signature 287°C', 'warning'),
  createTimelineEvent('4', new Date(Date.now() - 5000), 'dispatch', 'D-247 dispatched from patrol route', 'info'),
  createTimelineEvent('5', new Date(), 'coordination', 'ETA to incident: 27 seconds', 'info'),
];

export const mockTimelineRed: TimelineEvent[] = [
  createTimelineEvent('1', new Date(Date.now() - 120000), 'detection', 'Thermal signature detected', 'warning'),
  createTimelineEvent('2', new Date(Date.now() - 105000), 'confirmation', 'AI validated threat, D-247 dispatched', 'warning'),
  createTimelineEvent('3', new Date(Date.now() - 78000), 'confirmation', 'Fire confirmed, 50m from residential', 'critical'),
  createTimelineEvent('4', new Date(Date.now() - 65000), 'coordination', 'Fire department notified with coordinates', 'info'),
  createTimelineEvent('5', new Date(Date.now() - 50000), 'evacuation', '47 households alerted via emergency system', 'warning'),
  createTimelineEvent('6', new Date(Date.now() - 35000), 'dispatch', 'D-309 deployed for evacuation support', 'info'),
  createTimelineEvent('7', new Date(Date.now() - 20000), 'coordination', 'Fire Unit 12 en route, ETA 4 minutes', 'info'),
  createTimelineEvent('8', new Date(Date.now() - 5000), 'coordination', 'D-247 providing live thermal feed', 'info'),
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