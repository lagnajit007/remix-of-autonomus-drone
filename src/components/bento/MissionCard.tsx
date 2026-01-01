import { BentoCard } from "./BentoCard";
import { Drone } from "@/types/command-center";
import { 
  Target, 
  Pause, 
  Play, 
  RotateCcw,
  MapPin,
  Clock,
  Plane
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Mission {
  id: string;
  name: string;
  status: "active" | "paused" | "queued" | "completed";
  progress: number;
  drone: string;
  intent: string;
  eta?: string;
  zone?: string;
}

interface MissionCardProps {
  drones: Drone[];
  compact?: boolean;
  className?: string;
}

// Generate missions from drones
const generateMissions = (drones: Drone[]): Mission[] => {
  return drones
    .filter(d => d.status === "active" || d.status === "returning")
    .map((drone, index) => ({
      id: `mission-${drone.id}`,
      name: drone.currentTask || "Patrol Mission",
      status: drone.status === "active" ? "active" : "paused",
      progress: drone.status === "active" ? Math.floor(Math.random() * 60) + 20 : 100,
      drone: drone.id,
      intent: drone.currentTask?.includes("Perimeter") ? "Perimeter Scan" : 
              drone.currentTask?.includes("Thermal") ? "Thermal Survey" : "Monitoring",
      eta: drone.eta,
      zone: drone.assignedZone,
    }));
};

// Progress bar with gradient
const MissionProgress = ({ progress, status }: { progress: number; status: Mission["status"] }) => (
  <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
    <div 
      className={cn(
        "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
        status === "active" ? "bg-gradient-to-r from-primary to-status-normal" :
        status === "paused" ? "bg-status-attention" :
        status === "completed" ? "bg-status-normal" : "bg-muted-foreground"
      )}
      style={{ width: `${progress}%` }}
    />
    {status === "active" && (
      <div 
        className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
        style={{ left: `${progress - 4}%` }}
      />
    )}
  </div>
);

// Mission item component
const MissionItem = ({ mission, compact = false }: { mission: Mission; compact?: boolean }) => (
  <div className={cn(
    "p-2 rounded-lg border transition-all",
    mission.status === "active" ? "bg-card border-primary/30" : "bg-secondary/30 border-primary/10"
  )}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-6 h-6 rounded flex items-center justify-center",
          mission.status === "active" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
        )}>
          {mission.status === "active" ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
        </div>
        <div>
          <div className="text-xs font-medium text-foreground truncate max-w-[120px]">{mission.name}</div>
          {!compact && (
            <div className="text-[10px] text-muted-foreground">{mission.drone}</div>
          )}
        </div>
      </div>
      <span className="text-xs font-mono text-primary">{mission.progress}%</span>
    </div>
    
    <MissionProgress progress={mission.progress} status={mission.status} />
    
    {!compact && (
      <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          {mission.intent}
        </span>
        {mission.eta && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ETA {mission.eta}
          </span>
        )}
      </div>
    )}
  </div>
);

// Swarm intent card
const SwarmIntentCard = ({ drones }: { drones: Drone[] }) => {
  const activeDrones = drones.filter(d => d.status === "active");
  
  return (
    <div className="p-2 rounded-lg bg-secondary/30 border border-primary/10">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Swarm Intent</div>
      <div className="space-y-1">
        {activeDrones.slice(0, 3).map(drone => (
          <div key={drone.id} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <Plane className="w-3 h-3 text-primary" />
              <span className="text-foreground">{drone.id}</span>
            </span>
            <span className="text-muted-foreground truncate max-w-[80px]">
              {drone.currentTask?.split(" ")[0] || "Patrol"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MissionCard = ({ drones, compact = false, className }: MissionCardProps) => {
  const missions = generateMissions(drones);
  const activeMissions = missions.filter(m => m.status === "active");
  const queuedMissions = missions.filter(m => m.status === "queued" || m.status === "paused");
  
  if (compact) {
    return (
      <BentoCard className={className}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-foreground">{activeMissions.length} Active</span>
          </div>
          <span className="text-xs text-muted-foreground">{queuedMissions.length} queued</span>
        </div>
        {activeMissions[0] && (
          <MissionProgress progress={activeMissions[0].progress} status="active" />
        )}
      </BentoCard>
    );
  }

  return (
    <BentoCard 
      title="Mission Overview"
      icon={<Target className="w-3.5 h-3.5" />}
      headerAction={
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Pause className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      }
      className={className}
    >
      <div className="space-y-3">
        {/* Active missions */}
        {activeMissions.length > 0 ? (
          <div className="space-y-2">
            {activeMissions.map(mission => (
              <MissionItem key={mission.id} mission={mission} compact={compact} />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-muted-foreground">
            No active missions
          </div>
        )}

        {/* Swarm overview */}
        {drones.filter(d => d.status === "active").length > 1 && (
          <SwarmIntentCard drones={drones} />
        )}
        
        {/* Quick actions */}
        <div className="flex gap-2 pt-2 border-t border-primary/10">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 h-7 text-xs border-primary/20"
          >
            <MapPin className="w-3 h-3 mr-1" />
            Add Waypoint
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 h-7 text-xs border-primary/20"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reassign
          </Button>
        </div>
      </div>
    </BentoCard>
  );
};
