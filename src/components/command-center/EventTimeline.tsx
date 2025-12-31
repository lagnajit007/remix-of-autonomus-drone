import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { TimelineEvent } from '@/types/command-center';
import { AlertTriangle, Send, CheckCircle, Users, Radio, Zap } from 'lucide-react';

interface EventTimelineProps {
  events: TimelineEvent[];
  maxHeight?: string;
}

export function EventTimeline({ events, maxHeight = '300px' }: EventTimelineProps) {
  const getIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'detection': return Zap;
      case 'dispatch': return Send;
      case 'confirmation': return CheckCircle;
      case 'coordination': return Radio;
      case 'evacuation': return Users;
      case 'resolution': return CheckCircle;
      default: return Zap;
    }
  };

  const getIconColor = (severity: TimelineEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'text-status-critical bg-status-critical/20';
      case 'warning': return 'text-status-attention bg-status-attention/20';
      case 'info': return 'text-primary bg-primary/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="relative overflow-y-auto pr-2" style={{ maxHeight }}>
      <div className="absolute left-3 top-0 bottom-0 w-px bg-primary/20" />
      
      <div className="space-y-3">
        {events.map((event, index) => {
          const Icon = getIcon(event.type);
          const isLatest = index === events.length - 1;
          
          return (
            <div 
              key={event.id} 
              className={cn(
                'relative pl-8 py-2',
                isLatest && 'animate-fade-in'
              )}
            >
              <div className={cn(
                'absolute left-0 top-2 w-6 h-6 rounded-full flex items-center justify-center',
                getIconColor(event.severity)
              )}>
                <Icon className="w-3 h-3" />
              </div>
              
              <div className="flex flex-col gap-0.5">
                <p className={cn(
                  'text-sm leading-tight',
                  event.severity === 'critical' && 'text-status-critical font-medium',
                  event.severity === 'warning' && 'text-status-attention',
                  event.severity === 'info' && 'text-foreground'
                )}>
                  {event.message}
                </p>
                <span className="text-xs text-muted-foreground data-mono">
                  {format(event.timestamp, 'HH:mm:ss')} · {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
