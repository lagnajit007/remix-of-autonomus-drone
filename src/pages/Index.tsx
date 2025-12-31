import { useState, useEffect } from 'react';
import { CommandSidebar } from '@/components/command-center/CommandSidebar';
import { CommandMap } from '@/components/command-center/CommandMap';
import { DroneCard } from '@/components/command-center/DroneCard';
import { EventTimeline } from '@/components/command-center/EventTimeline';
import { EnvironmentalWidget } from '@/components/command-center/EnvironmentalWidget';
import { StatusBadge } from '@/components/command-center/StatusBadge';
import { Button } from '@/components/ui/button';
import { 
  getInitialState, 
  mockIncidentDetected, 
  mockActiveIncident,
  mockTimelineAmber,
  mockTimelineRed,
} from '@/data/mock-data';
import { OperationalState } from '@/types/command-center';
import { AlertTriangle, MapPin, Clock, Users, Radio } from 'lucide-react';

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

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const droneRoutes = state.operationalState !== 'green' && state.activeIncident ? [
    { droneId: 'D-247', path: [[34.0495, -118.2401], [34.0522, -118.2437]] as [number, number][] }
  ] : [];

  return (
    <div className="h-screen w-full flex bg-background overflow-hidden">
      <CommandSidebar 
        activeOperations={state.drones.filter(d => d.status !== 'docked').length}
        operationalState={state.operationalState}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Red State Header */}
        {state.operationalState === 'red' && state.activeIncident && (
          <div className="h-14 bg-[hsl(var(--status-critical)/0.1)] border-b border-[hsl(var(--status-critical)/0.3)] flex items-center justify-between px-6 animate-slide-in-top">
            <div className="flex items-center gap-4">
              <StatusBadge status="critical" label="Active Response" />
              <span className="font-bold">{state.activeIncident.id}</span>
              <span className="text-muted-foreground">|</span>
              <div className="flex items-center gap-2 font-mono">
                <Clock className="w-4 h-4" />
                <span className="font-bold text-status-critical">{formatElapsedTime(elapsedTime)}</span>
                <span className="text-muted-foreground">ELAPSED</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="border-[hsl(var(--status-critical)/0.3)] text-status-critical hover:bg-[hsl(var(--status-critical)/0.1)]">
                <Users className="w-4 h-4 mr-2" /> Add Drone
              </Button>
              <Button size="sm" variant="outline" className="border-primary/30">
                <Radio className="w-4 h-4 mr-2" /> Contact Ground
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Map Area */}
          <div className="flex-1 p-4 relative">
            <CommandMap
              drones={state.drones}
              sensors={state.sensors}
              dockStations={state.dockStations}
              incident={state.activeIncident}
              operationalState={state.operationalState}
              droneRoutes={droneRoutes}
            />

            {/* Amber Alert Overlay */}
            {state.operationalState === 'amber' && state.activeIncident && (
              <>
                <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOperationalState('green')} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[480px] animate-slide-in-top">
                  <div className="command-card border-[hsl(var(--status-attention)/0.5)] animate-pulse-border-amber overflow-hidden">
                    <div className="bg-[hsl(var(--status-attention)/0.1)] px-5 py-4 flex items-center justify-between border-b border-[hsl(var(--status-attention)/0.2)]">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-status-attention" />
                        <span className="font-bold">Thermal Anomaly Detected</span>
                      </div>
                      <StatusBadge status="attention" label="High" pulse={false} />
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{state.activeIncident.address}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {state.activeIncident.location.lat.toFixed(4)}, {state.activeIncident.location.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="command-card p-3">
                          <span className="text-xs text-muted-foreground">Heat Signature</span>
                          <p className="font-bold text-status-attention font-mono">{state.activeIncident.threatAssessment.heatSignature}°C</p>
                        </div>
                        <div className="command-card p-3">
                          <span className="text-xs text-muted-foreground">Structures at Risk</span>
                          <p className="font-bold text-status-attention font-mono">{state.activeIncident.threatAssessment.structuresAtRisk}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-xs text-muted-foreground mb-2">Autonomous Response</p>
                        <p className="text-sm"><span className="text-status-normal">✓</span> D-247 dispatched • <span className="text-primary font-bold">ETA 27s</span></p>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={() => setOperationalState('red')}>
                          Approve & Monitor
                        </Button>
                        <Button variant="outline" onClick={() => setOperationalState('green')}>
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Demo Controls */}
            <div className="absolute bottom-6 left-6 z-30">
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

          {/* Right Panel */}
          <aside className="w-80 border-l border-primary/10 flex flex-col overflow-hidden bg-card/50">
            {state.operationalState === 'red' && state.activeIncident ? (
              /* Red State: Command Panel */
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Situation</h3>
                  <div className="space-y-2">
                    <div className="command-card p-3 flex items-center justify-between">
                      <span className="text-sm">Threat Level</span>
                      <span className="text-status-critical font-bold">High - Expanding Fire</span>
                    </div>
                    <div className="command-card p-3 flex items-center justify-between">
                      <span className="text-sm">Structures</span>
                      <span className="font-bold font-mono">{state.activeIncident.threatAssessment.structuresAtRisk} at risk</span>
                    </div>
                    <div className="command-card p-3 flex items-center justify-between">
                      <span className="text-sm">Evacuations</span>
                      <span className="text-status-normal font-bold font-mono">{state.activeIncident.evacuationsSent} sent</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Thermal Feed */}
                <div>
                  <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Live Feed - D-247</h3>
                  <div className="command-card aspect-video relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-red-600/40 to-yellow-500/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 border-2 border-primary/60 rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 text-xs font-mono text-white/80">
                      THERMAL • REC
                    </div>
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span className="w-2 h-2 bg-status-critical rounded-full animate-pulse" />
                      <span className="text-xs font-mono text-white/80">LIVE</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Assigned Drones</h3>
                  <div className="space-y-2">
                    {state.drones.filter(d => d.status === 'on_mission').map(drone => (
                      <DroneCard key={drone.id} drone={drone} compact />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Event Log</h3>
                  <EventTimeline events={state.timeline} maxHeight="200px" />
                </div>

                <Button variant="outline" className="w-full border-status-normal/30 text-status-normal hover:bg-status-normal/10">
                  Mark Incident Resolved
                </Button>
              </div>
            ) : (
              /* Green/Amber State: Standard Panel */
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                  <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Active Drones</h3>
                  <div className="space-y-2">
                    {state.drones.map(drone => (
                      <DroneCard key={drone.id} drone={drone} compact />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Recent Activity</h3>
                  <EventTimeline events={state.timeline} maxHeight="180px" />
                </div>
                <div>
                  <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Environment</h3>
                  <EnvironmentalWidget data={state.environmentalData} />
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
