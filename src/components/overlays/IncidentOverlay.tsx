import { useEffect } from "react";
import { X, AlertTriangle, Zap, HelpCircle, Check, Ban, Eye, MapPin, Flame, Activity, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Incident } from "@/types/command-center";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
 * Amber State Tactical Overlay
 * 
 * Design: Command-Center Decision Gate
 */
export function IncidentOverlay({
  incident,
  isVisible,
  onApprove,
  onVeto,
  onMonitorOnly,
  className,
}: IncidentOverlayProps) {

  // Keyboard: Space = Approve, Esc = Veto
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); onApprove(); }
      if (e.code === 'Escape') { e.preventDefault(); onVeto(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onApprove, onVeto]);

  if (!isVisible) return null;

  return (
    <TooltipProvider>
      <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[#050B14]/80 backdrop-blur-md animate-in fade-in duration-500" onClick={onVeto} />

        {/* Content Card */}
        <div className={cn(
          "relative w-full max-w-[540px] bg-[#1A2332] border-2 border-status-attention rounded-2xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]",
          "animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out",
          className
        )}>
          {/* Tactical Header */}
          <div className="bg-status-attention p-4 flex justify-between items-center bg-gradient-to-r from-status-attention to-orange-600">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-black" />
              <div className="flex flex-col">
                <span className="font-black text-[10px] text-black/60 uppercase tracking-widest leading-none mb-1">Incident Verification Required</span>
                <span className="font-black text-lg text-black uppercase tracking-tighter leading-none">AMBER ALERT #{incident.id.split('-')[1] || '0842'}</span>
              </div>
            </div>
            <button onClick={onVeto} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors">
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Plain-English Summary */}
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight">THERMAL ANOMALY DETECTED IN ZONE C</h2>
              <p className="text-sm font-medium text-white/70 leading-relaxed italic">
                "AI detected a <span className="text-status-attention font-bold underline decoration-status-attention/30 underline-offset-4">consistent heat pattern</span> matching potential wildfire signature. D-247 has been automatically dispatched for visual confirmation. ETA: 22s."
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-status-critical" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Heat Intel</span>
                </div>
                <span className="text-xl font-black text-white uppercase tabular-nums">287°C Spike</span>
              </div>
              <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-status-attention" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Spread Speed</span>
                </div>
                <span className="text-xl font-black text-white uppercase tabular-nums">12m/min</span>
              </div>
            </div>

            {/* AI Reasoning / Why box */}
            <div className="flex items-center justify-between p-4 bg-status-ai/5 border border-status-ai/20 rounded-xl">
              <div className="flex items-center gap-4">
                <Zap className="w-6 h-6 text-status-ai" />
                <div>
                  <p className="text-[10px] font-black text-status-ai uppercase tracking-widest mb-0.5">Confidence Level</p>
                  <p className="text-xl font-black text-white tabular-nums leading-none">94% PROBABILITY</p>
                </div>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 bg-status-ai/10 text-status-ai rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-status-ai/20 transition-all border border-status-ai/20">
                    <HelpCircle className="w-4 h-4" />
                    Rationale
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[280px] bg-[#0A1628] border-status-ai/30 p-3 shadow-2xl">
                  <p className="text-xs font-medium text-white/80 leading-relaxed">
                    Detected heat bloom matches visual signature of 12 past wildfires. High wind (18mph) increases risk to nearby residential zone. Immediate intervention recommended.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Validation Checklist</span>
              <div className="grid grid-cols-1 gap-2">
                <ValidationRow checked text="Thermal streaming active" />
                <ValidationRow checked text="Nearby drones alerted" />
                <ValidationRow checked={false} text="Ground units dispatched" />
              </div>
            </div>

            {/* Primary Action */}
            <div className="pt-2 space-y-3">
              <button
                onClick={onApprove}
                className="w-full h-16 bg-status-normal hover:bg-green-600 text-white font-black text-xl uppercase tracking-tighter rounded-xl shadow-2xl shadow-status-normal/20 transition-all group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Check className="w-6 h-6" />
                  APPROVE FULL RESPONSE
                </span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

              <div className="flex justify-center">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Press <kbd className="mx-1 px-1.5 py-0.5 bg-white/5 rounded text-white/50 text-xs">SPACE</kbd> for tactical approval
                </span>
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={onMonitorOnly} className="h-12 border border-white/10 text-white/60 font-black text-xs uppercase tracking-widest hover:bg-white/5 rounded-xl flex items-center justify-center gap-2 transition-all">
                <Eye className="w-4 h-4" /> MONITOR ONLY
              </button>
              <button onClick={onVeto} className="h-12 border border-white/10 text-white/60 font-black text-xs uppercase tracking-widest hover:bg-white/5 rounded-xl flex items-center justify-center gap-2 transition-all">
                <Ban className="w-4 h-4" /> FALSE ALARM
              </button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function ValidationRow({ checked, text }: { checked: boolean, text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-4 h-4 rounded flex items-center justify-center", checked ? "bg-status-normal/20 text-status-normal" : "bg-white/5 text-white/20")}>
        <Check className="w-3 h-3" strokeWidth={4} />
      </div>
      <span className={cn("text-[11px] font-bold uppercase tracking-tight", checked ? "text-white" : "text-white/20")}>{text}</span>
    </div>
  );
}