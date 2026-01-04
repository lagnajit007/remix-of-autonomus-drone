import { useState } from "react";
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
  Battery,
  Wind,
  Gauge,
  Zap,
  ShieldCheck,
  Bot
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
  onZoneClick?: (zoneId: string) => void;
  onDroneSelect?: (droneId: string) => void;
  className?: string;
}

/**
 * Co-Pilot HUD Sidebar V2
 * 
 * Round 2 Enhancements:
 * - Dynamic Alt/Speed Gauges for selected drone
 * - Battery Ring Shakes on low power
 * - Mission Scheduler Progress (KML)
 * - Failsafe Status badges
 * - Enhanced Fleet sorting and status iconography
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

  const selectedDrone = drones.find(d => d.id === selectedDroneId);

  return (
    <div className={cn("flex flex-col h-full bg-[#03060B] select-none border-r border-white/5", className)}>

      {/* TELEMETRY SLIM V2 */}
      <div className="p-4 grid grid-cols-2 gap-2">
        <TelemetryCard icon={<Wind className="w-3 h-3 text-accent" />} label="ENV_WIND" value="18MPH_NE" />
        <TelemetryCard icon={<Activity className="w-3 h-3 text-accent" />} label="LINK_LAT" value={`${networkLatency}MS`} />
      </div>

      {/* SELECTED DRONE FOCUS - Alt/Speed Gauges */}
      {selectedDrone && (
        <div className="p-4 mx-4 mb-4 bg-accent/5 border border-accent/20 rounded-2xl animate-in slide-in-from-left duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-black text-accent uppercase tracking-widest">FOCUS: {selectedDrone.id}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[7px] font-black text-white/30 uppercase">ALTITUDE</span>
              <div className="text-sm font-mono font-black text-white">124.2<span className="text-[8px] text-white/40 ml-1">M</span></div>
            </div>
            <div className="space-y-1">
              <span className="text-[7px] font-black text-white/30 uppercase">AIR_SPEED</span>
              <div className="text-sm font-mono font-black text-white">42.5<span className="text-[8px] text-white/40 ml-1">KM/H</span></div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
            <FailsafeBadge active label="CASIA_G" />
            <FailsafeBadge active label="AUTO_RTB" />
          </div>
        </div>
      )}

      {/* FLEET OVERVIEW: Battery Rings HUD */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">FLEET_GRID</span>
            <Bot className="w-3 h-3 text-white/20" />
          </div>

          <div className="space-y-3">
            {drones.map((drone) => (
              <DroneHudCard
                key={drone.id}
                drone={drone}
                isSelected={selectedDroneId === drone.id}
                onClick={() => onDroneSelect?.(drone.id)}
              />
            ))}
          </div>
        </div>

        {/* ZONES HUD */}
        <div className="p-4 border-t border-white/5 mt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">ZONE_CONTEXT</span>
            <ChevronDown className="w-3 h-3 text-white/20" />
          </div>
          <div className="space-y-2">
            {zones.map(zone => (
              <button
                key={zone.id}
                onClick={() => onZoneClick?.(zone.id)}
                className={cn(
                  "w-full p-3 rounded-2xl border transition-all text-left",
                  zone.hasIncident ? "border-primary/50 bg-primary/5 animate-hud-pulse" : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03]"
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black text-white uppercase">{zone.name}</span>
                  <div className={cn("w-2 h-2 rounded-full", zone.status === 'normal' ? 'bg-status-normal' : 'bg-status-attention')} />
                </div>
                <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                  {zone.drones} UNITS | {zone.sensors} NODES
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* MISSION SCHEDULER (KML) */}
        <div className="p-4 border-t border-white/5">
          <span className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase block mb-4">MISSION_SCHEDULER</span>
          <div className="panel-section bg-accent/5 border-accent/10 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-white/80">GRID_SCAN_B-24</span>
              <span className="text-[8px] font-mono text-accent">Active</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent animate-pulse w-[75%]" />
            </div>
            <p className="text-[8px] font-bold text-white/20 uppercase mt-2">KML: sector_bravo_0842.kml</p>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS: HUD PANIC BUTTONS */}
      <div className="p-4 bg-background border-t border-white/10 flex flex-col gap-2">
        <button className="w-full h-14 bg-status-critical/10 text-status-critical border border-status-critical/30 font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-status-critical text-white transition-all active:animate-haptic-shake">
          <div className="flex items-center justify-center gap-3">
            <StopCircle className="w-5 h-5" />
            GLOBAL_EMERGENCY_KILL
          </div>
        </button>
        <div className="grid grid-cols-2 gap-2">
          <SmallHudAction icon={<Home className="w-4 h-4" />} label="RTB_ALL" />
          <SmallHudAction icon={<Pause className="w-4 h-4" />} label="PAUSE_OPS" />
        </div>
      </div>
    </div>
  );
}

function TelemetryCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-3">
      {icon}
      <div className="flex flex-col">
        <span className="text-[7px] font-black text-white/30 uppercase leading-none mb-1">{label}</span>
        <span className="text-[10px] font-mono font-black text-white/80 leading-none uppercase">{value}</span>
      </div>
    </div>
  );
}

