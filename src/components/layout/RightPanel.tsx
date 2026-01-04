import {
  AlertTriangle,
  Plane,
  Bot,
  Radio,
  Clock,
  Eye,
  Gamepad2,
  Send,
  ChevronRight,
  Flame,
  Wind,
  Home,
  MessageSquare,
  Activity,
  CheckCircle2,
  MapPin
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
 * Purpose: Decision making and real-time situational awareness
 * Design: State-driven content (Green -> Amber -> Red)
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
    <div className={cn("flex flex-col h-full bg-[#0A1628] select-none overflow-y-auto no-scrollbar", className)}>

      {/* STATE 2: INCIDENT DETECTED (Amber Alert) */}
      {operationalState === 'amber' && activeIncident && (
        <div className="flex flex-col gap-4 p-4 animate-in fade-in slide-in-from-right-4 duration-500">
          <AmberAlertCard
            incident={activeIncident}
            onApprove={onApprove}
            onVeto={onVeto}
          />
        </div>
      )}

      {/* STATE 3: ACTIVE RESPONSE (Red State) */}
      {operationalState === 'red' && activeIncident && (
        <div className="flex flex-col gap-4 p-4 animate-in fade-in slide-in-from-right-4 duration-500">
          <SituationStatusSection incident={activeIncident} />
          <DronesDeployedSection drones={activeDrones} />
          <GroundCommsSection />
          <TimelineSection events={timeline} />
          <AIAlertsSection />
          <IncidentResolutionActions onResolved={() => onVeto?.(activeIncident.id)} />
        </div>
      )}

      {/* STATE 1: NORMAL MONITORING (Green State) */}
      {operationalState === 'green' && (
        <div className="flex flex-col gap-4 p-4">
          <div className="panel-section border-status-normal/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-status-normal" />
                <span className="text-xs font-black tracking-widest uppercase text-white/80">INCIDENT QUEUE [0]</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic mb-2">No active incidents</p>
            <div className="h-px bg-white/5 my-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Recent Activity (30m):</p>
            <div className="space-y-2">
              {timeline.slice(0, 3).map((event, i) => (
                <div key={i} className="flex gap-2 text-[11px] font-medium text-muted-foreground">
                  <span className="font-mono opacity-60 shrink-0 uppercase">{event.time || "12:45"}</span>
                  <span className="truncate opacity-80 italic">• {event.message}</span>
                </div>
              ))}
            </div>
          </div>

          <ActiveDronesSection drones={activeDrones} label="IDLE STANDBY" />

          <div className="panel-section bg-status-ai/5 border-status-ai/20">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-status-ai" />
              <span className="text-[10px] font-black tracking-widest uppercase text-status-ai">AI INSIGHTS</span>
            </div>
            <div className="space-y-2">
              <InsightRow icon={<CheckCircle2 className="w-3 h-3 text-status-normal" />} text="All zones currently covered" />
              <InsightRow icon={<Wind className="w-3 h-3 text-status-attention" />} text="Wind increased to 22mph (monitor)" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function AmberAlertCard({ incident, onApprove, onVeto }: { incident: Incident, onApprove?: (id: string) => void, onVeto?: (id: string) => void }) {
  return (
    <div className="bg-[#1A2332] border-2 border-status-attention rounded-xl overflow-hidden shadow-2xl">
      <div className="bg-status-attention p-3 flex justify-between items-center bg-gradient-to-r from-status-attention to-orange-600">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-black" />
          <span className="font-black text-xs text-black uppercase tracking-tighter">NEW INCIDENT #{incident.id.split('-')[1] || '2847'}</span>
        </div>
        <span className="px-2 py-0.5 bg-black text-status-attention text-[10px] font-black rounded">AMBER ALERT</span>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none mb-2">THERMAL ANOMALY DETECTED</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">{incident.address || "Foothills Area, Zone C"}</span>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground/60 mt-1 uppercase">GPS: {incident.location.lat.toFixed(4)}°N, {incident.location.lng.toFixed(4)}°W</p>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-wider">Heat Signature</span>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-status-critical" />
              <span className="text-lg font-black text-white">287°C</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-wider">Growth Rate</span>
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-status-attention" />
              <span className="text-lg font-black text-white">12m/min</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-status-ai/5 border border-status-ai/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-status-ai" />
            <span className="text-[10px] font-black uppercase text-status-ai tracking-widest">AI AUTONOMOUS ACTION</span>
          </div>
          <ul className="space-y-1.5">
            <li className="flex items-center gap-2 text-[11px] font-bold text-white/90">
              <CheckCircle2 className="w-3 h-3 text-status-normal shrink-0" />
              <span>Validated fire signature (94% conf)</span>
            </li>
            <li className="flex items-center gap-2 text-[11px] font-bold text-white/90">
              <CheckCircle2 className="w-3 h-3 text-status-normal shrink-0" />
              <span>Drone D-247 dispatched from Dock 3</span>
            </li>
            <li className="flex items-center gap-2 text-[11px] font-bold text-white/90">
              <CheckCircle2 className="w-3 h-3 text-status-normal shrink-0" />
              <span>ETA: 27 seconds</span>
            </li>
          </ul>
        </div>

        <div className="space-y-2 pt-2">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">OPERATOR DECISION REQUIRED:</p>
          <button
            onClick={() => onApprove?.(incident.id)}
            className="w-full h-14 bg-status-normal hover:bg-green-600 text-white font-black text-lg uppercase tracking-tighter rounded-xl shadow-lg shadow-status-normal/20 transition-all active:scale-[0.98]"
          >
            APPROVE FULL RESPONSE
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="h-10 border border-white/10 text-white/60 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 rounded-lg">Monitor Only</button>
            <button
              onClick={() => onVeto?.(incident.id)}
              className="h-10 border border-white/10 text-white/60 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 rounded-lg"
            >
              False Alarm
            </button>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-[10px] font-bold text-white/40 italic">Why this decision? Heat + wind pattern matches 12 past confirmed wildfires in this area.</p>
        </div>
      </div>
    </div>
  );
}

function SituationStatusSection({ incident }: { incident: Incident }) {
  return (
    <div className="panel-section border-status-critical bg-status-critical/5">
      <div className="flex items-center justify-between mb-4 border-b border-status-critical/20 pb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-status-critical" />
          <span className="font-black text-lg text-white uppercase tracking-tighter">SITUATION STATUS</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-status-critical text-white text-[10px] font-black rounded-full animate-pulse uppercase">
          RED State
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-4">
        <StatusItem label="Fire Status" value="EXPANDING" valueClass="text-status-critical" />
        <StatusItem label="Current Size" value="~150m²" />
        <StatusItem label="Structures At Risk" value="47 Residential" valueClass="text-status-attention" />
        <StatusItem label="Wind Interaction" value="18mph NE" />
      </div>

      <div className="mt-4 p-3 bg-black/40 rounded-lg">
        <div className="flex justify-between text-[11px] font-black text-white mb-2 uppercase tracking-widest">
          <span>Evacuation Status</span>
          <span className="text-status-attention font-mono">28/47 OK</span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-status-attention w-[60%]" />
        </div>
      </div>
    </div>
  );
}

function DronesDeployedSection({ drones }: { drones: Drone[] }) {
  const deployed = drones.filter(d => d.status === 'on_mission' || d.status === 'en_route');

  return (
    <div className="panel-section">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-white/80">DRONES DEPLOYED [{deployed.length}]</span>
        </div>
      </div>
      <div className="space-y-3">
        {deployed.map(drone => (
          <div key={drone.id} className="p-3 bg-secondary/30 rounded-lg border border-white/5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-sm font-black text-white">{drone.id} - {drone.task || 'SURVEILLANCE'}</span>
                <p className="text-[10px] font-medium text-muted-foreground uppercase opacity-60">Alt: {drone.elevation || '120ft'} | Batt: {drone.battery}%</p>
              </div>
              <Activity className="w-4 h-4 text-status-normal" />
            </div>
            <div className="flex gap-2 mt-2">
              <button className="flex-1 h-9 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all">VIEW FEED</button>
              <button className="flex-1 h-9 bg-white/5 text-white/60 border border-white/10 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">REASSIGN</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroundCommsSection() {
  return (
    <div className="panel-section">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-primary" />
        <span className="text-xs font-black uppercase tracking-widest text-white/80">GROUND COMMUNICATIONS</span>
      </div>

      <div className="p-3 bg-status-normal/5 border border-status-normal/20 rounded-lg mb-4 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-status-normal pulse-green" />
        <span className="text-xs font-black text-white uppercase tracking-tighter">FIRE DEPT [CONNECTED]</span>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto opacity-50">30s ago</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button className="h-9 border border-white/10 text-[10px] font-black uppercase tracking-tighter hover:bg-white/5 rounded-md">SEND THERMAL MAP</button>
        <button className="h-9 border border-white/10 text-[10px] font-black uppercase tracking-tighter hover:bg-white/5 rounded-md">SHARE SAFE ROUTE</button>
        <button className="h-9 border border-white/10 text-[10px] font-black uppercase tracking-tighter hover:bg-white/5 rounded-md">EVAC STATUS UPDATE</button>
        <button className="h-9 border border-white/10 text-[10px] font-black uppercase tracking-tighter hover:bg-white/5 rounded-md">REQUEST UNITS</button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="DIRECT MESSAGE..."
          className="flex-1 h-10 bg-black/40 border border-white/10 rounded-lg px-3 text-xs font-bold focus:border-primary/50 outline-none"
        />
        <button className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg shadow-lg shadow-primary/20">
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

function TimelineSection({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="panel-section">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-black uppercase tracking-widest text-white/80">INCIDENT TIMELINE</span>
      </div>
      <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar">
        {events.map((event, i) => (
          <div key={i} className="flex gap-3 text-[11px] group">
            <span className="font-mono text-muted-foreground/40 shrink-0 font-bold">{event.time || "03:47"}</span>
            <span className="text-white/60 group-hover:text-white transition-colors">{event.message || event.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIAlertsSection() {
  return (
    <div className="panel-section bg-status-attention/10 border-status-attention/30">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-4 h-4 text-status-attention" />
        <span className="text-[10px] font-black uppercase text-status-attention tracking-widest">AI CO-PILOT ASSISTANCE</span>
      </div>
      <div className="space-y-3">
        <div className="text-[11px] font-bold text-white/90 leading-relaxed italic border-l-2 border-status-attention pl-3">
          "Wind shifted SW - updating fire spread prediction. Suggest deploying D-412 as backup?"
        </div>
        <div className="flex gap-2">
          <button className="flex-1 h-8 bg-status-attention text-black font-black text-[10px] uppercase rounded hover:bg-status-attention/90">DEPLOY BACKUP</button>
          <button className="flex-1 h-8 border border-status-attention/30 text-status-attention font-black text-[10px] uppercase rounded hover:bg-status-attention/5">MONITOR</button>
        </div>
      </div>
    </div>
  );
}

function IncidentResolutionActions({ onResolved }: { onResolved: () => void }) {
  return (
    <div className="flex flex-col gap-2 mt-2 pb-4">
      <button
        onClick={onResolved}
        className="w-full h-12 border-2 border-status-normal text-status-normal font-black uppercase text-xs tracking-widest rounded-lg hover:bg-status-normal/10 transition-all"
      >
        MARK INCIDENT RESOLVED
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button className="h-10 border border-white/10 text-white/40 font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-white/5 transition-all">ESCALATE TO SUPERVISOR</button>
        <button className="h-10 border border-white/10 text-white/40 font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-white/5 transition-all">HAND OFF SHIFT</button>
      </div>
    </div>
  );
}

function StatusItem({ label, value, valueClass }: { label: string, value: string, valueClass?: string }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40 tracking-widest block">{label}</span>
      <span className={cn("text-sm font-black text-white uppercase tracking-tighter", valueClass)}>{value}</span>
    </div>
  );
}

function InsightRow({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-bold text-white/70">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function ActiveDronesSection({ drones, label }: { drones: Drone[], label: string }) {
  const activeDrones = drones.map(d => d);

  return (
    <div className="panel-section">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/70">ACTIVE DRONES [{activeDrones.length}]</span>
        </div>
      </div>
      <div className="space-y-2">
        {activeDrones.slice(0, 2).map((drone) => (
          <div key={drone.id} className="p-3 bg-secondary/20 rounded-lg border border-white/5 flex justify-between items-center group hover:border-primary/20 transition-all">
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-white uppercase">{drone.id} - {drone.task || label}</span>
              <span className="text-[10px] font-medium text-muted-foreground opacity-60">Battery: {drone.battery}%</span>
            </div>
            <Eye className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors cursor-pointer" />
          </div>
        ))}
      </div>
    </div>
  );
}