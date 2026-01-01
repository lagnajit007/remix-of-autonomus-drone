import { BentoCard } from "./BentoCard";
import { Drone } from "@/types/command-center";
import { 
  Battery, 
  Signal, 
  Gauge, 
  Radio,
  Thermometer,
  Camera,
  Volume2,
  Lightbulb,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TelemetryCardProps {
  drone: Drone;
  compact?: boolean;
  className?: string;
}

// Battery ring gauge component
const BatteryGauge = ({ percentage }: { percentage: number }) => {
  const isLow = percentage < 30;
  const isCritical = percentage < 15;
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-12 h-12">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="3"
        />
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke={isCritical ? "hsl(var(--status-critical))" : isLow ? "hsl(var(--status-attention))" : "hsl(var(--status-normal))"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn(isCritical && "animate-pulse")}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          "text-xs font-mono font-bold",
          isCritical ? "text-status-critical" : isLow ? "text-status-attention" : "text-status-normal"
        )}>
          {percentage}%
        </span>
      </div>
    </div>
  );
};

// Signal strength indicator
const SignalIndicator = ({ strength }: { strength: number }) => {
  const bars = 4;
  const activeBars = Math.ceil((strength / 100) * bars);
  
  return (
    <div className="flex items-end gap-0.5 h-4">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-sm transition-colors",
            i < activeBars ? "bg-primary" : "bg-muted",
          )}
          style={{ height: `${((i + 1) / bars) * 100}%` }}
        />
      ))}
    </div>
  );
};

// Latency badge
const LatencyBadge = ({ ms }: { ms: number }) => {
  const isGood = ms < 200;
  const isOk = ms < 500;
  
  return (
    <div className={cn(
      "px-2 py-0.5 rounded text-xs font-mono",
      isGood ? "bg-status-normal/20 text-status-normal" :
      isOk ? "bg-status-attention/20 text-status-attention" :
      "bg-status-critical/20 text-status-critical"
    )}>
      {ms}ms
    </div>
  );
};

// Payload status icons
const PayloadStatus = ({ active, icon: Icon, label }: { active: boolean; icon: any; label: string }) => (
  <div className={cn(
    "flex items-center gap-1 text-xs",
    active ? "text-primary" : "text-muted-foreground/40"
  )} title={label}>
    <Icon className="w-3 h-3" />
  </div>
);

export const TelemetryCard = ({ drone, compact = false, className }: TelemetryCardProps) => {
  const isLowBattery = drone.battery < 30;
  
  if (compact) {
    return (
      <BentoCard 
        className={cn("py-2", className)} 
        priority={isLowBattery ? "high" : "medium"}
        pulsing={isLowBattery ? "amber" : undefined}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BatteryGauge percentage={drone.battery} />
            <div className="text-xs">
              <div className="font-medium text-foreground">{drone.id}</div>
              <div className="text-muted-foreground">{drone.status}</div>
            </div>
          </div>
          <SignalIndicator strength={drone.signalStrength} />
        </div>
      </BentoCard>
    );
  }

  return (
    <BentoCard 
      title="Drone Telemetry" 
      icon={<Radio className="w-3.5 h-3.5" />}
      priority={isLowBattery ? "high" : "medium"}
      pulsing={isLowBattery ? "amber" : undefined}
      className={className}
    >
      <div className="space-y-3">
        {/* Drone ID and Status */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-foreground">{drone.id}</div>
            <div className={cn(
              "text-xs",
              drone.status === "active" ? "text-status-normal" :
              drone.status === "returning" ? "text-status-attention" :
              "text-muted-foreground"
            )}>
              {drone.status.charAt(0).toUpperCase() + drone.status.slice(1)}
            </div>
          </div>
          <LatencyBadge ms={drone.signalStrength > 70 ? 132 : drone.signalStrength > 40 ? 287 : 512} />
        </div>

        {/* Battery Gauge - Large */}
        <div className="flex items-center gap-4">
          <BatteryGauge percentage={drone.battery} />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Battery</span>
              {isLowBattery && (
                <span className="flex items-center gap-1 text-status-attention">
                  <AlertTriangle className="w-3 h-3" />
                  Auto-land ready
                </span>
              )}
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  drone.battery > 50 ? "bg-status-normal" :
                  drone.battery > 30 ? "bg-status-attention" :
                  "bg-status-critical"
                )}
                style={{ width: `${drone.battery}%` }}
              />
            </div>
          </div>
        </div>

        {/* Signal & Connection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">RC Signal</div>
            <div className="flex items-center gap-2">
              <SignalIndicator strength={drone.signalStrength} />
              <span className="text-xs font-mono text-foreground">{drone.signalStrength}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">LTE</div>
            <div className="flex items-center gap-2">
              <SignalIndicator strength={Math.max(drone.signalStrength - 10, 0)} />
              <span className="text-xs font-mono text-foreground">{Math.max(drone.signalStrength - 10, 0)}%</span>
            </div>
          </div>
        </div>

        {/* Speed / Altitude */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Speed</div>
              <div className="text-sm font-mono text-foreground">12.4 m/s</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center text-primary text-xs">↑</div>
            <div>
              <div className="text-xs text-muted-foreground">Altitude</div>
              <div className="text-sm font-mono text-foreground">85m</div>
            </div>
          </div>
        </div>

        {/* Payload Status */}
        <div className="pt-2 border-t border-primary/10">
          <div className="text-xs text-muted-foreground mb-2">Payload Status</div>
          <div className="flex items-center gap-3">
            <PayloadStatus active={true} icon={Camera} label="Camera Active" />
            <PayloadStatus active={true} icon={Thermometer} label="Thermal On" />
            <PayloadStatus active={false} icon={Volume2} label="Speaker Off" />
            <PayloadStatus active={false} icon={Lightbulb} label="Lights Off" />
          </div>
        </div>
      </div>
    </BentoCard>
  );
};
