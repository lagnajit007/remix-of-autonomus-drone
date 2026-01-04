// FlytBase Command Center Types

export type OperationalState = 'green' | 'amber' | 'red';

export type DroneStatus = 'patrolling' | 'docked' | 'en_route' | 'on_mission' | 'returning' | 'offline';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentType = 'thermal_anomaly' | 'fire' | 'intrusion' | 'medical' | 'accident';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Drone {
  id: string;
  status: DroneStatus;
  battery: number;
  location: Coordinates;
  position?: [number, number]; // For Leaflet compatibility
  task?: string;
  zone?: string;
  eta?: number;
  signalStrength: number;
}

export interface Sensor {
  id: string;
  type: 'thermal' | 'motion' | 'smoke' | 'camera';
  location: Coordinates;
  position?: [number, number]; // For Leaflet compatibility
  temperature?: number;
  lastReading: string;
  status: 'normal' | 'alert' | 'offline';
}

export interface DockStation {
  id: string;
  location: Coordinates;
  dronesAvailable: number;
  totalCapacity: number;
  status: 'operational' | 'maintenance';
}

export interface ThreatAssessment {
  heatSignature: number;
  growthRate: string;
  windSpeed: string;
  windDirection: string;
  structuresAtRisk: number;
  distanceToStructures: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  location: Coordinates;
  coordinates?: [number, number]; // For Leaflet compatibility
  address: string;
  // Display properties
  title?: string;
  priority?: 1 | 2 | 3; // 1=Critical, 2=Attention, 3=Monitor
  confidence?: number; // AI confidence percentage
  detectedAt: Date;
  status: 'detected' | 'responding' | 'active' | 'contained' | 'resolved';
  threatAssessment: ThreatAssessment;
  assignedDrones: string[];
  dronesAssigned?: string[]; // Alias for compatibility
  groundUnits: string[];
  evacuationsSent: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  time?: string; // Formatted time string for display
  type: 'detection' | 'dispatch' | 'confirmation' | 'coordination' | 'evacuation' | 'resolution';
  message: string;
  description?: string; // Alias for compatibility
  severity: 'info' | 'warning' | 'critical';
}

export interface EnvironmentalData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibility: string;
}

export interface CommandCenterState {
  operationalState: OperationalState;
  drones: Drone[];
  sensors: Sensor[];
  dockStations: DockStation[];
  incidents: Incident[];
  activeIncident: Incident | null;
  timeline: TimelineEvent[];
  environmentalData: EnvironmentalData;
}