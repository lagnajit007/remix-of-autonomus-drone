import { useState, useCallback } from "react";
import {
  ChevronDown,
  MapPin,
  Plane,
  Radio,
  Calendar,
  Activity,
  AlertTriangle,
  StopCircle,
  Home,
  Pause,
  Settings,
  Focus,
  Battery
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Drone } from "@/types/command-center";

interface Zone {
  id: string;
  name: string;
  drones: number;
  sensors: number;
  status: "normal" | "attention" | "critical";
  hasIncident?: boolean;
  center?: [number, number];
}

interface LeftSidebarProps {
  zones: Zone[];
  drones: Drone[];
  sensorsOnline: number;
  sensorsWeak: number;
  sensorsOffline: number;
  systemStatus: "normal" | "degraded" | "critical";
  networkLatency: number;
  weather: string;
  lastUpdate: string;
  selectedDroneId?: string | null;
  onZoneClick?: (zoneId: string, center?: [number, number]) => void;
  onDroneSelect?: (droneId: string) => void;
  className?: string;
}

/**
 * Left Sidebar (280px Fixed Width)
 * 
 * Purpose: Static context and quick navigation
 * Design: High-density, glanceable, WCAG AAA accessibility
 */
export function LeftSidebar({
  zones,
  drones,
  sensorsOnline,
  sensorsWeak,
  sensorsOffline,
  systemStatus,
  networkLatency,
  weather,
  lastUpdate,
  selectedDroneId,
  onZoneClick,
  onDroneSelect,
  className,
}: LeftSidebarProps) {
  const [zonesExpanded, setZonesExpanded] = useState(true);
  const [sensorsExpanded, setSensorsExpanded] = useState(false);
  const [missionsExpanded, setMissionsExpanded] = useState(false);

  const statusColors = {
    normal: "text-status-normal",
    attention: "text-status-attention",
    critical: "text-status-critical",
  };

  const sortedDrones = [...drones].sort((a, b) => {
    const statusOrder = { on_mission: 0, en_route: 1, returning: 2, patrolling: 2.5, docked: 3, offline: 4 };
    const aOrder = statusOrder[a.status] ?? 5;
    const bOrder = statusOrder[b.status] ?? 5;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (b.battery ?? 0) - (a.battery ?? 0);
  });

  return (
    <div className={cn("flex flex-col h-full bg-background select-none", className)}>
      {/* SECTION 1: ZONE OVERVIEW (Collapsible) */}
      <CollapsibleSection
        title="ZONES"
        subtitle="Monitoring"
        icon={<MapPin className="w-4 h-4" />}
        expanded={zonesExpanded}
        onToggle={() => setZonesExpanded(!zonesExpanded)}
      >
        <div className="space-y-1">
          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => onZoneClick?.(zone.id, zone.center)}
              className={cn(
                "w-full px-3 py-2.5 rounded-lg text-left transition-all border border-transparent",
                "bg-[#1A2332]/40 hover:bg-[#1A2332] hover:border-primary/20",
                zone.hasIncident && "border-status-attention/50 bg-status-attention/5"
              )}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-bold text-white pr-2 truncate">{zone.name}</span>
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  zone.status === 'normal' ? "bg-status-normal" :
                    zone.status === 'attention' ? "bg-status-attention" : "bg-status-critical"
                )} />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span>● {zone.drones} DRONES</span>
                <span>| {zone.sensors} SENSORS</span>
              </div>
              {zone.hasIncident && (
                <div className="flex items-center gap-1 mt-1 text-[10px] font-black text-status-attention animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  <span>INCIDENT ACTIVE</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* SECTION 2: FLEET STATUS (Always Visible) */}
      <div className="p-4 border-b border-white/5 bg-[#1A2332]/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-white/70">DRONES</span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
            {drones.length} TOTAL
          </span>
        </div>
        <div className="space-y-0.5 mb-4">
          {sortedDrones.map((drone) => (
            <DroneStatusRow
              key={drone.id}
              drone={drone}
              isSelected={selectedDroneId === drone.id}
              onClick={() => onDroneSelect?.(drone.id)}
            />
          ))}
        </div>
        <button className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 rounded-md hover:bg-primary/10 hover:border-primary/40 transition-all active:scale-[0.98]">
          + Deploy Available Drone
        </button>
      </div>

      {/* SECTION 3: SENSOR HEALTH (Collapsible) */}
      <CollapsibleSection
        title="SENSORS"
        subtitle={`${sensorsOnline + sensorsWeak + sensorsOffline} Active`}
        icon={<Radio className="w-4 h-4" />}
        expanded={sensorsExpanded}
        onToggle={() => setSensorsExpanded(!sensorsExpanded)}
      >
        <div className="space-y-2 p-1">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-status-normal" />
              <span className="text-white/80">Operational</span>
            </div>
            <span className="text-muted-foreground">{sensorsOnline}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-status-attention" />
              <span className="text-white/80">Weak Signal</span>
            </div>
            <span className="text-muted-foreground">{sensorsWeak}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              <span className="text-white/80">Offline</span>
            </div>
            <span className="text-muted-foreground">{sensorsOffline}</span>
          </div>
        </div>
      </CollapsibleSection>

      {/* SECTION 4: MISSIONS SCHEDULER (Collapsible) */}
      <CollapsibleSection
        title="MISSIONS"
        icon={<Calendar className="w-4 h-4" />}
        expanded={missionsExpanded}
        onToggle={() => setMissionsExpanded(!missionsExpanded)}
      >
        <div className="space-y-2 p-1">
          <div className="bg-[#1A2332] p-3 rounded-lg border border-white/5">
            <p className="text-[11px] font-bold text-white mb-1">Perimeter Patrol</p>
            <p className="text-[10px] font-medium text-muted-foreground italic mb-3">Next launch: 18:00 (5h 47m)</p>
            <div className="flex gap-2">
              <button className="text-[10px] font-black text-primary hover:text-primary/80">EDIT</button>
              <button className="text-[10px] font-black text-muted-foreground hover:text-white">CANCEL</button>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* SECTION 5: SYSTEM HEALTH (Always Visible) */}
      <div className="p-4 border-t border-white/5 mt-auto bg-[#1A2332]/10">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-white/70">SYSTEM HEALTH</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <div className={cn("w-1.5 h-1.5 rounded-full", systemStatus === 'normal' ? "bg-status-normal" : "bg-status-critical")} />
            <span className="text-white/90">{systemStatus === 'normal' ? "All Systems Normal" : "System Alert"}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Network</span>
              <span className="text-[10px] font-mono font-bold text-white/80">{networkLatency}ms</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Weather</span>
              <span className="text-[10px] font-mono font-bold text-white/80">{weather}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: QUICK ACTIONS (Always Visible) - Panic Buttons */}
      <div className="p-4 flex flex-col gap-2 bg-background border-t border-white/10 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <button
          className={cn(
            "w-full h-12 flex items-center justify-center gap-2 rounded-lg",
            "bg-status-critical text-white font-black uppercase tracking-widest text-xs",
            "hover:bg-status-critical/90 active:scale-[0.98] transition-all duration-200",
            "shadow-lg shadow-status-critical/20 group"
          )}
        >
          <StopCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
          EMERGENCY STOP ALL
        </button>
        <div className="grid grid-cols-2 gap-2">
          <QuickActionButton icon={<Home className="w-3.5 h-3.5" />} label="RTH ALL" />
          <QuickActionButton icon={<Pause className="w-3.5 h-3.5" />} label="PAUSE" />
          <QuickActionButton icon={<Settings className="w-3.5 h-3.5" />} label="OVERRIDE" className="col-span-2" />
        </div>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  subtitle,
  icon,
  expanded,
  onToggle,
  children
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 group hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-primary group-hover:scale-110 transition-transform">{icon}</span>
          <span className="text-xs font-black tracking-widest text-white/70 uppercase">{title}</span>
          {subtitle && (
            <span className="text-[10px] font-bold text-muted-foreground/50 lowercase italic ml-1">{subtitle}</span>
          )}
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground/30 transition-transform duration-300",
          expanded && "rotate-180"
        )} />
      </button>
      <div className={cn(
        "grid transition-all duration-300 ease-in-out",
        expanded ? "grid-rows-[1fr] opacity-100 px-4 pb-4" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

function DroneStatusRow({ drone, isSelected, onClick }: { drone: Drone; isSelected?: boolean; onClick?: () => void }) {
  const statusConfig = {
    on_mission: { color: "bg-status-normal", glow: "shadow-status-normal/40" },
    en_route: { color: "bg-status-attention", glow: "shadow-status-attention/40" },
    returning: { color: "bg-status-attention", glow: "shadow-status-attention/40" },
    patrolling: { color: "bg-accent", glow: "shadow-accent/40" },
    docked: { color: "bg-muted-foreground", glow: "" },
    offline: { color: "bg-muted", glow: "" },
  };

  const config = statusConfig[drone.status] || statusConfig.offline;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center h-10 px-2.5 rounded transition-all group",
        isSelected ? "bg-primary/20 border border-primary/40" : "hover:bg-white/5 border border-transparent"
      )}
    >
      <div className={cn(
        "w-2 h-2 rounded-full shrink-0 mr-3 shadow-sm transition-transform group-hover:scale-125",
        config.color,
        isSelected && config.glow
      )} />

      <span className={cn(
        "text-[11px] font-black w-12 text-left",
        isSelected ? "text-primary shadow-primary/20" : "text-white/80"
      )}>
        {drone.id}
      </span>

      <div className="flex items-center gap-1.5 ml-1 mr-auto shrink-0">
        <Battery className={cn(
          "w-3 h-3 opacity-60",
          drone.battery && drone.battery < 30 ? "text-status-critical" : "text-muted-foreground"
        )} />
        <span className={cn(
          "text-[10px] font-mono font-bold",
          drone.battery && drone.battery < 30 ? "text-status-critical" : "text-muted-foreground"
        )}>
          {drone.battery ?? "--"}%
        </span>
      </div>

      <span className={cn(
        "text-[10px] uppercase font-black truncate max-w-[80px] text-right ml-2 opacity-60 tracking-tighter",
        isSelected ? "text-primary opacity-100" : "text-white/90"
      )}>
        {drone.task || drone.status.replace('_', ' ')}
      </span>
    </button>
  );
}

function QuickActionButton({ icon, label, className }: { icon: React.ReactNode; label: string; className?: string }) {
  return (
    <button className={cn(
      "h-10 border border-white/5 rounded-lg flex items-center justify-center gap-2",
      "bg-[#1A2332]/40 hover:bg-[#1A2332] hover:border-primary/30",
      "text-[10px] font-black uppercase tracking-widest text-white/70 transition-all active:scale-[0.95]",
      className
    )}>
      {icon}
      {label}
    </button>
  );
}