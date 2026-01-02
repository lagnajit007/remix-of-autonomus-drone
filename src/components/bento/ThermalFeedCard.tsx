import { BentoCard } from "./BentoCard";
import { Drone } from "@/types/command-center";
import { 
  Camera,
  Circle,
  Crosshair,
  Maximize2,
  Video,
  Thermometer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ThermalFeedCardProps {
  drone: Drone;
  className?: string;
}

// Simulated heat signature blob
const HeatBlob = ({ x, y, size, intensity }: { x: number; y: number; size: number; intensity: number }) => (
  <div 
    className="absolute rounded-full blur-md animate-pulse"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      background: `radial-gradient(circle, 
        hsl(${60 - intensity * 60}, 100%, 50%) 0%, 
        hsl(${30 - intensity * 30}, 100%, 40%) 40%, 
        hsl(0, 100%, ${30 + intensity * 20}%) 70%, 
        transparent 100%)`,
      transform: 'translate(-50%, -50%)',
    }}
  />
);

// Crosshair overlay
const CrosshairOverlay = () => (
  <div className="absolute inset-0 pointer-events-none">
    {/* Center crosshair */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="w-16 h-16 border-2 border-primary/60 rounded-full" />
      <div className="absolute top-1/2 left-0 w-full h-px bg-primary/40" />
      <div className="absolute left-1/2 top-0 h-full w-px bg-primary/40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
    </div>
    
    {/* Corner brackets */}
    <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/40" />
    <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/40" />
    <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/40" />
    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/40" />
  </div>
);

// Temperature scale
const TempScale = () => (
  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-32 rounded-full overflow-hidden">
    <div className="w-full h-full bg-gradient-to-b from-white via-yellow-400 via-orange-500 to-red-600" />
    <div className="absolute -right-8 top-0 text-[10px] font-mono text-white/80">500°C</div>
    <div className="absolute -right-8 bottom-0 text-[10px] font-mono text-white/80">20°C</div>
  </div>
);

// Telemetry overlay
const TelemetryOverlay = ({ drone, temp }: { drone: Drone; temp: number }) => (
  <>
    {/* Top left - Recording indicator */}
    <div className="absolute top-3 left-3 flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 rounded text-xs">
        <div className="w-2 h-2 bg-status-critical rounded-full animate-pulse" />
        <span className="font-mono text-white/90">REC</span>
      </div>
      <div className="px-2 py-1 bg-black/60 rounded text-xs font-mono text-primary">
        THERMAL
      </div>
    </div>
    
    {/* Top right - Drone info */}
    <div className="absolute top-3 right-12 text-right">
      <div className="px-2 py-1 bg-black/60 rounded text-xs font-mono text-white/90">
        {drone.id}
      </div>
    </div>
    
    {/* Bottom left - Coordinates & temp */}
    <div className="absolute bottom-3 left-3 space-y-1">
      <div className="px-2 py-1 bg-black/60 rounded text-xs font-mono text-white/80">
        {drone.location.lat.toFixed(4)}° N, {drone.location.lng.toFixed(4)}° W
      </div>
      <div className="flex items-center gap-2">
        <div className="px-2 py-1 bg-black/60 rounded text-xs font-mono text-status-critical">
          <Thermometer className="w-3 h-3 inline mr-1" />
          {temp}°C
        </div>
        <div className="px-2 py-1 bg-black/60 rounded text-xs font-mono text-white/80">
          ALT: 85m
        </div>
      </div>
    </div>
    
    {/* Bottom right - Timestamp */}
    <div className="absolute bottom-3 right-3">
      <div className="px-2 py-1 bg-black/60 rounded text-xs font-mono text-white/80">
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  </>
);

export const ThermalFeedCard = ({ drone, className }: ThermalFeedCardProps) => {
  const [heatBlobs, setHeatBlobs] = useState<Array<{ id: number; x: number; y: number; size: number; intensity: number }>>([]);
  const [peakTemp, setPeakTemp] = useState(287);
  
  // Simulate dynamic heat signatures
  useEffect(() => {
    // Initial blobs
    setHeatBlobs([
      { id: 1, x: 45, y: 40, size: 80, intensity: 0.9 },
      { id: 2, x: 55, y: 50, size: 60, intensity: 0.7 },
      { id: 3, x: 40, y: 55, size: 40, intensity: 0.5 },
      { id: 4, x: 60, y: 35, size: 30, intensity: 0.4 },
    ]);
    
    // Animate temp fluctuation
    const interval = setInterval(() => {
      setPeakTemp(prev => prev + Math.floor(Math.random() * 20) - 10);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <BentoCard 
      title="Live Thermal Feed"
      icon={<Camera className="w-3.5 h-3.5" />}
      priority="high"
      pulsing="red"
      headerAction={
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Maximize2 className="w-3 h-3" />
          </Button>
        </div>
      }
      className={className}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
        {/* Thermal gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/40 to-black" />
        
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Heat signature blobs */}
        {heatBlobs.map(blob => (
          <HeatBlob key={blob.id} {...blob} />
        ))}
        
        {/* Crosshair overlay */}
        <CrosshairOverlay />
        
        {/* Temperature scale */}
        <TempScale />
        
        {/* Telemetry overlay */}
        <TelemetryOverlay drone={drone} temp={peakTemp} />
        
        {/* Scan line effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px)',
          }}
        />
      </div>
      
      {/* Quick actions */}
      <div className="flex gap-2 mt-3">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 h-7 text-xs border-primary/20"
        >
          <Video className="w-3 h-3 mr-1" />
          Switch Feed
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 h-7 text-xs border-status-attention/30 text-status-attention hover:bg-status-attention/10"
        >
          <Circle className="w-3 h-3 mr-1" />
          Snapshot
        </Button>
      </div>
    </BentoCard>
  );
};
