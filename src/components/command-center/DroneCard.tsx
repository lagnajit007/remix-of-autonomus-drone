import { Battery, Signal, Hexagon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Drone } from '@/types/command-center';

interface DroneCardProps {
  drone: Drone;
  compact?: boolean;
  onClick?: () => void;
}

export function DroneCard({ drone, compact = false, onClick }: DroneCardProps) {
  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-status-normal';
    if (level > 20) return 'text-status-attention';
    return 'text-status-critical';
  };

  const getStatusColor = (status: Drone['status']) => {
    switch (status) {
      case 'patrolling':
      case 'on_mission':
        return 'text-status-normal';
      case 'en_route':
        return 'text-status-attention';
      case 'docked':
      case 'returning':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusLabel = (status: Drone['status']) => {
    switch (status) {
      case 'patrolling': return 'Patrolling';
      case 'docked': return 'Docked';
      case 'en_route': return 'En Route';
      case 'on_mission': return 'On Mission';
      case 'returning': return 'Returning';
      default: return status;
    }
  };

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 p-3 command-card cursor-pointer hover:bg-secondary/50 transition-colors',
          onClick && 'hover:border-primary/40'
        )}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10">
          <Hexagon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{drone.id}</span>
            <span className={cn('text-xs', getStatusColor(drone.status))}>
              {getStatusLabel(drone.status)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Battery className={cn('w-4 h-4', getBatteryColor(drone.battery))} />
          <span className="data-mono">{drone.battery}%</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 command-card space-y-3',
        onClick && 'cursor-pointer hover:bg-secondary/50 hover:border-primary/40 transition-colors'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Hexagon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm">{drone.id}</h3>
            <p className={cn('text-xs', getStatusColor(drone.status))}>
              {getStatusLabel(drone.status)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Signal className={cn(
            'w-3.5 h-3.5',
            drone.signalStrength > 80 ? 'text-status-normal' : 
            drone.signalStrength > 50 ? 'text-status-attention' : 'text-status-critical'
          )} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-muted-foreground">Battery</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full rounded-full transition-all',
                  drone.battery > 50 ? 'bg-status-normal' : 
                  drone.battery > 20 ? 'bg-status-attention' : 'bg-status-critical'
                )}
                style={{ width: `${drone.battery}%` }}
              />
            </div>
            <span className="data-mono font-medium">{drone.battery}%</span>
          </div>
        </div>
        <div>
          <span className="text-muted-foreground">Zone</span>
          <p className="mt-1 font-medium truncate">{drone.zone || 'Unassigned'}</p>
        </div>
      </div>

      {drone.task && (
        <div className="text-xs pt-2 border-t border-primary/10">
          <span className="text-muted-foreground">Task: </span>
          <span className="text-primary">{drone.task}</span>
        </div>
      )}

      {drone.eta && (
        <div className="flex items-center gap-2 text-xs text-status-attention">
          <span>ETA:</span>
          <span className="data-mono font-bold">{drone.eta}s</span>
        </div>
      )}
    </div>
  );
}
