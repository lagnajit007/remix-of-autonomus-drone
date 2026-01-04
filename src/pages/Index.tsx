import { useState, useEffect, useCallback, useRef } from 'react';
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
import { VoicePanel, useVoicePushToTalk } from '@/components/voice/VoicePanel';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  getInitialState,
  mockIncidentDetected,
  mockActiveIncident,
  mockTimelineAmber,
  mockTimelineRed,
} from '@/data/mock-data';
import { OperationalState, Drone } from '@/types/command-center';
import { WifiOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock zones data with center coordinates for zoom
const mockZones = [
  { id: 'zone-a', name: 'Zone A - North Sector', drones: 2, sensors: 14, status: 'normal' as const, center: [34.06, -118.25] as [number, number] },
  { id: 'zone-b', name: 'Zone B - East Perimeter', drones: 1, sensors: 8, status: 'normal' as const, center: [34.05, -118.23] as [number, number] },
  { id: 'zone-c', name: 'Zone C - South Ridge', drones: 3, sensors: 12, status: 'attention' as const, hasIncident: true, center: [34.04, -118.25] as [number, number] },
];

export default function Index() {
  const [state, setState] = useState(getInitialState());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [isNetworkLost, setIsNetworkLost] = useState(false);

  const droneMovementInterval = useRef<NodeJS.Timeout | null>(null);

  // Simulation: Move drones slightly every 2 seconds
  useEffect(() => {
    droneMovementInterval.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        drones: prev.drones.map(d => {
          if (d.status === 'offline' || d.status === 'docked') return d;

          // Random slight movement
          const currentPos = d.position || [d.location.lat, d.location.lng];
          const newPos: [number, number] = [
            currentPos[0] + (Math.random() - 0.5) * 0.001,
            currentPos[1] + (Math.random() - 0.5) * 0.001
          ];

          return {
            ...d,
            position: newPos,
            location: { lat: newPos[0], lng: newPos[1] }
          };
        })
      }));
    }, 2000);

    return () => {
      if (droneMovementInterval.current) clearInterval(droneMovementInterval.current);
    };
  }, []);

  // Format elapsed time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Demo controls - change operational state
  const setOperationalState = useCallback((newState: OperationalState) => {
    console.log(`[STATE CHANGE] Transitioning to ${newState}`);

    if (newState === 'green') {
      const base = getInitialState();
      setState({
        ...base,
        operationalState: 'green',
        incidents: [],
        activeIncident: null,
      });
      setElapsedTime(0);
      setSelectedDroneId(null);
    } else if (newState === 'amber') {
      setState(prev => ({
        ...prev,
        operationalState: 'amber',
        activeIncident: mockIncidentDetected,
        incidents: [mockIncidentDetected],
        timeline: mockTimelineAmber,
        drones: prev.drones.map(d =>
          d.id === 'D-247' ? {
            ...d,
            status: 'en_route' as const,
            task: 'RESPONDING',
            position: [34.045, -118.255] as [number, number],
            battery: 85
          } : d
        ),
      }));
      setMapCenter([34.045, -118.255]);
    } else if (newState === 'red') {
      setState(prev => ({
        ...prev,
        operationalState: 'red',
        activeIncident: mockActiveIncident,
        incidents: [mockActiveIncident],
        timeline: mockTimelineRed,
        drones: prev.drones.map(d => {
          if (d.id === 'D-247') return { ...d, status: 'on_mission' as const, task: 'THERMAL INTEL', battery: 82 };
          if (d.id === 'D-309') return { ...d, status: 'on_mission' as const, task: 'EVAC SUPPORT', battery: 91 };
          return d;
        }),
      }));
    }
  }, []);

  const handleZoneClick = useCallback((zoneId: string, center?: [number, number]) => {
    if (center) setMapCenter(center);
  }, []);

  const handleDroneSelect = useCallback((droneId: string) => {
    setSelectedDroneId(prev => prev === droneId ? null : droneId);
    const drone = state.drones.find(d => d.id === droneId);
    if (drone?.position) setMapCenter(drone.position);

    toast({
      title: selectedDroneId === droneId ? "Deselected" : "Targeting Drone",
      description: `Focused on ${droneId}`,
    });
  }, [state.drones, selectedDroneId]);

  // Voice commands setup
  const { simulateVoiceCommand } = useVoiceCommands({
    operationalState: state.operationalState,
    activeIncident: state.activeIncident,
    drones: state.drones,
    onApprove: () => setOperationalState('red'),
    onDecline: () => setOperationalState('green'),
    onDeployBackup: () => {
      toast({ title: "Backup Deployed", description: "D-412 launching from Dock 2", });
    },
    onZoomToIncident: () => {
      if (state.activeIncident?.coordinates) setMapCenter(state.activeIncident.coordinates);
    },
    onZoomToDrone: (droneId: string) => handleDroneSelect(droneId),
    onMarkResolved: () => setOperationalState('green'),
  });

  const { isListening, toggleListening } = useVoicePushToTalk(simulateVoiceCommand);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K => Search focus (simulated)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toast({ title: "Command Search", description: "Global index ready (Ctrl+K)" });
      }

      // Space to approve in amber state
      if (e.code === 'Space' && state.operationalState === 'amber' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOperationalState('red');
        toast({ title: "Response Approved", description: "Manual approval received from spacebar." });
      }

      // Escape to veto/dismiss
      if (e.code === 'Escape' && state.operationalState !== 'green') {
        e.preventDefault();
        setOperationalState('green');
        toast({ title: "Alert Dismissed", description: "System returning to safe state." });
      }

      // Quick State demo (Ctrl+1,2,3)
      if (e.ctrlKey) {
        if (e.key === '1') setOperationalState('green');
        if (e.key === '2') setOperationalState('amber');
        if (e.key === '3') setOperationalState('red');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.operationalState, setOperationalState]);

  // Elapsed time counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.operationalState !== 'green') {
      interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [state.operationalState]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-background">

      {/* Network Lost Banner (Edge Case) */}
      {isNetworkLost && (
        <div className="fixed top-0 left-0 w-full h-10 bg-status-attention z-[5000] flex items-center justify-center gap-3 animate-in slide-in-from-top duration-300">
          <WifiOff className="w-5 h-5 text-black" />
          <span className="text-sm font-black text-black uppercase tracking-widest">Network Connection Lost - Operating in Cached Mode</span>
        </div>
      )}

      <CommandLayout>
        {/* Top Bar */}
        <TopBarSlot>
          <div className="flex items-center justify-between w-full h-[80px]">
            <TopBar
              operationalState={state.operationalState}
              activeIncidents={state.incidents.length}
              alertsCount={isNetworkLost ? 1 : (state.operationalState === 'green' ? 0 : 3)}
              shiftTime="4h 23m"
              operatorName="SARAH CHEN"
            />
            {/* Voice Controller integrated into Top Bar right side */}
            <VoicePanel
              isListening={isListening}
              onToggleListening={toggleListening}
              onCommand={simulateVoiceCommand}
              className="ml-4"
            />
          </div>
        </TopBarSlot>

        {/* Left Sidebar - Static Context */}
        <LeftSidebarSlot>
          <LeftSidebar
            zones={mockZones.map(z => ({ ...z, status: state.operationalState === 'green' ? 'normal' : z.status }))}
            drones={state.drones}
            sensorsOnline={32}
            sensorsWeak={2}
            sensorsOffline={0}
            systemStatus={isNetworkLost ? "degraded" : "normal"}
            networkLatency={isNetworkLost ? 999 : 98}
            weather="Clear, 18mph"
            lastUpdate="3s ago"
            selectedDroneId={selectedDroneId}
            onZoneClick={handleZoneClick}
            onDroneSelect={handleDroneSelect}
          />
        </LeftSidebarSlot>

        {/* Center Map - Primary Tactical View */}
        <CenterMapSlot>
          <CommandMap
            state={state}
            operationalState={state.operationalState}
            selectedDroneId={selectedDroneId}
            mapCenter={mapCenter}
          />
        </CenterMapSlot>

        {/* Right Panel - Action Zone */}
        <RightPanelSlot>
          <RightPanel
            operationalState={state.operationalState}
            incidents={state.incidents}
            activeDrones={state.drones}
            timeline={state.timeline}
            onApprove={(id) => setOperationalState('red')}
            onVeto={(id) => setOperationalState('green')}
          />
        </RightPanelSlot>
      </CommandLayout>

      {/* FIXED OVERLAYS */}

      {/* Demo State Controller (Floating) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000]">
        <div className="bg-[#1A2332]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">State Simulation</span>
            <div className="flex items-center gap-2">
              <DemoStateBtn color="green" active={state.operationalState === 'green'} onClick={() => setOperationalState('green')} />
              <DemoStateBtn color="amber" active={state.operationalState === 'amber'} onClick={() => setOperationalState('amber')} />
              <DemoStateBtn color="red" active={state.operationalState === 'red'} onClick={() => setOperationalState('red')} />
            </div>
          </div>

          {state.operationalState !== 'green' && (
            <div className="flex flex-col border-l border-white/5 pl-6 pr-6">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Elapsed Time</span>
              <span className="text-lg font-mono font-black text-primary leading-none">{formatTime(elapsedTime)}</span>
            </div>
          )}

          <div className="flex flex-col border-l border-white/5 pl-6">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Resilience Testing</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsNetworkLost(!isNetworkLost)}
                className={cn(
                  "h-8 text-[10px] font-black tracking-widest uppercase border-white/10",
                  isNetworkLost ? "bg-status-attention text-black hover:bg-status-attention/80" : "text-white/60 hover:text-white"
                )}
              >
                {isNetworkLost ? "RESTORE NETWORK" : "LOSE NETWORK"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoStateBtn({ color, active, onClick }: { color: OperationalState, active: boolean, onClick: () => void }) {
  const styles = {
    green: active ? "bg-status-normal text-white ring-4 ring-status-normal/20" : "border-status-normal/40 text-status-normal hover:bg-status-normal/10",
    amber: active ? "bg-status-attention text-black ring-4 ring-status-attention/20" : "border-status-attention/40 text-status-attention hover:bg-status-attention/10",
    red: active ? "bg-status-critical text-white ring-4 ring-status-critical/20" : "border-status-critical/40 text-status-critical hover:bg-status-critical/10",
  };

  return (
    <Button
      size="sm"
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className={cn("h-10 px-6 font-black uppercase text-xs tracking-widest transition-all", styles[color])}
    >
      {color}
    </Button>
  );
}