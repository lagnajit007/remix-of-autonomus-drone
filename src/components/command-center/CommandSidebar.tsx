import { 
  LayoutGrid, 
  AlertTriangle, 
  Hexagon, 
  BarChart3, 
  Settings,
  User,
  Radio
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OperationalState } from '@/types/command-center';

interface SidebarProps {
  activeOperations: number;
  operationalState: OperationalState;
  activePage?: string;
}

export function CommandSidebar({ activeOperations, operationalState, activePage = 'overview' }: SidebarProps) {
  const navItems = [
    { id: 'overview', icon: LayoutGrid, label: 'Overview' },
    { id: 'incidents', icon: AlertTriangle, label: 'Incidents' },
    { id: 'drones', icon: Hexagon, label: 'Drones' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const getSystemStatusColor = () => {
    switch (operationalState) {
      case 'green': return 'bg-status-normal';
      case 'amber': return 'bg-status-attention';
      case 'red': return 'bg-status-critical';
    }
  };

  const getSystemStatusLabel = () => {
    switch (operationalState) {
      case 'green': return 'All Systems Normal';
      case 'amber': return 'Alert Detected';
      case 'red': return 'Active Incident';
    }
  };

  return (
    <aside className="w-60 h-full bg-sidebar flex flex-col border-r border-primary/10">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
            <Hexagon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">FLYTBASE</span>
            <span className="block text-[10px] text-muted-foreground tracking-widest">COMMAND CENTER</span>
          </div>
        </div>
      </div>

      {/* Active Operations Badge */}
      <div className="px-4 py-4">
        <div className="command-card p-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Active Operations</span>
          <span className="text-lg font-bold text-primary data-mono">{activeOperations}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              activePage === id 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
            {id === 'incidents' && operationalState !== 'green' && (
              <span className={cn(
                'ml-auto w-2 h-2 rounded-full',
                operationalState === 'amber' ? 'bg-status-attention' : 'bg-status-critical',
                'animate-pulse'
              )} />
            )}
          </button>
        ))}
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-primary/10">
        <div className="flex items-center gap-3 mb-4">
          <Radio className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">System Status</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn('w-2 h-2 rounded-full', getSystemStatusColor())} />
              <span className="text-xs font-medium">{getSystemStatusLabel()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Operator</p>
            <p className="text-xs text-muted-foreground">On duty</p>
          </div>
          <button className="p-1.5 rounded hover:bg-secondary transition-colors">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </aside>
  );
}
