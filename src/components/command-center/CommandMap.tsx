import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Drone, Sensor, DockStation, Incident, OperationalState } from '@/types/command-center';

// Custom drone icon
const createDroneIcon = (isActive: boolean = false) => L.divIcon({
  className: 'drone-marker',
  html: `
    <div class="relative">
      <div class="${isActive ? 'animate-ping absolute inset-0' : 'hidden'}">
        <svg viewBox="0 0 24 24" class="w-8 h-8 text-cyan-400 fill-current opacity-40">
          <polygon points="12,2 22,20 12,16 2,20" />
        </svg>
      </div>
      <svg viewBox="0 0 24 24" class="w-8 h-8 text-cyan-400 fill-current drop-shadow-[0_0_8px_rgba(0,217,255,0.6)]">
        <polygon points="12,2 22,20 12,16 2,20" />
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const sensorIcon = L.divIcon({
  className: 'sensor-marker',
  html: `<div class="w-3 h-3 bg-cyan-400 rounded-full pulse-cyan"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const dockIcon = L.divIcon({
  className: 'dock-marker',
  html: `
    <div class="w-6 h-6 bg-cyan-400/20 border-2 border-cyan-400 rounded flex items-center justify-center">
      <div class="w-2 h-2 bg-cyan-400 rounded-sm"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const incidentIcon = (severity: 'attention' | 'critical') => L.divIcon({
  className: 'incident-marker',
  html: `
    <div class="relative">
      <div class="absolute inset-0 ${severity === 'critical' ? 'animate-ping' : 'animate-pulse'}">
        <div class="w-8 h-8 ${severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'} rounded-full opacity-40"></div>
      </div>
      <div class="w-8 h-8 ${severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'} rounded-full flex items-center justify-center shadow-lg ${severity === 'critical' ? 'shadow-red-500/50' : 'shadow-amber-500/50'}">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface MapControllerProps {
  center?: [number, number];
  zoom?: number;
  incident?: Incident | null;
}

function MapController({ center, zoom, incident }: MapControllerProps) {
  const map = useMap();
  
  useEffect(() => {
    if (incident) {
      map.flyTo([incident.location.lat, incident.location.lng], 15, { duration: 1 });
    } else if (center) {
      map.flyTo(center, zoom || 13, { duration: 0.5 });
    }
  }, [map, center, zoom, incident]);
  
  return null;
}

interface CommandMapProps {
  drones: Drone[];
  sensors: Sensor[];
  dockStations: DockStation[];
  incident?: Incident | null;
  operationalState: OperationalState;
  droneRoutes?: { droneId: string; path: [number, number][] }[];
}

export function CommandMap({ 
  drones, 
  sensors, 
  dockStations, 
  incident,
  operationalState,
  droneRoutes = []
}: CommandMapProps) {
  const center: [number, number] = [34.0522, -118.2437];
  const [mapReady, setMapReady] = useState(false);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-primary/20">
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full"
        zoomControl={true}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController 
          center={center} 
          incident={incident}
        />

        {/* Coverage zones for dock stations */}
        {dockStations.map((dock) => (
          <Circle
            key={dock.id}
            center={[dock.location.lat, dock.location.lng]}
            radius={800}
            pathOptions={{
              color: '#00D9FF',
              fillColor: '#00D9FF',
              fillOpacity: 0.05,
              weight: 1,
              opacity: 0.3,
            }}
          />
        ))}

        {/* Incident zone */}
        {incident && (
          <>
            <Circle
              center={[incident.location.lat, incident.location.lng]}
              radius={operationalState === 'red' ? 300 : 150}
              pathOptions={{
                color: operationalState === 'red' ? '#FF3B3B' : '#FFB800',
                fillColor: operationalState === 'red' ? '#FF3B3B' : '#FFB800',
                fillOpacity: 0.15,
                weight: 2,
                opacity: 0.8,
              }}
            />
            <Marker 
              position={[incident.location.lat, incident.location.lng]}
              icon={incidentIcon(operationalState === 'red' ? 'critical' : 'attention')}
            >
              <Popup className="command-popup">
                <div className="text-sm">
                  <strong className="text-red-400">{incident.id}</strong>
                  <p>{incident.address}</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Drone routes */}
        {droneRoutes.map((route) => (
          <Polyline
            key={route.droneId}
            positions={route.path}
            pathOptions={{
              color: '#00D9FF',
              weight: 2,
              opacity: 0.8,
              dashArray: '10, 10',
            }}
          />
        ))}

        {/* Sensors */}
        {sensors.map((sensor) => (
          <Marker
            key={sensor.id}
            position={[sensor.location.lat, sensor.location.lng]}
            icon={sensorIcon}
          >
            <Popup>
              <div className="text-sm p-1">
                <strong>{sensor.id}</strong>
                <p className="text-muted-foreground capitalize">{sensor.type}</p>
                <p>Last: {sensor.lastReading}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Dock stations */}
        {dockStations.map((dock) => (
          <Marker
            key={dock.id}
            position={[dock.location.lat, dock.location.lng]}
            icon={dockIcon}
          >
            <Popup>
              <div className="text-sm p-1">
                <strong>{dock.id}</strong>
                <p>{dock.dronesAvailable}/{dock.totalCapacity} drones available</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Drones */}
        {drones.map((drone) => (
          <Marker
            key={drone.id}
            position={[drone.location.lat, drone.location.lng]}
            icon={createDroneIcon(drone.status === 'en_route' || drone.status === 'on_mission')}
          >
            <Popup>
              <div className="text-sm p-1">
                <strong className="text-cyan-400">{drone.id}</strong>
                <p className="capitalize">{drone.status.replace('_', ' ')}</p>
                <p>Battery: {drone.battery}%</p>
                {drone.task && <p className="text-cyan-400">{drone.task}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
