import { TimelineEvent } from "@/types/command-center";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Users,
  Radio
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PlaybackBarProps {
  events: TimelineEvent[];
  className?: string;
}

// Event marker on timeline
const EventMarker = ({ event, position }: { event: TimelineEvent; position: number }) => {
  const typeIcons: Record<TimelineEvent["type"], typeof Clock> = {
    detection: AlertTriangle,
    dispatch: Zap,
    confirmation: CheckCircle2,
    coordination: Radio,
    evacuation: Users,
    resolution: CheckCircle2,
  };
  const Icon = typeIcons[event.type] || Clock;
  
  const severityColors: Record<TimelineEvent["severity"], string> = {
    info: "bg-primary",
    warning: "bg-status-attention",
    critical: "bg-status-critical",
  };
  
  return (
    <div 
      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group cursor-pointer"
      style={{ left: `${position}%` }}
    >
      <div className={cn(
        "w-3 h-3 rounded-full border-2 border-background transition-transform group-hover:scale-150",
        severityColors[event.severity]
      )} />
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-primary/30 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3 h-3" />
          <span>{event.message.substring(0, 30)}{event.message.length > 30 ? "..." : ""}</span>
        </div>
        <div className="text-muted-foreground">
          {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

// Time display
const TimeDisplay = ({ label, time }: { label: string; time: string }) => (
  <div className="text-xs">
    <span className="text-muted-foreground mr-1">{label}</span>
    <span className="font-mono text-foreground">{time}</span>
  </div>
);

export const PlaybackBar = ({ events, className }: PlaybackBarProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(100); // Current position (0-100)
  
  // Calculate event positions (distribute across timeline)
  const eventPositions = events.map((event, index) => ({
    event,
    position: ((index + 1) / (events.length + 1)) * 100,
  }));
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleRewind = () => {
    setProgress(0);
    setIsPlaying(false);
  };
  
  const handleSkipBack = () => {
    setProgress(Math.max(0, progress - 10));
  };
  
  const handleSkipForward = () => {
    setProgress(Math.min(100, progress + 10));
  };

  return (
    <div className={cn(
      "h-12 px-4 flex items-center gap-4 bg-card/50 backdrop-blur-sm border-t border-primary/10",
      className
    )}>
      {/* Playback controls */}
      <div className="flex items-center gap-1">
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8"
          onClick={handleRewind}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8"
          onClick={handleSkipBack}
        >
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button 
          size="icon" 
          variant="outline" 
          className="h-8 w-8 border-primary/30"
          onClick={handlePlayPause}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8"
          onClick={handleSkipForward}
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Start time */}
      <TimeDisplay label="" time="00:00" />
      
      {/* Timeline scrubber */}
      <div className="flex-1 relative h-2 bg-muted rounded-full">
        {/* Progress bar */}
        <div 
          className="absolute inset-y-0 left-0 bg-primary/50 rounded-full"
          style={{ width: `${progress}%` }}
        />
        
        {/* Event markers */}
        {eventPositions.map(({ event, position }) => (
          <EventMarker key={event.id} event={event} position={position} />
        ))}
        
        {/* Playhead */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background shadow-lg cursor-grab active:cursor-grabbing"
          style={{ left: `${progress}%` }}
        />
      </div>
      
      {/* End time / current time */}
      <TimeDisplay label="" time="LIVE" />
      
      {/* Quick rewind button */}
      <Button 
        size="sm" 
        variant="outline" 
        className="h-7 px-3 text-xs border-primary/20"
      >
        <RotateCcw className="w-3 h-3 mr-1" />
        Last 60s
      </Button>
    </div>
  );
};
