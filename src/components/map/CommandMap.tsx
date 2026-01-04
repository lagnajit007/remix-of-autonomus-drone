import { useEffect, useState, useRef, useMemo, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CommandCenterState, OperationalState } from "@/types/command-center";
import { 
  Layers, 
  Cloud, 
  Navigation,
  Plus, 
  Minus, 
  Maximize2,
  RotateCcw
} from "lucide-react";

interface CommandMapProps {
  state: CommandCenterState;
  operationalState: OperationalState;
  selectedDroneId?: string | null;
  mapCenter?: [number, number] | null;
  className?: string;
}


/**
 * Center Map (Primary View)
 * 
 * Map Provider: Dark topographic style
 * 
 * Layers (Toggle on/off):
 * - Sensor Coverage (Cyan dots)
 * - Drone Positions (Hexagon icons)
 * - Incident Markers (Priority-colored)
 * - Geofences/No-Fly Zones (Orange outlines)
 * - Wind Direction (Arrows)
 * - Evacuation Zones (When Active)
 */

export function CommandMap({ state, operationalState, selectedDroneId, mapCenter, className }: CommandMapProps) {
  const [mapLibs, setMapLibs] = useState<{
    MapContainer: any;
    TileLayer: any;
    Circle: any;
    Popup: any;
    useMap: any;
  } | null>(null);
  const [mapError, setMapError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapInstanceRef = useRef<any>(null);

  // Memoize sensor positions to avoid unnecessary recalculations
  const sensorPositions = useMemo(() => {
    return state.sensors?.map((sensor) => ({
      id: sensor.id,
      position: sensor.position || [sensor.location.lat, sensor.location.lng],
      status: sensor.status,
      lastReading: sensor.lastReading,
    })) || [];
  }, [state.sensors]);

  // Memoize drone positions
  const dronePositions = useMemo(() => {
    return state.drones?.map((drone) => ({
      id: drone.id,
      position: drone.position || [drone.location.lat, drone.location.lng],
      status: drone.status,
      battery: drone.battery,
      task: drone.task,
      isSelected: selectedDroneId === drone.id,
    })) || [];
  }, [state.drones, selectedDroneId]);

  // Load map libraries only once
  useEffect(() => {
    let mounted = true;
    let cssLoaded = false;

    const loadMap = async () => {
      try {
        // Import Leaflet CSS only once
        if (!cssLoaded) {
          await import("leaflet/dist/leaflet.css");
          cssLoaded = true;
        }
        
        // Import React-Leaflet components
        const { MapContainer, TileLayer, Circle, Popup, useMap } = await import("react-leaflet");
        const L = await import("leaflet");

        // Fix default marker icons (only once)
        if (!(L.Icon.Default.prototype as any)._iconUrlFixed) {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          });
          (L.Icon.Default.prototype as any)._iconUrlFixed = true;
        }

        if (mounted) {
          setMapLibs({ MapContainer, TileLayer, Circle, Popup, useMap });
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to load map:", error);
        if (mounted) {
          setMapError(true);
          setIsLoading(false);
        }
      }
    };

    loadMap();

    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount

  // Memoize the initial center
  const initialCenter = useMemo(() => mapCenter || [34.0522, -118.2437], [mapCenter]);

  // Render map content
  const renderMapContent = useCallback(() => {
    if (mapError) {
      return <MapFallback state={state} operationalState={operationalState} />;
    }

    if (isLoading || !mapLibs) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-muted-foreground">Loading map...</div>
        </div>
      );
    }

    const { MapContainer, TileLayer, Circle, Popup, useMap } = mapLibs;

    // Create MapCenterUpdater component inside this scope
    const MapCenterUpdater = () => {
      const map = useMap();
      useEffect(() => {
        mapInstanceRef.current = map;
        if (mapCenter && map) {
          const currentZoom = map.getZoom();
          map.setView(mapCenter, currentZoom, { animate: true });
        }
      }, [mapCenter, map]);
      return null;
    };

    return (
      <MapContainer
        center={initialCenter}
        zoom={13}
        className="w-full h-full rounded-lg"
        zoomControl={false}
        key="map-container"
      >
        <MapCenterUpdater />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Sensors as cyan dots */}
        {sensorPositions.map((sensor) => (
          <Circle
            key={sensor.id}
            center={sensor.position}
            radius={50}
            pathOptions={{
              color: sensor.status === 'alert' ? '#FFB800' : '#00D9FF',
              fillColor: sensor.status === 'alert' ? '#FFB800' : '#00D9FF',
              fillOpacity: 0.3,
            }}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-bold">{sensor.id}</p>
                <p>Reading: {sensor.lastReading}</p>
                <p>Status: {sensor.status}</p>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Drones as markers with selection highlighting */}
        {dronePositions.map((drone) => (
          <Circle
            key={drone.id}
            center={drone.position}
            radius={drone.isSelected ? 80 : 40}
            pathOptions={{
              color: drone.isSelected ? '#FF851B' : drone.status === 'on_mission' ? '#00C853' : drone.status === 'en_route' ? '#FFB800' : '#00D9FF',
              fillColor: drone.isSelected ? '#FF851B' : drone.status === 'on_mission' ? '#00C853' : drone.status === 'en_route' ? '#FFB800' : '#00D9FF',
              fillOpacity: drone.isSelected ? 0.6 : 0.4,
              weight: drone.isSelected ? 3 : 2,
            }}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-bold">{drone.id}</p>
                <p>Battery: {drone.battery}%</p>
                <p>Status: {drone.status}</p>
                <p>Task: {drone.task || "Standby"}</p>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Incident marker */}
        {state.activeIncident && (
          <Circle
            center={state.activeIncident.coordinates || [state.activeIncident.location.lat, state.activeIncident.location.lng]}
            radius={200}
            pathOptions={{
              color: '#FF3B3B',
              fillColor: '#FF3B3B',
              fillOpacity: 0.2,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-bold text-red-500">{state.activeIncident.title || state.activeIncident.type}</p>
                <p>{state.activeIncident.address}</p>
              </div>
            </Popup>
          </Circle>
        )}
      </MapContainer>
    );
  }, [mapError, isLoading, mapLibs, initialCenter, mapCenter, sensorPositions, dronePositions, state.activeIncident, operationalState]);

  return (
    <div className={cn("relative w-full h-full rounded-lg overflow-hidden", className)}>
      {/* Map Container */}
      <div className="absolute inset-0 bg-background">
        {renderMapContent()}
      </div>

      {/* Map Controls (Top-Right) */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-[1000]">
        <MapControlButton icon={<Layers className="w-4 h-4" />} label="Layers" />
        <MapControlButton icon={<Cloud className="w-4 h-4" />} label="Weather" />
        <MapControlButton icon={<Navigation className="w-4 h-4" />} label="Wind" />
        <div className="h-px bg-primary/20 my-1" />
        <MapControlButton icon={<Plus className="w-4 h-4" />} label="Zoom In" />
        <MapControlButton icon={<Minus className="w-4 h-4" />} label="Zoom Out" />
        <MapControlButton icon={<RotateCcw className="w-4 h-4" />} label="Reset" />
        <MapControlButton icon={<Maximize2 className="w-4 h-4" />} label="Fullscreen" />
      </div>

      {/* Status Overlay (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-[1000]">
        <div className="bg-card/90 backdrop-blur border border-primary/20 rounded-lg px-3 py-2 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent pulse-cyan" />
              <span className="text-muted-foreground">{state.sensors?.length || 0} Sensors</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-status-normal" />
              <span className="text-muted-foreground">
                {state.drones?.filter(d => d.status === 'on_mission' || d.status === 'en_route').length || 0} Active
              </span>
            </div>
            {operationalState !== 'green' && (
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  operationalState === 'red' ? "bg-status-critical pulse-red" : "bg-status-attention pulse-amber"
                )} />
                <span className={operationalState === 'red' ? "text-status-critical" : "text-status-attention"}>
                  {state.incidents?.length || 0} Incident
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Map Control Button
interface MapControlButtonProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function MapControlButton({ icon, label, active, onClick }: MapControlButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
        "bg-card/90 backdrop-blur border border-primary/20",
        "hover:border-primary/40 hover:bg-secondary",
        active && "border-primary bg-primary/10"
      )}
    >
      <span className={active ? "text-primary" : "text-muted-foreground"}>
        {icon}
      </span>
    </button>
  );
}

// Fallback when map fails to load
interface MapFallbackProps {
  state: CommandCenterState;
  operationalState: OperationalState;
}

function MapFallback({ state, operationalState }: MapFallbackProps) {
  return (
    <div className="w-full h-full bg-[hsl(216,71%,9%)] flex flex-col items-center justify-center">
      {/* Grid pattern background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(hsl(28 100% 55% / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(28 100% 55% / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Center content */}
      <div className="relative z-10 text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-primary/30 flex items-center justify-center">
          <Navigation className="w-10 h-10 text-primary/50" />
        </div>
        <p className="text-lg font-medium text-foreground mb-1">Tactical Map View</p>
        <p className="text-sm text-muted-foreground mb-4">
          {state.drones?.length || 0} drones • {state.sensors?.length || 0} sensors monitored
        </p>
        
        {/* Status indicators */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-status-normal" />
            <span className="text-muted-foreground">
              {state.drones?.filter(d => d.status === 'docked').length || 0} Docked
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-status-attention" />
            <span className="text-muted-foreground">
              {state.drones?.filter(d => d.status === 'en_route').length || 0} En Route
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-muted-foreground">
              {state.drones?.filter(d => d.status === 'on_mission').length || 0} Active
            </span>
          </div>
        </div>

        {/* Incident indicator */}
        {operationalState !== 'green' && state.activeIncident && (
          <div className={cn(
            "mt-4 px-4 py-2 rounded-lg border",
            operationalState === 'red' 
              ? "bg-status-critical/10 border-status-critical/30 text-status-critical"
              : "bg-status-attention/10 border-status-attention/30 text-status-attention"
          )}>
            <p className="text-sm font-medium">{state.activeIncident.title || state.activeIncident.type}</p>
            <p className="text-xs opacity-80">{state.activeIncident.address}</p>
          </div>
        )}
      </div>
    </div>
  );
}