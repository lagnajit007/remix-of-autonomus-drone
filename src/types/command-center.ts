// FlytBase Command Center Types

export type OperationalState = 'green' | 'amber' | 'red';

export type DroneStatus = 'patrolling' | 'docked' | 'en_route' | 'on_mission' | 'returning';

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
  task?: string;
  zone?: string;
  eta?: number;
  signalStrength: number;
}

export interface Sensor {
  id: string;
  type: 'thermal' | 'motion' | 'smoke' | 'camera';
  location: Coordinates;
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
  address: string;
  detectedAt: Date;
  status: 'detected' | 'responding' | 'active' | 'contained' | 'resolved';
  threatAssessment: ThreatAssessment;
  assignedDrones: string[];
  groundUnits: string[];
  evacuationsSent: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'detection' | 'dispatch' | 'confirmation' | 'coordination' | 'evacuation' | 'resolution';
  message: string;
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
