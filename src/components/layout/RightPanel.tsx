import { 
  AlertTriangle, 
  Plane, 
  Bot, 
  Radio,
  Clock,
  Eye,
  Gamepad2,
  Send,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Incident, Drone, TimelineEvent, OperationalState } from "@/types/command-center";

interface RightPanelProps {
  operationalState: OperationalState;
  incidents: Incident[];
  activeDrones: Drone[];
  timeline: TimelineEvent[];
  onApprove?: (incidentId: string) => void;
  onVeto?: (incidentId: string) => void;
  className?: string;
}

/**
 * Right Panel (440px Fixed Width) - THE ACTION ZONE
 * 
 * This panel changes based on system state, but structure remains consistent
 * 
 * State 1: Normal Monitoring (Green)
 * State 2: Incident Detected (Amber)
 * State 3: Active Response (Red)
 */
export function RightPanel({
  operationalState,
  incidents,
  activeDrones,
  timeline,
  onApprove,
  onVeto,
  className,
}: RightPanelProps) {
  const activeIncident = incidents[0];

  return (
    <div className={cn("flex flex-col h-full gap-3", className)}>
      {/* Incident Queue */}
      <IncidentQueueSection 
        incidents={incidents}
        operationalState={operationalState}
        onApprove={onApprove}
        onVeto={onVeto}
      />

      {/* Active Drones */}
      <ActiveDronesSection drones={activeDrones} />

      {/* AI Insights (Green/Amber) or Ground Comms (Red) */}
      {operationalState === 'red' ? (
        <GroundCommsSection />
      ) : (
        <AIInsightsSection drones={activeDrones} />
      )}

      {/* Timeline (Red state only) */}
      {operationalState === 'red' && (
        <TimelineSection events={timeline} />
      )}

      {/* Recent Activity (Green state) */}
      {operationalState === 'green' && (
        <RecentActivitySection events={timeline} />
      )}
    </div>
  );
}

// Incident Queue Section
interface IncidentQueueSectionProps {
  incidents: Incident[];
  operationalState: OperationalState;
  onApprove?: (incidentId: string) => void;
  onVeto?: (incidentId: string) => void;
}

