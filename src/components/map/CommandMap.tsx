import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { CommandCenterState, OperationalState } from "@/types/command-center";
import {
  Layers,
  Plus,
  Minus,
  Wind,
  Navigation,
  Compass,
  Wifi,
  WifiOff,
  Crosshair,
  Target
} from "lucide-react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CommandMapProps {
  state: CommandCenterState;
  operationalState: OperationalState;
  selectedDroneId?: string | null;
  mapCenter?: [number, number] | null;
  className?: string;
  isOffline?: boolean;
}

/**
 * Co-Pilot Tactical Canvas V2
 * 
 * Round 2 HUD Enhancements:
 * - High-Detail Hex Drones (clip-path + status rings)
 * - Resident Evac Dots (Animated pulses)
 * - Dynamic Spread Prediction (morphing polygons)
 * - Wind Cones (Alpha-mapped gradients)
 * - Scanline & Reticle refinement
 */
export function CommandMap({ state, operationalState, selectedDroneId, mapCenter, className, isOffline }: CommandMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const dronesRef = useRef<{ [key: string]: L.Marker }>({});
  const residentsRef = useRef<{ [key: string]: L.Marker }>({});
  const layersRef = useRef<{ [key: string]: L.Layer }>({});

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialPos = mapCenter || [34.0522, -118.2437];
    const map = L.map(mapContainerRef.current, {
      center: initialPos,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
      inertia: true,
      zoomAnimation: true,
    });

    // Abs-Navy Tactical Tile Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      opacity: 0.8
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Map View
  useEffect(() => {
    if (mapInstanceRef.current && mapCenter) {
      mapInstanceRef.current.setView(mapCenter, mapInstanceRef.current.getZoom(), { animate: true, duration: 2 });
    }
  }, [mapCenter]);

  // Tactical Layer Rendering Engine
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // 1. DJI DOCK STATIONS (Absolute Position)
    state.dockStations?.forEach(dock => {
      const id = `dock-${dock.id}`;
      if (!layersRef.current[id]) {
        const icon = L.divIcon({
          className: 'dock-icon-v2',
          html: `
            <div class="w-8 h-8 flex items-center justify-center bg-[#1A2332]/80 border border-white/20 rounded-lg">
              <div class="w-3 h-3 bg-white/10 rounded-sm border border-white/20"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        const marker = L.marker([dock.location.lat, dock.location.lng], { icon }).addTo(map);
        layersRef.current[id] = marker;
      }
    });

    // 2. DRONE HEXAGONS (Deep Logic)
    state.drones?.forEach(drone => {
      const id = `drone-${drone.id}`;
      const pos = drone.position || [drone.location.lat, drone.location.lng];
      const isSelected = selectedDroneId === drone.id;

      const statusColor = isSelected ? '#FF851B' :
        drone.status === 'on_mission' ? '#00C853' :
          drone.status === 'en_route' ? '#FFB800' : '#00D9FF';

      if (dronesRef.current[id]) {
        const marker = dronesRef.current[id];
        marker.setLatLng(pos);
        // Direct DOM update for performance
        const container = marker.getElement()?.querySelector('.hex-outer') as HTMLElement;
        if (container) {
          container.style.borderColor = isSelected ? '#FF851B' : 'rgba(255,255,255,0.1)';
          container.style.backgroundColor = isSelected ? 'rgba(255,133,27,0.2)' : 'rgba(0,217,255,0.05)';
        }
      } else {
        const icon = L.divIcon({
          className: 'hex-marker',
          html: `
            <div class="hex-container ${isSelected ? 'animate-ai-glow' : ''}">
              <div class="hex-outer">
                <div class="hex-inner" style="background-color: ${statusColor}"></div>
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });
        const marker = L.marker(pos, { icon, zIndexOffset: isSelected ? 1000 : 0 }).addTo(map);
        dronesRef.current[id] = marker;
      }
    });

    // 3. RESIDENT DOTS (Evac Status)
    if (operationalState === 'red') {
      const incidentPos = state.activeIncident?.coordinates || [34.0522, -118.2437];
      const residents = [
        { id: 'evac-1', lat: incidentPos[0] + 0.003, lng: incidentPos[1] + 0.004, status: 'ok' },
        { id: 'evac-2', lat: incidentPos[0] - 0.002, lng: incidentPos[1] + 0.006, status: 'pending' },
        { id: 'evac-3', lat: incidentPos[0] + 0.005, lng: incidentPos[1] - 0.002, status: 'pending' },
        { id: 'evac-4', lat: incidentPos[0] - 0.004, lng: incidentPos[1] - 0.005, status: 'ok' },
      ];

      residents.forEach(r => {
        if (!residentsRef.current[r.id]) {
          const icon = L.divIcon({
            className: 'resident-icon',
            html: `<div class="resident-dot" style="background-color: ${r.status === 'ok' ? '#00C853' : '#FF851B'}"></div>`,
            iconSize: [12, 12]
          });
          const m = L.marker([r.lat, r.lng], { icon }).addTo(map);
          residentsRef.current[r.id] = m;
        }
      });
    } else {
      Object.keys(residentsRef.current).forEach(k => { residentsRef.current[k].remove(); delete residentsRef.current[k]; });
    }

    // 4. FIRE SPREAD PREDICTION (Morphing Polygon)
    const polyId = 'fire-prediction';
    if (operationalState === 'red' && state.activeIncident) {
      const c = state.activeIncident.coordinates || [34.0522, -118.2437];
      const points: [number, number][] = [
        [c[0] + 0.003, c[1] + 0.002],
        [c[0] + 0.006, c[1] + 0.005],
        [c[0] + 0.004, c[1] + 0.008],
        [c[0] + 0.001, c[1] + 0.006]
      ];
      if (layersRef.current[polyId]) {
        (layersRef.current[polyId] as L.Polygon).setLatLngs(points);
      } else {
        const poly = L.polygon(points, {
          color: '#FF3B3B',
          fillColor: '#FF3B3B',
          fillOpacity: 0.15,
          weight: 1,
          dashArray: '10, 10'
        }).addTo(map);
        layersRef.current[polyId] = poly;
      }
    } else if (layersRef.current[polyId]) {
      layersRef.current[polyId].remove(); delete layersRef.current[polyId];
    }

    // 5. WIND CONE V2 (Directional Gradient)
    const windId = 'wind-cone-v2';
    if (state.activeIncident || operationalState !== 'green') {
      const c = state.activeIncident?.coordinates || [34.0522, -118.2437];
      const conePoints: [number, number][] = [
        [c[0], c[1]],
        [c[0] - 0.015, c[1] - 0.008],
        [c[0] - 0.008, c[1] - 0.015]
      ];
      if (layersRef.current[windId]) {
        (layersRef.current[windId] as L.Polygon).setLatLngs(conePoints);
      } else {
        const cone = L.polygon(conePoints, {
          color: '#00D9FF',
          fillColor: '#00D9FF',
          fillOpacity: 0.05,
          weight: 1
        }).addTo(map);
        layersRef.current[windId] = cone;
      }
    }

    // 6. NFZ GEOFENCES (Persistent)
    const nfzId = 'nfz-restricted';
    if (!layersRef.current[nfzId]) {
      const nfz = L.circle([34.058, -118.24], {
        radius: 400,
        color: '#FF851B',
        fillColor: '#FF851B',
        fillOpacity: 0.1,
        weight: 1,
        dashArray: '5, 5'
      }).addTo(map);
      layersRef.current[nfzId] = nfz;
    }

  }, [state, operationalState, selectedDroneId]);

  return (
    <div className={cn("relative w-full h-full rounded-3xl overflow-hidden hud-panel", className)}>
      {/* Map Target */}
      <div ref={mapContainerRef} className="absolute inset-0 bg-[#020509]" />

      {/* OFFLINE BANNER */}
      {isOffline && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[2000] animate-haptic-shake">
          <div className="px-6 py-2 bg-status-critical/10 backdrop-blur-3xl border border-status-critical/40 rounded-full flex items-center gap-3">
            <WifiOff className="w-4 h-4 text-status-critical animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-status-critical">SIGNAL_LOSS: OFFLINE_CACHE_ACTIVE</span>
          </div>
        </div>
      )}

      {/* TOP-LEFT HUD METRICS */}
      <div className="absolute top-8 left-8 z-[1000] pointer-events-none flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-1 h-8 bg-accent animate-ai-glow" />
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white uppercase tracking-tighter leading-none">CANVAS_HUD_PRO</span>
            <span className="text-[9px] font-black text-accent uppercase tracking-[0.5em] mt-1">SYMBOTIC_OS_LINKED</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MiniMetric label="SAT_LINK" value="SECURE" status="normal" />
          <MiniMetric label="RC_LAT" value={isOffline ? '---' : '12MS'} status={isOffline ? 'critical' : 'normal'} />
        </div>
      </div>

      {/* MAP TOOLS (HUD GLASS) */}
      <div className="absolute top-8 right-8 z-[1000] flex flex-col gap-2">
        <MapTool icon={<Plus className="w-4 h-4" />} onClick={() => mapInstanceRef.current?.zoomIn()} />
        <MapTool icon={<Minus className="w-4 h-4" />} onClick={() => mapInstanceRef.current?.zoomOut()} />
        <div className="h-px bg-white/10 mx-2 my-1" />
        <MapTool icon={<Compass className="w-4 h-4" />} onClick={() => mapInstanceRef.current?.setView([34.0522, -118.2437], 14)} />
        <MapTool icon={<Layers className="w-4 h-4" />} active />
      </div>

      {/* BOTTOM-CENTER COORDS FEED */}
      <div className="absolute bottom-10 left-10 z-[1000] p-5 bg-black/60 backdrop-blur-3xl rounded-2xl border border-white/5 flex gap-10 shadow-2xl pointer-events-none">
        <HudStatItem icon={<Target className="w-5 h-5 text-accent" />} label="TARGET_GEO" value={`${mapInstanceRef.current?.getCenter().lat.toFixed(6) || '---'} | ${mapInstanceRef.current?.getCenter().lng.toFixed(6) || '---'}`} />
        <div className="w-px bg-white/10" />
        <HudStatItem icon={<Wind className="w-5 h-5 text-accent" />} label="ENV_WIND" value="18MPH_NE" />
        <div className="w-px bg-white/10" />
        <HudStatItem icon={<Wifi className="w-5 h-5 text-status-normal" />} label="COMMS" value={isOffline ? 'OFFLINE' : 'BVLOS_SYNC'} />
      </div>

      {/* SCANLINE & RETICLE */}
      <div className="scanline" />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
        <div className="w-1/2 h-1/2 border border-white rounded-full" />
        <Crosshair className="w-12 h-12 text-white" />
      </div>
    </div>
  );
}

function MiniMetric({ label, value, status }: { label: string, value: string, status: 'normal' | 'critical' }) {
  return (
    <div className="px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg flex flex-col">
      <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">{label}</span>
      <span className={cn("text-[10px] font-mono font-black", status === 'critical' ? 'text-status-critical' : 'text-accent')}>
        {value}
      </span>
    </div>
  );
}

function MapTool({ icon, onClick, active }: { icon: React.ReactNode, onClick?: () => void, active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-12 h-12 flex items-center justify-center rounded-xl transition-all shadow-xl border active:scale-90",
        active ? "bg-accent/20 border-accent/40 text-accent" : "bg-black/60 border-white/10 text-white/40 hover:text-white"
      )}
    >
      {icon}
    </button>
  );
}

function HudStatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2 bg-accent/5 rounded-lg">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{label}</span>
        <span className="text-sm font-mono font-black text-white uppercase">{value}</span>
      </div>
    </div>
  );
}
