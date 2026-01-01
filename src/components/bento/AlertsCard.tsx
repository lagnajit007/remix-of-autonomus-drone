import { BentoCard } from "./BentoCard";
import { Incident, OperationalState } from "@/types/command-center";
import { 
  AlertTriangle, 
  Flame, 
  Users, 
  Shield, 
  Eye,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AlertsCardProps {
  incidents: Incident[];
  operationalState: OperationalState;
  onApprove?: (incidentId: string) => void;
  onVeto?: (incidentId: string) => void;
  className?: string;
}

// Confidence gauge component
const ConfidenceGauge = ({ confidence }: { confidence: number }) => {
  const isHigh = confidence >= 90;
  const isMedium = confidence >= 85;
  
  return (
    <div className="relative group">
      <div className={cn(
        "px-2 py-0.5 rounded-full text-xs font-mono font-medium",
        isHigh ? "bg-status-normal/20 text-status-normal" :
        isMedium ? "bg-status-attention/20 text-status-attention" :
        "bg-status-critical/20 text-status-critical"
      )}>
        {confidence}%
      </div>
      
      {/* Why tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-primary/30 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        <div className="text-muted-foreground mb-1">AI Confidence Analysis</div>
        <div className="text-foreground">Heat signature + wind pattern match</div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary/30" />
      </div>
    </div>
  );
};

// Incident type icon
const IncidentIcon = ({ type }: { type: Incident["type"] }) => {
  const icons = {
    fire: Flame,
    intrusion: Shield,
    medical: Users,
    structural: AlertTriangle,
    chemical: Zap,
    other: Eye,
  };
  const Icon = icons[type] || Eye;
  
  return <Icon className="w-4 h-4" />;
};

// Priority indicator
const PriorityBadge = ({ severity }: { severity: Incident["severity"] }) => {
  const styles = {
    critical: "bg-status-critical/20 text-status-critical border-status-critical/30",
    high: "bg-status-attention/20 text-status-attention border-status-attention/30",
    medium: "bg-primary/20 text-primary border-primary/30",
    low: "bg-muted text-muted-foreground border-muted",
  };
  
  return (
    <span className={cn(
      "px-1.5 py-0.5 rounded text-[10px] uppercase font-medium border",
      styles[severity]
    )}>
      {severity}
    </span>
  );
};

// Single alert card
const AlertItem = ({ 
  incident, 
  onApprove, 
  onVeto,
  isActive = false 
}: { 
  incident: Incident; 
  onApprove?: () => void;
  onVeto?: () => void;
  isActive?: boolean;
}) => {
  const isFalsePositive = incident.confidence < 85;
  
  return (
    <div className={cn(
      "relative p-3 rounded-lg border transition-all",
      isActive ? "bg-card border-primary/40" : "bg-secondary/50 border-primary/10",
      isFalsePositive && "opacity-60"
    )}>
      {/* False positive banner */}
      {isFalsePositive && (
        <div className="absolute -top-2 left-3 px-2 py-0.5 bg-status-attention text-primary-foreground text-[10px] rounded font-medium">
          Review?
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded",
            incident.severity === "critical" ? "bg-status-critical/20 text-status-critical" :
            incident.severity === "high" ? "bg-status-attention/20 text-status-attention" :
            "bg-primary/20 text-primary"
          )}>
            <IncidentIcon type={incident.type} />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{incident.title}</div>
            <div className="text-xs text-muted-foreground">{incident.location}</div>
          </div>
        </div>
        <ConfidenceGauge confidence={incident.confidence} />
      </div>
      
      {/* Details */}
      <div className="flex items-center justify-between text-xs mb-3">
        <PriorityBadge severity={incident.severity} />
        <span className="text-muted-foreground">
          {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      {/* Autonomous action taken */}
      {incident.autonomousAction && (
        <div className="flex items-center gap-2 text-xs text-status-normal mb-3">
          <CheckCircle2 className="w-3 h-3" />
          <span>{incident.autonomousAction}</span>
        </div>
      )}
      
      {/* Action buttons */}
      {isActive && (onApprove || onVeto) && (
        <div className="flex gap-2 pt-2 border-t border-primary/10">
          {onApprove && (
            <Button 
              size="sm" 
              className="flex-1 h-8 bg-status-normal/20 text-status-normal hover:bg-status-normal/30 border border-status-normal/30"
              onClick={onApprove}
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Approve
            </Button>
          )}
          {onVeto && (
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 h-8 border-status-critical/30 text-status-critical hover:bg-status-critical/10"
              onClick={onVeto}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Veto
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export const AlertsCard = ({ 
  incidents, 
  operationalState, 
  onApprove, 
  onVeto,
  className 
}: AlertsCardProps) => {
  const activeIncidents = incidents.filter(i => i.status === "active" || i.status === "responding");
  const hasAlerts = activeIncidents.length > 0;
  
  return (
    <BentoCard 
      title="Alerts & Incidents"
      icon={<AlertTriangle className="w-3.5 h-3.5" />}
      priority={hasAlerts ? "high" : "low"}
      pulsing={operationalState === "red" ? "red" : operationalState === "amber" ? "amber" : undefined}
      headerAction={
        hasAlerts && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-status-critical text-primary-foreground text-xs font-bold">
            {activeIncidents.length}
          </span>
        )
      }
      className={className}
    >
      {activeIncidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-status-normal/10 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5 text-status-normal" />
          </div>
          <div className="text-sm text-muted-foreground">No active alerts</div>
          <div className="text-xs text-muted-foreground/60">All systems operational</div>
        </div>
      ) : (
        <div className="space-y-2 max-h-[calc(100%-2rem)] overflow-y-auto">
          {activeIncidents.map((incident, index) => (
            <AlertItem 
              key={incident.id}
              incident={incident}
              isActive={index === 0}
              onApprove={onApprove ? () => onApprove(incident.id) : undefined}
              onVeto={onVeto ? () => onVeto(incident.id) : undefined}
            />
          ))}
        </div>
      )}
    </BentoCard>
  );
};
