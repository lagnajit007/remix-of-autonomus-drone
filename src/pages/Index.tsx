import { useState, useEffect, useCallback } from 'react';
import { 
  CommandLayout, 
  TopBarSlot, 
  LeftSidebarSlot, 
  CenterMapSlot, 
  RightPanelSlot 
} from '@/components/layout/CommandLayout';
import { TopBar } from '@/components/layout/TopBar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { CommandMap } from '@/components/map/CommandMap';
import { Button } from '@/components/ui/button';
import { 
  getInitialState, 
  mockIncidentDetected, 
  mockActiveIncident,
  mockTimelineAmber,
  mockTimelineRed,
} from '@/data/mock-data';
import { OperationalState } from '@/types/command-center';

// Mock zones data
const mockZones = [
  { id: 'zone-a', name: 'Zone A - North Sector', drones: 2, sensors: 14, status: 'normal' as const },
  { id: 'zone-b', name: 'Zone B - East Perimeter', drones: 1, sensors: 8, status: 'normal' as const },
  { id: 'zone-c', name: 'Zone C - South Ridge', drones: 3, sensors: 12, status: 'attention' as const, hasIncident: true },
];

export default function Index() {
  const [state, setState] = useState(getInitialState());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Format elapsed time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
      // Space to approve in amber state
      if (e.code === 'Space' && state.operationalState === 'amber') {
        e.preventDefault();
        handleApprove(state.incidents[0]?.id);
      }
      // Escape to veto/dismiss
      if (e.code === 'Escape' && state.operationalState !== 'green') {
        e.preventDefault();
        handleVeto(state.incidents[0]?.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setOperationalState, state.operationalState, state.incidents]);

  // Elapsed time counter for active incidents
  useEffect(() => {
    if (state.operationalState !== 'green') {
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

  // Get active drones for display
  const activeDrones = state.drones.filter(d => 
    d.status === 'on_mission' || d.status === 'en_route' || d.status === 'returning'
  );

  // Update zones based on state
  const currentZones = state.operationalState === 'green' 
    ? mockZones.map(z => ({ ...z, status: 'normal' as const, hasIncident: false }))
    : mockZones;

  return (
    <CommandLayout>
      {/* Top Bar */}
      <TopBarSlot>
        <TopBar 
          operationalState={state.operationalState}
          activeIncidents={state.incidents.length}
          alertsCount={state.operationalState === 'green' ? 0 : 2}
          shiftTime="4h 23m"
          operatorName="Sarah Chen"
        />
      </TopBarSlot>

      {/* Left Sidebar - Static Context */}
      <LeftSidebarSlot>
        <LeftSidebar
          zones={currentZones}
          drones={state.drones}
          sensorsOnline={32}
          sensorsWeak={2}
          sensorsOffline={0}
          systemStatus="normal"
          networkLatency={98}
          weather="Clear, 18mph"
          lastUpdate="3s ago"
        />
      </LeftSidebarSlot>

      {/* Center Map - Primary View */}
      <CenterMapSlot>
        <CommandMap 
          state={state}
          operationalState={state.operationalState}
        />
      </CenterMapSlot>

      {/* Right Panel - Action Zone */}
      <RightPanelSlot>
        <RightPanel
          operationalState={state.operationalState}
          incidents={state.incidents}
          activeDrones={state.drones}
          timeline={state.timeline}
          onApprove={handleApprove}
          onVeto={handleVeto}
        />
      </RightPanelSlot>

      {/* Demo Controls (Bottom overlay) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="command-card px-4 py-3 flex items-center gap-4">
          <span className="text-xs text-muted-foreground">Demo:</span>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant={state.operationalState === 'green' ? 'default' : 'outline'} 
              onClick={() => setOperationalState('green')}
              className={state.operationalState === 'green' ? 'bg-status-normal hover:bg-status-normal/90 text-white' : 'border-status-normal/50 text-status-normal'}
            >
              Green
            </Button>
            <Button 
              size="sm" 
              variant={state.operationalState === 'amber' ? 'default' : 'outline'} 
              className={state.operationalState === 'amber' ? 'bg-status-attention hover:bg-status-attention/90 text-black' : 'border-status-attention/50 text-status-attention'} 
              onClick={() => setOperationalState('amber')}
            >
              Amber
            </Button>
            <Button 
              size="sm" 
              variant={state.operationalState === 'red' ? 'default' : 'outline'} 
              className={state.operationalState === 'red' ? 'bg-status-critical hover:bg-status-critical/90 text-white' : 'border-status-critical/50 text-status-critical'} 
              onClick={() => setOperationalState('red')}
            >
              Red
            </Button>
          </div>
          {state.operationalState !== 'green' && (
            <div className="flex items-center gap-2 pl-3 border-l border-primary/20">
              <span className="text-xs text-muted-foreground">Elapsed:</span>
              <span className="font-mono text-sm text-primary">{formatTime(elapsedTime)}</span>
            </div>
          )}
          <span className="text-[10px] text-muted-foreground/60 pl-3 border-l border-primary/20">
            Ctrl+1/2/3 | Space=Approve | Esc=Veto
          </span>
        </div>
      </div>
    </CommandLayout>
  );
}