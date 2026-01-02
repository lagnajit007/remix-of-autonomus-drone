import { useState, useEffect } from 'react';
import { BentoGrid, BentoArea } from '@/components/bento/BentoGrid';
import { TopBar } from '@/components/bento/TopBar';
import { TelemetryCard } from '@/components/bento/TelemetryCard';
import { MapCard } from '@/components/bento/MapCard';
import { AlertsCard } from '@/components/bento/AlertsCard';
import { MissionCard } from '@/components/bento/MissionCard';
import { CommsCard } from '@/components/bento/CommsCard';
import { PlaybackBar } from '@/components/bento/PlaybackBar';
import { Button } from '@/components/ui/button';
import { 
  getInitialState, 
  mockIncidentDetected, 
  mockActiveIncident,
  mockTimelineAmber,
  mockTimelineRed,
} from '@/data/mock-data';
import { OperationalState } from '@/types/command-center';

export default function Index() {
  const [state, setState] = useState(getInitialState());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Demo controls - change operational state
  const setOperationalState = (newState: OperationalState) => {
    if (newState === 'green') {
      setState(getInitialState());
      setElapsedTime(0);
    } else if (newState === 'amber') {
      setState(prev => ({
        ...prev,
        operationalState: 'amber',
        activeIncident: mockIncidentDetected,
        incidents: [mockIncidentDetected],
        timeline: mockTimelineAmber,
        drones: prev.drones.map(d => 
          d.id === 'D-247' ? { ...d, status: 'en_route' as const, task: 'Responding to incident', eta: 27 } : d
        ),
      }));
    } else if (newState === 'red') {
      setState(prev => ({
        ...prev,
        operationalState: 'red',
        activeIncident: mockActiveIncident,
        incidents: [mockActiveIncident],
        timeline: mockTimelineRed,
        drones: prev.drones.map(d => {
          if (d.id === 'D-247') return { ...d, status: 'on_mission' as const, task: 'Thermal reconnaissance', eta: undefined };
          if (d.id === 'D-309') return { ...d, status: 'on_mission' as const, task: 'Evacuation support' };
          return d;
        }),
      }));
    }
  };

  // Elapsed time counter for red state
  useEffect(() => {
    if (state.operationalState === 'red') {
      const interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [state.operationalState]);

  const handleApprove = (incidentId: string) => {
    setOperationalState('red');
  };

  const handleVeto = (incidentId: string) => {
    setOperationalState('green');
  };

  // Get primary drone for telemetry display
  const primaryDrone = state.drones.find(d => d.status === 'on_mission' || d.status === 'en_route') || state.drones[0];

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <TopBar 
        operationalState={state.operationalState}
        dronesActive={state.drones.filter(d => d.status !== 'docked').length}
        alertsPending={state.incidents.length}
        incidentTimer={state.operationalState === 'red' ? elapsedTime : undefined}
      />

      {/* Bento Grid */}
      <BentoGrid operationalState={state.operationalState} className="flex-1">
        {/* Telemetry Card - Left */}
        <BentoArea area="telemetry">
          <TelemetryCard drone={primaryDrone} />
        </BentoArea>

        {/* Map Card - Center (Dominant) */}
        <BentoArea area="map">
          <MapCard 
            state={state}
            operationalState={state.operationalState}
          />
        </BentoArea>

        {/* Alerts Card - Right */}
        <BentoArea area="alerts">
          <AlertsCard 
            incidents={state.incidents}
            operationalState={state.operationalState}
            onApprove={handleApprove}
            onVeto={handleVeto}
          />
        </BentoArea>

        {/* Mission Card - Bottom Left */}
        <BentoArea area="mission">
          <MissionCard drones={state.drones} />
        </BentoArea>

        {/* Comms Card - Bottom Left Corner */}
        <BentoArea area="comms">
          <CommsCard />
        </BentoArea>
      </BentoGrid>

      {/* Playback Bar - Bottom */}
      <PlaybackBar events={state.timeline} />

      {/* Demo Controls */}
      <div className="absolute bottom-16 left-4 z-50">
        <div className="command-card p-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground mr-2">Demo:</span>
          <Button 
            size="sm" 
            variant={state.operationalState === 'green' ? 'default' : 'outline'} 
            onClick={() => setOperationalState('green')}
            className={state.operationalState === 'green' ? 'bg-status-normal hover:bg-status-normal/90' : ''}
          >
            Green
          </Button>
          <Button 
            size="sm" 
            variant={state.operationalState === 'amber' ? 'default' : 'outline'} 
            className={state.operationalState === 'amber' ? 'bg-status-attention hover:bg-status-attention/90 text-black' : 'border-[hsl(var(--status-attention)/0.5)]'} 
            onClick={() => setOperationalState('amber')}
          >
            Amber
          </Button>
          <Button 
            size="sm" 
            variant={state.operationalState === 'red' ? 'default' : 'outline'} 
            className={state.operationalState === 'red' ? 'bg-status-critical hover:bg-status-critical/90' : 'border-[hsl(var(--status-critical)/0.5)]'} 
            onClick={() => setOperationalState('red')}
          >
            Red
          </Button>
        </div>
      </div>
    </div>
  );
}
