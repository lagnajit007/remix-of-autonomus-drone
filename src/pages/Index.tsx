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
import { IncidentOverlay } from '@/components/overlays/IncidentOverlay';
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
import { OperationalState } from '@/types/command-center';

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
  const [showIncidentOverlay, setShowIncidentOverlay] = useState(false);

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
      setShowIncidentOverlay(false);
      setSelectedDroneId(null);
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
      setShowIncidentOverlay(true);
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
      setShowIncidentOverlay(false);
    }
  }, []);

  // Handle zone click - zoom to zone
  const handleZoneClick = useCallback((zoneId: string, center?: [number, number]) => {
    console.log(`[INDEX] Zone clicked: ${zoneId}`, center);
    if (center) {
      setMapCenter(center);
      toast({
        title: "Map Centered",
        description: `Zoomed to ${mockZones.find(z => z.id === zoneId)?.name}`,
      });
    }
  }, []);

  // Handle drone selection
  const handleDroneSelect = useCallback((droneId: string) => {
    console.log(`[INDEX] Drone selected: ${droneId}`);
    setSelectedDroneId(prev => prev === droneId ? null : droneId);
    
    // Find drone and zoom to it
    const drone = state.drones.find(d => d.id === droneId);
    if (drone?.position) {
      setMapCenter(drone.position);
    }
    
    toast({
      title: selectedDroneId === droneId ? "Drone Deselected" : "Drone Selected",
      description: selectedDroneId === droneId ? `${droneId} deselected` : `Focused on ${droneId}`,
    });
  }, [state.drones, selectedDroneId]);

  // Voice commands setup
  const { simulateVoiceCommand } = useVoiceCommands({
    operationalState: state.operationalState,
    activeIncident: state.activeIncident,
    drones: state.drones,
    onApprove: () => handleApprove(state.incidents[0]?.id),
    onDecline: () => handleVeto(state.incidents[0]?.id),
    onDeployBackup: () => {
      console.log('[INDEX] Deploying backup drone');
      toast({
        title: "Backup Deployed",
        description: "D-412 launching from Dock 2",
      });
    },
    onZoomToIncident: () => {
      if (state.activeIncident?.coordinates) {
        setMapCenter(state.activeIncident.coordinates);
      }
    },
    onZoomToDrone: (droneId: string) => {
      handleDroneSelect(droneId);
    },
    onMarkResolved: () => setOperationalState('green'),
  });

  const { isListening, toggleListening } = useVoicePushToTalk(simulateVoiceCommand);

  const handleApprove = useCallback((incidentId: string) => {
    console.log('[INDEX] Approving incident:', incidentId);
    setShowIncidentOverlay(false);
    setOperationalState('red');
    toast({
      title: "Response Approved",
      description: "Full emergency response initiated. Good call.",
    });
  }, [setOperationalState]);

  const handleVeto = useCallback((incidentId: string) => {
    console.log('[INDEX] Vetoing incident:', incidentId);
    setShowIncidentOverlay(false);
    setOperationalState('green');
    toast({
      title: "Alert Dismissed",
      description: "Returning to normal monitoring.",
    });
  }, [setOperationalState]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // State switching shortcuts
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
      
      // Space to approve in amber state (when overlay is showing)
      if (e.code === 'Space' && state.operationalState === 'amber' && showIncidentOverlay && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (state.incidents[0]?.id) {
          handleApprove(state.incidents[0].id);
        }
      }
      
      // Escape to veto/dismiss
      if (e.code === 'Escape' && state.operationalState !== 'green') {
        e.preventDefault();
        if (state.incidents[0]?.id) {
          handleVeto(state.incidents[0].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setOperationalState, state.operationalState, state.incidents, showIncidentOverlay, handleApprove, handleVeto]);

  // Elapsed time counter for active incidents
  useEffect(() => {
    if (state.operationalState !== 'green') {
      const interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [state.operationalState]);

  const handleMonitorOnly = useCallback(() => {
    console.log('[INDEX] Monitor only selected');
    setShowIncidentOverlay(false);
    toast({
      title: "Monitoring Mode",
      description: "Continuing to observe. Alert will remain active.",
    });
  }, []);

  // Update zones based on state
  const currentZones = state.operationalState === 'green' 
    ? mockZones.map(z => ({ ...z, status: 'normal' as const, hasIncident: false }))
    : mockZones;

  return (
    <CommandLayout>
      {/* Top Bar */}
      <TopBarSlot>
        <div className="flex items-center justify-between w-full">
          <TopBar 
            operationalState={state.operationalState}
            activeIncidents={state.incidents.length}
            alertsCount={state.operationalState === 'green' ? 0 : 2}
            shiftTime="4h 23m"
            operatorName="Sarah Chen"
          />
          
          {/* Voice Panel in Top Bar */}
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
          zones={currentZones}
          drones={state.drones}
          sensorsOnline={32}
          sensorsWeak={2}
          sensorsOffline={0}
          systemStatus="normal"
          networkLatency={98}
          weather="Clear, 18mph"
          lastUpdate="3s ago"
          selectedDroneId={selectedDroneId}
          onZoneClick={handleZoneClick}
          onDroneSelect={handleDroneSelect}
        />
      </LeftSidebarSlot>

      {/* Center Map - Primary View */}
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
          onApprove={handleApprove}
          onVeto={handleVeto}
        />
      </RightPanelSlot>

      {/* Incident Overlay (Amber State) */}
      {state.operationalState === 'amber' && state.activeIncident && (
        <IncidentOverlay
          incident={state.activeIncident}
          isVisible={showIncidentOverlay}
          onApprove={() => handleApprove(state.activeIncident!.id)}
          onVeto={() => handleVeto(state.activeIncident!.id)}
          onMonitorOnly={handleMonitorOnly}
        />
      )}

      {/* Demo Controls (Bottom overlay) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
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
            Ctrl+1/2/3 | Space=Approve | Esc=Veto | Ctrl+Space=Voice
          </span>
        </div>
      </div>
    </CommandLayout>
  );
}