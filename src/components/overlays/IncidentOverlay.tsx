import { useEffect, useCallback } from "react";
import { X, AlertTriangle, Zap, HelpCircle, Check, Ban, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Incident } from "@/types/command-center";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IncidentOverlayProps {
  incident: Incident;
  isVisible: boolean;
  onApprove: () => void;
  onVeto: () => void;
  onMonitorOnly?: () => void;
  className?: string;
}

/**
 * Amber State Incident Overlay
 * 
 * Center-positioned modal-style overlay (500px) that slides in with:
 * - Plain-English AI summary
 * - AI validation checklist
 * - One Primary Action (orange button)
 * - "Why this decision?" tooltip
 * - Keyboard: Space = approve, Esc = dismiss
 */
export function IncidentOverlay({
  incident,
  isVisible,
  onApprove,
  onVeto,
  onMonitorOnly,
  className,
}: IncidentOverlayProps) {
  // Keyboard shortcuts
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        console.log('[OVERLAY] Space pressed - Approving');
        onApprove();
      }
      if (e.code === 'Escape') {
        e.preventDefault();
        console.log('[OVERLAY] Escape pressed - Dismissing');
        onVeto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onApprove, onVeto]);

  if (!isVisible) return null;

  const title = incident.title || incident.type.replace('_', ' ').toUpperCase();
  const confidence = incident.confidence || 92;
  const structuresAtRisk = incident.threatAssessment?.structuresAtRisk || 47;
  const heatSignature = incident.threatAssessment?.heatSignature || 287;
  const growthRate = incident.threatAssessment?.growthRate || '12m/min';
  const windDirection = incident.threatAssessment?.windDirection || 'NE';

  // AI reasoning for the tooltip
  const aiReasoning = `Heat signature of ${heatSignature}°C exceeds wildfire threshold. ` +
    `Pattern matches ${12} confirmed incidents in this area. ` +
    `Wind direction (${windDirection}) pushing toward ${structuresAtRisk} residential structures. ` +
    `Growth rate of ${growthRate} indicates rapid spread.`;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onVeto}
      />

      {/* Overlay Card */}
      <div 
        className={cn(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
          "w-[500px] max-h-[80vh] overflow-y-auto",
          "bg-card border-2 border-status-attention rounded-xl",
          "shadow-2xl shadow-status-attention/20",
          "animate-scale-in",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-status-attention/20 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-5 h-5 text-status-attention" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">#{incident.id}</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-status-attention/20 text-status-attention uppercase">
                  Amber Alert
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">{title}</p>
            </div>
          </div>
          <button 
            onClick={onVeto}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Plain-English Summary */}
          <div className="p-4 bg-secondary/50 rounded-lg border border-primary/10">
            <p className="text-sm text-foreground leading-relaxed">
              <span className="text-status-attention font-medium">Fire detected</span> near residential homes. 
              Drone verifying (ETA 27 seconds). AI has validated the threat pattern and 
              pre-alerted fire department.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <MetricCard 
              label="Heat Signature" 
              value={`${heatSignature}°C`} 
              status="critical"
            />
            <MetricCard 
              label="Structures at Risk" 
              value={`${structuresAtRisk}`} 
              status="warning"
            />
            <MetricCard 
              label="Growth Rate" 
              value={growthRate} 
              status="warning"
            />
          </div>

          {/* AI Confidence with "Why?" tooltip */}
          <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/30">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">AI Confidence</p>
                <p className="text-lg font-mono font-bold text-accent">{confidence}%</p>
              </div>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-1.5 text-xs text-accent border border-accent/30 rounded-lg hover:bg-accent/10 transition-colors">
                  <HelpCircle className="w-3 h-3" />
                  Why this decision?
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="left" 
                className="max-w-xs bg-card border border-accent/30 p-3"
              >
                <p className="text-xs text-foreground leading-relaxed">{aiReasoning}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* AI Validation Checklist */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              AI Validation Steps
            </p>
            <div className="space-y-1.5">
              <ValidationItem checked label="Thermal streaming active" />
              <ValidationItem checked label="Heat pattern validated against fire signatures" />
              <ValidationItem checked label="Nearest drone dispatched (D-247)" />
              <ValidationItem checked label="Fire department pre-alerted" />
              <ValidationItem checked label="Evacuation zones calculated" />
            </div>
          </div>

          {/* Location */}
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Location</p>
            <p className="text-sm font-medium">{incident.address}</p>
            <p className="text-xs text-muted-foreground font-mono">
              {incident.location.lat.toFixed(4)}°N, {Math.abs(incident.location.lng).toFixed(4)}°W
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-primary/20 space-y-3">
          {/* Primary Action - APPROVE */}
          <button
            onClick={onApprove}
            className={cn(
              "w-full py-4 rounded-lg font-medium text-lg",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 transition-all duration-200",
              "active:scale-[0.98]",
              "flex items-center justify-center gap-2",
              "shadow-lg shadow-primary/20",
              "animate-pulse-border"
            )}
          >
            <Check className="w-5 h-5" />
            APPROVE FULL RESPONSE
          </button>

          {/* Keyboard hint */}
          <p className="text-center text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Space</kbd> to approve
          </p>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onMonitorOnly}
              className="py-2.5 text-sm text-muted-foreground border border-primary/20 rounded-lg hover:border-primary/40 hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Monitor Only
            </button>
            <button
              onClick={onVeto}
              className="py-2.5 text-sm text-muted-foreground border border-primary/20 rounded-lg hover:border-destructive/40 hover:text-destructive transition-colors flex items-center justify-center gap-2"
            >
              <Ban className="w-4 h-4" />
              Mark False Alarm
            </button>
          </div>

          {/* Escape hint */}
          <p className="text-center text-xs text-muted-foreground/60">
            Press <kbd className="px-1.5 py-0.5 bg-secondary/50 rounded text-[10px] font-mono">Esc</kbd> to dismiss
          </p>
        </div>
      </div>
    </>
  );
}

// Metric Card Component
interface MetricCardProps {
  label: string;
  value: string;
  status: "normal" | "warning" | "critical";
}

function MetricCard({ label, value, status }: MetricCardProps) {
  const statusColors = {
    normal: "text-status-normal border-status-normal/30",
    warning: "text-status-attention border-status-attention/30",
    critical: "text-status-critical border-status-critical/30",
  };

  return (
    <div className={cn(
      "p-3 rounded-lg border bg-secondary/30",
      statusColors[status]
    )}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className={cn("text-lg font-mono font-bold", statusColors[status].split(' ')[0])}>
        {value}
      </p>
    </div>
  );
}

// Validation Item Component
interface ValidationItemProps {
  checked: boolean;
  label: string;
}

function ValidationItem({ checked, label }: ValidationItemProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={cn(
        "w-4 h-4 rounded flex items-center justify-center",
        checked ? "bg-accent/20 text-accent" : "bg-secondary"
      )}>
        {checked && <Check className="w-3 h-3" />}
      </div>
      <span className={checked ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}