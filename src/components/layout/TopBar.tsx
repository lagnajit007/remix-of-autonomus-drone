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

  return (
    <div className={cn("flex items-center justify-between w-full h-[80px]", className)}>
      {/* Left Section: Logo + Search */}
      <div className="flex items-center gap-8">
        {/* Logo - Panic button to return to overview */}
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity w-[120px]"
          title="Return to Overview"
        >
          <div className="w-9 h-9 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
            <Hexagon className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tighter text-white uppercase italic">FlytBase</span>
        </button>

        {/* Global Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search: ⌘K"
            className={cn(
              "w-[300px] h-11 pl-10 pr-4 rounded-lg",
              "bg-secondary border border-primary/20",
              "text-foreground placeholder:text-muted-foreground/50",
              "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30",
              "transition-all duration-200"
            )}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded border border-white/5">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Center Section: Active Incidents */}
      <div className="flex items-center gap-4">
        {/* Active Incidents Badge (150px focus) */}
        <button
          className={cn(
            "flex items-center justify-center gap-2 w-[150px] h-11 rounded-lg transition-all duration-300 overflow-hidden",
            activeIncidents > 0
              ? cn(
                "bg-status-critical/10 border border-status-critical shadow-sm",
                operationalState === 'red' && "animate-pulse"
              )
              : "bg-secondary border border-primary/20"
          )}
        >
          <div className={cn(
            "w-2.5 h-2.5 rounded-full shrink-0",
            activeIncidents > 0 ? "bg-status-critical pulse-red" : "bg-muted-foreground/30"
          )} />
          <span className={cn(
            "text-sm font-bold tracking-widest uppercase",
            activeIncidents > 0 ? "text-status-critical" : "text-muted-foreground"
          )}>
            {activeIncidents} ACTIVE
          </span>
        </button>

        {/* Operational State Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-primary/10">
          <div className={cn(
            "w-2 h-2 rounded-full",
            stateColors[operationalState],
            operationalState !== 'green' && "animate-pulse"
          )} />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            SYSTEM: {operationalState}
          </span>
        </div>
      </div>

      {/* Right Section: Notifications + Profile */}
      <div className="flex items-center gap-6">
        {/* Notifications Bell */}
        <button
          className={cn(
            "relative p-2.5 rounded-lg w-[44px] h-[44px] flex items-center justify-center",
            "bg-secondary border border-primary/20 hover:bg-secondary/80 hover:border-primary/40",
            "transition-all duration-200"
          )}
          title="System Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {alertsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg ring-2 ring-background">
              {alertsCount > 9 ? "9+" : alertsCount}
            </span>
          )}
        </button>

        {/* Operator Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-primary/20 h-10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white leading-tight">{operatorName}</p>
            <div className="flex items-center justify-end gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              <Clock className="w-3 h-3 text-primary/60" />
              <span>Shift: {shiftTime}</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-secondary to-muted border border-primary/20 flex items-center justify-center overflow-hidden shadow-inner">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}