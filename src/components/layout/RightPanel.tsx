import {
  AlertTriangle,
  PLANE as Plane,
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
  MapPin,
  ShieldCheck,
  Zap,
  FileText,
  UserCheck,
  Package,
  Headphones,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Incident, Drone, TimelineEvent, OperationalState } from "@/types/command-center";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
 * Co-Pilot Action Zone V2
 * 
 * Round 2 HUD Enhancements:
 * - AI Rationale Tooltips ("Why 92%?")
 * - Multi-Incident Priority Stack (Simulated)
 * - Ground Crew Sync with Packet Delivery status
 * - Thermal Feed Splice with HD context
 * - Motivational "Success" overlay state
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
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-[#03060B] select-none overflow-y-auto no-scrollbar border-l border-white/5", className)}>

        {/* HUD HEADER V2 */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-3 h-3 text-accent animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">COMMAND_VOICE_LINK</span>
          </div>
          <span className="text-[10px] font-mono text-accent">VUI_ACTIVE</span>
        </div>

        <div className="flex-1">
          {/* STATE 2: AMBER - VALIDATION GATE */}
          {operationalState === 'amber' && activeIncident && (
            <div className="p-5 space-y-4 animate-in slide-in-from-right duration-500">
              <AmberDecisionCard incident={activeIncident} onApprove={onApprove} onVeto={onVeto} />

              {/* Secondary Risks (Priority Stack) */}
              <div className="panel-section opacity-40 border-dashed">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-2">QUEUED_ANOMALIES (0)</span>
                <p className="text-[9px] font-medium text-white/20 italic">No secondary signatures detected. All eyes on sector C.</p>
              </div>
            </div>
          )}

          {/* STATE 3: RED - TACTICAL COORDINATION */}
          {operationalState === 'red' && activeIncident && (
            <div className="p-5 space-y-5 animate-in slide-in-from-right duration-500">
              <ThermalSpliceGrid drones={activeDrones} />
              <IncidentSitrep incident={activeIncident} />
              <GroundAssetCoordination />
              <EvacuationStatus acknowledged={28} total={47} />

              {/* Motivational Nudge */}
              <div className="p-4 bg-status-normal/5 border border-status-normal/20 rounded-2xl flex items-center gap-4">
                <Bot className="w-5 h-5 text-status-normal animate-ai-glow" />
                <p className="text-[11px] font-bold text-white/80 leading-snug">"Excellent coordination, operator. Ground units have received the tactical packets. Swarm is in optimal position."</p>
              </div>
            </div>
          )}

          {/* STATE 1: GREEN - CALM PATROL */}
          {operationalState === 'green' && (
            <div className="p-5 space-y-5">
              <div className="panel-section border-accent/20 bg-accent/5">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-accent animate-ai-glow" />
                  <span className="text-xs font-black uppercase text-white tracking-widest">SYSTEM_CALM</span>
                </div>
                <p className="text-[11px] font-medium text-white/50 leading-relaxed italic">"Silence is safety. 8 drones on autonomous patrol. Grid scan B-24 covering Sector Bravo. No anomalies detected in the last 122 minutes."</p>
              </div>

              <AICoPilotInsigths />

              <div className="panel-section">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/30">OPERATIONAL_TIMELINE</span>
                  <Clock className="w-3 h-3 text-white/20" />
                </div>
                <div className="space-y-3">
                  {timeline.slice(0, 5).map((e, i) => (
                    <div key={i} className="flex gap-3 text-[10px] items-start">
                      <span className="font-mono text-accent/60 shrink-0">{e.time}</span>
                      <span className="text-white/60 leading-tight">{e.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PERSISTENT ACTIONS (Red/Amber) */}
        {(operationalState !== 'green') && (
          <div className="p-5 bg-background border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">MISSION_RESOLVE</span>
              <span className="text-[8px] font-mono text-accent">S_0842</span>
            </div>
            <button
              onClick={() => onVeto?.(activeIncident?.id || '')}
              className="w-full h-14 bg-status-normal/10 border-2 border-status-normal text-status-normal font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl hover:bg-status-normal hover:text-white transition-all shadow-xl shadow-status-normal/10 active:animate-ripple"
            >
              RESOLVE_INCIDENT
            </button>
            <div className="grid grid-cols-2 gap-2">
              <SmallHudBtn icon={<FileText className="w-3.5 h-3.5" />} label="EXPORT_LOG" />
              <SmallHudBtn icon={<Package className="w-3.5 h-3.5" />} label="SYNC_MEDIA" />
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

// --- SUBCOMPONENTS ---

function AmberDecisionCard({ incident, onApprove, onVeto }: { incident: Incident, onApprove?: (id: string) => void, onVeto?: (id: string) => void }) {
  return (
    <div className="bg-[#1A2332] border-2 border-primary rounded-3xl overflow-hidden shadow-2xl animate-hud-pulse">
      <div className="bg-primary p-4 flex justify-between items-center group cursor-help">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-black animate-ai-glow" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-black/60 uppercase tracking-widest">VAL_CONFIDENCE</span>
            <span className="text-lg font-black text-black leading-none">92.4% PROBABILITY</span>
          </div>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center hover:bg-black/10 transition-all">
              <Info className="w-5 h-5 text-black" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-black border-accent/40 text-white p-4 max-w-[240px]">
            <p className="text-[10px] uppercase font-black text-accent mb-2">AI_RATIONALE</p>
            <p className="text-xs font-bold leading-relaxed">"Detected 287°C heat bloom matches past wildfire visual signatures. High wind (18mph) increases threat to 47 residential structures situated only 50m from detection point."</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2">THERMAL_ANOMALY</h3>
          <p className="text-xs font-bold text-white/50">{incident.address}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="hud-metric-card">
            <span className="text-[8px] font-black text-white/20 uppercase block mb-1">SIGNATURE</span>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-status-critical" />
              <span className="text-xl font-mono font-black text-white italic">287°C</span>
            </div>
          </div>
          <div className="hud-metric-card">
            <span className="text-[8px] font-black text-white/20 uppercase block mb-1">THREAT_LVL</span>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary" />
              <span className="text-xl font-mono font-black text-white italic italic">HIGH</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onApprove?.(incident.id)}
            className="w-full h-16 bg-status-normal text-white font-black text-xl uppercase tracking-tighter rounded-2xl shadow-2xl shadow-status-normal/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            APPROVE_RESPONSE
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button className="h-12 border border-white/10 text-white/40 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-status-critical hover:text-white transition-all active:animate-haptic-shake" onClick={() => onVeto?.(incident.id)}>VETO_DISMISS</button>
            <button className="h-12 border border-white/10 text-white/40 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/5 transition-all">SENS_ONLY</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThermalSpliceGrid({ drones }: { drones: Drone[] }) {
  return (
    <div className="panel-section border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-status-critical">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">RECON_MATRIX_LIVE</span>
        </div>
        <div className="px-2 py-0.5 bg-status-critical/10 text-status-critical text-[8px] font-black rounded border border-status-critical/20">HD_SPLICED</div>
      </div>

      <div className="grid grid-cols-2 gap-2 h-44">
        <div className="bg-black/60 rounded-xl border border-status-critical/40 relative overflow-hidden group cursor-crosshair">
          <div className="absolute inset-0 bg-red-600/10 mix-blend-color" />
          <div className="absolute top-2 left-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-status-critical animate-pulse" />
            <span className="text-[9px] font-black text-white tracking-widest">D-247 (MAIN)</span>
          </div>
          <div className="absolute bottom-2 right-2 text-[8px] font-mono text-white/40">34.0522°N | 118.2437°W</div>
        </div>
        <div className="bg-black/60 rounded-xl border border-white/5 relative opacity-60">
          <div className="absolute top-2 left-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="text-[9px] font-black text-white/40 tracking-widest">D-309 (SUPP)</span>
          </div>
          <div className="flex items-center justify-center h-full">
            <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">SYNCING_LINK...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function IncidentSitrep({ incident }: { incident: Incident }) {
  return (
    <div className="panel-section bg-status-critical/5 border-status-critical/20 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Flame className="w-6 h-6 text-status-critical animate-ai-glow" />
        <span className="text-xl font-black text-white uppercase tracking-tighter">SITUATION_REPORT</span>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <SitrepDetail label="SIT_FIRE" value="EXPANDING" color="text-status-critical" />
        <SitrepDetail label="RISK_IDX" value="0.94_SEV" color="text-primary" />
        <SitrepDetail label="MET_WIND" value="18MPH_NE" />
        <SitrepDetail label="POP_AT_RISK" value="47_HOMES" color="text-primary" />
      </div>
    </div>
  );
}

function GroundAssetCoordination() {
  return (
    <div className="panel-section">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span className="text-xs font-black uppercase text-white/80 tracking-widest">CREW_SYNC</span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Plane className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-black text-white uppercase block mb-0.5">ENGINE_0406</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-status-normal pulse-green" />
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">PACKET_DELIVERED_GPS_HOTSPOTS</span>
            </div>
          </div>
          <button className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center hover:bg-accent hover:text-black transition-all">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="TYPE_COMMAND_FOR_VOICE_RELAY..."
            className="flex-1 h-12 bg-black border border-white/10 rounded-2xl px-5 text-xs font-black text-white tracking-widest focus:border-accent/40 outline-none"
          />
          <button className="w-12 h-12 bg-accent flex items-center justify-center rounded-2xl shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all">
            <Crosshair className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}

function EvacuationStatus({ acknowledged, total }: { acknowledged: number, total: number }) {
  const percent = Math.round((acknowledged / total) * 100);
  return (
    <div className="panel-section bg-primary/5 border-primary/20">
      <div className="flex items-center justify-between mb-3 text-primary">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">EVAC_ALERTS: {percent}%_READY</span>
        </div>
        <span className="text-[10px] font-mono font-black">{acknowledged}/{total}</span>
      </div>
      <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
        <div className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(255,133,27,0.5)]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function AICoPilotInsigths() {
  return (
    <div className="panel-section bg-status-ai/5 border-status-ai/20">
      <div className="flex items-center gap-2 mb-4 text-status-ai">
        <Bot className="w-5 h-5 animate-ai-glow" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI_CO_PILOT_INTEL</span>
      </div>
      <div className="space-y-3">
        <InsightItem icon={<Wind className="w-3.5 h-3.5 text-accent" />} text="Wind shift imminent - Swarm auto-adjusting to SE." />
        <InsightItem icon={<Bot className="w-3.5 h-3.5 text-accent" />} text="D-118 patrol path optimized for maximum overlap." />
        <InsightItem icon={<ShieldCheck className="w-3.5 h-3.5 text-status-normal" />} status="READY" text="Evacuation routing successful via Drone Speaker Link." />
      </div>
    </div>
  );
}

function InsightItem({ icon, text, status }: { icon: React.ReactNode, text: string, status?: string }) {
  return (
    <div className="flex gap-4 group">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-[11px] font-bold text-white/70 italic leading-snug group-hover:text-white transition-colors">{text}</p>
        {status && <span className="text-[7px] font-black text-status-normal border border-status-normal/30 px-1 rounded-sm mt-1 inline-block uppercase">{status}</span>}
      </div>
    </div>
  );
}

function SitrepDetail({ label, value, color = "text-white" }: { label: string, value: string, color?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{label}</span>
      <span className={cn("text-base font-black uppercase tabular-nums", color)}>{value}</span>
    </div>
  );
}

function SmallHudBtn({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="h-12 border border-white/10 bg-white/[0.01] rounded-2xl flex items-center justify-center gap-2 text-[9px] font-black tracking-widest text-white/40 uppercase hover:text-white hover:border-accent/40 transition-all active:scale-95">
      {icon}
      {label}
    </button>
  );
}