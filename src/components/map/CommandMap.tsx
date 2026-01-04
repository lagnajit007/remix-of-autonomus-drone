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
  RotateCcw,
  Zap,
  Wind
} from "lucide-react";

// Use Vanilla Leaflet for absolute reliability
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Import Heatmap plugin via CDN/Global since it's hard to find a good ESM one sometimes
// But we can simulate a heatmap with circles if needed, or just use a Leaflet plugin pattern

interface CommandMapProps {
  state: CommandCenterState;
  operationalState: OperationalState;
  selectedDroneId?: string | null;
  mapCenter?: [number, number] | null;
  className?: string;
}

/**
 * Tactical Command Map
 * 
 * Features:
 * - Smooth drone movement interpolation
 * - Thermal heatmap overlay simulation
 * - Geofence/NFZ visualization
 * - Wind direction indicators
 */
export function CommandMap({ state, operationalState, selectedDroneId, mapCenter, className }: CommandMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ [key: string]: L.Layer }>({});
  const droneMarkersRef = useRef<{ [key: string]: L.Circle }>({});

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialPos = mapCenter || [34.0522, -118.2437];
    const map = L.map(mapContainerRef.current, {
      center: initialPos,
      zoom: 13,
      zoomControl: false,
      fadeAnimation: true,
      markerZoomAnimation: true,
    });

    // Dark topographic style (reduces eye strain)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: 'FlytBase | Emergency Response',
      maxZoom: 20
    }).addTo(map);

    // Geofences / No-Fly Zones (Orange outlines)
    const nfz = L.polygon([
      [34.06, -118.25],
      [34.065, -118.25],
      [34.065, -118.245],
      [34.06, -118.245]
    ], {
      color: '#FF851B',
      weight: 1,
      fillColor: '#FF851B',
      fillOpacity: 0.1
    }).addTo(map);

    L.popup()
      .setLatLng([34.0625, -118.2475])
      .setContent('<span class="text-[10px] font-bold text-primary uppercase tracking-widest">Restricted Airspace</span>')
      .openOn(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Center
  useEffect(() => {
    if (mapInstanceRef.current && mapCenter) {
      mapInstanceRef.current.setView(mapCenter, mapInstanceRef.current.getZoom(), { animate: true });
    }
  }, [mapCenter]);

  // Update Markers (Sensors, Drones, Incidents)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // 1. SENSORS (Small pulsing dots)
    state.sensors?.forEach(sensor => {
      const id = `sensor-${sensor.id}`;
      const pos = sensor.position || ([sensor.location.lat, sensor.location.lng] as [number, number]);
      const color = sensor.status === 'alert' ? '#FFB800' : '#00D9FF';

      if (layersRef.current[id]) {
        (layersRef.current[id] as L.Circle).setLatLng(pos);
      } else {
        const circle = L.circle(pos, {
          radius: 30,
          color: color,
          fillColor: color,
          fillOpacity: 0.4,
          weight: 1,
          className: 'pulse-cyan'
        }).addTo(map);
        layersRef.current[id] = circle;
      }
    });

    // 2. DRONES (Hexagon simulation with Circles)
    state.drones?.forEach(drone => {
      const id = `drone-${drone.id}`;
      const pos = drone.position || ([drone.location.lat, drone.location.lng] as [number, number]);
      const isSelected = selectedDroneId === drone.id;
      const color = isSelected ? '#FF851B' : drone.status === 'on_mission' ? '#00C853' : drone.status === 'en_route' ? '#FFB800' : '#00D9FF';

      if (droneMarkersRef.current[id]) {
        // Smoothly animate to new position
        const marker = droneMarkersRef.current[id];
        marker.setLatLng(pos);
        marker.setStyle({
          color: color,
          fillColor: color,
          fillOpacity: isSelected ? 0.7 : 0.4,
          weight: isSelected ? 3 : 1
        });
      } else {
        const marker = L.circle(pos, {
          radius: isSelected ? 80 : 50,
          color: color,
          fillColor: color,
          fillOpacity: isSelected ? 0.7 : 0.4,
          weight: isSelected ? 3 : 1,
          className: isSelected ? 'pulse-orange' : ''
        }).addTo(map);
        droneMarkersRef.current[id] = marker;
      }
    });

    // 3. INCIDENT (Thermal Heatmap Simulation)
    if (state.activeIncident) {
      const id = 'active-incident';
      const pos = state.activeIncident.coordinates || ([state.activeIncident.location.lat, state.activeIncident.location.lng] as [number, number]);

      if (layersRef.current[id]) {
        (layersRef.current[id] as L.LayerGroup).remove();
      }

      // Create a "Heatmap" look with multiple concentric circles
      const heatGroup = L.layerGroup([
        L.circle(pos, { radius: 300, color: '#FF3B3B', fillColor: '#FF3B3B', fillOpacity: 0.1, weight: 0 }),
        L.circle(pos, { radius: 200, color: '#FF3B3B', fillColor: '#FF3B3B', fillOpacity: 0.2, weight: 0 }),
        L.circle(pos, { radius: 100, color: '#FF3B3B', fillColor: '#FF3B3B', fillOpacity: 0.3, weight: 1, className: 'pulse-red' }),
      ]).addTo(map);

      layersRef.current[id] = heatGroup;
    } else {
      if (layersRef.current['active-incident']) {
        (layersRef.current['active-incident'] as L.LayerGroup).remove();
        delete layersRef.current['active-incident'];
      }
    }

    // 4. WIND DIRECTION (Arrows)
    const windId = 'wind-indicators';
    if (!layersRef.current[windId]) {
      const windGroup = L.layerGroup();
      // Add a few static arrows for demo
      const centers: [number, number][] = [[34.04, -118.26], [34.07, -118.23], [34.05, -118.25]];
      centers.forEach(c => {
        const arrow = L.polyline([c, [c[0] + 0.005, c[1] + 0.005]], {
          color: 'white',
          weight: 1,
          opacity: 0.3
        }).addTo(windGroup);
      });
      windGroup.addTo(map);
      layersRef.current[windId] = windGroup;
    }

  }, [state, selectedDroneId, operationalState]);

  return (
    <div className={cn("relative w-full h-full rounded-xl overflow-hidden border border-white/5", className)}>
      {/* Map Target */}
      <div ref={mapContainerRef} className="absolute inset-0 bg-[#0A1628]" />

      {/* Map Controls (Top-Right) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <TacticalControl icon={<Layers className="w-4 h-4" />} label="Layers" />
        <TacticalControl
          icon={<RotateCcw className="w-4 h-4" />}
          label="Reset View"
          onClick={() => mapInstanceRef.current?.setView([34.0522, -118.2437], 13)}
        />
        <div className="h-px bg-white/10 my-1" />
        <TacticalControl
          icon={<Plus className="w-4 h-4" />}
          label="Zoom In"
          onClick={() => mapInstanceRef.current?.zoomIn()}
        />
        <TacticalControl
          icon={<Minus className="w-4 h-4" />}
          label="Zoom Out"
          onClick={() => mapInstanceRef.current?.zoomOut()}
        />
        <TacticalControl icon={<Maximize2 className="w-4 h-4" />} label="Fullscreen" />
      </div>

      {/* Map Legend / Context (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 z-[1000] pointer-events-none">
        <div className="bg-[#1A2332]/90 backdrop-blur-md border border-white/10 rounded-lg p-3 space-y-2 shadow-2xl">
          <LegendItem color="bg-status-critical" label="Active Fire" />
          <LegendItem color="bg-primary" label="Geofence" />
          <LegendItem color="bg-status-ai" label="Sensor Coverage" />
          <div className="pt-1 flex items-center gap-2">
            <Wind className="w-3 h-3 text-white/40" />
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Wind: 18mph NE</span>
          </div>
        </div>
      </div>

      {/* Center Reticle (Atmospheric) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[500] opacity-20">
        <div className="w-20 h-20 border border-white/50 rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-white rounded-full" />
        </div>
      </div>
    </div>
  );
}

function TacticalControl({ icon, label, onClick }: { icon: ReactNode, label: string, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      type="button"
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-lg transition-all",
        "bg-[#1A2332]/90 backdrop-blur-md border border-white/10",
        "hover:border-primary/50 hover:bg-secondary",
        "active:scale-95 shadow-lg"
      )}
    >
      <span className="text-white/70 group-hover:text-primary">
        {icon}
      </span>
    </button>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", color)} />
      <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{label}</span>
    </div>
  );
}