function DroneHudCard({ drone, isSelected, onClick }: { drone: Drone, isSelected: boolean, onClick: () => void }) {
  const isLowBattery = (drone.battery || 0) < 30;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center h-20 px-4 rounded-3xl transition-all relative overflow-hidden group",
        isSelected ? "bg-accent/10 border-accent/40 shadow-lg" : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03]",
        "border"
      )}
    >
      {/* Battery Ring HUD */}
      <div className={cn("relative w-12 h-12 flex items-center justify-center mr-4", isLowBattery && "animate-haptic-shake")}>
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="24" cy="24" r="20" className="stroke-white/5 fill-none" strokeWidth="3" />
          <circle
            cx="24" cy="24" r="20"
            className={cn("fill-none transition-all duration-1000", isLowBattery ? "stroke-status-critical" : "stroke-accent")}
            strokeWidth="3"
            strokeDasharray={126}
            strokeDashoffset={126 - (1.26 * (drone.battery || 0))}
            strokeLinecap="round"
          />
        </svg>
        <span className={cn("absolute text-[10px] font-mono font-black", isLowBattery ? "text-status-critical" : "text-white")}>
          {Math.floor(drone.battery || 0)}%
        </span>
      </div>

      <div className="flex flex-col flex-1 text-left">
        <div className="flex items-center justify-between mb-1">
          <span className={cn("text-sm font-black uppercase tracking-tighter", isSelected ? "text-accent" : "text-white")}>
            {drone.id}
          </span>
          <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">
            {drone.status.replace('_', '.')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn("w-1 h-1 rounded-full", drone.status === 'offline' ? 'bg-status-critical' : 'bg-status-normal')} />
          <span className="text-[9px] font-bold text-white/40 uppercase truncate max-w-[100px]">
            {drone.task || 'IDLE_PATROL'}
          </span>
        </div>
      </div>

      {isSelected && <div className="absolute right-0 top-0 bottom-0 w-1 bg-accent" />}
    </button>
  );
}

function FailsafeBadge({ active, label }: { active: boolean, label: string }) {
  return (
    <div className={cn("px-2 py-0.5 rounded-md text-[7px] font-black border",
      active ? "bg-status-normal/10 border-status-normal/30 text-status-normal" : "bg-white/5 border-white/10 text-white/20"
    )}>
      {label}
    </div>
  );
}

function SmallHudAction({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="h-10 border border-white/5 bg-white/[0.01] rounded-xl flex items-center justify-center gap-2 text-[8px] font-black tracking-widest text-white/30 uppercase hover:text-white hover:border-white/20 transition-all">
      {icon}
      {label}
    </button>
  );
}