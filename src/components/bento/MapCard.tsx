import { BentoCard } from "./BentoCard";
import { CommandCenterState, OperationalState, Incident, DroneStatus } from "@/types/command-center";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import { DivIcon, LatLngTuple } from "leaflet";
import { useEffect, useMemo } from "react";
import { 
  Maximize2, 
  Layers, 
  Thermometer,
  Wind,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

interface MapCardProps {
  state: CommandCenterState;
  operationalState: OperationalState;
  className?: string;
  onIncidentClick?: (incident: Incident) => void;
}

// Map controller for dynamic zoom/pan
const MapController = ({ operationalState, incident }: { operationalState: OperationalState; incident?: Incident }) => {
  const map = useMap();
  
  useEffect(() => {
    if (operationalState !== "green" && incident) {
      map.flyTo([incident.location.lat, incident.location.lng], 16, { duration: 1 });
    } else {
      map.flyTo([34.0522, -118.2437], 13, { duration: 1 });
    }
  }, [operationalState, incident, map]);
  
  return null;
};

// Helper to check if drone is active (patrolling or on mission)
const isDroneActive = (status: DroneStatus): boolean => {
  return status === "patrolling" || status === "on_mission" || status === "en_route";
};

// Custom icons
const createDroneIcon = (status: DroneStatus) => new DivIcon({
  className: "custom-drone-icon",
  html: `
    <div class="relative">
      <div class="w-8 h-8 rounded-full ${isDroneActive(status) ? "bg-primary/30" : "bg-muted/30"} flex items-center justify-center ${isDroneActive(status) ? "animate-pulse" : ""}">
        <div class="w-4 h-4 rounded-full ${isDroneActive(status) ? "bg-primary" : "bg-muted-foreground"} flex items-center justify-center">
          <svg class="w-2.5 h-2.5 text-background" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const createSensorIcon = (status: string) => new DivIcon({
  className: "custom-sensor-icon",
  html: `
    <div class="w-3 h-3 rounded-full ${status === "alert" ? "bg-status-critical pulse-red" : status === "normal" ? "bg-primary pulse-cyan" : "bg-muted-foreground/50"}"></div>
  `,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const createDockIcon = () => new DivIcon({
  className: "custom-dock-icon",
  html: `
    <div class="w-4 h-4 bg-status-normal rotate-45 border border-status-normal/50"></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const createIncidentIcon = (severity: string) => new DivIcon({
  className: "custom-incident-icon",
  html: `
    <div class="relative">
      <div class="w-10 h-10 rounded-full ${severity === "critical" ? "bg-status-critical/30 pulse-red" : "bg-status-attention/30 pulse-amber"} flex items-center justify-center">
        <div class="w-5 h-5 rounded-full ${severity === "critical" ? "bg-status-critical" : "bg-status-attention"} flex items-center justify-center">
          <svg class="w-3 h-3 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M12 9v4M12 17h.01"/>
          </svg>
        </div>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Flight path component
const FlightPath = ({ positions, isPlanned = false }: { positions: LatLngTuple[]; isPlanned?: boolean }) => (
  <Polyline 
    positions={positions}
    pathOptions={{
      color: isPlanned ? "hsl(187, 100%, 50%)" : "hsl(145, 100%, 39%)",
      weight: isPlanned ? 2 : 3,
      dashArray: isPlanned ? "5, 10" : undefined,
      opacity: isPlanned ? 0.5 : 0.8,
    }}
  />
);

// Wind direction indicator overlay
const WindOverlay = ({ direction, speed }: { direction: string; speed: number }) => {
  const directionDegrees: Record<string, number> = {
    N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315
  };
  
  return (
    <div className="absolute bottom-16 left-3 p-2 bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20 z-[1000]">
      <div className="flex items-center gap-2 text-xs">
        <Wind className="w-3.5 h-3.5 text-primary" style={{ transform: `rotate(${directionDegrees[direction] || 0}deg)` }} />
        <span className="text-foreground font-mono">{speed} mph {direction}</span>
      </div>
    </div>
  );
};

// Map controls overlay
const MapControls = ({ onThermalToggle, thermalActive }: { onThermalToggle: () => void; thermalActive: boolean }) => (
  <div className="absolute top-3 right-3 flex flex-col gap-2 z-[1000]">
    <Button 
      size="icon" 
      variant="outline" 
      className={cn(
        "h-8 w-8 bg-card/80 backdrop-blur-sm border-primary/20",
        thermalActive && "bg-status-attention/20 border-status-attention/30"
      )}
      onClick={onThermalToggle}
    >
      <Thermometer className={cn("w-4 h-4", thermalActive && "text-status-attention")} />
    </Button>
    <Button size="icon" variant="outline" className="h-8 w-8 bg-card/80 backdrop-blur-sm border-primary/20">
      <Layers className="w-4 h-4" />
    </Button>
    <Button size="icon" variant="outline" className="h-8 w-8 bg-card/80 backdrop-blur-sm border-primary/20">
      <Target className="w-4 h-4" />
    </Button>
  </div>
);

export const MapCard = ({ state, operationalState, className, onIncidentClick }: MapCardProps) => {
  const activeIncident = state.incidents.find(i => i.status === "active" || i.status === "responding") || state.activeIncident;
  
  // Generate flight paths
  const flightPaths = useMemo(() => {
    return state.drones
      .filter(d => isDroneActive(d.status))
      .map(drone => {
        const points: LatLngTuple[] = [
          [drone.location.lat, drone.location.lng],
          [drone.location.lat + 0.005, drone.location.lng + 0.003],
          [drone.location.lat + 0.008, drone.location.lng - 0.002],
        ];
        return { droneId: drone.id, points };
      });
  }, [state.drones]);

  return (
    <BentoCard 
      noPadding
      priority={operationalState === "red" ? "high" : "medium"}
      pulsing={operationalState === "red" ? "red" : operationalState === "amber" ? "amber" : undefined}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Fullscreen button */}
      <Button 
        size="icon" 
        variant="ghost" 
        className="absolute top-3 left-3 z-[1000] h-8 w-8 bg-card/80 backdrop-blur-sm"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>
      
      {/* Map controls */}
      <MapControls onThermalToggle={() => {}} thermalActive={operationalState === "red"} />
      
      {/* Wind overlay */}
      <WindOverlay 
        direction={state.environmentalData.windDirection} 
        speed={state.environmentalData.windSpeed} 
      />
      
      {/* Map */}
      <div className="h-full w-full min-h-[300px]">
        <MapContainer
          center={[34.0522, -118.2437]}
          zoom={13}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          <MapController operationalState={operationalState} incident={activeIncident || undefined} />
          
          {/* Flight paths */}
          {flightPaths.map(path => (
            <FlightPath key={path.droneId} positions={path.points} />
          ))}
          
          {/* Drones */}
          {state.drones.map(drone => (
            <Marker
              key={drone.id}
              position={[drone.location.lat, drone.location.lng]}
              icon={createDroneIcon(drone.status)}
            >
              <Popup className="custom-popup">
                <div className="text-xs">
                  <div className="font-medium">{drone.id}</div>
                  <div className="text-muted-foreground">{drone.task || drone.status}</div>
                  <div className="text-muted-foreground">Battery: {drone.battery}%</div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Sensors */}
          {state.sensors.map(sensor => (
            <Marker
              key={sensor.id}
              position={[sensor.location.lat, sensor.location.lng]}
              icon={createSensorIcon(sensor.status)}
            >
              <Popup>
                <div className="text-xs">
                  <div className="font-medium">{sensor.id}</div>
                  <div className="text-muted-foreground">{sensor.type}</div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Dock stations */}
          {state.dockStations.map(dock => (
            <Marker
              key={dock.id}
              position={[dock.location.lat, dock.location.lng]}
              icon={createDockIcon()}
            >
              <Popup>
                <div className="text-xs">
                  <div className="font-medium">{dock.id}</div>
                  <div className="text-muted-foreground">Drones: {dock.dronesAvailable}/{dock.totalCapacity}</div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Active incident */}
          {activeIncident && (
            <Marker
              key={activeIncident.id}
              position={[activeIncident.location.lat, activeIncident.location.lng]}
              icon={createIncidentIcon(activeIncident.severity)}
              eventHandlers={{
                click: () => onIncidentClick?.(activeIncident),
              }}
            >
              <Popup>
                <div className="text-xs">
                  <div className="font-medium text-status-critical">{activeIncident.type.replace("_", " ")}</div>
                  <div className="text-muted-foreground">{activeIncident.address}</div>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Incident radius for red state */}
          {operationalState === "red" && activeIncident && (
            <Circle
              center={[activeIncident.location.lat, activeIncident.location.lng]}
              radius={300}
              pathOptions={{
                color: "hsl(0, 100%, 62%)",
                fillColor: "hsl(0, 100%, 62%)",
                fillOpacity: 0.1,
                weight: 2,
                dashArray: "5, 5",
              }}
            />
          )}
        </MapContainer>
      </div>
      
      {/* Thermal overlay effect */}
      {operationalState === "red" && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-status-critical/5 to-transparent z-[500]" />
      )}
    </BentoCard>
  );
};
