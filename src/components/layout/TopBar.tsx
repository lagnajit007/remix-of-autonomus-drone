import { Search, Bell, Hexagon, User, Clock, Terminal, Activity, Shield } from "lucide-react";
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
 * Co-Pilot HUD TopBar (80px Fixed)
 * 
 * Design: High-density, tactical navigation
 * Elements: Logo (Panic), Search (⌘K), Active Banners, Operator Meta
 */
export function TopBar({
  operationalState,
  activeIncidents,
  alertsCount,
  shiftTime = "4H_23M",
  operatorName = "CHEN.S",
  className,
}: TopBarProps) {
  const stateColors = {
    green: "bg-status-normal shadow-status-normal/20",
    amber: "bg-status-attention shadow-status-attention/20",
    red: "bg-status-critical shadow-status-critical/20",
  };

  return (
    <div className={cn("flex items-center justify-between w-full h-[80px] px-6 bg-[#050B14] border-b border-white/10", className)}>

      {/* LEFT: Branding & Command Search */}
      <div className="flex items-center gap-10">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-3 transition-all hover:scale-105 group"
          title="KILL_COMMAND - RETURN TO BASE"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/40 group-hover:border-primary transition-all shadow-lg">
            <Hexagon className="w-6 h-6 text-primary group-hover:rotate-90 transition-transform duration-500" strokeWidth={3} />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-black text-xl tracking-tighter text-white leading-none">FLYTBASE</span>
            <span className="text-[8px] font-black text-primary tracking-[0.4em] leading-none mt-1 opacity-60">TACTICAL_OS</span>
          </div>
        </button>

        <div className="relative group hidden lg:block">
          <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="RUN_COMMAND (⌘K)..."
            className={cn(
              "w-[340px] h-11 pl-12 pr-12 rounded-xl",
              "bg-white/[0.02] border border-white/10",
              "text-xs font-bold text-white placeholder:text-white/20",
              "focus:outline-none focus:border-primary/50 focus:bg-white/[0.05]",
              "transition-all duration-300 uppercase tracking-widest"
            )}
          />
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/20 bg-white/5 px-2 py-1 rounded-md border border-white/5">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* CENTER: Operational Status Banner */}
      <div className="flex items-center gap-6">
        <div className={cn(
          "flex items-center gap-4 h-12 px-6 rounded-2xl border transition-all duration-500",
          operationalState === 'green' ? "bg-status-normal/5 border-status-normal/20" :
            operationalState === 'amber' ? "bg-status-attention/10 border-status-attention/50 animate-hud-pulse" :
              "bg-status-critical/10 border-status-critical/50 animate-hud-pulse"
        )}>
          <div className={cn("w-2 h-2 rounded-full", stateColors[operationalState], "animate-pulse")} />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">SYSTEM_STATUS</span>
            <span className={cn(
              "text-sm font-black uppercase tracking-widest leading-none",
              operationalState === 'green' ? "text-status-normal" :
                operationalState === 'amber' ? "text-status-attention" : "text-status-critical"
            )}>
              {operationalState === 'green' ? 'ROUTINE_PATROL' :
                operationalState === 'amber' ? 'VALIDATION_REQ' : 'ACTIVE_RESPONSE'}
            </span>
          </div>
        </div>

        {activeIncidents > 0 && (
          <div className="flex items-center gap-2 h-12 px-5 rounded-2xl bg-status-critical text-white shadow-xl shadow-status-critical/20 animate-in slide-in-from-top duration-500">
            <Activity className="w-5 h-5 text-white animate-pulse" />
            <span className="text-xl font-black tabular-nums">{activeIncidents}</span>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-80">ALERT</span>
          </div>
        )}
      </div>

      {/* RIGHT: Notifications & Operator Profile */}
      <div className="flex items-center gap-8">
        <button className="relative w-12 h-12 flex items-center justify-center bg-white/[0.02] border border-white/10 rounded-2xl hover:bg-white/[0.05] hover:border-white/20 transition-all group">
          <Bell className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
          {alertsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] bg-primary text-white text-[9px] font-black rounded-lg flex items-center justify-center shadow-lg border-2 border-[#050B14]">
              {alertsCount}
            </span>
          )}
        </button>

        <div className="h-10 w-px bg-white/5" />

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-white leading-none mb-1.5">{operatorName.toUpperCase()}</p>
            <div className="flex items-center justify-end gap-2 text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">
              <Shield className="w-3 h-3 text-status-normal" />
              <span>LOGGED_IN: {shiftTime}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center p-0.5">
            <div className="w-full h-full rounded-xl bg-[#1A2332] flex items-center justify-center">
              <User className="w-5 h-5 text-white/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}