import { Thermometer, Wind, Droplets, Eye } from 'lucide-react';
import { EnvironmentalData } from '@/types/command-center';

interface EnvironmentalWidgetProps {
  data: EnvironmentalData;
}

export function EnvironmentalWidget({ data }: EnvironmentalWidgetProps) {
  const metrics = [
    { 
      icon: Thermometer, 
      label: 'Temperature', 
      value: `${data.temperature}°C`,
      color: data.temperature > 35 ? 'text-status-attention' : 'text-primary'
    },
    { 
      icon: Wind, 
      label: 'Wind', 
      value: `${data.windSpeed} mph ${data.windDirection}`,
      color: data.windSpeed > 20 ? 'text-status-attention' : 'text-primary'
    },
    { 
      icon: Droplets, 
      label: 'Humidity', 
      value: `${data.humidity}%`,
      color: 'text-primary'
    },
    { 
      icon: Eye, 
      label: 'Visibility', 
      value: data.visibility,
      color: 'text-primary'
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {metrics.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="p-3 command-card">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-3.5 h-3.5 ${color}`} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
          <p className={`text-sm font-semibold data-mono ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}
