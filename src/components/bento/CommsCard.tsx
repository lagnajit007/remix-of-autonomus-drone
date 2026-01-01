import { BentoCard } from "./BentoCard";
import { 
  Radio, 
  Send, 
  MapPin, 
  Thermometer, 
  Bell, 
  MessageSquare,
  Wifi,
  WifiOff,
  Battery
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CommsCardProps {
  isConnected?: boolean;
  controllerBattery?: number;
  signalStrength?: number;
  className?: string;
}

interface QuickMessage {
  id: string;
  label: string;
  icon: any;
  sent?: boolean;
}

const quickMessages: QuickMessage[] = [
  { id: "route", label: "Send Route", icon: MapPin },
  { id: "thermal", label: "Thermal Map", icon: Thermometer },
  { id: "alert", label: "Alert Crews", icon: Bell },
];

// Chat snippet component
const ChatSnippet = ({ message, time, from }: { message: string; time: string; from: string }) => (
  <div className="p-2 rounded-lg bg-secondary/30 border border-primary/10">
    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
      <span>{from}</span>
      <span>{time}</span>
    </div>
    <div className="text-xs text-foreground">{message}</div>
  </div>
);

// RC Telemetry mini view
const RCTelemetry = ({ battery, signal, connected }: { battery: number; signal: number; connected: boolean }) => (
  <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30 border border-primary/10">
    <div className="flex items-center gap-1.5">
      {connected ? (
        <Wifi className="w-3.5 h-3.5 text-status-normal" />
      ) : (
        <WifiOff className="w-3.5 h-3.5 text-status-critical" />
      )}
      <span className="text-xs font-mono text-foreground">{signal}%</span>
    </div>
    <div className="w-px h-4 bg-primary/20" />
    <div className="flex items-center gap-1.5">
      <Battery className={cn(
        "w-3.5 h-3.5",
        battery > 50 ? "text-status-normal" : battery > 20 ? "text-status-attention" : "text-status-critical"
      )} />
      <span className="text-xs font-mono text-foreground">{battery}%</span>
    </div>
  </div>
);

export const CommsCard = ({ 
  isConnected = true, 
  controllerBattery = 76, 
  signalStrength = 89,
  className 
}: CommsCardProps) => {
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  
  const handleSend = (id: string) => {
    setSentMessages(prev => [...prev, id]);
    // Reset after animation
    setTimeout(() => {
      setSentMessages(prev => prev.filter(m => m !== id));
    }, 2000);
  };

  return (
    <BentoCard 
      title="Ground Comms"
      icon={<Radio className="w-3.5 h-3.5" />}
      priority={!isConnected ? "high" : "low"}
      pulsing={!isConnected ? "red" : undefined}
      headerAction={
        <div className={cn(
          "w-2 h-2 rounded-full",
          isConnected ? "bg-status-normal" : "bg-status-critical animate-pulse"
        )} />
      }
      className={className}
    >
      <div className="space-y-3">
        {/* Connection status */}
        {!isConnected && (
          <div className="p-2 rounded-lg bg-status-critical/10 border border-status-critical/30 text-xs text-status-critical">
            Connection lost. Using cached data (60s buffer)
          </div>
        )}
        
        {/* RC Telemetry */}
        <RCTelemetry 
          battery={controllerBattery} 
          signal={signalStrength} 
          connected={isConnected} 
        />
        
        {/* Quick action buttons */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Quick Send</div>
          <div className="grid grid-cols-3 gap-2">
            {quickMessages.map(msg => {
              const Icon = msg.icon;
              const isSent = sentMessages.includes(msg.id);
              return (
                <Button
                  key={msg.id}
                  size="sm"
                  variant="outline"
                  className={cn(
                    "h-auto py-2 flex-col gap-1 border-primary/20 transition-all",
                    isSent && "bg-status-normal/20 border-status-normal/30 text-status-normal"
                  )}
                  onClick={() => handleSend(msg.id)}
                  disabled={isSent}
                >
                  {isSent ? (
                    <Send className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[10px]">{isSent ? "Sent!" : msg.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
        
        {/* Recent chat */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Recent</div>
            <MessageSquare className="w-3 h-3 text-muted-foreground" />
          </div>
          <ChatSnippet 
            from="Fire Dept" 
            time="2m ago" 
            message="ETA 4 minutes. Requesting thermal overlay." 
          />
        </div>
      </div>
    </BentoCard>
  );
};
