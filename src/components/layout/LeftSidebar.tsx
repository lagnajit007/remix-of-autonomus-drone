import { useState, useCallback } from "react";
import { 
  ChevronDown, 
  ChevronRight,
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
  Focus
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
 * Left Sidebar (280px Fixed Width) - Enhanced with interactions
 * 
 * Features:
 * - Smooth collapsible animations
 * - Zone click-to-zoom
 * - Drone selection with map highlighting
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

  const statusBg = {
    normal: "bg-status-normal",
    attention: "bg-status-attention", 
    critical: "bg-status-critical",
  };

  // Sort drones: Active → Low battery → Docked → Offline
  const sortedDrones = [...drones].sort((a, b) => {
    const statusOrder = { on_mission: 0, en_route: 1, returning: 2, patrolling: 2.5, docked: 3, offline: 4 };
    const aOrder = statusOrder[a.status] ?? 5;
    const bOrder = statusOrder[b.status] ?? 5;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (b.battery ?? 0) - (a.battery ?? 0);
  });

  const handleZoneClick = useCallback((zone: Zone) => {
    console.log(`[SIDEBAR] Zone clicked: ${zone.name}`);
    onZoneClick?.(zone.id, zone.center);
  }, [onZoneClick]);

  const handleDroneClick = useCallback((droneId: string) => {
    console.log(`[SIDEBAR] Drone selected: ${droneId}`);
    onDroneSelect?.(droneId);
  }, [onDroneSelect]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Section 1: Zone Overview */}
      <CollapsibleSection
        title="ZONES"
        subtitle="Monitoring"
        icon={<MapPin className="w-4 h-4" />}
        expanded={zonesExpanded}
        onToggle={() => setZonesExpanded(!zonesExpanded)}
      >
        <div className="space-y-2">
          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => handleZoneClick(zone)}
              className={cn(
                "w-full p-2 rounded-lg text-left transition-all duration-200",
                "bg-secondary/50 border border-primary/10",
                "hover:border-primary/40 hover:bg-secondary hover:scale-[1.02]",
                "active:scale-[0.98]",
                "group"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  {zone.name}
                </span>
                <div className="flex items-center gap-2">
                  <Focus className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className={cn("w-2 h-2 rounded-full", statusBg[zone.status])} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>● {zone.drones} Drones</span>
                <span>| {zone.sensors} Sensors</span>
              </div>
              {zone.hasIncident && (
                <div className="flex items-center gap-1 mt-1 text-xs text-status-attention animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  <span>1 Incident Active</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Section 2: Fleet Status (Always Visible) */}
      <div className="panel-section">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">DRONES</span>
          </div>
          <span className="text-xs text-muted-foreground">({drones.length} Total)</span>
        </div>
        <div className="space-y-1.5">
          {sortedDrones.map((drone) => (
            <DroneStatusRow 
              key={drone.id} 
              drone={drone} 
              isSelected={selectedDroneId === drone.id}
              onClick={() => handleDroneClick(drone.id)}
            />
          ))}
        </div>
        <button className="w-full mt-3 py-2 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 active:scale-[0.98]">
          + Deploy Available Drone
        </button>
      </div>

      {/* Section 3: Sensor Health */}
      <CollapsibleSection
        title="SENSORS"
        subtitle={`${sensorsOnline + sensorsWeak + sensorsOffline} Active`}
        icon={<Radio className="w-4 h-4" />}
        expanded={sensorsExpanded}
        onToggle={() => setSensorsExpanded(!sensorsExpanded)}
      >
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-status-normal">✓</span>
            <span>{sensorsOnline} Operational</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-status-attention">⚠</span>
            <span>{sensorsWeak} Weak Signal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">✗</span>
            <span>{sensorsOffline} Offline</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Last Check: {lastUpdate}
          </p>
        </div>
      </CollapsibleSection>

      {/* Section 4: Missions Scheduler */}
      <CollapsibleSection
        title="SCHEDULED MISSIONS"
        icon={<Calendar className="w-4 h-4" />}
        expanded={missionsExpanded}
        onToggle={() => setMissionsExpanded(!missionsExpanded)}
      >
        <div className="space-y-2 text-sm">
          <div className="p-2 bg-secondary/50 rounded-lg border border-primary/10">
            <p className="font-medium">Next: Perimeter Patrol</p>
            <p className="text-xs text-muted-foreground">Time: 18:00 (5h 47m)</p>
            <p className="text-xs text-muted-foreground">Drone: Auto-assign</p>
            <div className="flex gap-2 mt-2">
              <button className="text-xs text-primary hover:underline">[Edit]</button>
              <button className="text-xs text-muted-foreground hover:underline">[Cancel]</button>
            </div>
          </div>
          <button className="w-full py-2 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors">
            + Create New Mission
          </button>
        </div>
      </CollapsibleSection>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Section 5: System Health (Always Visible) */}
      <div className="panel-section">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">SYSTEM STATUS</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className={statusColors[systemStatus]}>
              {systemStatus === "normal" ? "✓" : "⚠"}
            </span>
            <span>
              {systemStatus === "normal" 
                ? "All Systems Normal" 
                : systemStatus === "degraded" 
                  ? "Degraded Performance"
                  : "Critical Issue"
              }
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Network: {networkLatency}ms latency
          </p>
          <p className="text-xs text-muted-foreground">
            Weather: {weather}
          </p>
          <p className="text-xs text-muted-foreground">
            Last Update: {lastUpdate}
          </p>
        </div>
      </div>

      {/* Section 6: Quick Actions (Always Visible) */}
      <div className="panel-section space-y-2">
        <button className="w-full py-2.5 text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] hover:shadow-lg hover:shadow-destructive/20">
          <StopCircle className="w-4 h-4" />
          Emergency Stop All
        </button>
        <button className="w-full py-2 text-sm text-foreground bg-secondary border border-primary/20 hover:border-primary/40 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]">
          <Home className="w-4 h-4" />
          Return All to Dock
        </button>
        <button className="w-full py-2 text-sm text-foreground bg-secondary border border-primary/20 hover:border-primary/40 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]">
          <Pause className="w-4 h-4" />
          Pause Operations
        </button>
        <button className="w-full py-2 text-sm text-foreground bg-secondary border border-primary/20 hover:border-primary/40 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]">
          <Settings className="w-4 h-4" />
          Manual Override
        </button>
      </div>
    </div>
  );
}

// Collapsible Section Component with smooth animation
interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ 
  title, 
  subtitle, 
  icon, 
  expanded, 
  onToggle, 
  children 
}: CollapsibleSectionProps) {
  return (
    <div className="panel-section overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-2 group"
      >
        <div className="flex items-center gap-2">
          <span className="text-primary transition-transform duration-200 group-hover:scale-110">
            {icon}
          </span>
          <span className="text-sm font-medium">{title}</span>
          {subtitle && (
            <span className="text-xs text-muted-foreground">({subtitle})</span>
          )}
        </div>
        <div className={cn(
          "transition-transform duration-200",
          expanded && "rotate-180"
        )}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>
      
      {/* Animated content container */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

// Drone Status Row Component with selection state
interface DroneStatusRowProps {
  drone: Drone;
  isSelected?: boolean;
  onClick?: () => void;
}

function DroneStatusRow({ drone, isSelected, onClick }: DroneStatusRowProps) {
  const statusConfig = {
    on_mission: { dot: "bg-status-normal", label: "Active" },
    en_route: { dot: "bg-status-attention", label: "En Route" },
    returning: { dot: "bg-status-attention", label: "RTH" },
    patrolling: { dot: "bg-accent", label: "Patrol" },
    docked: { dot: "bg-muted-foreground", label: "Docked" },
    offline: { dot: "bg-muted", label: "Offline" },
  };

  const config = statusConfig[drone.status] || statusConfig.offline;
  const batteryColor = 
    drone.battery === undefined ? "text-muted-foreground" :
    drone.battery < 30 ? "text-status-critical" : 
    drone.battery < 50 ? "text-status-attention" : 
    "text-status-normal";

  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between py-1.5 px-2 rounded transition-all duration-200 text-left",
        "hover:bg-secondary/70",
        "active:scale-[0.98]",
        isSelected && "bg-primary/20 border border-primary/50 shadow-sm shadow-primary/10"
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full transition-all duration-200",
          config.dot,
          isSelected && "scale-125 ring-2 ring-primary/30"
        )} />
        <span className={cn(
          "text-sm font-mono transition-colors",
          isSelected && "text-primary font-semibold"
        )}>
          {drone.id}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className={cn("font-mono", batteryColor)}>
          {drone.battery !== undefined ? `${drone.battery}%` : "--"}
        </span>
        <span className={cn(
          "w-16 truncate",
          isSelected ? "text-primary" : "text-muted-foreground"
        )}>
          {drone.task || config.label}
        </span>
      </div>
    </button>
  );
}