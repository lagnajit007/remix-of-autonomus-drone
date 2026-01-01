import { BentoCard } from "./BentoCard";
import { CommandCenterState, OperationalState, Incident } from "@/types/command-center";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import { Icon, DivIcon, LatLngTuple } from "leaflet";
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
      map.flyTo([incident.coordinates.lat, incident.coordinates.lng], 16, { duration: 1 });
    } else {
      map.flyTo([37.7749, -122.4194], 13, { duration: 1 });
    }
  }, [operationalState, incident, map]);
  
  return null;
};

// Custom icons
const createDroneIcon = (status: string) => new DivIcon({
  className: "custom-drone-icon",
  html: `
    <div class="relative">
      <div class="w-8 h-8 rounded-full ${status === "active" ? "bg-primary/30" : "bg-muted/30"} flex items-center justify-center ${status === "active" ? "animate-pulse" : ""}">
        <div class="w-4 h-4 rounded-full ${status === "active" ? "bg-primary" : "bg-muted-foreground"} flex items-center justify-center">
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

const createSensorIcon = (isActive: boolean) => new DivIcon({
  className: "custom-sensor-icon",
  html: `
    <div class="w-3 h-3 rounded-full ${isActive ? "bg-primary pulse-cyan" : "bg-muted-foreground/50"}"></div>
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
const WindOverlay = ({ direction, speed }: { direction: number; speed: number }) => (
  <div className="absolute bottom-16 left-3 p-2 bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20 z-[1000]">
    <div className="flex items-center gap-2 text-xs">
      <Wind className="w-3.5 h-3.5 text-primary" style={{ transform: `rotate(${direction}deg)` }} />
      <span className="text-foreground font-mono">{speed} m/s</span>
    </div>
  </div>
);

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
  const activeIncident = state.incidents.find(i => i.status === "active" || i.status === "responding");
  
  // Generate flight paths
  const flightPaths = useMemo(() => {
    return state.drones
      .filter(d => d.status === "active")
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
      <WindOverlay direction={state.environmental?.windDirection || 0} speed={state.environmental?.windSpeed || 0} />
      
      {/* Map */}
      <div className="h-full w-full min-h-[300px]">
        <MapContainer
          center={[37.7749, -122.4194]}
          zoom={13}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          <MapController operationalState={operationalState} incident={activeIncident} />
          
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
                  <div className="text-muted-foreground">{drone.currentTask}</div>
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
              icon={createSensorIcon(sensor.status === "active")}
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
                  <div className="font-medium">{dock.name}</div>
                  <div className="text-muted-foreground">Drones: {dock.dronesAvailable}/{dock.totalSlots}</div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Incidents */}
          {state.incidents
            .filter(i => i.status === "active" || i.status === "responding")
            .map(incident => (
              <Marker
                key={incident.id}
                position={[incident.coordinates.lat, incident.coordinates.lng]}
                icon={createIncidentIcon(incident.severity)}
                eventHandlers={{
                  click: () => onIncidentClick?.(incident),
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <div className="font-medium text-status-critical">{incident.title}</div>
                    <div className="text-muted-foreground">{incident.location}</div>
                    <div className="text-muted-foreground">Confidence: {incident.confidence}%</div>
                  </div>
                </Popup>
              </Marker>
            ))
          }
          
          {/* Incident radius for red state */}
          {operationalState === "red" && activeIncident && (
            <Circle
              center={[activeIncident.coordinates.lat, activeIncident.coordinates.lng]}
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
