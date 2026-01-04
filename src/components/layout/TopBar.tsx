import { Search, Bell, Hexagon, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { OperationalState } from "@/types/command-center";

interface TopBarProps {
  operationalState: OperationalState;
  activeIncidents: number;
  alertsCount: number;
  shiftTime?: string;
  operatorName?: string;
  className?: string;
}

/**
 * Top Bar (80px Fixed Height)
 * 
 * Elements (left to right):
 * 1. Logo (120px) - Click returns to overview (panic button)
 * 2. Global Search (300px) - Cmd/Ctrl+K, fuzzy matching
 * 3. Active Incidents Badge (150px) - Pulses if Priority 1
 * 4. Notifications Bell (60px) - System alerts only
 * 5. Operator Profile (120px) - Name, shift timer
 */
export function TopBar({
  operationalState,
  activeIncidents,
  alertsCount,
  shiftTime = "4h 23m",
  operatorName = "Operator",
  className,
}: TopBarProps) {
  const stateColors = {
    green: "bg-status-normal",
    amber: "bg-status-attention", 
    red: "bg-status-critical",
  };

  const statePulse = {
    green: "",
    amber: "animate-pulse",
    red: "animate-pulse",
  };

  return (
    <div className={cn("flex items-center justify-between h-full", className)}>
      {/* Left Section: Logo + Search */}
      <div className="flex items-center gap-6">
        {/* Logo - Panic button to return to overview */}
        <button 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          title="Return to Overview"
        >
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
            <Hexagon className="w-6 h-6 text-primary" />
          </div>
          <span className="font-semibold text-lg tracking-tight">FlytBase</span>
        </button>

        {/* Global Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search drones, incidents, locations..."
            className={cn(
              "w-[300px] h-10 pl-10 pr-4 rounded-lg",
              "bg-secondary border border-primary/20",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:border-primary/50",
              "transition-colors"
            )}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Center Section: Active Incidents */}
      <div className="flex items-center gap-4">
        {/* Operational State Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-primary/20">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full",
            stateColors[operationalState],
            statePulse[operationalState]
          )} />
          <span className="text-sm font-medium uppercase tracking-wide">
            {operationalState}
          </span>
        </div>

        {/* Active Incidents Badge */}
        <button
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
            activeIncidents > 0
              ? "bg-primary/20 border border-primary text-primary hover:bg-primary/30"
              : "bg-secondary border border-primary/20 text-muted-foreground"
          )}
        >
          <span className={cn(
            "font-mono text-lg font-bold",
            activeIncidents > 0 && "text-primary"
          )}>
            {activeIncidents}
          </span>
          <span className="text-sm">ACTIVE</span>
          {activeIncidents > 0 && operationalState !== 'green' && (
            <div className={cn(
              "w-2 h-2 rounded-full",
              operationalState === 'red' ? "bg-status-critical pulse-red" : "bg-status-attention pulse-amber"
            )} />
          )}
        </button>
      </div>

      {/* Right Section: Notifications + Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications Bell */}
        <button 
          className={cn(
            "relative p-2.5 rounded-lg",
            "bg-secondary border border-primary/20",
            "hover:border-primary/40 transition-colors"
          )}
          title="System Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {alertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {alertsCount > 9 ? "9+" : alertsCount}
            </span>
          )}
        </button>

        {/* Operator Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-primary/20">
          <div className="text-right">
            <p className="text-sm font-medium">{operatorName}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>On duty {shiftTime}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-secondary border border-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}