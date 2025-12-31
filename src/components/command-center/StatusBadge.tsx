import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'normal' | 'attention' | 'critical';
  label: string;
  className?: string;
  pulse?: boolean;
}

export function StatusBadge({ status, label, className, pulse = true }: StatusBadgeProps) {
  const statusStyles = {
    normal: 'bg-status-normal/20 text-status-normal border-status-normal/30',
    attention: 'bg-status-attention/20 text-status-attention border-status-attention/30',
    critical: 'bg-status-critical/20 text-status-critical border-status-critical/30',
  };

  const pulseStyles = {
    normal: '',
    attention: pulse ? 'animate-pulse-border-amber' : '',
    critical: pulse ? 'animate-pulse-border-red' : '',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border uppercase tracking-wide',
        statusStyles[status],
        pulseStyles[status],
        className
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        status === 'normal' && 'bg-status-normal',
        status === 'attention' && 'bg-status-attention',
        status === 'critical' && 'bg-status-critical'
      )} />
      {label}
    </span>
  );
}
