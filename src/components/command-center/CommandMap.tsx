import { useEffect, useRef } from 'react';
import { Drone, Sensor, DockStation, Incident, OperationalState } from '@/types/command-center';

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
}: CommandMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    const initMap = async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      if (!mapRef.current || mapInstanceRef.current) return;

      // Initialize map
      const map = L.map(mapRef.current, {
        center: [34.0522, -118.2437],
        zoom: 13,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Add dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
      }).addTo(map);

      // Create custom icons
      const droneIcon = L.divIcon({
        className: 'drone-marker',
        html: `<div style="width: 24px; height: 24px; background: #00D9FF; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 10px #00D9FF;"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const sensorIcon = L.divIcon({
        className: 'sensor-marker',
        html: `<div style="width: 10px; height: 10px; background: #00D9FF; border-radius: 50%; opacity: 0.7;"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      const dockIcon = L.divIcon({
        className: 'dock-marker',
        html: `<div style="width: 20px; height: 20px; background: rgba(0,217,255,0.2); border: 2px solid #00D9FF; border-radius: 4px;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      // Add coverage zones for dock stations
      dockStations.forEach((dock) => {
        L.circle([dock.location.lat, dock.location.lng], {
          radius: 800,
          color: '#00D9FF',
          fillColor: '#00D9FF',
          fillOpacity: 0.05,
          weight: 1,
        }).addTo(map);

        L.marker([dock.location.lat, dock.location.lng], { icon: dockIcon })
          .bindPopup(`<strong>${dock.id}</strong><br/>${dock.dronesAvailable}/${dock.totalCapacity} drones`)
          .addTo(map);
      });

      // Add sensors
      sensors.forEach((sensor) => {
        L.marker([sensor.location.lat, sensor.location.lng], { icon: sensorIcon })
          .bindPopup(`<strong>${sensor.id}</strong><br/>${sensor.type}: ${sensor.lastReading}`)
          .addTo(map);
      });

      // Add drones
      drones.forEach((drone) => {
        L.marker([drone.location.lat, drone.location.lng], { icon: droneIcon })
          .bindPopup(`<strong style="color:#00D9FF">${drone.id}</strong><br/>${drone.status}<br/>Battery: ${drone.battery}%`)
          .addTo(map);
      });

      // Force resize after mount
      setTimeout(() => map.invalidateSize(), 100);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update incident marker
  useEffect(() => {
    const updateIncident = async () => {
      if (!mapInstanceRef.current || !incident) return;
      
      const L = await import('leaflet');
      const map = mapInstanceRef.current;

      const color = operationalState === 'red' ? '#FF3B3B' : '#FFB800';
      
      L.circle([incident.location.lat, incident.location.lng], {
        radius: operationalState === 'red' ? 300 : 150,
        color,
        fillColor: color,
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(map);

      const incidentIcon = L.divIcon({
        className: 'incident-marker',
        html: `<div style="width: 28px; height: 28px; background: ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px ${color};">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([incident.location.lat, incident.location.lng], { icon: incidentIcon })
        .bindPopup(`<strong style="color:${color}">${incident.id}</strong><br/>${incident.address}`)
        .addTo(map);

      map.flyTo([incident.location.lat, incident.location.lng], 14, { duration: 1 });
    };

    if (incident) updateIncident();
  }, [incident, operationalState]);

  return (
    <div className="w-full h-full min-h-[500px] rounded-lg overflow-hidden border border-primary/20 bg-background">
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '500px' }} />
    </div>
  );
}
