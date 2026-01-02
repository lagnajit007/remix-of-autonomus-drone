import { useState, useEffect, useCallback } from 'react';
import { BentoGrid, BentoArea } from '@/components/bento/BentoGrid';
import { TopBar } from '@/components/bento/TopBar';
import { TelemetryCard } from '@/components/bento/TelemetryCard';
import { MapCard } from '@/components/bento/MapCard';
import { AlertsCard } from '@/components/bento/AlertsCard';
import { MissionCard } from '@/components/bento/MissionCard';
import { CommsCard } from '@/components/bento/CommsCard';
import { PlaybackBar } from '@/components/bento/PlaybackBar';
import { ThermalFeedCard } from '@/components/bento/ThermalFeedCard';
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
  const setOperationalState = useCallback((newState: OperationalState) => {
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
  }, []);

  // Keyboard shortcuts: Ctrl+1 (Green), Ctrl+2 (Amber), Ctrl+3 (Red)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setOperationalState('green');
            break;
          case '2':
            e.preventDefault();
            setOperationalState('amber');
            break;
          case '3':
            e.preventDefault();
            setOperationalState('red');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setOperationalState]);

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
  const isRedState = state.operationalState === 'red';

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

        {/* Alerts Card - Right (or Thermal Feed in Red state) */}
        <BentoArea area="alerts">
          {isRedState ? (
            <div className="h-full flex flex-col gap-3">
              <ThermalFeedCard drone={primaryDrone} className="flex-1" />
              <AlertsCard 
                incidents={state.incidents}
                operationalState={state.operationalState}
                onApprove={handleApprove}
                onVeto={handleVeto}
                className="flex-shrink-0"
              />
            </div>
          ) : (
            <AlertsCard 
              incidents={state.incidents}
              operationalState={state.operationalState}
              onApprove={handleApprove}
              onVeto={handleVeto}
            />
          )}
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
            title="Ctrl+1"
          >
            Green
          </Button>
          <Button 
            size="sm" 
            variant={state.operationalState === 'amber' ? 'default' : 'outline'} 
            className={state.operationalState === 'amber' ? 'bg-status-attention hover:bg-status-attention/90 text-black' : 'border-[hsl(var(--status-attention)/0.5)]'} 
            onClick={() => setOperationalState('amber')}
            title="Ctrl+2"
          >
            Amber
          </Button>
          <Button 
            size="sm" 
            variant={state.operationalState === 'red' ? 'default' : 'outline'} 
            className={state.operationalState === 'red' ? 'bg-status-critical hover:bg-status-critical/90' : 'border-[hsl(var(--status-critical)/0.5)]'} 
            onClick={() => setOperationalState('red')}
            title="Ctrl+3"
          >
            Red
          </Button>
          <span className="text-[10px] text-muted-foreground/60 ml-2 hidden sm:inline">Ctrl+1/2/3</span>
        </div>
      </div>
    </div>
  );
}
