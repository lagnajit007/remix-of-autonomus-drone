import { OperationalState } from "@/types/command-center";
import { 
  Mic, 
  MicOff, 
  Plane, 
  AlertTriangle, 
  Wifi, 
  WifiOff,
  Clock,
  Radio
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface TopBarProps {
  operationalState: OperationalState;
  dronesActive: number;
  alertsPending: number;
  isConnected?: boolean;
  incidentTimer?: number; // seconds elapsed since incident start
  className?: string;
}

// Status pill component
const StatusPill = ({ 
  icon: Icon, 
  label, 
  value, 
  variant = "default" 
}: { 
  icon: any; 
  label: string; 
  value: string | number;
  variant?: "default" | "success" | "warning" | "danger";
}) => {
  const variants = {
    default: "bg-secondary text-foreground",
    success: "bg-status-normal/20 text-status-normal",
    warning: "bg-status-attention/20 text-status-attention",
    danger: "bg-status-critical/20 text-status-critical",
  };
  
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs",
      variants[variant]
    )}>
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
};

// Incident timer component
const IncidentTimer = ({ seconds }: { seconds: number }) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-critical/20 text-status-critical animate-pulse">
      <Clock className="w-3.5 h-3.5" />
      <span className="font-mono font-bold">{formatTime(seconds)}</span>
    </div>
  );
};

// Voice indicator
const VoiceIndicator = ({ isListening }: { isListening: boolean }) => (
  <Button
    size="sm"
    variant="ghost"
    className={cn(
      "h-8 px-3 gap-2",
      isListening && "bg-primary/20 text-primary"
    )}
  >
    {isListening ? (
      <>
        <Mic className="w-4 h-4 animate-pulse" />
        <span className="text-xs hidden sm:inline">Listening...</span>
      </>
    ) : (
      <>
        <MicOff className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground hidden sm:inline">Voice</span>
      </>
    )}
  </Button>
);

// Operational state indicator
const StateIndicator = ({ state }: { state: OperationalState }) => {
  const stateConfig = {
    green: { label: "MONITORING", color: "text-status-normal", bg: "bg-status-normal/20" },
    amber: { label: "ALERT", color: "text-status-attention", bg: "bg-status-attention/20" },
    red: { label: "RESPONSE", color: "text-status-critical", bg: "bg-status-critical/20" },
  };
  const config = stateConfig[state];
  
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider",
      config.bg, config.color,
      state === "red" && "animate-pulse"
    )}>
      <div className={cn("w-2 h-2 rounded-full", 
        state === "green" ? "bg-status-normal" : 
        state === "amber" ? "bg-status-attention" : 
        "bg-status-critical"
      )} />
      {config.label}
    </div>
  );
};

export const TopBar = ({ 
  operationalState, 
  dronesActive, 
  alertsPending,
  isConnected = true,
  incidentTimer,
  className 
}: TopBarProps) => {
  const [isListening, setIsListening] = useState(false);

  return (
    <header className={cn(
      "h-14 px-4 flex items-center justify-between border-b border-primary/10 bg-card/50 backdrop-blur-sm",
      className
    )}>
      {/* Left: Logo and state */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Radio className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-foreground">FlytBase</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Command Center</div>
          </div>
        </div>
        
        <div className="w-px h-8 bg-primary/20 hidden sm:block" />
        
        {/* Operational State */}
        <StateIndicator state={operationalState} />
        
        {/* Incident Timer (only in red state) */}
        {operationalState === "red" && incidentTimer !== undefined && (
          <IncidentTimer seconds={incidentTimer} />
        )}
      </div>
      
      {/* Center: Status pills */}
      <div className="hidden md:flex items-center gap-2">
        <StatusPill 
          icon={Plane} 
          label="Drones" 
          value={dronesActive}
          variant="success"
        />
        <StatusPill 
          icon={AlertTriangle} 
          label="Alerts" 
          value={alertsPending}
          variant={alertsPending > 0 ? "warning" : "default"}
        />
        <StatusPill 
          icon={isConnected ? Wifi : WifiOff} 
          label="Status" 
          value={isConnected ? "Online" : "Offline"}
          variant={isConnected ? "success" : "danger"}
        />
      </div>
      
      {/* Right: Voice and actions */}
      <div className="flex items-center gap-2">
        <VoiceIndicator isListening={isListening} />
        
        {/* NLP hint */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
          <span>Try:</span>
          <code className="px-1.5 py-0.5 rounded bg-background/50 text-primary font-mono">"Status?"</code>
          <code className="px-1.5 py-0.5 rounded bg-background/50 text-primary font-mono">"Deploy evac"</code>
        </div>
      </div>
    </header>
  );
};
