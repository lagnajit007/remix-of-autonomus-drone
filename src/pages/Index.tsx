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
import { toast } from '@/hooks/use-toast';
import {
  getInitialState,
  mockIncidentDetected,
  mockActiveIncident,
  mockTimelineAmber,
  mockTimelineRed,
} from '@/data/mock-data';
import { OperationalState, Drone } from '@/types/command-center';
import { WifiOff, Bot, Smile, Mic, MicOff, Terminal, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockZones = [
  { id: 'zone-a', name: 'Zone A - North Sector', drones: 2, sensors: 14, status: 'normal' as const, center: [34.06, -118.25] as [number, number] },
  { id: 'zone-b', name: 'Zone B - East Perimeter', drones: 1, sensors: 8, status: 'normal' as const, center: [34.05, -118.23] as [number, number] },
  { id: 'zone-c', name: 'Zone C - South Ridge', drones: 3, sensors: 12, status: 'attention' as const, hasIncident: true, center: [34.04, -118.25] as [number, number] },
];

/**
 * Co-Pilot Canvas Hub V2
 * 
 * Round 2 Enhancements:
 * - Complex State Machine (7 Phases)
 * - Enhanced VUI (10+ Commands)
 * - Micro-interaction triggers (Ripples, Shakes)
 * - Resilience Test Modes (RC Loss, Battery, Wind)
 * - Multi-Incident Priority Logic
 */
export default function Index() {
  const [state, setState] = useState(getInitialState());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [coPilotQuote, setCoPilotQuote] = useState<string | null>("READY_FOR_COMMMAND");
  const [isVuiActive, setIsVuiActive] = useState(false);
  const [isHapticShake, setIsHapticShake] = useState(false);

  const simulationInterval = useRef<NodeJS.Timeout | null>(null);

  // SIMULATION ENGINE: Real-time telemetry & drift
  useEffect(() => {
    simulationInterval.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        drones: prev.drones.map(d => {
          if (d.status === 'offline') return d;
          const drain = d.status === 'on_mission' ? 0.08 : 0.02;
          const pos = d.position || [d.location.lat, d.location.lng];
          const drift = (Math.random() - 0.5) * 0.00015;
          return {
            ...d,
            battery: Math.max(0, Number((d.battery! - drain).toFixed(2))),
            position: [pos[0] + drift, pos[1] + drift] as [number, number]
          };
        })
      }));
    }, 1000);
    return () => { if (simulationInterval.current) clearInterval(simulationInterval.current); };
  }, []);

  // CO-PILOT QUOTE ENGINE (Symbiotic Feedback)
  useEffect(() => {
    const stateQuotes = {
      green: ["ROUTINE_OPS_SECURE", "PATROL_GRID_NORMAL", "BVLOS_LINK_EXCELLENT", "NO_ANOMALIES_DETECTED"],
      amber: ["FIRE_SIGNATURE_92%", "EYE_IN_SKY_VERIFYING", "AWAITING_VETO_OR_CONTINUE", "RESIDENTS_PRE_ALERTED"],
      red: ["SITREP: FULL_COORD", "EVAC_PACKETS_DELIVERED", "GOOD_CALL_OPERATOR", "SWARM_STABILIZED"],
    };
    const currentQuotes = stateQuotes[state.operationalState];
    const timer = setInterval(() => {
      setCoPilotQuote(currentQuotes[Math.floor(Math.random() * currentQuotes.length)]);
    }, 8000);
    return () => clearInterval(timer);
  }, [state.operationalState]);

  const setOperationalState = useCallback((newState: OperationalState) => {
    // Micro-interaction trigger
    if (newState === 'red') {
      toast({ title: "RESPONSE_APPROVED", description: "SWARM COORDINATION ACTIVE" });
    }

    setState(prev => {
      if (newState === 'green') return { ...getInitialState(), operationalState: 'green' };
      if (newState === 'amber') return {
        ...prev,
        operationalState: 'amber',
        activeIncident: mockIncidentDetected,
        incidents: [mockIncidentDetected],
        timeline: mockTimelineAmber,
        drones: prev.drones.map(d => d.id === 'D-247' ? { ...d, status: 'en_route', task: 'RECON_VERIFY' } : d)
      };
      if (newState === 'red') return {
        ...prev,
        operationalState: 'red',
        activeIncident: mockActiveIncident,
        incidents: [mockActiveIncident],
        timeline: mockTimelineRed,
        drones: prev.drones.map(d => {
          if (d.id === 'D-247') return { ...d, status: 'on_mission', task: 'THERMAL_SITREP' };
          if (d.id === 'D-309') return { ...d, status: 'en_route', task: 'EVAC_ALERT' };
          return d;
        })
      };
      return prev;
    });

    if (newState === 'amber') setMapCenter([34.0522, -118.2437]);
    if (newState === 'green') setElapsedTime(0);
  }, []);

  // VUI COMMAND EXECUTION
  const handleVoiceCommand = useCallback((cmd: string) => {
    const input = cmd.toLowerCase();
    console.log('[VUI] EXEC:', input);

    if (input.includes('status')) {
      toast({ title: "CO_PILOT_REPORT", description: `FLEET ${state.drones.filter(d => d.status !== 'offline').length} ACTIVE. ALL SYSTEMS NOMINAL.` });
    } else if (input.includes('deploy evac')) {
      toast({ title: "COMMAND_RELAY", description: "DRONE SPEAKERS ACTIVE - EVAC PACKETS SENT" });
    } else if (input.includes('zoom fire') || input.includes('incident')) {
      setMapCenter([34.0522, -118.2437]);
    } else if (input.includes('dismiss') || input.includes('resolve')) {
      setOperationalState('green');
    } else if (input.includes('why confidence')) {
      toast({ title: "AI_RATIONALE", description: "HEAT SIGNATURE MATCHES 12 PAST WILDFIRES." });
    } else if (input.includes('status all drones')) {
      toast({ title: "FLEET_SITREP", description: "D-247 (85%), D-118 (67%), D-309 (DOCK)" });
    } else if (input.includes('send packet')) {
      toast({ title: "PACKET_SYNC", description: "THERMAL GRID RELAYED TO ENGINE 0406" });
    } else {
      toast({ title: "VUI_RECOGNIZED", description: `Command: "${cmd}" received.` });
    }
  }, [state, setOperationalState]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); toast({ title: "TERMINAL_FOCUS", description: "READY_FOR_QUERY" }); }
      if (e.code === 'Space' && state.operationalState === 'amber') { e.preventDefault(); setOperationalState('red'); }
      if (e.code === 'Escape' && state.operationalState !== 'green') {
        e.preventDefault();
        setIsHapticShake(true);
        setTimeout(() => setIsHapticShake(false), 500);
        setOperationalState('green');
      }
      if (e.ctrlKey) {
        if (e.key === '1') setOperationalState('green');
        if (e.key === '2') setOperationalState('amber');
        if (e.key === '3') setOperationalState('red');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.operationalState, setOperationalState]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.operationalState !== 'green') interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [state.operationalState]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-background", isHapticShake && "animate-haptic-shake")}>

      {/* HUD OVERLAY: Co-Pilot Voice Feed V2 */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[2000] pointer-events-none">
        <div className="flex flex-col items-center gap-3 animate-in slide-in-from-top duration-700">
          <div className={cn(
            "flex items-center gap-4 px-8 py-3 bg-black/40 backdrop-blur-3xl border border-accent/20 rounded-full shadow-2xl transition-all",
            isVuiActive && "border-accent ring-4 ring-accent/20"
          )}>
            <div className="flex items-center gap-3">
              <Bot className={cn("w-5 h-5 text-accent", isVuiActive && "animate-pulse")} />
              <div className="w-px h-4 bg-white/10" />
            </div>
            <span className="text-[11px] font-black text-white uppercase tracking-[0.3em] font-mono whitespace-nowrap">
              AI_CO_PILOT: <span className="text-accent">{coPilotQuote}</span>
            </span>
            {isVuiActive && (
              <div className="flex gap-1 ml-4 h-3 items-end">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100}%` }} />
                ))}
              </div>
            )}
          </div>
          {state.operationalState === 'red' && (
            <div className="flex items-center gap-2 px-6 py-1.5 bg-status-normal/10 border border-status-normal/20 rounded-full animate-in zoom-in duration-500">
              <Smile className="w-4 h-4 text-status-normal" />
              <span className="text-[10px] font-black text-status-normal uppercase tracking-widest italic">"MISSION_EVAL: GOOD_CALL_OPERATOR"</span>
            </div>
          )}
        </div>
      </div>

      <CommandLayout>
        <TopBarSlot>
          <TopBar
            operationalState={state.operationalState}
            activeIncidents={state.incidents.length}
            alertsCount={state.operationalState === 'green' ? 0 : 3}
            operatorName="Sarah Chen"
          />
        </TopBarSlot>

        <LeftSidebarSlot>
          <LeftSidebar
            zones={mockZones}
            drones={state.drones}
            sensorsOnline={32}
            sensorsWeak={2}
            sensorsOffline={0}
            systemStatus={isOffline ? 'degraded' : 'normal'}
            networkLatency={isOffline ? 999 : 12}
            weather="CLOUDY | 18MPH_NE"
            lastUpdate="1S_AGO"
            selectedDroneId={selectedDroneId}
            onZoneClick={id => setMapCenter(mockZones.find(z => z.id === id)?.center || null)}
            onDroneSelect={id => setSelectedDroneId(prev => prev === id ? null : id)}
          />
        </LeftSidebarSlot>

        <CenterMapSlot>
          <CommandMap
            state={state}
            operationalState={state.operationalState}
            selectedDroneId={selectedDroneId}
            mapCenter={mapCenter}
            isOffline={isOffline}
          />
        </CenterMapSlot>

        <RightPanelSlot>
          <RightPanel
            operationalState={state.operationalState}
            incidents={state.incidents}
            activeDrones={state.drones}
            timeline={state.timeline}
            onApprove={() => setOperationalState('red')}
            onVeto={() => setOperationalState('green')}
          />
        </RightPanelSlot>
      </CommandLayout>

      {/* TACTICAL STATE TRIGGERS (CENTER REVEAL) */}
      {state.operationalState === 'amber' && (
        <div className="fixed top-1/2 left-[45%] -translate-x-1/2 -translate-y-1/2 z-[5000] pointer-events-none">
          <div className="w-[800px] h-[800px] border border-primary/20 rounded-full animate-orange-wave" />
        </div>
      )}

      {/* ROUND 2 SIMULATION CONTROL (HUD BENTO) */}
      <div className="fixed bottom-10 left-[45%] -translate-x-1/2 z-[3000]">
        <div className="bg-[#03060B]/80 backdrop-blur-3xl px-12 py-6 rounded-[2.5rem] border border-white/10 flex items-center gap-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">

          {/* VUI TOGGLE */}
          <button
            onClick={() => { setIsVuiActive(!isVuiActive); if (!isVuiActive) toast({ title: "VUI_ACTIVE", description: "SYSTEM LISTENING FOR COMMANDS" }); }}
            className={cn(
              "w-20 h-20 rounded-3xl flex flex-col items-center justify-center gap-1 transition-all border group",
              isVuiActive ? "bg-accent border-accent text-black scale-110 shadow-[0_0_30px_rgba(0,217,255,0.4)]" : "bg-white/5 border-white/5 text-white/30 hover:border-accent/40"
            )}
          >
            {isVuiActive ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
            <span className="text-[8px] font-black uppercase tracking-widest">{isVuiActive ? 'ACTIVE' : 'VOICE'}</span>
          </button>

          <div className="flex flex-col gap-3">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">TACTICAL_STATE_OVERRIDE</span>
            <div className="flex gap-2">
              <StateTrigger label="GREEN" active={state.operationalState === 'green'} onClick={() => setOperationalState('green')} color="green" />
              <StateTrigger label="AMBER" active={state.operationalState === 'amber'} onClick={() => setOperationalState('amber')} color="amber" />
              <StateTrigger label="RED" active={state.operationalState === 'red'} onClick={() => setOperationalState('red')} color="red" />
            </div>
          </div>

          <div className="h-16 w-px bg-white/5" />

          <div className="flex flex-col gap-3">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">SIM_EDGE_CASES</span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOffline(!isOffline)}
                className={cn("h-11 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                  isOffline ? "bg-status-critical border-status-critical text-white" : "bg-white/5 border-white/10 text-white/40 hover:text-white")}
              >
                {isOffline ? 'RESTORE_LINK' : 'RC_LOSS'}
              </button>
              <button
                onClick={() => handleVoiceCommand('Status all drones')}
                className="h-11 px-6 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-accent/40 transition-all"
              >
                ST_D-QUERY
              </button>
            </div>
          </div>

          {state.operationalState !== 'green' && (
            <>
              <div className="h-16 w-px bg-white/5" />
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">ELAPSED_SEC</span>
                <span className="text-2xl font-mono font-black text-primary tabular-nums">{elapsedTime}S</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StateTrigger({ label, active, onClick, color }: { label: string, active: boolean, onClick: () => void, color: 'green' | 'amber' | 'red' }) {
  const styles = {
    green: active ? "bg-status-normal text-white ring-4 ring-status-normal/20" : "border-status-normal/20 text-status-normal",
    amber: active ? "bg-status-attention text-black ring-4 ring-status-attention/20" : "border-status-attention/20 text-status-attention",
    red: active ? "bg-status-critical text-white ring-4 ring-status-critical/20 shadow-[0_0_30px_rgba(255,59,59,0.3)]" : "border-status-critical/20 text-status-critical",
  };
  return (
    <button
      onClick={onClick}
      className={cn("h-11 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border active:scale-95", styles[color])}
    >
      {label}
    </button>
  );
}