function IncidentQueueSection({ 
  incidents, 
  operationalState,
  onApprove,
  onVeto 
}: IncidentQueueSectionProps) {
  const priorityColors = {
    1: "border-status-critical",
    2: "border-status-attention",
    3: "border-accent",
  };

  const getPriority = (incident: Incident): 1 | 2 | 3 => {
    if (incident.priority) return incident.priority;
    if (incident.severity === 'critical') return 1;
    if (incident.severity === 'high') return 1;
    if (incident.severity === 'medium') return 2;
    return 3;
  };

  const getTitle = (incident: Incident): string => {
    return incident.title || incident.type.replace('_', ' ').toUpperCase();
  };

  const getLocation = (incident: Incident): string => {
    return incident.address;
  };

  return (
    <div className="panel-section">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">INCIDENT QUEUE</span>
        </div>
        <span className={cn(
          "px-2 py-0.5 rounded text-xs font-mono",
          incidents.length > 0 ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
        )}>
          {incidents.length}
        </span>
      </div>

      {incidents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active incidents</p>
      ) : (
        <div className="space-y-2">
          {incidents.map((incident) => {
            const priority = getPriority(incident);
            const title = getTitle(incident);
            const location = getLocation(incident);
            
            return (
              <div
                key={incident.id}
                className={cn(
                  "p-3 rounded-lg bg-secondary/50 border-l-4 transition-all",
                  priorityColors[priority],
                  operationalState === 'amber' && priority === 1 && "animate-pulse-border-amber",
                  operationalState === 'red' && priority === 1 && "animate-pulse-border-red"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">{location}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium uppercase",
                    priority === 1 ? "bg-status-critical/20 text-status-critical" :
                    priority === 2 ? "bg-status-attention/20 text-status-attention" :
                    "bg-accent/20 text-accent"
                  )}>
                    {priority === 1 ? "Critical" : priority === 2 ? "Attention" : "Monitor"}
                  </span>
                </div>

                {/* Amber state: Show approval buttons */}
                {operationalState === 'amber' && incident.status === 'detected' && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      AI Confidence: <span className="text-accent font-mono">{incident.confidence || 92}%</span>
                    </p>
                    <button
                      onClick={() => onApprove?.(incident.id)}
                      className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      APPROVE FULL RESPONSE
                    </button>
                    <div className="flex gap-2">
                      <button className="flex-1 py-1.5 text-xs text-muted-foreground border border-primary/20 rounded hover:border-primary/40 transition-colors">
                        Monitor Only
                      </button>
                      <button 
                        onClick={() => onVeto?.(incident.id)}
                        className="flex-1 py-1.5 text-xs text-muted-foreground border border-primary/20 rounded hover:border-primary/40 transition-colors"
                      >
                        Mark False Alarm
                      </button>
                    </div>
                  </div>
                )}

                {/* Red state: Show incident details */}
                {operationalState === 'red' && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>Drones deployed: {incident.assignedDrones?.length || 0}</p>
                    <button className="text-primary hover:underline flex items-center gap-1 mt-1">
                      View Details <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Active Drones Section
interface ActiveDronesSectionProps {
  drones: Drone[];
}

function ActiveDronesSection({ drones }: ActiveDronesSectionProps) {
  const activeDrones = drones.filter(d => d.status === 'on_mission' || d.status === 'en_route');

  return (
    <div className="panel-section">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">ACTIVE DRONES</span>
        </div>
        <span className="px-2 py-0.5 rounded text-xs font-mono bg-secondary text-muted-foreground">
          {activeDrones.length}
        </span>
      </div>

      {activeDrones.length === 0 ? (
        <p className="text-sm text-muted-foreground">No drones currently active</p>
      ) : (
        <div className="space-y-2">
          {activeDrones.map((drone) => (
            <div key={drone.id} className="p-2 rounded-lg bg-secondary/50 border border-primary/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-mono font-medium">{drone.id}</span>
                <span className={cn(
                  "text-xs font-mono",
                  drone.battery && drone.battery < 30 ? "text-status-critical" : "text-status-normal"
                )}>
                  {drone.battery}% ({Math.round((drone.battery || 0) * 0.22)}min)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Task: {drone.task || "Standby"}
              </p>
              <div className="flex gap-2">
                <button className="flex-1 py-1 text-xs bg-accent/10 text-accent border border-accent/30 rounded hover:bg-accent/20 flex items-center justify-center gap-1 transition-colors">
                  <Eye className="w-3 h-3" /> View Feed
                </button>
                <button className="flex-1 py-1 text-xs bg-secondary border border-primary/20 rounded hover:border-primary/40 flex items-center justify-center gap-1 transition-colors">
                  <Gamepad2 className="w-3 h-3" /> Control
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="w-full mt-2 py-2 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors">
        + Deploy Additional Drone
      </button>
    </div>
  );
}

// AI Insights Section
interface AIInsightsSectionProps {
  drones: Drone[];
}

function AIInsightsSection({ drones }: AIInsightsSectionProps) {
  const lowBatteryDrones = drones.filter(d => d.battery && d.battery < 30);
  
  return (
    <div className="panel-section">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-4 h-4 text-accent" />
        <span className="text-sm font-medium">AI INSIGHTS</span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-status-normal">✓</span>
          <span className="text-muted-foreground">All zones covered</span>
        </div>
        {lowBatteryDrones.map(drone => (
          <div key={drone.id} className="flex items-start gap-2">
            <span className="text-status-attention">⚠</span>
            <span className="text-muted-foreground">
              {drone.id} battery → {drone.battery}% (RTH soon)
            </span>
          </div>
        ))}
        <div className="flex items-start gap-2">
          <span className="text-accent">ℹ</span>
          <span className="text-muted-foreground">Wind increased to 22mph (monitor)</span>
        </div>
      </div>
    </div>
  );
}

// Ground Communications Section
function GroundCommsSection() {
  return (
    <div className="panel-section flex-1">
      <div className="flex items-center gap-2 mb-3">
        <Radio className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">GROUND COMMUNICATIONS</span>
      </div>
      
      <div className="flex items-center gap-2 mb-3 p-2 bg-status-normal/10 border border-status-normal/30 rounded-lg">
        <div className="w-2 h-2 rounded-full bg-status-normal" />
        <span className="text-sm">🚒 Fire Department</span>
        <span className="text-xs text-muted-foreground ml-auto">[CONNECTED]</span>
      </div>

      <p className="text-xs text-muted-foreground mb-2">Quick Actions:</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button className="py-2 px-3 text-xs bg-secondary border border-primary/20 rounded hover:border-primary/40 transition-colors">
          Send Thermal Map
        </button>
        <button className="py-2 px-3 text-xs bg-secondary border border-primary/20 rounded hover:border-primary/40 transition-colors">
          Share Safe Route
        </button>
        <button className="py-2 px-3 text-xs bg-secondary border border-primary/20 rounded hover:border-primary/40 transition-colors">
          Update Evac Status
        </button>
        <button className="py-2 px-3 text-xs bg-secondary border border-primary/20 rounded hover:border-primary/40 transition-colors">
          Request Units
        </button>
      </div>

      <div className="flex gap-2">
        <input 
          type="text"
          placeholder="Custom message..."
          className="flex-1 px-3 py-2 text-sm bg-secondary border border-primary/20 rounded-lg focus:outline-none focus:border-primary/50"
        />
        <button className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Timeline Section
interface TimelineSectionProps {
  events: TimelineEvent[];
}

function TimelineSection({ events }: TimelineSectionProps) {
  const formatEventTime = (event: TimelineEvent): string => {
    if (event.time) return event.time;
    return event.timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: false 
    });
  };

  const getEventDescription = (event: TimelineEvent): string => {
    return event.description || event.message;
  };

  return (
    <div className="panel-section max-h-48 overflow-y-auto">
      <div className="flex items-center gap-2 mb-3 sticky top-0 bg-card pb-2">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">TIMELINE</span>
      </div>
      <div className="space-y-2">
        {events.slice(0, 10).map((event, index) => (
          <div key={event.id || index} className="flex gap-2 text-xs">
            <span className="text-muted-foreground font-mono shrink-0">{formatEventTime(event)}</span>
            <span className="text-foreground">{getEventDescription(event)}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <button className="text-xs text-primary hover:underline">[Export Log]</button>
        <button className="text-xs text-primary hover:underline">[Add Note]</button>
      </div>
    </div>
  );
}

// Recent Activity Section
interface RecentActivitySectionProps {
  events: TimelineEvent[];
}

function RecentActivitySection({ events }: RecentActivitySectionProps) {
  const formatEventTime = (event: TimelineEvent): string => {
    if (event.time) return event.time;
    return event.timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: false 
    });
  };

  const getEventDescription = (event: TimelineEvent): string => {
    return event.description || event.message;
  };

  return (
    <div className="panel-section flex-1">
      <p className="text-xs text-muted-foreground mb-2">Recent Activity (last 30 min):</p>
      <div className="space-y-1.5">
        {events.slice(0, 5).map((event, index) => (
          <div key={event.id || index} className="flex gap-2 text-xs">
            <span className="text-muted-foreground font-mono shrink-0">{formatEventTime(event)}</span>
            <span className="text-muted-foreground">{getEventDescription(event)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}